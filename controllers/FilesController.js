import { v4 as uuidv4 } from 'uuid';
import mime from 'mime-types';
import fs from 'fs';
import path from 'path';
import { ObjectId } from 'mongodb';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

export default class FilesController {
  static async postNew(req, res) {
    const token = req.headers['x-token'];

    // Step 1: Retrieve the user based on the token
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await dbClient.db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Step 2: Validate the input data
    const { name, type, parentId = 0, isPublic = false, data } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    // Step 3: Handle parentId validation if provided
    let parentFile = null;
    if (parentId !== 0) {
      parentFile = await dbClient.db.collection('files').findOne({ _id: new ObjectId(parentId) });
      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }

      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    // Step 4: If type is folder, directly create the folder in DB
    if (type === 'folder') {
      const newFolder = {
        userId: new ObjectId(userId),
        name,
        type,
        isPublic,
        parentId: parentId === 0 ? 0 : new ObjectId(parentId),
      };

      const result = await dbClient.db.collection('files').insertOne(newFolder);
      return res.status(201).json({
        id: result.insertedId,
        userId: newFolder.userId,
        name: newFolder.name,
        type: newFolder.type,
        isPublic: newFolder.isPublic,
        parentId: newFolder.parentId,
      });
    }

    // Step 5: Handle file or image creation
    const base64Data = Buffer.from(data, 'base64');
    const fileUUID = uuidv4();
    const extension = mime.extension(type === 'image' ? 'image/jpeg' : 'text/plain');
    const fileName = `${fileUUID}.${extension}`;
    const localPath = path.join(FOLDER_PATH, fileName);

    try {
      // Ensure the directory exists
      if (!fs.existsSync(FOLDER_PATH)) {
        fs.mkdirSync(FOLDER_PATH, { recursive: true });
      }

      // Write the file to the local disk
      fs.writeFileSync(localPath, base64Data);

      // Step 6: Insert the file record into the DB
      const newFile = {
        userId: new ObjectId(userId),
        name,
        type,
        isPublic,
        parentId: parentId === 0 ? 0 : new ObjectId(parentId),
        localPath,
      };

      const result = await dbClient.db.collection('files').insertOne(newFile);
      return res.status(201).json({
        id: result.insertedId,
        userId: newFile.userId,
        name: newFile.name,
        type: newFile.type,
        isPublic: newFile.isPublic,
        parentId: newFile.parentId,
        localPath: newFile.localPath,
      });
    } catch (error) {
      console.error('Error creating file:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  // New method to retrieve a file by ID
  static async getShow(req, res) {
    const token = req.headers['x-token'];
    const fileId = req.params.id;

    // Step 1: Retrieve the user based on the token
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Step 2: Retrieve the file document
    const file = await dbClient.db.collection('files').findOne({
      _id: new ObjectId(fileId),
      userId: new ObjectId(userId),
    });

    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.status(200).json(file);
  }

  // New method to retrieve files with pagination
  static async getIndex(req, res) {
    const token = req.headers['x-token'];
    const parentId = parseInt(req.query.parentId) || 0;
    const page = parseInt(req.query.page) || 0;

    // Step 1: Retrieve the user based on the token
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Step 2: Retrieve files for the specific parentId and paginate
    const limit = 20;
    const skip = page * limit;

    const files = await dbClient.db.collection('files').find({
      userId: new ObjectId(userId),
      parentId: parentId,
    }).skip(skip).limit(limit).toArray();

    return res.status(200).json(files);
  }
  // Method to publish a file (set isPublic to true)
  static async putPublish(req, res) {
    const token = req.headers['x-token'];
    const fileId = req.params.id;
    
    // Step 1: Retrieve the user based on the token
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    // Step 2: Find the file document based on the ID and userId
    const file = await dbClient.db.collection('files').findOne({
        _id: new ObjectId(fileId),
        userId: new ObjectId(userId),
    });
    if (!file) {
        return res.status(404).json({ error: 'Not found' });
    }
    // Step 3: Update isPublic to true
    await dbClient.db.collection('files').updateOne(
        { _id: new ObjectId(fileId) },
        { $set: { isPublic: true } }
    );
    // Return the updated file document
    const updatedFile = await dbClient.db.collection('files').findOne({
        _id: new ObjectId(fileId),
    });
    return res.status(200).json(updatedFile);
    }
    // Method to unpublish a file (set isPublic to false)
    static async putUnpublish(req, res) {
    const token = req.headers['x-token'];
    const fileId = req.params.id;
    // Step 1: Retrieve the user based on the token
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    // Step 2: Find the file document based on the ID and userId
    const file = await dbClient.db.collection('files').findOne({
        _id: new ObjectId(fileId),
        userId: new ObjectId(userId),
    });
    if (!file) {
        return res.status(404).json({ error: 'Not found' });
    }
    // Step 3: Update isPublic to false
    await dbClient.db.collection('files').updateOne(
        { _id: new ObjectId(fileId) },
        { $set: { isPublic: false } }
    );
    // Return the updated file document
    const updatedFile = await dbClient.db.collection('files').findOne({
        _id: new ObjectId(fileId),
    });    
    return res.status(200).json(updatedFile);
    }
}

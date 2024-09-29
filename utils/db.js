const { MongoClient } = require('mongodb');
import { promisify } from 'util';

class DBClient {
    constructor() {
        const host = 'localhost';
        const port = 27017;
        const database = 'files_manager';
        const url = `mongodb://${host}:${port}/${database}`;
        this.client = new MongoClient(url, { useUnifiedTopology: true });
        this.client.connect()
    }

    isAlive() {
        this.client.topology.isConnected();
    }
    async nbUsers() {
        return this.client.db().collection('users').countDocuments();
    }
    async nbFiles() {
        return this.client.db().collection('files').countDocuments();
    }
}

export const dbClient = new DBClient();
export default dbClient;
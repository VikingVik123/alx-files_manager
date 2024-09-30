const redisUtils = require('../utils/redis');
const dbUtils = require('../utils/db');
import redisClient from '../utils/redis';
import DBClient from '../utils/db';


export default class AppController {
    static getStatus(req, res) {
      res.status(200).json({
        redis: redisClient.isAlive(),
        db: DBClient.isAlive()
      });
    }

    static getStats(req, res) {
      Promise.all([DBClient.nbUsers(), DBClient.nbFiles()])
        .then(([usersCount, filesCount]) => {
          res.status(200).json({ users: usersCount, files: filesCount });
        })
        .catch((error) => {
          console.error(error);
          res.status(500).json({error});
        });
    }
}
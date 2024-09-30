import redisClient from '../utils/redis';
import dbClient from '../utils/db';

export default class AppController {
    static async getStatus(req, res) {
        try {
            const redisStatus = redisClient.isAlive();
            const dbStatus = await dbClient.isAlive();
            res.status(200).json({
                redis: redisStatus,
                db: dbStatus,
            });
        } catch (error) {
            console.error('Error getting status:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async getStats(req, res) {
        try {
            const [usersCount, filesCount] = await Promise.all([dbClient.nbUsers(), dbClient.nbFiles()]);
            res.status(200).json({
                users: usersCount,
                files: filesCount,
            });
        } catch (error) {
            console.error('Error getting stats:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

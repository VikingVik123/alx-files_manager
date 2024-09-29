const { MongoClient } = require('mongodb');

class DBClient {
    constructor() {
        const host = 'localhost';
        const port = 27017;
        const database = 'files_manager';
        const url = `mongodb://${host}:${port}/${database}`;
        this.client = new MongoClient(url, { useUnifiedTopology: true });

        this.client.connect().catch(err => {
            console.error('Failed to connect to MongoDB:', err);
        });
    }

    async isAlive() {
        try {
            return this.client.topology.isConnected();
        } catch (err) {
            console.error('Error checking if the database is alive:', err);
            return false;
        }
    }

    async nbUsers() {
        try {
            return this.client.db().collection('users').countDocuments();
        } catch (err) {
            console.error('Error counting users:', err);
            return 0;
        }
    }

    async nbFiles() {
        try {
            return this.client.db().collection('files').countDocuments();
        } catch (err) {
            console.error('Error counting files:', err);
            return 0;
        }
    }
}

export const dbClient = new DBClient();
export default dbClient;

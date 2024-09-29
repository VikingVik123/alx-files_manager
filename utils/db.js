const { MongoClient } = require('mongodb');

class DBClient {
    constructor() {
        const host = 'localhost';
        const port = 27017;
        const database = 'files_manager';
        const url = `mongodb://${host}:${port}`;
        this.client = new MongoClient(url, { useUnifiedTopology: true });
        this.client.connect().catch((err) => {
            console.error('Failed to connect to MongoDB:', err);
        });
        this.database = this.client.db(database);
        
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
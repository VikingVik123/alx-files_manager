const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    const host = 'localhost';
    const port = 27017;
    const database = 'files_manager';
    const url = `mongodb://${host}:${port}/${database}`;
    
    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.db = null;
    this.client.connect()
      .then(() => {
        this.db = this.client.db(database);
        console.log('Connected to MongoDB');
      })
      .catch((err) => {
        console.error('Failed to connect to MongoDB:', err);
      });
  }

  isAlive() {
    return !!this.db;
  }

  async nbUsers() {
    if (!this.db) return 0;
    return this.db.collection('users').countDocuments();
  }

  async nbFiles() {
    if (!this.db) return 0;
    return this.db.collection('files').countDocuments();
  }
}

export const dbClient = new DBClient();
export default dbClient;

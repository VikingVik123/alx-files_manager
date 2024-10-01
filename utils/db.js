import { MongoClient } from 'mongodb';
import { promisify } from 'util';

class DBClient {
  constructor() {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/files_manager';
    this.client = new MongoClient(uri, { useUnifiedTopology: true });
    this.client.connect()
      .then((client) => {
        this.db = client.db(process.env.DB_NAME || 'files_manager');
        console.log('Connected to MongoDB');
      })
      .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
        this.db = null;
      });
  }

  isAlive() {
    return !!this.db;
  }

  async collection(name) {
    return this.db.collection(name);
  }
}

const dbClient = new DBClient();
export default dbClient;

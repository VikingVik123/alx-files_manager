import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient();
    this.isClientConnected = true;
    this.client.on('error', (err) => {
      console.error(err.message || err.toString());
      this.isClientConnected = false;
    });

    this.client.on('connect', () => {
      console.log('Redis client connected');
      this.isClientConnected = true;
    });
  }

  isAlive() {
    return this.isClientConnected;
  }

  async get(key) {
    try {
      const value = await this.client.get(key);
      return value;
    } catch (error) {
      console.error(`Error getting key ${key}:`, error);
      return null;
    }
  }

  async set(key, value, duration) {
    try {
      await this.client.set(key, value);
      if (duration) {
        await this.client.expire(key, duration);
      }
    } catch (error) {
      console.error(`Error setting key ${key}:`, error);
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error(`Error deleting key ${key}:`, error);
    }
  }
}

const redisClient = new RedisClient();
export default redisClient;
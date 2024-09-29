import { createClient } from 'redis';


class RedisClient {
    constructor() {
        this.client = createClient();
        this.isconnected = true;
        this.client.on_connect('error', (err) => {
            console.log("Failed to connect", err.message || err.toString())
            this.isconnected = false;
        })
        this.client.on('connect', () => {
            this.isClientConnected = true;
          });
    }
    isAlive() {
        return this.isconnected;
    }
    async get(key) {
        const value = await this.client.get(key)
    }
    async set(key, value, duration) {
        await this.client.set(key, value);   // Set the key-value pair
        if (duration) {
            await this.client.expire(key, duration);  // Set the expiration time in seconds
        }

    }
    async del(key) {
        await this.client.del(key);
    }
}

(async () => {
    console.log(redisClient.isAlive());
    console.log(await redisClient.get('myKey'));
    await redisClient.set('myKey', 12, 5);
    console.log(await redisClient.get('myKey'));

    setTimeout(async () => {
        console.log(await redisClient.get('myKey'));
    }, 1000*10)
})();
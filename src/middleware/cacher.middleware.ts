import * as redis from 'redis';
import { Request, Response, NextFunction } from "express";

// Get App Config based on Environment
import getConfig from '../../config';
const env = process.env.NODE_ENV || 'development';
const config = getConfig(env);
const REDIS_CONFIG = config.REDIS;

// Redis Client
const redisClient = redis.createClient({
  host: REDIS_CONFIG.HOST,
  port: REDIS_CONFIG.PORT
})

// Caching Logic
function cacher(req: Request, res: Response, next: NextFunction) {
  const cacheKey = req.url;

  redisClient.get(cacheKey, (err, cachedData) => {
    if (err) throw err;

    res.setHeader('Content-Type', 'application/json');
    if (cachedData !== null) {
      const data = JSON.parse(cachedData);
      res.send(data);
    } else {
      const originalSend = res.send;
      res.send = (body) => {
        redisClient.setex(cacheKey, 3600, JSON.stringify(body));
        return originalSend.call(res, body);
      };
      next();
    }
  });
}

export default cacher;
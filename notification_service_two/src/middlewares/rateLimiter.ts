import { Request, Response, NextFunction } from "express";
import { redisClient } from "../redis/client";
import moment from "moment";

const RATE_LIMIT_DURATION_IN_SECONDS = 60;
const NUMBER_OF_REQUESTS_ALLOWED = 2;

export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.headers["user_id"] as string;

    if (!userId) {
        return res.status(400).json({ 
            success: false, 
            message: "User ID is required in headers." 
        });
    }

    const currentTime = moment().unix();

    const user = await redisClient.hgetall(userId);
    
    if (!user || Object.keys(user).length === 0) {
        // First request from the user, initialize rate limit
        await redisClient.hset(userId, {
            "createdAt": currentTime,
            "count": 1
        });
        return next();
    }

    const createdAt = parseInt(user["createdAt"]);
    let count = parseInt(user["count"]);

    if (isNaN(createdAt) || isNaN(count)) {
        // If Redis data is corrupted, reset the rate limiter for the user
        await redisClient.hset(userId, {
            "createdAt": currentTime,
            "count": 1
        });
        return next();
    }

    const diff = currentTime - createdAt;

    if (diff > RATE_LIMIT_DURATION_IN_SECONDS) {
        // Reset counter if the time window has passed
        await redisClient.hset(userId, {
            "createdAt": currentTime,
            "count": 1
        });
        return next();
    }

    if (count >= NUMBER_OF_REQUESTS_ALLOWED) {
        return res.status(429).json({
            success: false,
            message: "User rate-limited. Try again later."
        });
    } else {
        // Increment request count
        await redisClient.hset(userId, { "count": count + 1 });
        return next();
    }
};

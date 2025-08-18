import { eq } from 'drizzle-orm';
import { Request } from 'express';
import { db } from '../db';
import { User, userColumns, UserClient, users } from '../db/schema/users';
import { HttpError } from '../middlewares/errorHandler';
import { escapeTagValue } from '../redis/common';
import { redisClient } from '../redis/connect';
import { ensureUserPersonalData, userHsetSchema } from '../redis/users';
import { touchOnlineUser, touchUser } from '../redis/users/expiration';

/** Get the authenticated user from the request. */
export async function authRequest(req: Request) {
    try {
        // valid header: "userhandle username"
        const header = req.headers?.authorization;

        //check if header exist
        if (!header)
            throw new HttpError(401, "No authorization header")
        const words = header.split(" ")

        //check if there are exactly 2 words
        if (words.length !== 2)
            throw new HttpError(422, `The authorization header must contain exactly 2 words, but it contains \"${words.length}\"`)

        //check if the type is userhandle
        if (words[0] !== "userhandle")
            throw new HttpError(422, `The authorization header must start with \"userhandle\", not \"${words[0]}\"`)

        //get the userhandle
        const userhandle = words[1];

        return authUser(userhandle)
    }
    catch {
        return undefined
    }
}

/** Get the authenticated user or throw. */
export async function authUserStrict(userhandle: string) {
    const user = await authUser(userhandle)
    if (!user)
        throw new HttpError(401, "No user belongs to this identifier")
    return user
}

/** Get the authenticated user from the request or throw. */
export async function authRequestStrict(req: Request) {
    const user = await authRequest(req)
    if (!user)
        throw new HttpError(401, "No user belongs to this identifier")
    return user
}

/** Get the user from the db based on the handle. */
export async function authUser(userhandle: string): Promise<User | undefined> {
    // Try to get from redis
    const result = await redisClient.ft.search("users", `@handle:{${escapeTagValue(userhandle)}}`)
    let [user] = userHsetSchema.parseSearch(result)
    // Fallback to database
    if (!user)
        user = (
            await db.select()
                .from(users)
                .where(eq(users.handle, userhandle))
        )[0]
    if (user) {
        // Ensure personal cache if exists
        await ensureUserPersonalData(user)
        // Update expirations
        const multi = redisClient.multi()
        touchOnlineUser(multi, user.id)
        await multi.exec()
    }
    return user
}

/** Get the common user from the db based on the handle. */
export async function authUserCommon(userhandle: string): Promise<UserClient | undefined> {
    const user = (
        await db.select(userColumns)
            .from(users)
            .where(eq(users.handle, userhandle))
    )[0]
    return user
}
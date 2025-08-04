import { EditProfileForm } from "@me/schemas/src/zod/createUser"
import { eq } from "drizzle-orm"
import { db } from "../../db"
import { updateMedia } from "../../db/controllers/pendingUploads/updateMedia"
import { User, userColumns, users } from "../../db/schema/users"
import { redisClient } from "../../redis/connect"
import { cachedUsers } from "../../redis/users"

export async function updateUser(user: User, update: Partial<User>) {
    // Update the media of the user
    await Promise.all([
        updateMedia(user.avatar ? [user.avatar] : [], update.avatar ? [update.avatar] : []),
        updateMedia(user.banner ? [user.banner] : [], update.banner ? [update.banner] : [])
    ])
    // Update the user
    const [updatedUser] = await db
        .update(users)
        .set(update)
        .where(eq(users.id, user.id))
        .returning(userColumns)
    // Update cache
    const multi = redisClient.multi()
    cachedUsers.update([{
        key: user.id,
        values: update
    }],multi)
    await multi.exec()
    return updatedUser
}
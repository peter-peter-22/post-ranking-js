import { EditProfileForm } from "@me/schemas/src/zod/createUser"
import { eq } from "drizzle-orm"
import { User, userColumns, users } from "../../db/schema/users"
import { updateMedia } from "../../db/controllers/pendingUploads/updateMedia"
import { db } from "../../db"
import { cachedUsersWrite } from "../../redis/users/read"

export async function updateUser(user:User,newUser:EditProfileForm){
    // Update the media of the user
    await Promise.all([
        updateMedia(user.avatar ? [user.avatar] : [], newUser.profileMedia ? [newUser.profileMedia] : []),
        updateMedia(user.banner ? [user.banner] : [], newUser.bannerMedia ? [newUser.bannerMedia] : [])
    ])
    // Update the user
    const [updatedUser] = await db
        .update(users)
        .set(newUser)
        .where(eq(users.id, user.id))
        .returning(userColumns)
    // Update cache
    await cachedUsersWrite.write([{
        ...user,
        name: newUser.name,
        handle: newUser.handle,
        bio: newUser.bio,
        avatar: newUser.profileMedia ? newUser.profileMedia : null,
        banner: newUser.bannerMedia ? newUser.bannerMedia : null
    }])
    return updatedUser
}
import { eq } from "drizzle-orm";
import { users } from "../schema/users";
import { db } from "..";
import { createMainUser, mainUser } from "../seed/users";

/** Recreate the main user.
 * @returns The new main user.
 */
export async function clearMainUser() {
    await db.delete(users).where(eq(users.handle, mainUser.handle))
    const newMainUser = await createMainUser()
    console.log("Recreated main user.")
    return newMainUser
}
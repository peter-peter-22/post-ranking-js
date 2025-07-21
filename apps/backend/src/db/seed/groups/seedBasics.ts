import { updateTrends } from "../../controllers/trends/updateTrends";
import { clearAllTables } from "../../reset/clearTables";
import { seedFollows } from "../follows";
import { seedPosts } from "../posts";
import { createMainUser, seedUsers } from "../users";

/**
 * Seed users, the main user, posts, and follows.
 */
export async function seedBasics() {
    await clearAllTables()
    await createMainUser()
    const allUsers = await seedUsers(1000)
    await seedPosts(10000)
    await seedFollows({ from: allUsers, to: allUsers })
    await updateTrends()
    console.log("Seeded basics")
}
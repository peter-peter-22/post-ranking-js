import { eq } from "drizzle-orm";
import { db } from "..";
import { User, users } from "../schema/users";

/**
 * Return all users those are marked as bots
 * @returns array of users
 */
export async function getAllBots(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.bot, true));
}
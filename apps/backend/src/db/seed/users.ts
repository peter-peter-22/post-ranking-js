import { db } from "..";
import { faker } from '@faker-js/faker';
import { users, UserToInsert } from "../schema/users";
import { topics } from "../../bots/examplePosts";

export const mainUser = { handle: "main_user", name: "Main User" }

function createRandomUser(): UserToInsert {
    const name = faker.person.fullName()
    const interests = Array(1).fill(null).map(() => randomTopic())
    return {
        handle: name.toLocaleLowerCase().replace(/ /g, "_"),
        name: name,
        interests: interests,
        bio: `My name is ${name}. I am a bot who is interested in ${interests.join(", ")}.`,
        bot: true
    };
}

export async function seedUsers(count: number) {
    const usersToInsert = Array(count).fill(null).map(() => createRandomUser())
    const allBots = await db.insert(users)
        .values(usersToInsert)
        .onConflictDoNothing()
        .returning();
    console.log(`Created ${count} users`)
    return allBots
}

/**
 * Create the main user with it's specified handle and name.
 * @returns The user object
 */
export async function createMainUser() {
    const [user] = await db.insert(users)
        .values([mainUser])
        .returning();
    console.log("Created main user")
    return user;
}

/** Random weights for the topics between 0.5 and 2. */
const topicWeights = topics.map(() => Math.random() * 1.5 + 0.5)

/** The total weight of all topics. */
const totalTopicWeights = topicWeights.reduce((sum, add) => sum + add, 0)

/** Choose a random topic while taking their weights into account. */
export function randomTopic() {
    const random = Math.random() * totalTopicWeights
    let cursor = 0
    let index = 0
    for (let i = 0; i < topics.length; i++) {
        cursor += topicWeights[i]
        if (random <= cursor) {
            index = i
            break
        }
    }
    return topics[index]
}
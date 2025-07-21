import { faker } from '@faker-js/faker';
import { exampleComments, examplePosts } from '../../bots/examplePosts';
import { createPosts } from '../../userActions/posts/createPost';
import { UserCommon } from '../schema/users';
import { getAllBots } from './utils';
import { PostToInsert } from '../schema/posts';

/** The age interval where the posts are created in days. */
const ageInterval = 10

/**
 * Returns a post with random values.
 * 
 * @param users possible publishers
 * @returns post to insert
 */
function createRandomPostFromRandomUser(users: UserCommon[]): PostToInsert {
    //randomly selected user
    const user = users[Math.floor(Math.random() * users.length)];
    return createRandomPost(user)
}

/**
 * Returns a post with random values.
 * 
 * @param users the publisher
 * @returns post to insert
 */
export function createRandomPost(user: UserCommon): PostToInsert {
    const topic = getRandomTopicFromUser(user)
    return {
        userId: user.id,
        text: generatePostText(topic),
        topic: topic,
        engaging: Math.random(),
        createdAt: faker.date.recent({ days: ageInterval })
    };
}

/**Get a random topic from the selected user. 
 * @param user the user to get the topic from
 * @returns a random topic from the user interests
*/
export function getRandomTopicFromUser(user: UserCommon) {
    return user.interests[Math.floor(Math.random() * user.interests.length)]
}

/**
 * Returns a random post text from the selected topic.
 * 
 * @param topic the topic to get the post from
 * @returns a random post text from the selected topic
 */
function generatePostText(topic: string) {
    const group = examplePosts[topic]
    if (!group)
        throw new Error(`The topic "${topic}" does not exists!`)
    return group[Math.floor(Math.random() * group.length)]
}

/**
 * Returns a random reply text from the selected topic.
 * 
 * @param topic the topic to get the post from
 * @returns a random post text from the selected topic
 */
export function generateReplyText(topic: string) {
    const group = exampleComments[topic]
    if (!group)
        throw new Error(`The topic "${topic}" does not exists!`)
    return group[Math.floor(Math.random() * group.length)]
}

/**
 * Creates random posts using the accounts of the bot users.
 * The topic of the posts is relevant to the topic of the publisher.
 * 
 * @param count the count of the generated posts
 */
export async function seedPosts(count: number) {
    const allBots = await getAllBots()
    const postsToInsert = Array(count).fill(null).map(() => createRandomPostFromRandomUser(allBots))
    const allPosts = await createPosts(postsToInsert)
    console.log(`Created ${count} posts`)
    return allPosts;
}
import { PersonalUser } from "./getUser";

/** Apply changes to the fetched users before sending them to the client.
 */
export async function postProcessUsers(users: PersonalUser[]) {
    return users
}
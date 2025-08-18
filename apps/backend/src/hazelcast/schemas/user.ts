import { User } from "../../db/schema/users";
import { hazelClient } from "../connect";

export type CachedUser = Pick<User, "id" | "avatar" | "banner" | "bio" | "embedding" | "followerCount" | "followingCount" | "handle" | "name">

await hazelClient.getSql().execute(`
CREATE OR REPLACE MAPPING users (
    __key VARCHAR,             
    name VARCHAR,
    createdAt TIMESTAMP,
    profilePicture JSON,
    embedding JSON
)
TYPE IMap
OPTIONS (
    'keyFormat' = 'varchar',
    'valueFormat' = 'json-flat'
)
`);

// 3. Insert data
const usersMap = await hazelClient.getMap<string, CachedUser>('users');
await usersMap.set("id", { name: 'name', id: "id", handle: "handle", embedding: null, followerCount: 0, followingCount: 0, avatar: null, banner: null, bio: null });

// 4. Query
const result = await hazelClient.getSql().execute('SELECT * FROM users');
for await (const row of result) {
    console.log(row);
}

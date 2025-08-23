import { CachedUser, deserializeUser, usersMap } from "../schemas/users";

export async function getCachedUsersById(ids: string[]) {
    // Read from cache
    const map = new Map<string, CachedUser | undefined>(ids.map(id => [id, undefined]))
    const cached = (await usersMap.getAll(ids)).map((kvp) => deserializeUser(kvp[1]))
    for (const post of cached) {
        map.set(post.id, post)
    }
    console.log(`Reading users, cache hit: ${cached.length}/${ids.length}`)
    if (cached.length === ids.length) return map

    // Fallback to db
}

export async function getCachedUsersByHandle(handles: string[]) {

}

export async function enrichUsers(entries: CachedUser[]) {

}
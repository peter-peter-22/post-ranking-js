import { PersonalPost } from '@me/schemas/src/zod/post';
import { User } from '@me/schemas/src/zod/user';
import { create, ExtractState } from 'zustand';
import { combine } from 'zustand/middleware';

export type PostOnly = Omit<PersonalPost, "user">

export const useMainStore = create(combine(
    {
        users: new Map<string, User>(),
        posts: new Map<string, PostOnly>(),
        usersByHandle: new Map<string, User>(),
    },
    (set) => ({
        addUsers: (users: User[]) => {
            set((state) => {
                const newUsers = new Map(state.users)
                const newUsersByHandle = new Map(state.usersByHandle)
                for (const user of users) {
                    newUsers.set(user.id, user)
                    newUsersByHandle.set(user.handle, user)
                }
                return { users: newUsers }
            })
        },
        addPosts: (postsToAdd: PersonalPost[]) => {
            set(({ posts, users, usersByHandle }) => {
                const newPosts = new Map(posts)
                const newUsers = new Map(users)
                const newUsersByHandle = new Map(usersByHandle)
                for (const post of postsToAdd) {
                    newPosts.set(post.id, { ...post, userId: post.user.id })
                    newUsers.set(post.user.id, post.user)
                    newUsersByHandle.set(post.user.handle, post.user)
                }
                return { posts: newPosts, users: newUsers, usersByHandle: newUsersByHandle }
            })
        },
        updateUser: (id: string, changes: Partial<Omit<User, 'id'>>) => {
            set((state) => {
                const user = state.users.get(id);
                if (!user) throw new Error(`No user with id ${id}`)
                return {
                    users: new Map(state.users).set(id, { ...user, ...changes })
                };
            });
        },
        updatePost: (id: string, updateFn: (post: PostOnly) => PostOnly) => {
            set((state) => {
                const post = state.posts.get(id);
                if (!post) throw new Error(`No post with id ${id}`)
                return {
                    posts: new Map(state.posts).set(id, updateFn(post))
                };
            });
        },
    })
))

type StateType = ExtractState<typeof useMainStore>

export function requireUser<T>(id: string, selectFn: (user: User) => T) {
    return (state: StateType): T => {
        const user = state.users.get(id)
        if (!user) throw new Error(`User with id "${id}" not found in zustand`)
        return selectFn(user)
    }
}

export function requirePost<T>(id: string, selectFn: (user: PostOnly) => T) {
    return (state: StateType): T => {
        const post = state.posts.get(id)
        if (!post) throw new Error(`Post with id "${id}" not found in zustand`)
        return selectFn(post)
    }
}

/** Add the posts to the global storage and return their ids */
export function processPosts(posts: PersonalPost[]) {
    useMainStore.getState().addPosts(posts)
    return posts.map(post => post.id)
}

/** Add the users to the global storage and return their ids */
export function processUsers(users: User[]) {
    useMainStore.getState().addUsers(users)
    return users.map(user => user.id)
}
import { eq, inArray } from "drizzle-orm";
import { db } from "../../db";
import { posts } from "../../db/schema/posts";

export function selectTargetPost(postId:string){
    return db.select({ userId: posts.userId }).from(posts).where(eq(posts.id, postId)).as("select_post")
}

export function selectTargetPosts(postIds:string[]){
    return db.select({ userId: posts.userId, id:posts.id }).from(posts).where(inArray(posts.id, postIds)).as("select_post")
}
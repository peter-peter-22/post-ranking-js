import fs from "fs";
import { hashtagRegex } from "../userActions/posts/preparePost";

export const examplePosts: { [key: string]: string[] } = JSON.parse(fs.readFileSync('./src/bots/posts.json', 'utf8'));

export const topics = Object.keys(examplePosts);

/** The same texts as the posts, but without hashtags. */
export const exampleComments: { [key: string]: string[] } =
    Object.fromEntries(
        Object.entries(examplePosts).map(([category, texts]) => [
            category,
            texts = texts.map(text => text.replace(hashtagRegex, "").trim())
        ])
    )
import { hashtagRegex, mentionRegex, urlRegex } from "@me/schemas/src/regex";
import { eq } from "drizzle-orm";
import emojiRegex from "emoji-regex";
import { db } from "../../db";
import { generateEmbeddingVectors } from "../../db/controllers/embedding";
import { posts, PostToInsert } from "../../db/schema/posts";
import { HttpError } from "../../middlewares/errorHandler";
import { normalizeVector } from "../../utilities/arrays/normalize";

/** Bulk prepare posts before insert. */
export async function preparePosts(data: PostToInsert[]) {
    console.log(`Preparing ${data.length} posts...`)

    // Set text related data
    data.forEach(post => { processPostText(post) })

    // Generate embedding vectors for texts
    const { embeddings, keywords } = await generateEmbeddingVectors(data.map(post => post.embeddingText || ""))

    // Create rows to insert from the results
    const postsToInsert: PostToInsert[] = data.map(
        (post, i) => ({
            ...post,
            embedding: post.embeddingText ? embeddings[i] : null, // Add the embedding vector only if there is an embedding text
            embeddingNormalized: post.embeddingText ? normalizeVector(embeddings[i]) : null,
            keywords: [...new Set([...keywords[i], ...post.hashtags || []])], // Add the hashtags and the keywords
        })
    )
    return postsToInsert
}

/** Calculate the metadata of a post before insert. */
export async function preparePost(post: PostToInsert) {
    // Set text related data
    processPostText(post)

    // Generate embedding vectors and keywords
    if (!post.embeddingText) throw new HttpError(422, "The post has no text and media description")
    const { embeddings, keywords } = await generateEmbeddingVectors([post.embeddingText])
    post.embedding = embeddings[0]
    post.keywords = [...new Set([...keywords[0], ...post.hashtags || []])]
    post.embeddingNormalized = post.embeddingText ? normalizeVector(post.embedding) : null

    return post
}

function processPostText(post: PostToInsert) {
    if (!post.text) return
    const textHashtags = getEmbeddingTextAndHashtasgs(post)
    post.hashtags = textHashtags.hashtags
    post.embeddingText = textHashtags.embeddingText
    post.mentions = getMentions(textHashtags.embeddingText)
}

/** Calculate the metadata of a reply before insert. */
export async function prepareReply(post: PostToInsert) {
    processPostText(post)
    await addRepliedUser(post)
    return post
}

async function addRepliedUser(post: PostToInsert) {
    if (!post.replyingTo) throw new HttpError(422, "Invalid reply.")
    const [repliedPost] = await db
        .select({ userId: posts.userId, id: posts.id })
        .from(posts)
        .where(eq(posts.id, post.replyingTo))
    if (!repliedPost) throw new HttpError(404, "The replied post does not exists.")
    post.repliedUser = repliedPost.userId
}

/** Calculate the medadata of a post or a reply before insert. */
export async function prepareAnyPost(data: PostToInsert) {
    const postToInsert = data.replyingTo ?
        await prepareReply(data)
        :
        await preparePost(data)
    return postToInsert
}

/** Remove hashtags from the text, add them to the hashtag list */
function getEmbeddingTextAndHashtasgs(post: PostToInsert) {
    /** The hashtags in the text */
    let hashtags: string[] = []
    /** The text that will be used to gerenrate the embedding vector */
    let embeddingText = post.text || ""
    // Remove hashtags from the post text, add them to an array
    if (post.text)
        embeddingText = post.text.replace(hashtagRegex, (hashtag) => {
            const hashtagText = hashtag.toLowerCase().slice(1)
            hashtags.push(hashtagText.replace("_", " "))// Replace _ with space to use the same format as the keyword detector
            return hashtagText + "."
        })
    // Remove urls from the post text
    embeddingText = embeddingText?.replace(urlRegex, "")
    // Remove emojis
    embeddingText = embeddingText?.replace(emojiRegex(), "")
    // Extract text from the media files and add them to the embedding text
    if (post.media)
        for (const file of post.media)
            if (file.description)
                embeddingText += "\n" + file.description
    // Trim text
    embeddingText = embeddingText.trim()
    return { embeddingText, hashtags }
}

/** Get user mentions from the embedding text of a post. */
function getMentions(embeddingText: string) {
    return Array.from(embeddingText.matchAll(mentionRegex)).map(match => match[0].toLowerCase().slice(1))
}
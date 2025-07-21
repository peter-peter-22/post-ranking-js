import { EngagementHistory } from "../db/schema/engagementHistory"
import { Post } from "../db/schema/posts"
import { User, UserCommon } from "../db/schema/users"
import { lerp } from "../utilities/math/lerp"

export type ViewerPublisherRelationship = {
    followed: boolean,
    engagementHistory?: EngagementHistory,
    repliedByFollowed: boolean,
    cosineSimilarity?: number | null,
}

export type Engagement = {
    post: Post,
    user: UserCommon,
    like: boolean,
    reply: boolean,
    click: boolean,
    date: Date,
}

/** Get the organic engagement chances between a user and a post.*/
export function getEngagementChances(user: User, post: Post, relationship: ViewerPublisherRelationship) {
    /** Common relevance based on following and embedding similarity. */
    const cosineSimilarity = relationship.cosineSimilarity || 0
    let relevance = cosineSimilarity
    if(relationship.followed) relevance+=0.7

    /** Age in hours, max 48. */
    const age = (Date.now() - post.createdAt.getTime()) / 1000 / 60 / 60
    /** Common engagement chance multiplier defined by age. */
    const ageModifier = lerp(1, 0.3, age / 48)

    /** Common indicator of engagement likelyhood. Symbolizes the quality of the post. */
    const engagingModifier = lerp(0.7, 1, post.engaging)

    /** The chance of liking */
    let like = relevance * 1
    like += Math.log10(post.likeCount + 1) / 6 // More likes, more chance to like.
    like += Math.log10(relationship.engagementHistory?.likes || 0 + 1) / 3 // Engagement history
    like *= engagingModifier
    like *= ageModifier

    /** The chance of replying */
    let reply = relevance * 0.3
    reply += Math.log10(post.replyCount + 1) / 6 // More likes, more chance to like.
    reply += Math.log10(relationship.engagementHistory?.replies || 0 + 1) / 3 // Engagement history
    if (relationship.repliedByFollowed) reply += 0.3
    reply *= engagingModifier
    reply *= ageModifier

    /** The chance of replying */
    let click = relevance * 0.6
    click += Math.log10(Math.max(1, post.clickCount)) / 6 // More likes, more chance to like.
    click += Math.log10(relationship.engagementHistory?.clicks || 0 + 1) / 5 // Engagement history
    click *= engagingModifier
    click *= ageModifier

    return { like, reply, click, } // TODO: Add the logic to calculate the engagement chances.
}

/** Create engagements for post user pairs. */
export function getEngagements(user: User, post: Post, relationship: ViewerPublisherRelationship, date: Date): Engagement {
    const { like, reply, click } = getEngagementChances(user, post, relationship)
    return {
        like: Math.random() < like,
        reply: Math.random() < reply,
        click: Math.random() < click,
        post: post,
        user: user,
        date,
    }
}

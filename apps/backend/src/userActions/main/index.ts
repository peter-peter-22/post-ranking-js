import { setCachedFollow } from "../../redis/users/follows";
import { insertPost } from "../posts/createPost";
import { deletePost, restorePost } from "../posts/delete";
import { addClicks, removeClicks } from "../posts/engagements/actions/clicks";
import { addLikes, removeLikes } from "../posts/engagements/actions/likes";
import { addViews, removeViews } from "../posts/engagements/actions/views";
import { updateUser } from "../users/update";

export const userActions = {
    users: {
        follow: setCachedFollow,
        update: updateUser
    },
    posts: {
        engagements: {
            actions: {
                likes: {
                    add: addLikes,
                    remove: removeLikes
                },
                clicks: {
                    add: addClicks,
                    remove: removeClicks,
                },
                views: {
                    add: addViews,
                    remove: removeViews
                },
            },
        },
        create: insertPost,
        delete: deletePost,
        restore: restorePost
    }
}
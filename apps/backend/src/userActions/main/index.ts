import { setCachedFollow } from "../../redis/users/follows";
import { addClicks, removeClicks } from "./posts/engagements/actions/clicks";
import { addLikes, removeLikes } from "./posts/engagements/actions/likes";
import { addViews, removeViews } from "./posts/engagements/actions/views";
import { processEngagementUpdates } from "./posts/engagements/updates";

export const userActions = {
    users: {
        follow: setCachedFollow
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
            processUpdates: processEngagementUpdates
        }
    }
}
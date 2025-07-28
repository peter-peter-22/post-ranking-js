import { addClicks, removeClicks } from "./posts/engagements/set/clicks";
import { addLikes, removeLikes } from "./posts/engagements/set/likes";
import { addViews, removeViews } from "./posts/engagements/set/views";
import { processEngagementUpdates } from "./posts/engagements/updates";

export const userActions = {
    users: {

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
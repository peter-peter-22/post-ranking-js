import { Notification, PostPreview, PostWithUserPreview, UserPreview } from "../../api/notifications";

const postPreview: PostPreview = {
    text: "post text",
    media: null,
    id: "0"
}

const userPreview: UserPreview = {
    name: "User Name",
    handle: "user_handle",
    avatar: null
}

const postWithUserPreview: PostWithUserPreview = {
    post: postPreview,
    user: userPreview
}

export const exampleNotifications: Notification[] = [
    {
        id: "0",
        userId: "0",
        createdAt: new Date(),
        readAt: null,
        read: false,
        type: 'like',
        data: {
            postId: "0"
        },
        secondaryData: {
            post: postPreview,
            users: [userPreview],
            count: 1
        }
    },
    {
        id: "0",
        userId: "0",
        createdAt: new Date(),
        readAt: null,
        read: false,
        type: 'like',
        data: {
            postId: "0"
        },
        secondaryData: {
            post: postPreview,
            users: Array(10).fill(userPreview),
            count: 10
        }
    },
    {
        id: "0",
        userId: "0",
        createdAt: new Date(),
        readAt: null,
        read: false,
        type: 'like',
        data: {
            postId: "0"
        },
        secondaryData: {
            post: postPreview,
            users: Array(10).fill(userPreview),
            count: 100
        }
    },
    {
        id: "0",
        userId: "0",
        createdAt: new Date(),
        readAt: null,
        read: false,
        type: 'reply',
        data: {
            postId: "0"
        },
        secondaryData: {
            post: postPreview,
            replies: Array(1).fill(postWithUserPreview),
            count: 1
        }
    },
    {
        id: "0",
        userId: "0",
        createdAt: new Date(),
        readAt: null,
        read: false,
        type: 'reply',
        data: {
            postId: "0"
        },
        secondaryData: {
            post: postPreview,
            replies: Array(10).fill(postWithUserPreview),
            count: 10
        }
    },
    {
        id: "0",
        userId: "0",
        createdAt: new Date(),
        readAt: null,
        read: false,
        type: 'reply',
        data: {
            postId: "0"
        },
        secondaryData: {
            post: postPreview,
            replies: Array(10).fill(postWithUserPreview),
            count: 100
        }
    },
    {
        id: "0",
        userId: "0",
        createdAt: new Date(),
        readAt: null,
        read: false,
        type: 'follow',
        secondaryData: {
            users: Array(1).fill(userPreview),
            count: 1
        }
    },
    {
        id: "0",
        userId: "0",
        createdAt: new Date(),
        readAt: null,
        read: false,
        type: 'follow',
        secondaryData: {
            users: Array(10).fill(userPreview),
            count: 10
        }
    },
    {
        id: "0",
        userId: "0",
        createdAt: new Date(),
        readAt: null,
        read: false,
        type: 'follow',
        secondaryData: {
            users: Array(10).fill(userPreview),
            count: 100
        }
    },
    {
        id: "0",
        userId: "0",
        createdAt: new Date(),
        readAt: null,
        read: false,
        type: 'mention',
        data: {
            postId: "0"
        },
        secondaryData: {
            mention: postWithUserPreview,
        }
    },
]

export async function getExampleNotifications(offset?: number) {
    if (offset) return []
    return exampleNotifications
}
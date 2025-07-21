export function notificationsRedisKey(userId: string) {
    return `notifications/${userId}/unread_keys`
}

export const redisSetPlaceholder="default"

export const notificationsPerPage = 50
export const userPreviewsPerNotification = 10
export const notificationRedisTTL = 60 * 60

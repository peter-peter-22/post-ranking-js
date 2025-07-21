export const trackedPosts = new Set<string>()
export const viewedPosts = new Set<string>()
export const clickedPosts = new Set<string>()

export function addTrackedPost(postId: string) {
    trackedPosts.add(postId)
}

export function removeTrackedPost(postId: string) {
    trackedPosts.delete(postId)
}

export function viewPost(postId: string) {
    viewedPosts.add(postId)
}

export function clickPost(postId: string) {
    clickedPosts.add(postId)
}

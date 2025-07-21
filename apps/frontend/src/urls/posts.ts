
export function getPostUrl(postId:string,userHandle:string) {
    return `/users/${userHandle}/status/${postId}`
}
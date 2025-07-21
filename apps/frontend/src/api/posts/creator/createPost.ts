import { CreatePendingPostResponseSchma, CreatePostRequest, CreatePostResponseSchema, FinalizePostRequest, PostFormData, UpdatePostRequest, UpdatePostResponseSchema } from "@me/schemas/src/zod/createPost";
import { ServerMedia } from "@me/schemas/src/zod/media";
import { PostToEdit } from "@me/schemas/src/zod/post";
import { getFileCategory } from "../../../components/media/getFileCategory";
import { MediaUpload } from "../../../components/media/useMultipleMediaUpload";
import { apiClient } from "../../api";
import { uploadImage, uploadVideo } from "./media";

export type PostCreationSession = ReturnType<typeof createPostSession>

export async function createPostWithoutMedia({
    text,
    replyingTo,
    media
}: {
    text: string,
    replyingTo?: string,
    media?: ServerMedia[]
}) {
    const res = await apiClient.post("/userActions/create/post", { text, replyingTo, media } as CreatePostRequest)
    const { created } = CreatePostResponseSchema.parse(res.data)
    return created
}

export async function createPendingPost() {
    const res = await apiClient.post("/userActions/create/pendingPost")
    const { id } = CreatePendingPostResponseSchma.parse(res.data)
    return id
}

export async function finalizePost({
    text,
    replyingTo,
    media,
    id
}: FinalizePostRequest) {
    const res = await apiClient.post("/userActions/create/finalizePost", { text, replyingTo, media, id } )
    const { created } = CreatePostResponseSchema.parse(res.data)
    return created
}

export async function updatePost({
    text,
    media,
    id
}: UpdatePostRequest) {
    const res = await apiClient.post("/userActions/updatePost", { text, media, id })
    const { post } = UpdatePostResponseSchema.parse(res.data)
    return post
}

export function createPostSession(editedPost?: PostToEdit) {
    let hasUploadedMedia = false
    let mediaCount = editedPost?.media?.length || 0
    let pendingPostPromise: Promise<string> | undefined = undefined

    const getPendingPost = async () => {
        if (!pendingPostPromise) pendingPostPromise = createPendingPost()
        return await pendingPostPromise
    }

    const getPostId = async () => {
        if (editedPost) return editedPost.id
        return await getPendingPost()
    }

    const uploadFile = async (upload: MediaUpload) => {
        // Mark that this post contains uploaded media. if true, the post will be finalized
        hasUploadedMedia = true
        // Get local file
        const localData = upload.localData
        if (!localData) throw new Error("No local data")
        const uploadProcess = upload.uploadProcess
        if (!uploadProcess) throw new Error("No upload process")
        // Get or create pending post
        const pendingPostId = await getPostId()
        // Increase the meida counter right before the upload to define the object key
        mediaCount++
        // Get the file category
        const category = getFileCategory(localData.mimeType)
        // Upload the file using the function of it's category
        const uploadResponse = category === "image" ? (
            await uploadImage(
                {
                    pendingPostId: pendingPostId,
                    id: mediaCount,
                    mimeType: localData.mimeType,
                },
                localData.file,
                (progress: number) => {
                    uploadProcess.progress = progress
                    uploadProcess.progressEvent.emit(upload)
                }
            )
        ) : (
            await uploadVideo(
                {
                    pendingPostId: pendingPostId,
                    id: mediaCount,
                    mimeType: localData.mimeType,
                },
                localData.file,
                (progress: number) => {
                    uploadProcess.progress = progress
                    uploadProcess.progressEvent.emit(upload)
                }
            )
        )
        // Finish the upload
        uploadProcess.finished = true
        uploadProcess.progressEvent.emit(upload)
        return uploadResponse
    }

    const submitPost = async (data: PostFormData, replyingTo?: string) => {
        if (editedPost)
            return await updatePost({ ...data, id: editedPost.id })
        if (hasUploadedMedia) {
            const id = await getPostId()
            return await finalizePost({ ...data, id, replyingTo })
        }
        else {
            return await createPostWithoutMedia({ ...data, replyingTo })
        }
    }

    return { submitPost, uploadFile }
}
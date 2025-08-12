import { CreatePendingPostResponseSchma, CreatePostRequest, CreatePostResponseSchema, FinalizePostRequest, PostFormData, UpdatePostRequest, UpdatePostResponseSchema } from "@me/schemas/src/zod/createPost";
import { ServerMedia } from "@me/schemas/src/zod/media";
import { PostToEdit } from "@me/schemas/src/zod/post";
import { getFileCategory } from "../../../components/media/getFileCategory";
import { MediaUpload } from "../../../components/media/useMultipleMediaUpload";
import { apiClient } from "../../api";
import { uploadImage, uploadVideo } from "./media";

export type PostCreationSession = ReturnType<typeof createPostSession>

export async function createPost({
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
    const uploadFile = async (upload: MediaUpload) => {
        // Get local file
        const localData = upload.localData
        if (!localData) throw new Error("No local data")
        const uploadProcess = upload.uploadProcess
        if (!uploadProcess) throw new Error("No upload process")
        // Get the file category
        const category = getFileCategory(localData.mimeType)
        // Upload the file using the function of it's category
        const uploadResponse = category === "image" ? (
            await uploadImage(
                {
                    mimeType: localData.mimeType
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
        else {
            return await createPost({ ...data, replyingTo })
        }
    }

    return { submitPost, uploadFile }
}
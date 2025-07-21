import { useCallback, useState } from "react";
import { generatePreview, MediaUpload } from "./useMultipleMediaUpload";
import { createEvent } from "../../utilities/Event";
import { ServerMedia } from "@me/schemas/src/zod/media";

export type UseSingleMediaUploadProps = {
    initialValue?: ServerMedia,
    uploadFn: (upload: MediaUpload) => Promise<ServerMedia>,
    accept?: string[]
}

export function useSingleMediaUpload({ initialValue, uploadFn, accept }: UseSingleMediaUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [upload, setUpload] = useState<MediaUpload | undefined>(
        () => initialValue ? { cloudData: initialValue } : undefined
    )

    /** Remove the preview url to save memory */
    const clearPreviewUrl = useCallback(() => {
        const url = upload?.localData?.previewUrl
        if (url) URL.revokeObjectURL(url)
    }, [upload])

    /** Set a file before uploading. */
    const setFile = useCallback(async (file?: File) => {
        // Clear the preview url if exists
        clearPreviewUrl()

        // If no file, clear the upload state and exit
        if (!file) {
            setUpload(undefined)
            setUploading(false)
            return
        }

        // Check filetype
        if (accept && !accept.includes(file.type)) {
            console.warn(`File skipped because of invalid type. Type: ${file.type} Accepted:${accept.join(", ")}`)
            return
        }

        // Create upload object
        const upload: MediaUpload = {
            uploadProcess: {
                progressEvent: createEvent<MediaUpload>(),
                progress: 0,
                finished: false,
                error: false
            },
            localData: {
                previewUrl: generatePreview(file),
                file: file,
                objectKey: "",
                bucketName: "",
                mimeType: file.type
            }
        }
        // Set the upload object to display the preview
        setUpload(upload)
    }, [clearPreviewUrl, accept])

    /** Upload the selected file to the server if it exists. */
    const submit = useCallback(async () => {
        if (!upload) return
        try {
            // Set the upload state to prevent submit
            setUploading(true)

            // Start upload process
            const cloudData = await uploadFn(upload)

            // Finish upload
            upload.cloudData = cloudData
            setUploading(false)

            return cloudData
        }
        catch (e) {
            console.log("Error while uploading file", e)
            // Notify the component about the error
            upload.uploadProcess!.error = true
            upload.uploadProcess!.progressEvent.emit(upload)
        }
    }, [upload])

    // Export public functions
    return {
        setFile,
        submit,
        uploading,
        upload
    }
}
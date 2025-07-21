import { useCallback, useEffect, useState } from "react";
import { createEvent, Event } from "../../utilities/Event";
import { ServerMedia } from "../../types/media";

export type MediaUploadLocalData = {
    mimeType: string,
    previewUrl: string,
    file: File,
    objectKey: string,
    bucketName: string,
}

export type MediaUpload = {
    cloudData?: ServerMedia,
    uploadProcess?: {
        progressEvent: Event<MediaUpload>,
        progress: number,
        finished: boolean,
        error: boolean
    },
    localData?: MediaUploadLocalData
}

/** Create a preview url. Must be deleted later. */
export function generatePreview(file: File) {
    return URL.createObjectURL(file)
}

export type UseMediaUploadProps = {
    getFiles: () => ServerMedia[],
    setFiles: (files: ServerMedia[]) => void,
    uploadFn: (upload: MediaUpload) => Promise<ServerMedia>,
    accept?: string[]
}

/** Hooks for managing the files of a form. */
export function useMediaUpload({ getFiles, setFiles, uploadFn, accept }: UseMediaUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [uploads, setUploads] = useState<MediaUpload[]>(
        () => getFiles().map(file => ({ cloudData: file }))
    )

    /** Sync the files of the form with the finished uploads. */
    useEffect(() => {
        const newFiles: ServerMedia[] = []
        uploads.forEach(upload => {
            const cloudData = upload.cloudData
            if (!cloudData)
                return // Only finished uploads are included in the form.
            newFiles.push(cloudData)
        })
        setFiles(newFiles)
        setUploading(newFiles.length !== uploads.length)
    }, [uploads])

    /** Upload a file. */
    const addFile = useCallback(async (file: File) => {
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
        try {
            // Add it to the list
            setUploads(prev => [...prev, upload])

            // Start upload process
            const cloudData = await uploadFn(upload)

            // Finish upload
            upload.cloudData = cloudData

            // Update the form data by updating the uploads
            setUploads(prev => [...prev])
        }
        catch (e) {
            console.log("Error while uploading file", file.name, e)
            // Notify the component about the error
            upload.uploadProcess!.error = true
            upload.uploadProcess!.progressEvent.emit(upload)
        }
    }, [])

    /** Upload multiple files. */
    const addFiles = useCallback(async (files: File[]) => {
        console.log("Added files:", files)
        await Promise.all(
            files.map(file => {
                if(accept&&!accept.includes(file.type))
                {
                    console.warn(`File skipped because of invalid type. Type: ${file.type} Accepted:${accept.join(", ")}`)
                    return
                }
                addFile(file)
            })
        )
    }, [accept])

    /** Remove the preview urls of the provided uploads to save memory */
    const removePreviews = useCallback((files: MediaUpload[]) => {
        for (const upload of files) {
            const url = upload.localData?.previewUrl
            if (!url) continue
            URL.revokeObjectURL(url)
        }
    }, [])

    /** Remove a file by id. */
    const removeFile = useCallback((deletedIndex: number) => {
        setUploads(prev => {
            const deleted = prev.splice(deletedIndex, 1)
            removePreviews(deleted)
            return [...prev]
        })
    }, [])

    /** Remove all preview urls. */
    const clear = useCallback(() => {
        removePreviews(uploads)
    }, [uploads])

    // Export public functions
    return {
        addFile, removeFile, uploads, uploading, addFiles, clear
    }
}

export type MediaUploader = ReturnType<typeof useMediaUpload>
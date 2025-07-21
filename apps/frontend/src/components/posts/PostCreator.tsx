import { zodResolver } from '@hookform/resolvers/zod';
import { CreatePostFormSchema, PostFormData } from "@me/schemas/src/zod/createPost";
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import Box from "@mui/material/Box";
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from "@mui/material/Typography";
import { useSnackbar } from 'notistack';
import { ChangeEvent, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { FormProvider, useForm } from 'react-hook-form';
import { acceptedMediaTypes } from '../../api/media/mediaApi';
import { createPostSession } from '../../api/posts/creator/createPost';
import { getPostUrl } from '../../urls/posts';
import { getStandardGradient } from '../../utilities/getStandardGradient';
import GradientButton from '../buttons/GradientButton';
import { ResetProvider, useReset } from '../contexts/ResetProvider';
import { useMainStore } from '../globalStore/mainStore';
import StyledFileInput from '../inputs/StyledFileInput';
import UploadingMediaDisplayer from '../media/UploadingMediaDisplayer';
import { useMediaUpload } from '../media/useMultipleMediaUpload';
import CharacterCounter from './CharacterCounter';
import { ReplyingTo } from './PostContent';
import FormRichTextEditor from './RichTextEditor/FormEditor';
import { maxPostTextLength } from '@me/schemas/src/postCharacterCounter';
import { PersonalPost, PostToEdit } from '@me/schemas/src/zod/post';
import { FormHelperText } from '@mui/material';

export type PostCreatorProps = {
    post?: PostToEdit,
    onPublish?: (post: PersonalPost) => void,
    replyingTo?: string,
    successMessage?: boolean
}

const myAcceptedMediaTypes = acceptedMediaTypes

/** Form to create or edit a post. */
export default function PostCreator(props: PostCreatorProps) {
    return (
        <ResetProvider>
            <PostCreatorInner {...props} />
        </ResetProvider>
    )
}

function PostCreatorInner({ post, onPublish, replyingTo, successMessage = true }: PostCreatorProps) {
    const theme = useTheme()
    //const maxLength = 500
    const session = useMemo(() => createPostSession(post), [post])
    const { reset } = useReset()
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()

    // Form
    const methods = useForm<PostFormData>({
        resolver: zodResolver(CreatePostFormSchema),
        defaultValues: {
            text: post?.text || "",
            media: post?.media || []
        }
    });
    const { handleSubmit, getValues, setValue, control, formState: { isSubmitting, errors } } = methods;
    console.log(errors)
    const onSubmit = async (data: PostFormData) => {
        // Check text max length
        //if (characters >= maxLength) {
        //    setError("text", { type: "maxLength" })
        //    return
        //}
        // The text or the a media is required
        //if (characters === 0 && data.media.length === 0) {
        //    setError("text", { type: "required" })
        //    return
        //}
        console.log("Post form", data)
        const created = await session.submitPost(data, replyingTo)
        // Update reply counter
        if (created.replyingTo) useMainStore.getState().updatePost(created.replyingTo, ({ replies, ...post }) => ({ ...post, replies: replies + 1 }))
        // Show success message
        if (successMessage) {
            const key = enqueueSnackbar("Post published", {
                variant: "success",
                action: <>
                    <Button href={getPostUrl(created.id, created.user.handle)} size="small" color="inherit">View</Button>
                    <IconButton size='small' color="inherit" onClick={() => { closeSnackbar(key) }}><CloseIcon /></IconButton>
                </>,
            })
        }
        // Use callback
        if (onPublish) onPublish(created)
        // Clear
        reset()
    }

    // Media upload
    const uploader = useMediaUpload({
        getFiles: () => getValues(["media"])[0] || [],
        setFiles: (files) => { setValue("media", files) },
        uploadFn: session.uploadFile,
        accept: myAcceptedMediaTypes
    })
    /** Upload from file input */
    const handleUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const fileList = e.target.files
        if (!fileList) return
        const files = Array.from(fileList)
        uploader.addFiles(files)
    }, [uploader.addFiles])
    /** Upload from clipboard */
    const handlePaste = useCallback((blobs: Blob[]) => {
        // Convert blobs to files
        const files = blobs.map((blob, index) => {
            console.log("blob", blob.type)
            return new File([blob], `pasted-file-${index}`, {
                type: blob.type,
                lastModified: Date.now(),
            });
        });
        uploader.addFiles(files)
        return "handled"
    }, [uploader.addFiles])
    // Handle dropzone
    const { getRootProps, isDragActive } = useDropzone({//TODO: limit file formats
        onDrop: uploader.addFiles
    });

    return (
        <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ p: 2, position: "relative" }}
            {...getRootProps()}
        >
            {isDragActive &&
                <DragIndicator />
            }
            <FormProvider {...methods}>
                <Stack gap={1}>
                    {replyingTo && <ReplyingTo replyingTo={replyingTo} />}
                    <FormRichTextEditor
                        name="text"
                        editorProps={{
                            handlePastedFiles: handlePaste
                        }}
                    />
                    {errors.text && <FormHelperText error>{errors.text.message}</FormHelperText>}
                    <UploadingMediaDisplayer uploader={uploader} />
                    <Stack direction="row" gap={1}>
                        <CharacterCounter max={maxPostTextLength} control={control} />
                        <StyledFileInput
                            onChange={handleUpload}
                            render={({ onClick }) => (
                                <IconButton sx={{ ml: "auto" }} color="primary" onClick={onClick}>
                                    <AddPhotoAlternateOutlinedIcon />
                                </IconButton>
                            )}
                            multiple
                            accept={myAcceptedMediaTypes.join(", ")}
                        />
                        <GradientButton
                            type="submit"
                            gradient={getStandardGradient(theme)}
                            loading={isSubmitting}
                            disabled={uploader.uploading}
                        >
                            Submit
                        </GradientButton>
                    </Stack>
                </Stack>
            </FormProvider>
        </Box>
    )
}

/** Overlay when dragging is active */
function DragIndicator() {
    const theme = useTheme()
    return (
        <Box sx={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            zIndex: theme.zIndex.modal,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column"
        }}>
            <UploadFileOutlinedIcon fontSize='large' />
            <Typography  >
                Drop files here to upload
            </Typography>
        </Box>
    )
}
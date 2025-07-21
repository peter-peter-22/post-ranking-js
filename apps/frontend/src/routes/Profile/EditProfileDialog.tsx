import { zodResolver } from "@hookform/resolvers/zod";
import { EditProfileForm, EditProfileFormSchema } from "@me/schemas/src/zod/createUser";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from '@mui/material/Dialog';
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useShallow } from "zustand/react/shallow";
import { acceptedImageTypes } from "../../api/media/mediaApi";
import { updateUser } from "../../api/users/updateUser";
import { uploadBanner, UploadMediaFunction, uploadProfile } from "../../api/users/uploadProfileMedia";
import GradientButton from "../../components/buttons/GradientButton";
import { requireUser, useMainStore } from "../../components/globalStore/mainStore";
import FormTextField from "../../components/inputs/FormTextField";
import { MediaUpload } from "../../components/media/useMultipleMediaUpload";
import { useSingleMediaUpload } from "../../components/media/useSingleMediaUpload";
import { useUser } from "../../components/users/UserContext";
import { getStandardGradient } from "../../utilities/getStandardGradient";
import EditMediaDialog from "./EditMediaDialog";
import EditProfileBanner from "./EditProfileBanner";
import EditProfilePicture from "./EditProfilePicture";
import { useSnackbar } from "notistack";
import { formatError } from "../../utilities/formatError";

type EditProfileType = {
    show: () => void,
    close: () => void
}

const EditProfileContext = createContext<EditProfileType | undefined>(undefined)

export function ProfileEditorProvider({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false)

    const show = useCallback(() => {
        setOpen(true)
    }, [])

    const close = useCallback(() => {
        setOpen(false)
    }, [])

    return (
        <>
            <EditProfileContext.Provider value={{ show, close }}>
                {children}
            </EditProfileContext.Provider>
            <EditProfileDialog open={open} close={close} />
        </>
    )
}

export function useProfileEditor() {
    const context = useContext(EditProfileContext)
    if (!context) throw new Error('useProfileEditor must be used within a ProfileEditorProvider')
    return context
}

const myAcceptedMediaTypes = acceptedImageTypes

function EditProfileDialog({ open, close }: { open: boolean, close: () => void }) {
    // Common
    const theme = useTheme()
    const { enqueueSnackbar } = useSnackbar()

    // Get user
    const { userId } = useUser()
    const user = useMainStore(requireUser(userId, useShallow(user => ({
        name: user.name,
        handle: user.handle,
        bio: user.bio,
        profileImage: user.avatar,
        profileBanner: user.banner,
    }))))

    // Form
    const methods = useForm<EditProfileForm>({
        resolver: zodResolver(EditProfileFormSchema),
        defaultValues: {
            name: user.name,
            handle: user.handle,
            bio: user.bio || ""
        }
    });
    const { handleSubmit, formState: { isSubmitting } } = methods;

    // Media
    const handleUpload = useCallback((uploadFn: UploadMediaFunction) => {
        return async (upload: MediaUpload) => {
            const { localData, uploadProcess } = upload
            if (!localData || !uploadProcess || !localData.file) throw new Error("Missing data in upload process")
            return await uploadFn(
                localData,
                (progress: number) => {
                    uploadProcess.progress = progress
                    uploadProcess.progressEvent.emit(upload)
                }
            )
        }
    }, [])
    const profileMedia = useSingleMediaUpload({
        initialValue: user.profileImage ? user.profileImage : undefined,
        uploadFn: handleUpload(uploadProfile),
    })
    const bannerMedia = useSingleMediaUpload({
        initialValue: user.profileBanner ? user.profileBanner : undefined,
        uploadFn: handleUpload(uploadBanner),
    })

    // Submit
    const canSubmit = !isSubmitting && !profileMedia.uploading && !bannerMedia.uploading
    const onSubmit = useCallback(async (data: EditProfileForm) => {
        try {
            if (!canSubmit) return
            // Upload media before submit
            const [banner, avatar] = await Promise.all([
                bannerMedia.submit(),
                profileMedia.submit()
            ])
            // Construct the full data that contains the media
            const fullData = { ...data, banner, avatar }
            console.log("Edit profile form", fullData)
            // Submit to the api
            const newUser = await updateUser(fullData)
            // Apply changes to the global store
            useMainStore.getState().addUsers([newUser])
            // Success
            close()
            enqueueSnackbar("Profile updated", { variant: "success" })
        }
        catch (e) {
            enqueueSnackbar(formatError(e), { variant: "error" })
        }
    }, [profileMedia, bannerMedia, canSubmit, useMainStore])

    return (
        <Dialog
            open={open}
            onClose={close}
            fullWidth
            maxWidth="middle"
            component="form"
            onSubmit={handleSubmit(onSubmit)}
        >
            <FormProvider {...methods}>
                <DialogTitle fontWeight={"bold"}>
                    Edit profile
                </DialogTitle>
                <Box >
                    <EditMediaDialog
                        onChange={bannerMedia.setFile}
                        fileInputProps={{ accept: myAcceptedMediaTypes.join(", ") }}
                    >
                        {
                            (onClick) => (
                                <EditProfileBanner
                                    upload={bannerMedia.upload}
                                    onClick={onClick}
                                    sx={{
                                        width: "100%",
                                        height: 150,
                                        objectFit: "cover"
                                    }}
                                />
                            )
                        }
                    </EditMediaDialog>
                    <EditMediaDialog
                        onChange={profileMedia.setFile}
                        fileInputProps={{ accept: myAcceptedMediaTypes.join(", ") }}
                    >
                        {
                            (onClick) => (
                                <EditProfilePicture
                                    upload={profileMedia.upload}
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        transform: "translateY(-50%)",
                                        ml: 2,
                                        borderColor: theme.palette.background.paper,
                                        borderWidth: 5,
                                        borderStyle: "solid",
                                        marginBottom: `${-60}px`
                                    }}
                                    onClick={onClick}
                                />
                            )
                        }
                    </EditMediaDialog>
                </Box>
                <DialogContent>
                    <Stack gap={2} alignItems={"start"}>
                        <FormTextField name="name" label="Name" fullWidth />
                        <FormTextField name="handle" label="Handle" fullWidth />
                        <FormTextField name="bio" label="Description" fullWidth minRows={2} multiline />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={close}>
                        Cancel
                    </Button>
                    <GradientButton gradient={getStandardGradient(theme)} loading={isSubmitting} type={"submit"}>
                        Submit
                    </GradientButton>
                </DialogActions>
            </FormProvider>
        </Dialog>
    )
}

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { ChangeEvent, InputHTMLAttributes, ReactNode, useCallback, useState } from 'react';
import StyledFileInput from '../../components/inputs/StyledFileInput';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';

export type EditMenuDialogProps = {
    children: (onClick: (event: React.MouseEvent<HTMLElement>) => void) => ReactNode,
    onChange: (file?: File) => void,
    fileInputProps:InputHTMLAttributes<HTMLInputElement>
}

export default function EditMediaDialog({ children, onChange,fileInputProps }: EditMenuDialogProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    }, []);
    const handleClose = useCallback(() => {
        setAnchorEl(null);
    }, []);
    const handleEdit = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        handleClose()
        const files = e.target.files
        if (!files) {
            console.warn("No file list")
            return
        }
        const file = files[0]
        if (!file) {
            console.warn("0 files")
            return
        }
        onChange(file)
    }, [onChange, handleClose])
    const handleDelete = useCallback(() => {
        handleClose()
        onChange(undefined)
    }, [onChange, handleClose])
    return (
        <>
            {children(handleClick)}
            <Menu
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: "center",
                    horizontal: "center"
                }}
                transformOrigin={{
                    vertical: "center",
                    horizontal: "center"
                }}
                anchorEl={anchorEl}
            >
                <StyledFileInput
                    onChange={handleEdit}
                    render={
                        ({ onClick }) => (
                            <MenuItem onClick={onClick} aria-label='upload file'>
                                <FileUploadOutlinedIcon />
                            </MenuItem>
                        )
                    }
                    {...fileInputProps}
                />
                <MenuItem onClick={handleDelete} aria-label='clear'>
                    <ClearOutlinedIcon />
                </MenuItem>
            </Menu>
        </>
    )
}
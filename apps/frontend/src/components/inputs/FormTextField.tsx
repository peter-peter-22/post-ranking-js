import TextField, { TextFieldProps } from '@mui/material/TextField';
import { RegisterOptions, useFormContext } from 'react-hook-form';

export type FormTextFieldProps = TextFieldProps & {
    name: string
    registerOptions?: RegisterOptions
}

/** Textfield with react-hook-form integration. */
export default function FormTextField({ name, registerOptions, ...props }: FormTextFieldProps) {
    const { register, formState: { errors } } = useFormContext();
    const myError = errors[name]?.message;
    return (
        <TextField
            error={!!myError}
            helperText={myError?.toString()}
            {...register(name, registerOptions)}
            {...props}
        />
    );
}
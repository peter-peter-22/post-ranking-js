import FormControl, { FormControlProps } from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel, { InputLabelProps } from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import { ReactNode } from 'react';
import { Controller, ControllerProps, useFormContext } from 'react-hook-form';

export type FormSelectProps = FormControlProps & {
    inputLabelProps: InputLabelProps,
    controllerProps: ControllerProps,
    name: string,
    label: ReactNode
}

/** Select input with react-hook-form integration. Uses MenuItems as children. */
export default function FormSelect({ name, children, label, sx, ...props }: FormSelectProps) {
    const { control, formState: { errors } } = useFormContext();
    const myError = errors[name]?.message;

    return (
        <FormControl
            variant={"standard"}
            sx={{ minWidth: 120, ...sx }}
            {...props}
        >
            <InputLabel id={name}>{label}</InputLabel>
            <Controller
                name={name}
                control={control}
                render={({ field: { value, ...field } }) => (
                    <Select
                        labelId={name}
                        value={value ?? ""}//prevent the "changing uncontrolled to controlled error"
                        {...field}
                        error={!!myError}
                    >
                        {children}
                    </Select>
                )}
            />
            {myError && <FormHelperText error={true}>{myError.toString()}</FormHelperText>}
        </FormControl>
    )
}
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { errorStatusCode, formatError } from '../../utilities/formatError';
import { ReactNode } from 'react';

export type ErrorDisplayerProps={ error: unknown, title?: ReactNode }

export default function ErrorDisplayer({ error, title = "Oops! Something went wrong." }: ErrorDisplayerProps) {
    const code = errorStatusCode(error)
    return (
        <Alert variant="standard" severity="error">
            <AlertTitle>{title}</AlertTitle>
            {formatError(error)}
            {code && <div>Status code: {code}</div>}
        </Alert>
    )
}
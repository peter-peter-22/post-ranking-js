import { ReactNode } from 'react';
import ErrorDisplayer from '../error/ErrorDisplayer';

/** Standard error displayer for infinite lists with formatting. */
export function InfiniteListErrorFormatted({ error, title }: { error: Error, title: ReactNode }) {
    return (
        <ErrorDisplayer title={title} error={error} />
    )
}
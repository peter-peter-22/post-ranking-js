import { AxiosError } from "axios";

export function formatError(error: unknown) {
    return error instanceof AxiosError ? (
        error.response?.data?.message ?? error.message
    ) : error instanceof Error ? (
        error.message
    ) : (
        "Unknown error"
    )
}

export function errorStatusCode(error: unknown) {
    if (error !== null && typeof error === "object" && "status" in error && typeof error.status === "number")
        return error.status
}
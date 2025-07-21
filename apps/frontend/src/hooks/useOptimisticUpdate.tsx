import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";

type UseOptimisticToggleOptions = {
    mutateValue: (value: boolean) => Promise<void>,
    onToggle: (value: boolean) => void,
    onError?: (error: Error) => void,
    currentValue: boolean
}

export function useOptimisticToggle({ mutateValue, onToggle, onError, currentValue }: UseOptimisticToggleOptions) {
    const {
        mutateAsync,
        isPending,
        error
    } = useMutation({
        mutationFn: mutateValue,
        onMutate: onToggle,
        onError: (error, value) => {
            console.error(error)
            onToggle(!value)
            if (onError) onError(error)
        }
    })

    const setValue = useCallback(async (value: boolean) => {
        if (isPending) return
        await mutateAsync(value)
    }, [isPending, mutateAsync])

    const toggle = useCallback(async () => {
        await setValue(!currentValue)
    }, [currentValue, setValue])

    return {
        setValue,
        toggle,
        isPending,
        error
    }
}
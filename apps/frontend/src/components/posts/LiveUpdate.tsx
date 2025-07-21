import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useDebouncedCallback } from 'use-debounce';

export const LiveUpdate = ({ submit }: { submit: () => void }) => {
    const { watch } = useFormContext()

    useEffect(() => {
        // This will run whenever any form field changes
        const subscription = watch(() => {
            debounced()
        });

        return () => subscription.unsubscribe(); // Cleanup on unmount
    }, [watch]);


    const debounced = useDebouncedCallback(
        submit,
        300
    );

    return <></>
}
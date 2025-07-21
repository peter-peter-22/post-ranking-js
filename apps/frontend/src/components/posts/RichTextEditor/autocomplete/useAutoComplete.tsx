import { useCallback, useEffect, useMemo, useState } from 'react';
import { EditorKeyEvent,useEditorEvents } from '../Events';

export type RichTextAutoCompleteSelectorProps<T> = {
    text: string,
    items: T[]
    filter: (text: string, item: T) => boolean,
    onSubmit: (item: T) => void,
}

/** Hook to control autocomplete state. */
export function useAutocompleteSelector<T>({ items, filter, text, onSubmit }: RichTextAutoCompleteSelectorProps<T>) {
    /** Index of the selected item */
    const [selected, setSelected] = useState(0)
    // Get keyboard events
    const { keyboard } = useEditorEvents()

    // Sync item filtering
    const filteredItems = useMemo(() => {
        setSelected(0) // Reset the selection when the items change
        return items.filter(item => filter(text, item))
    }, [items, text])

    // Handle keyboard navigation
    const onNavigateUp = useCallback(() => {
        setSelected(prev => {
            if (prev <= 0)
                return filteredItems.length - 1
            return prev - 1
        })
    }, [filteredItems])

    const onNavigateDown = useCallback(() => {
        setSelected(prev => {
            if (prev >= filteredItems.length - 1)
                return 0
            return prev + 1
        })
    }, [filteredItems])

    /// Handle item selection
    const submit = useCallback(() => {
        const item = filteredItems[selected]
        if (!item) return false
        onSubmit(item)
        return true
    }, [selected, filteredItems])

    // Handle event subscriptions
    useEffect(() => {
        const eventHandler = (e: EditorKeyEvent) => {
            if (e.code === "ArrowUp") {
                onNavigateUp()
                return true
            }
            if (e.code === "ArrowDown") {
                onNavigateDown()
                return true
            }
            if (e.code === "Enter") {
                return submit()
            }
            return false
        }
        keyboard.subscribe(eventHandler)
        return () => { keyboard.unsubscribe(eventHandler) }
    }, [onNavigateDown, onNavigateUp, submit]) //TODO: restarting the event listeners on each update is not ideal

    // Return the functions and items
    return {
        selected,
        onNavigateUp,
        onNavigateDown,
        submit,
        filteredItems,
        setSelected,
        onSubmit
    }
}

import { DraftDecoratorComponentProps, EditorState } from 'draft-js';
import { useEffect, useRef, useState } from 'react';
import { isSelected } from '../common';

/** Hook to control visibility of the autocomplete menu. */
export function useAutoCompleteController(
    decoratorComponentProps: DraftDecoratorComponentProps,
    editorState: EditorState,
    focused:boolean
) {
    const textRef = useRef<HTMLAnchorElement>(null)
    const [anchorEl, setAnchorEl] = useState<HTMLAnchorElement | null>(null);
    const selected = isSelected(editorState, decoratorComponentProps)

    useEffect(() => {
        setAnchorEl(textRef.current)
    }, [])

    const open=Boolean(selected && anchorEl && focused)

    return {
        textRef,
        selected,
        anchorEl,
        open
    }
}
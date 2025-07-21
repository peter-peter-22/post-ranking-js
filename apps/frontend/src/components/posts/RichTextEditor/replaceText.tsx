import { DraftDecoratorComponentProps, EditorState, Modifier, SelectionState } from "draft-js";

/** Replace the text of the selected decorator component. */
export function replaceDecoratorText(
    {start,end,blockKey,contentState}:DraftDecoratorComponentProps,
    editorState: EditorState,
    text: string,
    selectEnd: boolean
) {
    // Get the selection range of the decorator component.
    const decoratorRangeSelection = SelectionState.createEmpty(blockKey).merge({
        anchorOffset: start,
        focusOffset: end,
    });

    // Apply the replacement to the content state.
    const updatedContent = Modifier.replaceText(
        contentState,
        decoratorRangeSelection,
        text,
        editorState.getCurrentInlineStyle()
    );

    // Create a new editor state with the updated content.
    let newEditorState = EditorState.push(
        editorState,
        updatedContent,
        'insert-characters'
    );

    // Select the end of the modified text if needed.
    if (selectEnd) {
        const newEndOffset = start + text.length;

        const newSelection = SelectionState.createEmpty(blockKey).merge({
            anchorOffset: newEndOffset,
            focusOffset: newEndOffset,
        });

        newEditorState = EditorState.forceSelection(newEditorState, newSelection);
    }

    // Return the updated editor state.
    return newEditorState
}
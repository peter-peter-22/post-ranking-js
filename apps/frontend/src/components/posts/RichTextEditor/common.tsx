import { ContentBlock, DraftDecoratorComponentProps, EditorState } from "draft-js";

export function findWithRegex(
    regex: RegExp,
    block: ContentBlock,
    callback: (start: number, end: number) => void,
) {
    const text = block.getText();
    let matchArr, start;
    while ((matchArr = regex.exec(text)) !== null) {
        start = matchArr.index;
        callback(start, start + matchArr[0].length);
    }
}

/** Get if the selection is inside the component. */
export function isSelected(editorState: EditorState, { start, end, blockKey }: DraftDecoratorComponentProps) {
    const selection = editorState.getSelection()
    return (
        selection.getStartOffset() >= start
        && selection.getEndOffset() <= end
        && selection.getEndKey() === blockKey
        && selection.getStartKey() === blockKey
    )
}

export const suggestionDebounce = 300
import { CompositeDecorator, ContentState, Editor, EditorState } from "draft-js";
import { hashtagDecoratorViewer } from "./decorators/Hashtags";
import { mentionDecoratorViewer } from "./decorators/Mentions";
import { linkDecoratorViewer } from "./decorators/Links";
import { memo } from "react";

const decorators = new CompositeDecorator([hashtagDecoratorViewer, mentionDecoratorViewer, linkDecoratorViewer])

const PostTextViewer = memo(({ value }: { value: string }) => {
    const editorState = EditorState.createWithContent(
        ContentState.createFromText(value),
        decorators
    )
    return (
        <Editor
            editorState={editorState}
            readOnly={true}
            onChange={() => { }}
        />
    )
})

export default PostTextViewer
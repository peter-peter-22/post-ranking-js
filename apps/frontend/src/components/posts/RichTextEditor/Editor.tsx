import { CompositeDecorator, ContentState, Editor, EditorProps, EditorState, getDefaultKeyBinding } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { forwardRef, SyntheticEvent, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { hashtagDecoratorEditor } from './decorators/Hashtags';
import { linkDecoratorEditor } from './decorators/Links';
import { mentionDecoratorEditor } from './decorators/Mentions';
import { EditorStateProvider } from './EditorStateContext';
import { EditorEventsProvider, EditorKeyEvents } from './Events';

const decorators = new CompositeDecorator([hashtagDecoratorEditor, mentionDecoratorEditor, linkDecoratorEditor])

export type RichTextEditorProps = Omit<EditorProps, "editorState" | "onChange" | "keybingingFn"> & {
  value?: string
  onChange?: (value: string) => void
}

/** Rich text editor for posts */
const RichTextEditor = forwardRef<any, RichTextEditorProps>(({ value = "", onChange, onFocus, onBlur, ...props }, ref) => {
  const [editorState, setEditorState] = useState(
    () => {
      const contentState = ContentState.createFromText(value);
      return EditorState.createWithContent(
        contentState,
        decorators
      );
    }
  );
  const editorRef = useRef<Editor>(null);
  const [focused, setFocused] = useState(false)

  const events = useMemo(() => ({
    keyboard: EditorKeyEvents()
  }), [])

  const handleChange = useCallback((newState: EditorState) => {
    if (onChange) onChange(newState.getCurrentContent().getPlainText())
    setEditorState(newState)
  }, [])

  useImperativeHandle(ref, () => ({
    focus: () => editorRef.current?.focus(),
  }), []);

  const handleFocus = useCallback((e: SyntheticEvent) => {
    setFocused(true)
    if (onFocus) onFocus(e)
  }, [])

  const handleBlur = useCallback((e: SyntheticEvent) => {
    setFocused(false)
    if (onBlur) onBlur(e)
  }, [])

  return (
    <EditorStateProvider value={{ editorState, setEditorState, focused }}>
      <EditorEventsProvider events={events}>
        <Editor
          editorState={editorState}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyBindingFn={(e) => {
            const handled = events.keyboard.emit(e)
            if (handled) return "event"
            return getDefaultKeyBinding(e)
          }}
          ref={editorRef}
          {...props}
        />
      </EditorEventsProvider>
    </EditorStateProvider>
  );
})

export default RichTextEditor
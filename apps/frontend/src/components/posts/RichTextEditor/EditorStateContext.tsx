import { EditorState } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { createContext, ReactNode, useContext } from 'react';

type EditorStateContextType = {
  editorState: EditorState,
  setEditorState: React.Dispatch<React.SetStateAction<EditorState>>,
  focused: boolean
}

const EditorStateContext = createContext<EditorStateContextType | undefined>(undefined)

export function EditorStateProvider({ children, value }: { children: ReactNode, value: EditorStateContextType }) {
  return <EditorStateContext.Provider value={value}>{children}</EditorStateContext.Provider>
}

export function useEditorState() {
  const data = useContext(EditorStateContext)
  if (!data) throw Error("useEditorState must be used within a EditorStateProvider")
  return data
}
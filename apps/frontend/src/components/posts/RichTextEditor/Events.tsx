import 'draft-js/dist/Draft.css';
import { createContext, KeyboardEvent, ReactNode, useContext } from 'react';

export type EditorKeyEvent = KeyboardEvent<{}>

export type EditorKeyEventHandler = (e: EditorKeyEvent) => boolean

export type EditorEvents = { keyboard: ReturnType<typeof EditorKeyEvents> }

const EditorEventsContext = createContext<EditorEvents | undefined>(undefined)

export function EditorEventsProvider({ children, events }: { children: ReactNode, events: EditorEvents }) {
  return <EditorEventsContext.Provider value={events}>{children}</EditorEventsContext.Provider>
}

export function useEditorEvents() {
  const data = useContext(EditorEventsContext)
  if (!data) throw Error("useEditorEvents must be used within a EditorEventsProvider")
  return data
}

export const EditorKeyEvents = () => {
  const listeners = new Set<EditorKeyEventHandler>()
  const emit = (data: EditorKeyEvent) => {
    for (const event of listeners) {
      let used = false
      if (event(data))
        used = true
      return used
    }
  }
  const subscribe = (event: EditorKeyEventHandler) => listeners.add(event);
  const unsubscribe = (event: EditorKeyEventHandler) => listeners.delete(event);
  const clear = () => listeners.clear();
  return { subscribe, unsubscribe, clear, emit };
}
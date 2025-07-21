import { Controller } from "react-hook-form";
import { RichTextEditorProps } from './Editor';
import ThemedEditor from "./ThemedEditor";

export type FormRichTextEditorProps = {
    name: string,
    editorProps?: RichTextEditorProps
}

/** Themed post text editor with react-hook-form integration. */
export default function FormRichTextEditor({ name, editorProps }: FormRichTextEditorProps) {
    return (
        <Controller
            name={name}
            render={({
                field,
                fieldState: { error },
            }) => (
                <ThemedEditor
                    editorProps={{ ...field, ...editorProps }}
                    error={Boolean(error)}
                />
            )}
        />
    )
}
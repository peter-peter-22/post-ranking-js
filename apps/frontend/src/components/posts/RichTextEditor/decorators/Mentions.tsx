import Link, { LinkProps } from '@mui/material/Link';
import { ContentBlock, ContentState, DraftDecorator, DraftDecoratorComponentProps } from 'draft-js';
import { forwardRef, useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { getMentionAutocomplete, UserPrediction } from '../../../../api/posts/creator/mentions/mentionsAutocomplete';
import { getUserUrl } from '../../../../urls/user';
import { mentionRegex } from '../../../../utilities/regex';
import RichTextAutocompleteContainer from '../autocomplete/AutoCompleteContainer';
import { useAutoCompleteController } from '../autocomplete/useAutoCompleteController';
import UserAutoCompleteSelector from '../autocomplete/UserAutoCompleteSelector';
import { findWithRegex, suggestionDebounce } from '../common';
import { useEditorState } from '../EditorStateContext';
import { replaceDecoratorText } from '../replaceText';

function mentionStrategy(
    block: ContentBlock,
    callback: (start: number, end: number) => void,
    _contentState: ContentState,
) {
    findWithRegex(mentionRegex, block, callback);
}

type MentionComponentProps = LinkProps & {
    decoratedText: string,

}

const MentionComponent = forwardRef<HTMLAnchorElement, MentionComponentProps>((
    { decoratedText, children, ...props },
    ref
) => {
    return (
        <Link
            {...props}
            href={getUserUrl(decoratedText ? decoratedText.substring(1) : "")}
            rel={"noreferrer noopener"}
            target="_self"
            ref={ref}
        >
            {children}
        </Link>
    )
})

function MentionComponentViewer(
    { decoratedText, children }: DraftDecoratorComponentProps
) {
    return (
        <MentionComponent
            decoratedText={decoratedText}
        >
            {children}
        </MentionComponent>
    )
}

function MentionComponentEditor({ children, ...props }: DraftDecoratorComponentProps) {
    const { editorState, setEditorState, focused } = useEditorState()
    // Remove @ from text
    const handle = props.decoratedText.substring(1)

    // Fetch suggestions
    const [loading, setLoading] = useState(true)
    const [debouncedText] = useDebounce(handle, suggestionDebounce)
    const [items, setItems] = useState<UserPrediction[]>([])
    useEffect(() => {
        setLoading(true)
        getMentionAutocomplete(debouncedText)
            .then(users => { setItems(users) })
            .catch(e => {
                console.error(e)
                // Clear the items on error
                setItems([])
            })
            .finally(() => { setLoading(false) })
    }, [debouncedText])

    // Handle autocomplete dialog visibility
    const { textRef, open, anchorEl } = useAutoCompleteController(props, editorState, focused)

    // Submit selected suggestion
    const submitSuggestion = (item: UserPrediction) => {
        setEditorState(
            replaceDecoratorText(
                props,
                editorState,
                "@" + item.handle,
                true
            )
        )
    }

    return (
        <>
            <MentionComponent
                decoratedText={props.decoratedText}
                onClick={(e) => { e.preventDefault() }}
                ref={textRef}
            >
                {children}
            </MentionComponent>
            <RichTextAutocompleteContainer
                aria-describedby="mention recommendations"
                open={open}
                anchorEl={anchorEl}
            >
                <UserAutoCompleteSelector
                    autoCompleteOptions={{
                        text: handle,
                        items: items,
                        filter: (text, user) => user.handle.startsWith(text),
                        onSubmit: submitSuggestion
                    }}
                    loading={loading}
                />
            </RichTextAutocompleteContainer>
        </>
    )
}

export const mentionDecoratorEditor: DraftDecorator = {
    strategy: mentionStrategy,
    component: MentionComponentEditor
};

export const mentionDecoratorViewer: DraftDecorator = {
    strategy: mentionStrategy,
    component: MentionComponentViewer
};
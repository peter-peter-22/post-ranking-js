import Link, { LinkProps } from '@mui/material/Link';
import { ContentBlock, ContentState, DraftDecorator, DraftDecoratorComponentProps } from 'draft-js';
import { forwardRef, useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { getHashtagAutocomplete } from '../../../../api/posts/creator/hashtags/hashtagsAutocomplete';
import { getTrendUrl } from '../../../../urls/trends';
import { hashtagRegex } from '../../../../utilities/regex';
import RichTextAutocompleteContainer from '../autocomplete/AutoCompleteContainer';
import HashtagAutoCompleteSelector from '../autocomplete/HashtagAutoCompleteSelector';
import { useAutoCompleteController } from '../autocomplete/useAutoCompleteController';
import { findWithRegex, suggestionDebounce } from '../common';
import { useEditorState } from '../EditorStateContext';
import { replaceDecoratorText } from '../replaceText';
import { Trend } from '@me/schemas/src/zod/trends';

function hashtagStrategy(
    block: ContentBlock,
    callback: (start: number, end: number) => void,
    _contentState: ContentState,
) {
    findWithRegex(hashtagRegex, block, callback);
}

type HashtagComponentProps = LinkProps & {
    decoratedText: string
}

const HashtagComponent = forwardRef<HTMLAnchorElement, HashtagComponentProps>(
    ({ decoratedText, children }, ref) => {
        return (
            <Link
                href={getTrendUrl(decoratedText ? decoratedText.substring(1) : "")}
                rel={"noreferrer noopener"}
                target="_blank"
                color="textPrimary"
                fontWeight="bold"
                ref={ref}
            >
                {children}
            </Link>
        )
    }
)

function HashtagComponentViewer({ decoratedText, children }: HashtagComponentProps) {
    return (
        <Link
            href={getTrendUrl(decoratedText ? decoratedText.substring(1) : "")}
            rel={"noreferrer noopener"}
            target="_blank"
            color="textPrimary"
            fontWeight="bold"
        >
            {children}
        </Link>
    )
}


function HashtagComponentEditor({ children, ...props }: DraftDecoratorComponentProps) {
    const { editorState, setEditorState, focused } = useEditorState()
    // Remove # from text
    const handle = props.decoratedText.substring(1)

    // Fetch suggestions
    const [loading, setLoading] = useState(true)
    const [debouncedText] = useDebounce(handle, suggestionDebounce)
    const [items, setItems] = useState<Trend[]>([])
    useEffect(() => {
        setLoading(true)
        getHashtagAutocomplete(debouncedText)
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
    const submitSuggestion = (item: Trend) => {
        setEditorState(
            replaceDecoratorText(
                props,
                editorState,
                "#" + item.keyword,
                true
            )
        )
    }
    return (
        <>
            <HashtagComponent
                decoratedText={props.decoratedText}
                onClick={(e) => { e.preventDefault() }}
                ref={textRef}
            >
                {children}
            </HashtagComponent>
            <RichTextAutocompleteContainer
                aria-describedby="hashtag recommendations"
                open={open}
                anchorEl={anchorEl}
            >
                <HashtagAutoCompleteSelector
                    autoCompleteOptions={{
                        text: handle,
                        items: items,
                        filter: (text, hashtag) => hashtag.keyword.startsWith(text),
                        onSubmit: submitSuggestion
                    }}
                    loading={loading}
                />
            </RichTextAutocompleteContainer>
        </>
    )
}

export const hashtagDecoratorEditor: DraftDecorator = {
    strategy: hashtagStrategy,
    component: HashtagComponentEditor
};

export const hashtagDecoratorViewer: DraftDecorator = {
    strategy: hashtagStrategy,
    component: HashtagComponentViewer
};
import Link, { LinkProps } from '@mui/material/Link';
import { ContentBlock, ContentState, DraftDecorator, DraftDecoratorComponentProps } from 'draft-js';
import { forwardRef } from 'react';
import { urlRegex } from '../../../../utilities/regex';
import { findWithRegex } from '../common';

function linkStrategy(
    block: ContentBlock,
    callback: (start: number, end: number) => void,
    _contentState: ContentState,
) {
    findWithRegex(urlRegex, block, callback);
}

const LinkComponent = forwardRef<HTMLAnchorElement, LinkProps>(
    ({ href, children }, ref) => {
        return (
            <Link
                href={href}
                rel={"noreferrer noopener"}
                target="_blank"
                ref={ref}
            >
                {children}
            </Link>
        )
    }
)
function LinkComponentViewer({ decoratedText }: DraftDecoratorComponentProps) {
    const maxLength=40
    const displayedText = decoratedText.length < maxLength ? (
        decoratedText
    ) : (
        decoratedText.slice(0, maxLength) + "..."
    )
    return (
        <LinkComponent
            href={decoratedText}
        >
            {displayedText}
        </LinkComponent>
    )
}

function LinkComponentEditor({ children, decoratedText }: DraftDecoratorComponentProps) {
    return (
        <LinkComponent
            href={decoratedText}
            onClick={(e) => { e.preventDefault() }}
        >
            {children}
        </LinkComponent>
    )
}

export const linkDecoratorEditor: DraftDecorator = {
    strategy: linkStrategy,
    component: LinkComponentEditor
};

export const linkDecoratorViewer: DraftDecorator = {
    strategy: linkStrategy,
    component: LinkComponentViewer
};
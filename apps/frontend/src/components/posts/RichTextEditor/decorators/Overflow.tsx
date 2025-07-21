import { alpha, useTheme } from '@mui/material/styles';
import { LinkProps } from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { ContentBlock, ContentState, DraftDecorator, DraftDecoratorComponentProps } from 'draft-js';
import { forwardRef } from 'react';

const limit = 10

function overflowStrategy(
    block: ContentBlock,
    callback: (start: number, end: number) => void,
    contentState: ContentState,
) {
    const blockKey = block.getKey();
    const allBlocks = contentState.getBlocksAsArray();

    let cumulativeLength = 0;

    for (const previousBlock of allBlocks) {
        const key = previousBlock.getKey();

        if (blockKey === key) {
            const myLength = block.getText().length
            if (cumulativeLength + myLength > limit) {
                // Text in this block contributes to overflow
                const start = limit - cumulativeLength;
                const end = myLength;
                callback(Math.max(start, 0), end);
                //callback(limit, block.getText().length);
            }
            cumulativeLength += myLength
        }
        else {
            const text = previousBlock.getText();
            const blockLength = text.length;
            cumulativeLength += blockLength;
        }
        // Count newlines — optional depending on how you define limits
        //cumulativeLength += 1; // for newline character
    }

    //callback(limit, block.getText().length);
}

const OverflowComponentEditor = forwardRef<HTMLParagraphElement, DraftDecoratorComponentProps & LinkProps>(
    ({ children }, ref) => {
        const theme = useTheme()
        return (
            <Typography
                ref={ref}
                component="mark"
                sx={{ backgroundColor: alpha(theme.palette.error.light, 0.5) }}
            >
                {children}
            </Typography>
        )
    }
)

export const overflowDecoratorEditor: DraftDecorator = {
    strategy: overflowStrategy,
    component: OverflowComponentEditor
};
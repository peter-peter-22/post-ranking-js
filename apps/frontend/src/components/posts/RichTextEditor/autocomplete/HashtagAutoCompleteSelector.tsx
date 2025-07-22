import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper, { PaperProps } from '@mui/material/Paper';
import { forwardRef } from 'react';
import { formatNumber } from '../../../../utilities/formatNumber';
import { RichTextAutoCompleteSelectorProps, useAutocompleteSelector } from './useAutoComplete';
import { Trend } from '@me/schemas/src/zod/trends';

type HashtagAutoCompleteSelectorProps = Omit<PaperProps, "onSubmit"> & {
    autoCompleteOptions: RichTextAutoCompleteSelectorProps<Trend>,
    loading: boolean
}

/** Rich text autocomplete for user items. */
const HashtagAutoCompleteSelector = forwardRef<HTMLDivElement, HashtagAutoCompleteSelectorProps>(
    ({
        autoCompleteOptions,
        loading,
        ...props
    }, ref) => {
        // Get autocomplete data
        const {
            selected,
            setSelected,
            filteredItems,
            onSubmit
        } = useAutocompleteSelector(autoCompleteOptions)

        return (
            <Paper sx={{ m: 1 }} ref={ref} {...props}>
                <List>
                    {
                        filteredItems.length > 0 ? (
                            filteredItems.map((item, i) => (
                                <ListItem disablePadding key={i}>
                                    <ListItemButton
                                        selected={i === selected}
                                        onMouseEnter={() => { setSelected(i) }}
                                        onClick={() => { onSubmit(item) }}
                                    >
                                        <ListItemText
                                            primary={item.keyword}
                                            secondary={formatNumber(item.postCount) + " posts"}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            ))
                        ) : (
                            loading ? (
                                <ListItem>
                                    <ListItemIcon>
                                        <CircularProgress size={25}/>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={"Loading"}
                                    />
                                </ListItem>
                            ) : (
                                <ListItem>
                                    <ListItemText
                                        primary={"No results"}
                                    />
                                </ListItem>
                            )
                        )
                    }
                </List>
            </Paper >
        )
    }
)

export default HashtagAutoCompleteSelector;
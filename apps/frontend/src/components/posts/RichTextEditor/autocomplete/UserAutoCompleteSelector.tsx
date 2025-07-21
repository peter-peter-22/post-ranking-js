import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper, { PaperProps } from '@mui/material/Paper';
import { forwardRef } from 'react';
import { UserPrediction } from '../../../../api/posts/creator/mentions/mentionsAutocomplete';
import UserAvatar from '../../../users/UserAvatar';
import { RichTextAutoCompleteSelectorProps, useAutocompleteSelector } from '../autocomplete/useAutoComplete';

type UserAutoCompleteSelectorProps = Omit<PaperProps, "onSubmit"> & {
    autoCompleteOptions: RichTextAutoCompleteSelectorProps<UserPrediction>,
    loading: boolean
}

/** Rich text autocomplete for user items. */
const UserAutoCompleteSelector = forwardRef<HTMLDivElement, UserAutoCompleteSelectorProps>(
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
                                        <ListItemAvatar>
                                            <UserAvatar file={undefined} handle={item.handle} />
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={item.name}
                                            secondary={"@" + item.handle}
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

export default UserAutoCompleteSelector;
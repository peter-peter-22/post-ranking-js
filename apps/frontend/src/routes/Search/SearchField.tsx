import { zodResolver } from "@hookform/resolvers/zod";
import SearchIcon from '@mui/icons-material/Search';
import Box from "@mui/material/Box";
import InputAdornment from "@mui/material/InputAdornment";
import { FormProvider, useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { z } from "zod";
import FormTextField from "../../components/inputs/FormTextField";

const SearchSchema = z.object({
    text: z.string(),
})

type FormData = z.infer<typeof SearchSchema>

export default function SearchField() {
    // Get search params
    const [searchParams, setSearchParams] = useSearchParams();
    const searchedText = searchParams.get("text") || "";

    // Handle form
    const methods = useForm<FormData>({
        resolver: zodResolver(SearchSchema),
        defaultValues: { text: searchedText }
    });
    const { handleSubmit } = methods;
    const onSubmit = async (data: FormData) => {
        console.log("Search form", data)
        setSearchParams(new URLSearchParams({ text:data.text }))
    }

    return (
        <Box component="form" sx={{ p: 1 }} onSubmit={handleSubmit(onSubmit)}>
            <FormProvider {...methods}>
                <FormTextField
                    size="small"
                    name="text"
                    fullWidth
                    placeholder="Search for a trend, keyword, or user..."
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        },
                    }}
                />
            </FormProvider>
        </Box>
    )
}
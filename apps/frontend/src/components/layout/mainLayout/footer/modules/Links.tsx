import Stack from '@mui/material/Stack';
import FooterLink from "../../../../buttons/FooterLink";
import Paper from "@mui/material/Paper";

export default function FooterLinks() {
    return (
        <Paper component="footer" sx={{p:2}}>
            <Stack direction={"row"} gap={1} flexWrap={"wrap"}>
                <FooterLink href="#">Privacy policy</FooterLink>
                <FooterLink href="#">Terms of service</FooterLink>
                <FooterLink href="#">About us</FooterLink>
                <FooterLink href="#">Contact</FooterLink>
            </Stack>
        </Paper>
    )
}
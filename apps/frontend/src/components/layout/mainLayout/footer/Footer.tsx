import Stack from '@mui/material/Stack';
import FooterLinks from './modules/Links';
import LayoutBox from '../LayoutBox';
import ClampedFollow from './ClampedFollow';

export type FooterProps = {
    children?: React.ReactNode
};

export default function Footer({ children }: FooterProps) {
    return (
        <ClampedFollow>
            <LayoutBox component="aside" >
                <Stack gap={2} >
                    {children}
                    <FooterLinks />
                </Stack>
            </LayoutBox>
        </ClampedFollow>
    )
}
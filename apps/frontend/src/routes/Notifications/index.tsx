import Footer from "../../components/layout/mainLayout/footer/Footer";
import TrendsPreview from "../../components/layout/mainLayout/footer/modules/Trends";
import WhoToFollow from "../../components/layout/mainLayout/footer/modules/WhoToFollow";
import { MainLayoutInner } from "../../components/layout/mainLayout/MainLayout";
import NotificationsPage from "./NotificationsPage";

export default function Notifications() {
    return <MainLayoutInner
        middle={<NotificationsPage />}
        right={<Footer><TrendsPreview /><WhoToFollow /></Footer>}
    />;
}
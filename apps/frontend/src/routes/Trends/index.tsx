import Footer from "../../components/layout/mainLayout/footer/Footer";
import WhoToFollow from "../../components/layout/mainLayout/footer/modules/WhoToFollow";
import { MainLayoutInner } from "../../components/layout/mainLayout/MainLayout";
import TrendsPage from "./TrendsPage";

export default function Trends() {
    return <MainLayoutInner
        middle={<TrendsPage />}
        right={<Footer><WhoToFollow /></Footer>}
    />;
}
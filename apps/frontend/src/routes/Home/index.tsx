import Footer from "../../components/layout/mainLayout/footer/Footer";
import TrendsPreview from "../../components/layout/mainLayout/footer/modules/Trends";
import WhoToFollow from "../../components/layout/mainLayout/footer/modules/WhoToFollow";
import { MainLayoutInner } from "../../components/layout/mainLayout/MainLayout";
import HomeFeed from "./HomePage";

export default function Home() {
    return <MainLayoutInner
        middle={<HomeFeed />}
        right={<Footer><TrendsPreview /><WhoToFollow  /></Footer>}
    />;
}
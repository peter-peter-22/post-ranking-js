import { useSearchParams } from "react-router-dom";
import Footer from "../../components/layout/mainLayout/footer/Footer";
import TrendsPreview from "../../components/layout/mainLayout/footer/modules/Trends";
import WhoToFollow from "../../components/layout/mainLayout/footer/modules/WhoToFollow";
import { MainLayoutInner } from "../../components/layout/mainLayout/MainLayout";
import SearchPage from "./SearchPage";

export default function Search() {
    const [searchParams] = useSearchParams();
    const text=searchParams.get("text")||""
    return <MainLayoutInner
        middle={<SearchPage key={text}/>}
        right={<Footer><WhoToFollow /><TrendsPreview /></Footer>}
    />;
}
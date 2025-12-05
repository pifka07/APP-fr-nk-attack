import Home from './pages/Home';
import Shop from './pages/Shop';
import Missions from './pages/Missions';
import Profile from './pages/Profile';
import Game from './pages/Game';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Leaderboard from './pages/Leaderboard';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Shop": Shop,
    "Missions": Missions,
    "Profile": Profile,
    "Game": Game,
    "PrivacyPolicy": PrivacyPolicy,
    "Leaderboard": Leaderboard,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
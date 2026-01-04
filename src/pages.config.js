import Home from './pages/Home';
import Leaderboard from './pages/Leaderboard';
import Missions from './pages/Missions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Profile from './pages/Profile';
import Shop from './pages/Shop';
import Skins from './pages/Skins';
import Game from './pages/Game';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Leaderboard": Leaderboard,
    "Missions": Missions,
    "PrivacyPolicy": PrivacyPolicy,
    "Profile": Profile,
    "Shop": Shop,
    "Skins": Skins,
    "Game": Game,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
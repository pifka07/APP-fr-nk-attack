import Europa from './pages/Europa';
import Game from './pages/Game';
import Home from './pages/Home';
import Leaderboard from './pages/Leaderboard';
import Missions from './pages/Missions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Profile from './pages/Profile';
import Shop from './pages/Shop';
import Skins from './pages/Skins';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Europa": Europa,
    "Game": Game,
    "Home": Home,
    "Leaderboard": Leaderboard,
    "Missions": Missions,
    "PrivacyPolicy": PrivacyPolicy,
    "Profile": Profile,
    "Shop": Shop,
    "Skins": Skins,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
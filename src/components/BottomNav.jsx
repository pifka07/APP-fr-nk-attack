import React, { useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Target, ShoppingBag, Trophy, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BottomNav() {
    const location = useLocation();
    const navigate = useNavigate();
    const historyStackRef = useRef({});
    
    const tabs = [
        { name: 'Missions', icon: Target, path: createPageUrl('Missions'), key: 'missions' },
        { name: 'Shop', icon: ShoppingBag, path: createPageUrl('Shop'), key: 'shop' },
        { name: 'Highscores', icon: Trophy, path: createPageUrl('Leaderboard'), key: 'leaderboard' },
        { name: 'Profile', icon: User, path: createPageUrl('Profile'), key: 'profile' }
    ];

    // Track navigation history for each stack
    useEffect(() => {
        const currentTab = tabs.find(t => location.pathname.startsWith(t.path));
        if (currentTab) {
            if (!historyStackRef.current[currentTab.key]) {
                historyStackRef.current[currentTab.key] = [];
            }
            historyStackRef.current[currentTab.key].push(location.pathname);
        }
    }, [location.pathname]);

    const handleTabClick = (e, tab) => {
        e.preventDefault();
        
        // Always navigate to the root path of the tab
        navigate(tab.path);
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-slate-800/95 backdrop-blur-lg border-t border-slate-700 z-50 select-none safe-area-pb">
            <div className="max-w-md mx-auto flex justify-around items-center h-16">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = location.pathname === tab.path || location.pathname.startsWith(tab.path + '/');
                    
                    return (
                        <Link
                            key={tab.name}
                            to={tab.path}
                            onClick={(e) => handleTabClick(e, tab)}
                            className="flex-1 flex flex-col items-center justify-center h-full relative"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-teal-500/20"
                                    initial={false}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                />
                            )}
                            <Icon className={`w-6 h-6 relative z-10 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                            <span className={`text-xs mt-1 relative z-10 ${isActive ? 'text-teal-400 font-semibold' : 'text-slate-400'}`}>
                                {tab.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
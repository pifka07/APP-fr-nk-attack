import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';
import { Play, ShoppingCart, Target, User as UserIcon, Trophy } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const initUser = async () => {
            try {
                const currentUser = await base44.auth.me();
                setUser(currentUser);
                // Initialize default user stats if they don't exist (handled by entity default, but good to ensure)
            } catch (e) {
                console.error("User not loaded", e);
            }
        };
        initUser();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-cyan-900 via-purple-900 to-slate-900 p-6 relative overflow-hidden">
            {/* Animated Background Elements */}
            <motion.div 
                animate={{ x: [0, 100, 0], y: [0, -20, 0] }}
                transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                className="absolute top-20 left-10 opacity-20"
            >
                <div className="w-32 h-32 rounded-full bg-teal-400 blur-3xl"></div>
            </motion.div>
            <motion.div 
                animate={{ x: [0, -100, 0], y: [0, 30, 0] }}
                transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                className="absolute bottom-20 right-10 opacity-20"
            >
                <div className="w-40 h-40 rounded-full bg-purple-500 blur-3xl"></div>
            </motion.div>

            {/* Title Section */}
            <div className="text-center mb-12 z-10">
                <motion.h1 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-purple-400 to-yellow-400 drop-shadow-lg"
                    style={{ fontFamily: 'Impact, sans-serif' }} // Fallback to a chunky font
                >
                    FRÄNK
                </motion.h1>
                <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl font-bold text-teal-200 tracking-wide mt-2"
                >
                    THE POOP FROM ABOVE
                </motion.p>
            </div>

            {/* Fränk Avatar (Placeholder) */}
            <motion.div 
                animate={{ y: [-10, 10, -10] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="mb-12 relative z-10"
            >
                <div className="w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center border-4 border-teal-400 shadow-[0_0_30px_rgba(45,212,191,0.5)]">
                    <span className="text-6xl">🐦</span>
                </div>
            </motion.div>

            {/* Menu Buttons */}
            <div className="w-full max-w-xs space-y-4 z-10">
                <Link to={createPageUrl('Game')}>
                    <Button className="w-full h-16 text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-slate-900 border-0 shadow-[0_0_20px_rgba(250,204,21,0.4)] transform hover:scale-105 transition-all mb-4">
                        <Play className="mr-2 w-6 h-6 fill-current" /> PLAY RUN
                    </Button>
                </Link>

                <div className="grid grid-cols-2 gap-4">
                    <Link to={createPageUrl('Shop')}>
                        <Button variant="outline" className="w-full h-14 bg-slate-800/50 border-purple-500 text-purple-300 hover:bg-purple-900/50 hover:text-white backdrop-blur-sm">
                            <ShoppingCart className="mr-2 w-5 h-5" /> Shop
                        </Button>
                    </Link>
                    <Link to={createPageUrl('Missions')}>
                        <Button variant="outline" className="w-full h-14 bg-slate-800/50 border-teal-500 text-teal-300 hover:bg-teal-900/50 hover:text-white backdrop-blur-sm">
                            <Target className="mr-2 w-5 h-5" /> Missions
                        </Button>
                    </Link>
                </div>

                <Link to={createPageUrl('Profile')}>
                    <Button variant="ghost" className="w-full text-slate-400 hover:text-white hover:bg-white/10">
                        <UserIcon className="mr-2 w-5 h-5" /> Profile & Stats
                    </Button>
                </Link>
            </div>

            {/* Footer Stats */}
            {user && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute bottom-6 flex gap-6 text-sm font-medium text-slate-400"
                >
                    <div className="flex items-center">
                        <span className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></span>
                        {user.total_coins || 0} Coins
                    </div>
                    <div className="flex items-center">
                        <Trophy className="w-3 h-3 mr-2 text-purple-400" />
                        Highscore: {user.best_score || 0}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
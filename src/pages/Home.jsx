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
        <div className="flex flex-col items-center justify-end min-h-screen bg-slate-900 p-6 relative overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/b3b7d6b41_ChatGPTImage3Dez202518_19_15.png" 
                    alt="Background" 
                    className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
            </div>

            {/* Title Section */}
            <div className="text-center mb-8 z-10 relative">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-4 flex flex-col items-center"
                >
                    <img 
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/81c474281_FrnkdieTaube3-Kopie.png" 
                        alt="Fränk Character" 
                        className="w-40 h-40 object-contain mb-2 drop-shadow-2xl filter brightness-110"
                    />
                    <h1 className="text-6xl font-black text-white drop-shadow-[0_4px_0_#000] tracking-wider" style={{ fontFamily: 'Impact, sans-serif' }}>
                        FRÄNK
                    </h1>
                </motion.div>
            </div>

            {/* Menu Buttons */}
            <div className="w-full max-w-xs space-y-4 z-10">
                <Link to={createPageUrl('Game')}>
                    <Button className="w-full h-16 text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-slate-900 border-0 shadow-[0_0_20px_rgba(250,204,21,0.4)] transform hover:scale-105 transition-all mb-4">
                        <Play className="mr-2 w-6 h-6 fill-current" /> PLAY
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
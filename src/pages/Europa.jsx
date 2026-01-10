import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Play, Lock, Trophy, Coins } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function Europa() {
    const [stats, setStats] = useState(null);
    const [unlockedLevels, setUnlockedLevels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const user = await base44.auth.me();
                const playerStats = await base44.entities.PlayerStats.filter({ user_id: user.id });
                const unlocked = await base44.entities.UnlockedLevel.filter({ user_id: user.id });
                
                setStats(playerStats.length > 0 ? playerStats[0] : { total_score: 0, total_coins: 0 });
                setUnlockedLevels(unlocked.map(u => u.level_id));
            } catch (error) {
                setStats({ total_score: 0, total_coins: 0 });
                setUnlockedLevels([]);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const levelRequirements = {
        london: { score: 500, coins: 250 },
        paris: { score: 1000, coins: 500 },
        madrid: { score: 3000, coins: 1500 },
        rome: { score: 6000, coins: 3000 },
        berlin: { score: 10000, coins: 5000 }
    };

    const europeanLevels = [
        {
            id: 'london',
            name: 'London',
            description: 'Big Ben, Tower Bridge, and the Eye. Poop like royalty!',
            image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/13caea1c7_file_0000000036c0722fb90be1d4f360a66d.png'
        },
        {
            id: 'paris',
            name: 'Paris',
            description: 'The City of Light. Eiffel Tower, Notre-Dame, and croissants!',
            image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/8859d51a5_file_00000000f5c8722fbfc7d8fffaafeec6.png'
        },
        {
            id: 'madrid',
            name: 'Madrid',
            description: 'Royal Palace, tapas, and Spanish flair. ¡Vamos!',
            image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/dbc30a26c_file_000000007ee0722fb1fc03fbe2a5cdea.png'
        },
        {
            id: 'rome',
            name: 'Rom',
            description: 'Colosseum, ancient ruins, and pasta. When in Rome...',
            image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/ba63ecdfe_file_00000000b38c722fbef60ea67c6e8c16.png'
        },
        {
            id: 'berlin',
            name: 'Berlin',
            description: 'Brandenburger Tor, Fernsehturm, and currywurst!',
            image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/87f9f8d81_file_000000008e14722f878ca7562773ebbd.png'
        }
    ].map(level => {
        const req = levelRequirements[level.id];
        const isUnlocked = unlockedLevels.includes(level.id);
        const meetsRequirements = stats && stats.total_score >= req.score && stats.total_coins >= req.coins;
        const locked = !isUnlocked;
        
        return { ...level, locked, requirements: req, meetsRequirements };
    });

    const handleUnlockLevel = async (e, level) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!level.meetsRequirements) {
            toast.error(`Du brauchst ${level.requirements.score} Score und ${level.requirements.coins} Coins!`);
            return;
        }
        
        try {
            const user = await base44.auth.me();
            
            // Create unlock entry
            await base44.entities.UnlockedLevel.create({ user_id: user.id, level_id: level.id });
            
            // Deduct coins
            const playerStats = await base44.entities.PlayerStats.filter({ user_id: user.id });
            if (playerStats.length > 0) {
                const currentStats = playerStats[0];
                await base44.entities.PlayerStats.update(currentStats.id, {
                    total_coins: currentStats.total_coins - level.requirements.coins
                });
                setStats(prev => ({ ...prev, total_coins: prev.total_coins - level.requirements.coins }));
            }
            
            setUnlockedLevels(prev => [...prev, level.id]);
            toast.success(`${level.name} freigeschaltet!`);
        } catch (error) {
            console.error('Failed to unlock level:', error);
            toast.error('Freischaltung fehlgeschlagen');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center text-teal-400">
                Loading...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-4 pt-[15px] pb-20">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6 sticky top-0 bg-slate-900/90 backdrop-blur-md z-20 py-4 border-b border-slate-800">
                <Link to={createPageUrl('Missions')}>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-purple-400">EUROPA</h1>
            </div>

            <div className="space-y-6">
                {europeanLevels.map((level, index) => (
                    <motion.div
                        key={level.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        {level.locked && level.meetsRequirements ? (
                            <div onClick={(e) => handleUnlockLevel(e, level)} className="cursor-pointer">
                                <Card className="relative overflow-hidden border-4 transition-all duration-300 group border-yellow-600 hover:border-yellow-400">
                                    {/* Background Image */}
                                    <div className="absolute inset-0 z-0">
                                        <img 
                                            src={level.image} 
                                            alt={level.name} 
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                                    </div>

                                    <CardContent className="relative z-10 p-6 h-40 flex flex-col justify-end">
                                        <div className="flex justify-between items-end">
                                            <div className="flex-1">
                                                <h2 className="text-3xl font-black text-white font-titan uppercase stroke-black drop-shadow-lg">{level.name}</h2>
                                                <p className="text-slate-200 text-sm font-medium drop-shadow-md">{level.description}</p>
                                                <div className="mt-2 flex flex-col gap-1 text-xs text-slate-300">
                                                    <div className="flex items-center gap-1">
                                                        <Trophy className="w-3 h-3" />
                                                        <span>Benötigt: {level.requirements.score} Score</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Coins className="w-3 h-3" />
                                                        <span>Benötigt: {level.requirements.coins} Coins</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-yellow-600 p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                                                <Coins className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <Link to={level.locked ? '#' : `${createPageUrl('Game')}?level=${level.id}`}>
                                <Card className={`relative overflow-hidden border-4 transition-all duration-300 group ${level.locked ? 'border-slate-700 opacity-70' : 'border-slate-700 hover:border-teal-500 hover:shadow-[0_0_20px_rgba(45,212,191,0.3)]'}`}>
                                    {/* Background Image */}
                                    <div className="absolute inset-0 z-0">
                                        <img 
                                            src={level.image} 
                                            alt={level.name} 
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                                    </div>

                                    <CardContent className="relative z-10 p-6 h-40 flex flex-col justify-end">
                                        <div className="flex justify-between items-end">
                                            <div className="flex-1">
                                                <h2 className="text-3xl font-black text-white font-titan uppercase stroke-black drop-shadow-lg">{level.name}</h2>
                                                <p className="text-slate-200 text-sm font-medium drop-shadow-md">{level.description}</p>
                                                {level.locked && (
                                                    <div className="mt-2 flex flex-col gap-1 text-xs text-slate-300">
                                                        <div className="flex items-center gap-1">
                                                            <Trophy className="w-3 h-3" />
                                                            <span>Benötigt: {level.requirements.score} Score</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Coins className="w-3 h-3" />
                                                            <span>Benötigt: {level.requirements.coins} Coins</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {level.locked ? (
                                                <div className="bg-slate-900/80 p-3 rounded-full">
                                                    <Lock className="w-6 h-6 text-slate-500" />
                                                </div>
                                            ) : (
                                                <div className="bg-teal-500 p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                                                    <Play className="w-6 h-6 text-white fill-current" />
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
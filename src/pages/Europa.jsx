import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Lock, Trophy, Coins } from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { toast } from "sonner";
import MobileHeader from '@/components/MobileHeader';

export default function Europa() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [unlockedLevels, setUnlockedLevels] = useState([]);
    const [loading, setLoading] = useState(true);
    const dragX = useMotionValue(0);
    const background = useTransform(dragX, [0, 300], ['rgba(15, 23, 42, 1)', 'rgba(45, 212, 191, 0.1)']);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const user = await base44.auth.me();
                const unlocked = await base44.entities.UnlockedLevel.filter({ user_id: user.id });
                
                const currentStats = {
                    total_score: user.total_score || 0,
                    total_coins: user.total_coins || 0
                };
                console.log('Europa Stats from User:', currentStats);
                console.log('Unlocked Levels:', unlocked);
                
                setStats(currentStats);
                setUnlockedLevels(unlocked.map(u => u.level_id));
            } catch (error) {
                console.error('Error fetching stats:', error);
                setStats({ total_score: 0, total_coins: 0 });
                setUnlockedLevels([]);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();

        // Handle hardware back button (Android)
        const handleBackButton = (e) => {
            e.preventDefault();
            navigate(createPageUrl('Missions'));
        };
        window.addEventListener('popstate', handleBackButton);
        return () => window.removeEventListener('popstate', handleBackButton);
    }, [navigate]);

    const levelRequirements = {
        london: { score: 1000, coins: 500 },
        paris: { score: 1000, coins: 500 },
        madrid: { score: 1000, coins: 500 },
        rome: { score: 1000, coins: 500 },
        berlin: { score: 1000, coins: 500 }
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
            image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/562d13a4a_Hintergrund.png'
        },
        {
            id: 'berlin',
            name: 'Berlin',
            description: 'Brandenburger Tor, Fernsehturm, and currywurst!',
            image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/25d9baf11_Hintergrund.png'
        }
    ].map(level => {
        const req = levelRequirements[level.id];
        const isUnlocked = unlockedLevels.includes(level.id);
        const meetsRequirements = stats && stats.total_score >= req.score && stats.total_coins >= req.coins;
        const locked = !isUnlocked;
        
        console.log(`${level.id}: unlocked=${isUnlocked}, meetsReq=${meetsRequirements}, score=${stats?.total_score}/${req.score}, coins=${stats?.total_coins}/${req.coins}`);
        
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

    const handleDragEnd = (event, info) => {
        if (info.offset.x > 200) {
            navigate(createPageUrl('Missions'));
        }
    };

    return (
        <motion.div 
            className="min-h-screen bg-slate-900 text-slate-100 pb-20"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0, right: 0.5 }}
            onDragEnd={handleDragEnd}
            style={{ background }}
        >
            <MobileHeader title="EUROPA" showBack={true} backTo={createPageUrl('Missions')} />
            
            <div className="p-4">

            <div className="space-y-6">
                {europeanLevels.map((level, index) => (
                    <motion.div
                        key={level.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        {level.comingSoon ? (
                            <Card className="relative overflow-hidden border-4 transition-all duration-300 border-slate-700 opacity-70 cursor-not-allowed">
                                <div className="absolute inset-0 z-0">
                                    <img 
                                        src={level.image} 
                                        alt={level.name} 
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                                </div>

                                <CardContent className="relative z-10 p-6 h-40 flex flex-col justify-end">
                                    <div className="flex justify-between items-end">
                                        <div className="flex-1">
                                            <h2 className="text-3xl font-black text-white font-titan uppercase stroke-black drop-shadow-lg">{level.name}</h2>
                                            <p className="text-slate-200 text-sm font-medium drop-shadow-md">{level.description}</p>
                                        </div>

                                        <div className="absolute top-4 right-4 bg-yellow-500 text-slate-900 font-black text-xs px-3 py-1.5 rounded-full shadow-lg transform rotate-12">
                                            COMING SOON
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : level.locked && level.meetsRequirements ? (
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
                                            <div className="flex-1 max-w-[70%]">
                                                <h2 className="text-2xl font-black text-white font-titan uppercase stroke-black drop-shadow-lg leading-tight">{level.name}</h2>
                                                <p className="text-slate-200 text-xs font-medium drop-shadow-md line-clamp-2 mt-1">{level.description}</p>
                                                {level.locked && (
                                                    <div className="mt-1.5 flex flex-col gap-0.5 text-[10px] text-slate-300">
                                                        <div className="flex items-center gap-1">
                                                            <Trophy className="w-2.5 h-2.5" />
                                                            <span>{level.requirements.score} Score</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Coins className="w-2.5 h-2.5" />
                                                            <span>{level.requirements.coins} Coins</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {level.comingSoon ? (
                                                <div className="absolute top-4 right-4 bg-yellow-500 text-slate-900 font-black text-xs px-3 py-1.5 rounded-full shadow-lg transform rotate-12">
                                                    COMING SOON
                                                </div>
                                            ) : level.locked ? (
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
                    </motion.div>
                    );
                    }
import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { base44 } from '@/api/base44Client';
import GameEngine from '@/components/game/GameEngine';
import { Pause, Play, RefreshCw, Home as HomeIcon, Heart, Trophy, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function Game() {
    const engineRef = useRef(null);
    const [gameState, setGameState] = useState('start'); // start, playing, paused, gameover
    const [score, setScore] = useState(0);
    const [coins, setCoins] = useState(0);
    const [health, setHealth] = useState(100);
    const [combo, setCombo] = useState(0);
    const [finalStats, setFinalStats] = useState(null);
    const [saving, setSaving] = useState(false);
    const [gameConfig, setGameConfig] = useState({});
    const [skin, setSkin] = useState('default');

    useEffect(() => {
        const loadConfig = async () => {
            try {
                const [user, playerUpgrades, upgrades] = await Promise.all([
                    base44.auth.me(),
                    base44.entities.PlayerUpgrade.list(),
                    base44.entities.Upgrade.list()
                ]);
                
                setSkin(user.equipped_skin || 'default');

                // Default config
                let config = {
                    maxPoops: 3,
                    cooldownReduction: 0,
                    agility: 1,
                    comboDuration: 2000
                };

                playerUpgrades.forEach(pu => {
                    const upgrade = upgrades.find(u => u.id === pu.upgrade_id);
                    if (upgrade) {
                        const totalEffect = upgrade.effect_per_level * pu.level;
                        switch(upgrade.key) {
                            case 'poop_tank': config.maxPoops += Math.floor(totalEffect); break;
                            case 'poop_cooldown': config.cooldownReduction += totalEffect; break;
                            case 'wing_speed': config.agility += totalEffect; break;
                            case 'combo_booster': config.comboDuration += (totalEffect * 1000); break;
                        }
                    }
                });
                setGameConfig(config);
            } catch (e) {
                console.error("Failed to load game config", e);
            }
        };
        loadConfig();
    }, []);

    const startGame = () => {
        setGameState('playing');
        setScore(0);
        setCoins(0);
        setHealth(100);
        setCombo(0);
        setFinalStats(null);
        if (engineRef.current) engineRef.current.start();
    };

    const pauseGame = () => {
        setGameState('paused');
        if (engineRef.current) engineRef.current.stop();
    };

    const resumeGame = () => {
        setGameState('playing');
        if (engineRef.current) engineRef.current.start();
    };

    const handleGameOver = async (stats) => {
        setGameState('gameover');
        setFinalStats(stats);
        setSaving(true);

        try {
            const user = await base44.auth.me();
            
            // Create Run Record
            await base44.entities.Run.create({
                score: stats.score,
                distance: stats.distance,
                coins_earned: stats.coins,
                mode: 'endless'
            });

            // Update User Stats
            await base44.auth.updateMe({
                total_coins: (user.total_coins || 0) + stats.coins,
                best_score: Math.max(user.best_score || 0, stats.score),
                best_distance: Math.max(user.best_distance || 0, stats.distance)
            });

            toast.success("Run saved!");
        } catch (error) {
            console.error("Failed to save run", error);
            toast.error("Failed to save stats");
        } finally {
            setSaving(false);
        }
    };

    const handleScreenTouch = (e) => {
        // If tapping on a button, don't flap
        if (e.target.closest('button')) return;
        
        if (gameState === 'playing' && engineRef.current) {
            engineRef.current.flap();
        }
    };

    const handlePoop = (e) => {
        e.stopPropagation(); // Prevent flap
        if (gameState === 'playing' && engineRef.current) {
            engineRef.current.poop();
        }
    };

    return (
        <div 
            className="relative w-full h-screen bg-slate-900 overflow-hidden select-none touch-none"
            onMouseDown={handleScreenTouch}
            onTouchStart={handleScreenTouch}
        >
            {/* Game Engine Canvas */}
            <div className="absolute inset-0 z-0">
                <GameEngine 
                    ref={engineRef}
                    config={gameConfig}
                    skin={skin}
                    onGameOver={handleGameOver}
                    onScoreUpdate={(s, c) => { setScore(s); setCoins(c); }}
                    onHealthUpdate={setHealth}
                    onComboUpdate={setCombo}
                />
            </div>

            {/* HUD */}
            {gameState !== 'start' && (
                <div className="absolute top-0 left-0 right-0 p-4 z-10 pointer-events-none">
                    <div className="flex justify-between items-start">
                        {/* Health & Score */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-1 bg-slate-900/50 backdrop-blur-sm p-2 rounded-full border border-slate-700">
                                <Heart className="w-5 h-5 text-red-500 fill-current" />
                                <div className="w-32 h-3 bg-slate-700 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-red-500 transition-all duration-300" 
                                        style={{ width: `${health}%` }}
                                    />
                                </div>
                            </div>
                            <div className="bg-slate-900/50 backdrop-blur-sm p-2 rounded-lg border border-slate-700 inline-block">
                                <div className="text-2xl font-black text-yellow-400 tabular-nums">{score}</div>
                                <div className="text-xs text-slate-400">PTS</div>
                            </div>
                        </div>

                        {/* Combo Indicator */}
                        <AnimatePresence>
                            {combo > 1 && (
                                <motion.div 
                                    initial={{ scale: 0, rotate: -10 }}
                                    animate={{ scale: 1.2, rotate: 0 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    key="combo"
                                    className="absolute top-16 left-4"
                                >
                                    <div className="bg-purple-600 text-white font-black text-xl px-3 py-1 rounded-lg shadow-lg border-2 border-white transform -rotate-6">
                                        {combo}x COMBO!
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Pause Button */}
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="pointer-events-auto text-white hover:bg-white/20 rounded-full"
                            onClick={(e) => { e.stopPropagation(); pauseGame(); }}
                        >
                            <Pause className="w-8 h-8" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Controls Overlay (Mobile friendly) */}
            {gameState === 'playing' && (
                <div className="absolute bottom-0 left-0 right-0 p-6 z-10 pointer-events-none flex justify-between items-end">
                     <div className="text-white/50 text-sm font-bold animate-pulse pointer-events-none ml-4 mb-4">
                        TAP SCREEN TO FLY
                    </div>

                    {/* Poop Button */}
                    <motion.button 
                        whileTap={{ scale: 0.9 }}
                        className="pointer-events-auto w-24 h-24 rounded-full bg-gradient-to-b from-orange-400 to-orange-600 border-4 border-white/20 shadow-[0_8px_0_rgb(194,65,12)] active:shadow-none active:translate-y-2 transition-all flex items-center justify-center"
                        onClick={handlePoop}
                        onTouchStart={handlePoop}
                    >
                        <span className="text-5xl filter drop-shadow-md">💩</span>
                    </motion.button>
                </div>
            )}

            {/* Start Screen */}
            {gameState === 'start' && (
                <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-6">
                    <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-teal-400 to-purple-600 mb-8 drop-shadow-lg text-center">
                        READY TO POOP?
                    </h1>
                    <div className="space-y-4 w-full max-w-xs">
                        <div className="bg-slate-800/80 p-6 rounded-3xl border-4 border-slate-700 text-center backdrop-blur-sm shadow-2xl">
                            <div className="mb-6">
                                <img 
                                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/afbb5dca0_ChatGPTImage3Dez202518_29_58.png" 
                                    className="w-32 h-32 mx-auto object-cover object-[70%_0%] rounded-full border-4 border-teal-500 bg-cyan-400 mb-4" 
                                    style={{ objectPosition: '66% 27%', width: '120px', height: '120px' }} // Crop to Fränk's face from Loading
                                    alt="Fränk"
                                />
                                <p className="text-teal-300 font-bold mb-1">MISSION</p>
                                <p className="text-white text-xl font-black uppercase">Poop on Everything</p>
                            </div>

                            <Button 
                                size="lg" 
                                className="w-full h-16 text-2xl font-black bg-orange-500 hover:bg-orange-600 text-white border-b-8 border-orange-700 rounded-2xl active:border-b-0 active:translate-y-2 transition-all mb-4"
                                onClick={(e) => { e.stopPropagation(); startGame(); }}
                            >
                                PLAY
                            </Button>
                            
                            <Link to={createPageUrl('Home')} className="block">
                                <Button variant="ghost" className="w-full text-slate-400 hover:text-white hover:bg-transparent">
                                    MENU
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Pause Screen */}
            {gameState === 'paused' && (
                <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6">
                    <h2 className="text-4xl font-bold text-white mb-8">PAUSED</h2>
                    <div className="space-y-4 w-full max-w-xs">
                        <Button 
                            size="lg" 
                            className="w-full h-14 bg-teal-500 hover:bg-teal-600 text-white"
                            onClick={(e) => { e.stopPropagation(); resumeGame(); }}
                        >
                            <Play className="mr-2 w-5 h-5 fill-current" /> RESUME
                        </Button>
                        <Link to={createPageUrl('Home')} className="block">
                            <Button variant="destructive" size="lg" className="w-full">
                                <HomeIcon className="mr-2 w-5 h-5" /> QUIT
                            </Button>
                        </Link>
                    </div>
                </div>
            )}

            {/* Game Over Screen */}
            {gameState === 'gameover' && finalStats && (
                <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-6">
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-full max-w-sm text-center"
                    >
                        <div className="mb-6">
                            <h2 className="text-6xl font-black text-white mb-2 drop-shadow-[0_4px_0_#000]">GAME</h2>
                            <h2 className="text-6xl font-black text-white mb-6 drop-shadow-[0_4px_0_#000]">OVER</h2>
                            
                            {/* Dead Fränk Image */}
                            <div className="relative w-48 h-48 mx-auto mb-6">
                                <img 
                                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/973061496_ChatGPTImage3Dez202518_18_26.png" 
                                    className="w-full h-full object-cover object-[100%_100%]" // Crop to Dead Fränk (bottom right)
                                    style={{ objectPosition: '100% 100%' }}
                                    alt="Dead Fränk"
                                />
                            </div>
                        </div>

                        <div className="bg-slate-800/80 border-4 border-slate-700 p-6 rounded-3xl mb-6">
                            <div className="flex justify-around mb-2">
                                <div>
                                    <div className="text-xs text-slate-400 uppercase font-bold">Score</div>
                                    <div className="text-yellow-400 text-4xl font-black">{finalStats.score}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-400 uppercase font-bold">Coins</div>
                                    <div className="text-teal-400 text-4xl font-black">{finalStats.coins}</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Button 
                                size="lg" 
                                className="w-full h-16 text-2xl font-black bg-orange-500 hover:bg-orange-600 text-white border-b-8 border-orange-700 rounded-2xl active:border-b-0 active:translate-y-2 transition-all"
                                onClick={(e) => { e.stopPropagation(); startGame(); }}
                            >
                                RETRY
                            </Button>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <Link to={createPageUrl('Shop')}>
                                    <Button className="w-full h-14 font-bold bg-purple-600 hover:bg-purple-700 text-white border-b-4 border-purple-800 rounded-xl active:border-b-0 active:translate-y-1">
                                        SHOP
                                    </Button>
                                </Link>
                                <Link to={createPageUrl('Home')}>
                                    <Button className="w-full h-14 font-bold bg-yellow-500 hover:bg-yellow-600 text-slate-900 border-b-4 border-yellow-700 rounded-xl active:border-b-0 active:translate-y-1">
                                        MENU
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { base44 } from '@/api/base44Client';
import GameEngine from '@/components/game/GameEngine';
import { Pause, Play, RefreshCw, Home as HomeIcon, Heart, Trophy, Target, Zap, Music, Music2, Volume2, VolumeX, ArrowUp, Coins } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const UI_ATLAS = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/8759edce6_ChatGPTImage3Dez202518_37_35.png";

export default function Game() {
    const engineRef = useRef(null);
    const [gameState, setGameState] = useState('start'); 
    const [score, setScore] = useState(0);
    const [coins, setCoins] = useState(0);
    const [health, setHealth] = useState(100);
    const [combo, setCombo] = useState(0);
    const [finalStats, setFinalStats] = useState(null);
    const [saving, setSaving] = useState(false);
    const [gameConfig, setGameConfig] = useState({});
    const [skin, setSkin] = useState('default');
    const [musicEnabled, setMusicEnabled] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    
    // Get selected level from URL
    const urlParams = new URLSearchParams(window.location.search);
    const currentLevel = urlParams.get('level') || 'downtown';

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

            const newBestScore = Math.max(user.best_score || 0, stats.score);

            // Update User Stats
            await base44.auth.updateMe({
                total_coins: (user.total_coins || 0) + stats.coins,
                best_score: newBestScore,
                best_distance: Math.max(user.best_distance || 0, stats.distance)
            });

            // Update Public Leaderboard
            try {
                // Find existing entry for this user (using created_by implicit filter or explicit user_id check if possible)
                // Since we can only update our own records usually, checking specifically for my entry is safer via list filter
                // However, the easiest way to maintain "one entry per user" without complex backend logic is to check if we have one.
                // We'll search by user_id (which we'll store)
                const existingEntries = await base44.entities.LeaderboardEntry.list({ 
                    user_id: user.id 
                }, 1);

                if (existingEntries.length > 0) {
                    const entry = existingEntries[0];
                    if (stats.score > entry.score) {
                        await base44.entities.LeaderboardEntry.update(entry.id, {
                            score: stats.score,
                            username: user.username || user.email?.split('@')[0] || 'Pilot',
                            date: new Date().toISOString()
                        });
                    }
                } else {
                    await base44.entities.LeaderboardEntry.create({
                        user_id: user.id,
                        username: user.username || user.email?.split('@')[0] || 'Pilot',
                        score: stats.score,
                        date: new Date().toISOString()
                    });
                }
            } catch (lbError) {
                console.error("Failed to update leaderboard", lbError);
            }

            // Check for Top 10 locally to notify user immediately (optional UX)
            // We'll rely on the Leaderboard page for the full list, but could toast here.
            if (stats.score > (user.best_score || 0)) {
                toast.success("New Personal Best!");
            } else {
                toast.success("Run saved!");
            }
        } catch (error) {
            console.error("Failed to save run", error);
            toast.error("Failed to save stats");
        } finally {
            setSaving(false);
        }
    };

    const touchYRef = useRef(null);

    const handleInputStart = (e) => {
        // If tapping on a button, don't flap
        if (e.target.closest('button')) return;

        if (gameState === 'playing' && engineRef.current) {
            engineRef.current.startInput();
            // Initialize touch/mouse position
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            touchYRef.current = clientY;
        }
    };

    const handleInputMove = (e) => {
        if (gameState === 'playing' && engineRef.current && touchYRef.current !== null) {
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const deltaY = clientY - touchYRef.current;

            // Pass movement to engine (sensitivity adjustment if needed)
            engineRef.current.movePlayer(deltaY * 1.2);

            touchYRef.current = clientY;
        }
    };

    const handleInputEnd = () => {
        touchYRef.current = null;
        if (gameState === 'playing' && engineRef.current) {
            engineRef.current.endInput();
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
            onMouseDown={handleInputStart}
            onTouchStart={handleInputStart}
            onMouseMove={handleInputMove}
            onTouchMove={handleInputMove}
            onMouseUp={handleInputEnd}
            onTouchEnd={handleInputEnd}
            onMouseLeave={handleInputEnd}
        >
            {/* Game Engine Canvas */}
            <div className="absolute inset-0 z-0">
                <GameEngine 
                    ref={engineRef}
                    config={gameConfig}
                    skin={skin}
                    level={currentLevel}
                    musicEnabled={musicEnabled}
                    soundEnabled={soundEnabled}
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
                            {/* Health Bar with Icon */}
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-full border-2 border-white shadow-md overflow-hidden relative bg-blue-400 flex items-center justify-center">
                                    <img 
                                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/b686e47c1_FrnkdieTaubeicon9.png" 
                                        alt="Energy" 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="w-32 h-4 bg-slate-800 rounded-full border-2 border-slate-600 overflow-hidden relative">
                                    <div 
                                        className="h-full bg-gradient-to-r from-teal-400 to-teal-300 transition-all duration-300" 
                                        style={{ width: `${health}%` }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-md">ENERGY</div>
                                </div>
                            </div>

                            {/* Coins Display */}
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-full border-2 border-yellow-400 shadow-md overflow-hidden relative bg-yellow-100 flex items-center justify-center">
                                    <img 
                                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/a3d089aef_FrnkdieTaubecoin.png" 
                                        alt="Coin" 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="bg-slate-900/80 px-3 py-1 rounded-xl border border-yellow-500/30">
                                    <div className="text-xl font-black text-yellow-400 tabular-nums">{coins}</div>
                                </div>
                            </div>

                            <div className="bg-slate-900/50 backdrop-blur-sm px-3 py-1 rounded-lg border border-slate-700 inline-block ml-1">
                                <div className="text-xl font-black text-white tabular-nums tracking-wider">{score}</div>
                                <div className="text-[10px] text-slate-400 font-bold">SCORE</div>
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
                            className="pointer-events-auto bg-slate-800 text-white border-4 border-slate-900 shadow-[0_4px_0_#0f172a] active:shadow-none active:translate-y-1 rounded-full w-14 h-14 flex items-center justify-center hover:bg-slate-700"
                            onClick={(e) => { e.stopPropagation(); pauseGame(); }}
                        >
                            <Pause className="w-6 h-6" />
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

                    {/* Poop Button with Ammo */}
                    <motion.button 
                        whileTap={{ scale: 0.9 }}
                        className="pointer-events-auto w-28 h-28 rounded-full shadow-[0_8px_0_#0f5d55] active:shadow-none active:translate-y-2 transition-all relative overflow-hidden bg-transparent border-0 p-0"
                        onClick={handlePoop}
                        onTouchStart={handlePoop}
                        onMouseUp={(e) => e.stopPropagation()}
                        onTouchEnd={(e) => e.stopPropagation()}
                    >
                         <img 
                            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/4de0465cf_FrnkdieTaubeiconkake.png" 
                            className="w-full h-full object-contain"
                            alt="Poop"
                        />
                    </motion.button>
                </div>
            )}

            {/* Start Screen */}
            {gameState === 'start' && (
                <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 pb-48">
                    <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-teal-400 to-purple-600 mb-8 drop-shadow-lg text-center">
                        READY TO POOP?
                    </h1>
                    <div className="space-y-4 w-full max-w-xs">
                        <div className="bg-slate-800/80 p-6 rounded-3xl border-4 border-slate-700 text-center backdrop-blur-sm shadow-2xl">
                            <div className="mb-6">
                                <img 
                                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/a638c62a8_frankbild.png" 
                                    className="w-32 h-32 mx-auto object-cover rounded-3xl border-4 border-teal-500 bg-cyan-400 mb-4" 
                                    style={{ width: '120px', height: '120px' }}
                                    alt="Fränk"
                                />
                                <p className="text-teal-300 font-bold mb-1">MISSION</p>
                                <p className="text-white text-xl font-black uppercase">Poop on Everything</p>
                            </div>

                            <Button 
                                size="lg" 
                                className="w-full h-16 text-3xl font-titan bg-orange-500 hover:bg-orange-400 text-white border-4 border-slate-900 shadow-[0_6px_0_#0f172a] active:shadow-none active:translate-y-1.5 transition-all mb-4 rounded-full uppercase tracking-wider"
                                onClick={(e) => { e.stopPropagation(); startGame(); }}
                            >
                                PLAY
                            </Button>

                            <Link to={createPageUrl('Home')} className="block">
                                <Button className="w-full h-12 font-titan text-xl bg-slate-700 hover:bg-slate-600 text-white border-4 border-slate-900 shadow-[0_4px_0_#0f172a] active:shadow-none active:translate-y-1 rounded-full uppercase">
                                    MENU
                                </Button>
                            </Link>

                            <Link to={createPageUrl('Leaderboard')} className="block mt-2">
                                <Button className="w-full h-12 font-titan text-xl bg-yellow-600 hover:bg-yellow-500 text-white border-4 border-slate-900 shadow-[0_4px_0_#0f172a] active:shadow-none active:translate-y-1 rounded-full uppercase">
                                    <Trophy className="w-5 h-5 mr-2" /> Highscores
                                </Button>
                            </Link>

                            <div className="flex justify-center gap-4 mt-4">
                                <Button
                                    size="icon"
                                    onClick={(e) => { e.stopPropagation(); setMusicEnabled(!musicEnabled); }}
                                    className={`w-14 h-14 rounded-full border-4 border-slate-900 shadow-[0_4px_0_#0f172a] active:shadow-none active:translate-y-1 transition-all ${musicEnabled ? 'bg-teal-500 hover:bg-teal-400' : 'bg-slate-600 hover:bg-slate-500'}`}
                                >
                                    {musicEnabled ? <Music className="w-7 h-7 text-white" /> : <div className="relative"><Music className="w-7 h-7 text-slate-400" /><div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-1 bg-red-500 rotate-45 transform scale-110 rounded-full"></div></div></div>}
                                </Button>

                                <Button
                                    size="icon"
                                    onClick={(e) => { e.stopPropagation(); setSoundEnabled(!soundEnabled); }}
                                    className={`w-14 h-14 rounded-full border-4 border-slate-900 shadow-[0_4px_0_#0f172a] active:shadow-none active:translate-y-1 transition-all ${soundEnabled ? 'bg-purple-500 hover:bg-purple-400' : 'bg-slate-600 hover:bg-slate-500'}`}
                                >
                                    {soundEnabled ? <Volume2 className="w-7 h-7 text-white" /> : <div className="relative"><VolumeX className="w-7 h-7 text-slate-400" /><div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-1 bg-red-500 rotate-45 transform scale-110 rounded-full"></div></div></div>}
                                </Button>
                            </div>
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
                            className="w-full h-14 font-titan text-xl bg-teal-500 hover:bg-teal-400 text-white border-4 border-slate-900 shadow-[0_4px_0_#0f172a] active:shadow-none active:translate-y-1 rounded-full uppercase"
                            onClick={(e) => { e.stopPropagation(); resumeGame(); }}
                        >
                            <Play className="mr-2 w-5 h-5 fill-current" /> RESUME
                        </Button>
                        <Link to={createPageUrl('Home')} className="block">
                            <Button size="lg" className="w-full h-14 font-titan text-xl bg-red-500 hover:bg-red-400 text-white border-4 border-slate-900 shadow-[0_4px_0_#0f172a] active:shadow-none active:translate-y-1 rounded-full uppercase">
                                <HomeIcon className="mr-2 w-5 h-5" /> QUIT
                            </Button>
                        </Link>
                    </div>
                </div>
            )}

            {/* Game Over Screen */}
            {gameState === 'gameover' && finalStats && (
                <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-4">
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-full max-w-sm relative"
                    >
                        <img 
                            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/c9b686995_gameover.png" 
                            alt="Game Over" 
                            className="w-full h-auto drop-shadow-2xl"
                        />

                        {/* Stats Overlay */}
                        <div className="absolute top-[34%] left-0 right-0 flex justify-center gap-8 z-10">
                             <div className="text-center transform -rotate-3">
                                 <div className="text-[10px] font-black text-slate-900/60 uppercase tracking-widest">Score</div>
                                 <div className="text-2xl font-black text-slate-900">{finalStats.score}</div>
                             </div>
                             <div className="text-center transform rotate-3">
                                 <div className="text-[10px] font-black text-slate-900/60 uppercase tracking-widest">Coins</div>
                                 <div className="text-2xl font-black text-slate-900">{finalStats.coins}</div>
                             </div>
                        </div>

                        {/* Invisible Buttons Overlay */}
                        <div className="absolute bottom-[8%] left-[8%] w-[38%] h-[12%]">
                            <button 
                              onClick={(e) => { e.stopPropagation(); startGame(); }}
                              className="w-full h-full rounded-full active:bg-white/20 transition-colors"
                            />
                        </div>
                        <div className="absolute bottom-[8%] right-[8%] w-[38%] h-[12%]">
                            <Link to={createPageUrl('Home')} className="block w-full h-full">
                              <button className="w-full h-full rounded-full active:bg-white/20 transition-colors" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
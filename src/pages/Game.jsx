import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { base44 } from '@/api/base44Client';
import GameEngine from '@/components/game/GameEngine';
import { Pause, Play, RefreshCw, Home as HomeIcon, Heart, Trophy, Target, Zap, Music, Music2, Volume2, VolumeX, ArrowUp, Coins } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import LoginModal from "../components/auth/LoginModal";

const UI_ATLAS = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/8759edce6_ChatGPTImage3Dez202518_37_35.png";

export default function Game() {
    const engineRef = useRef(null);
    const navigate = useNavigate();
    const [gameState, setGameState] = useState('start'); 
    const [score, setScore] = useState(0);
    const [coins, setCoins] = useState(0);
    const [health, setHealth] = useState(100);
    const [distance, setDistance] = useState(0);
    const [combo, setCombo] = useState(0);
    const [finalStats, setFinalStats] = useState(null);
    const [saving, setSaving] = useState(false);
    const [gameConfig, setGameConfig] = useState({ poopTankCapacity: 10 });
    const [ammo, setAmmo] = useState(10);
    const [skin, setSkin] = useState('default');
    const [musicEnabled, setMusicEnabled] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [gameSpeed, setGameSpeed] = useState('normal'); // 'slow', 'normal', 'quick'
    const runSessionIdRef = useRef(null);
    const runStartTimeRef = useRef(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    
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
                    poopTankCapacity: 11,
                    cooldownReduction: 0,
                    agility: 1,
                    comboDuration: 2000
                };

                playerUpgrades.forEach(pu => {
                    const upgrade = upgrades.find(u => u.id === pu.upgrade_id);
                    if (upgrade) {
                        const totalEffect = upgrade.effect_per_level * pu.level;
                        switch(upgrade.key) {
                            case 'poop_tank': config.poopTankCapacity = 11 + (pu.level * 3); break;
                            case 'poop_cooldown': config.cooldownReduction = pu.level * 0.1; break;
                            case 'wing_speed': config.agility += totalEffect; break;
                            case 'combo_booster': config.comboDuration += (totalEffect * 1000); break;
                        }
                    }
                });
                setGameConfig(config);
                setAmmo(config.poopTankCapacity);
            } catch (e) {
                console.error("Failed to load game config", e);
            }
        };
        loadConfig();
    }, []);

    const startGame = async () => {
        try {
            console.log("startGame called with gameSpeed:", gameSpeed);
            
            // Try to create session if logged in
            const isAuth = await base44.auth.isAuthenticated();
            if (isAuth) {
                const response = await base44.functions.invoke('startRun', {
                    missionId: null,
                    difficulty: gameSpeed
                });

                console.log("startRun response:", response.data);

                if (response.data.success) {
                    runSessionIdRef.current = response.data.run_session_id;
                    runStartTimeRef.current = new Date(response.data.started_at);
                    console.log("Session created:", runSessionIdRef.current);
                }
            } else {
                // Allow playing without login
                runSessionIdRef.current = null;
                runStartTimeRef.current = new Date();
            }

            setGameState('playing');
            setScore(0);
            setCoins(0);
            setHealth(100);
            setDistance(0);
            setCombo(0);
            setFinalStats(null);
            if (engineRef.current) engineRef.current.start();
        } catch (error) {
            console.error("Failed to start run", error);
            toast.error("Failed to start game");
        }
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
        console.log("handleGameOver called with stats:", stats);
        console.log("runSessionId from ref:", runSessionIdRef.current);
        console.log("gameSpeed:", gameSpeed);
        
        setGameState('gameover');
        setFinalStats(stats);

        // Check if user is logged in
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
            console.log("Not logged in - showing login modal");
            setShowLoginModal(true);
            return;
        }

        setSaving(true);

        try {
            if (!runSessionIdRef.current) {
                console.error("runSessionId is null - cannot save run");
                toast.error("Invalid game session");
                setSaving(false);
                return;
            }

            // Calculate run duration
            const now = new Date();
            const durationMs = runStartTimeRef.current ? now - runStartTimeRef.current : stats.duration || 60000;

            console.log("Calling finishRun with payload:", {
                run_session_id: runSessionIdRef.current,
                score: stats.score,
                coinsCollected: stats.coins,
                distance: stats.distance,
                durationMs: durationMs,
                missionId: null,
                difficulty: gameSpeed
            });

            // Call finishRun server action with anti-cheat protection
            const response = await base44.functions.invoke('finishRun', {
                run_session_id: runSessionIdRef.current,
                score: stats.score,
                coinsCollected: stats.coins,
                distance: stats.distance,
                durationMs: durationMs,
                missionId: null,
                difficulty: gameSpeed
            });
            
            console.log("finishRun response:", response.data);

            if (!response.data.success) {
                // Handle cheat detection
                console.error("Failed to save run - Reason:", response.data.reason);
                if (response.data.reason === "CHEAT_DETECTED" || 
                    response.data.reason === "CHEAT_REPLAY" || 
                    response.data.reason === "CHEAT_SPEEDHACK" ||
                    response.data.reason === "CHEAT_INVALID_SESSION" ||
                    response.data.reason === "CHEAT_EXPIRED") {
                    toast.error("Session Error: " + response.data.reason);
                } else {
                    toast.error("Failed to save run: " + response.data.reason);
                }
                setSaving(false);
                return;
            }

            // Success - show appropriate message
            if (response.data.isHighscore) {
                toast.success("🎉 New Personal Best!");
            } else {
                toast.success("Run saved!");
            }

            // Update local final stats with server stats
            setFinalStats({
                ...stats,
                serverStats: response.data.stats
            });

        } catch (error) {
            console.error("Failed to save run", error);
            console.error("Error details:", error.response?.data);
            toast.error("Failed to save stats: " + (error.response?.data?.reason || error.message));
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
                    gameSpeed={gameSpeed}
                    musicEnabled={musicEnabled}
                    soundEnabled={soundEnabled}
                    onGameOver={handleGameOver}
                    onScoreUpdate={(s, c, d) => { setScore(s); setCoins(c); setDistance(d); }}
                    onHealthUpdate={setHealth}
                    onComboUpdate={setCombo}
                    onAmmoUpdate={setAmmo}
                />
            </div>

            {/* HUD */}
            {gameState !== 'start' && (
                <div className="absolute top-0 left-0 right-0 p-3 z-10 pointer-events-none">
                    <div className="flex justify-between items-start">
                        {/* Health & Score */}
                        <div className="space-y-1.5">
                            {/* Health Bar */}
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full border-2 border-white shadow-md overflow-hidden bg-blue-400 flex items-center justify-center">
                                    <img 
                                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/b686e47c1_FrnkdieTaubeicon9.png" 
                                        alt="Energy" 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="w-24 h-3 bg-slate-800 rounded-full border border-slate-600 overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-teal-400 to-teal-300 transition-all duration-300" 
                                        style={{ width: `${health}%` }}
                                    />
                                </div>
                            </div>

                            {/* Poop Tank */}
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full border-2 border-amber-400 shadow-md overflow-hidden bg-amber-100 flex items-center justify-center">
                                    <span className="text-lg">💩</span>
                                </div>
                                <div className="w-24 h-3 bg-slate-800 rounded-full border border-slate-600 overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-amber-600 to-yellow-400 transition-all duration-300"
                                        style={{ width: `${(ammo / gameConfig.poopTankCapacity) * 100}%` }}
                                    />
                                </div>
                                <span className="text-[10px] text-white font-bold">{ammo}/{gameConfig.poopTankCapacity}</span>
                            </div>

                            {/* Coins */}
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full border-2 border-yellow-400 shadow-md overflow-hidden bg-yellow-100 flex items-center justify-center">
                                    <img 
                                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/a3d089aef_FrnkdieTaubecoin.png" 
                                        alt="Coin" 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="bg-slate-900/80 px-2 py-0.5 rounded-lg border border-yellow-500/30">
                                    <div className="text-base font-black text-yellow-400 tabular-nums">{coins}</div>
                                </div>
                            </div>

                            <div className="bg-slate-900/50 backdrop-blur-sm px-2 py-0.5 rounded-lg border border-slate-700 inline-block ml-1">
                                <div className="text-base font-black text-white tabular-nums">{score}</div>
                                <div className="text-[8px] text-slate-400 font-bold">SCORE</div>
                            </div>

                            <div className="bg-slate-900/50 backdrop-blur-sm px-2 py-0.5 rounded-lg border border-slate-700 inline-block ml-1">
                                <div className="text-sm font-black text-teal-400 tabular-nums">{Math.floor(distance)}m</div>
                                <div className="text-[8px] text-slate-400 font-bold">DISTANCE</div>
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
                <>
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-10 pointer-events-none">
                         <AnimatePresence>
                            <motion.div
                                initial={{ opacity: 1 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: 3, duration: 0.5 }}
                                onAnimationComplete={() => {
                                    setTimeout(() => {
                                        document.getElementById('swipe-hints')?.style.setProperty('display', 'none');
                                    }, 3000);
                                }}
                                id="swipe-hints"
                                className="absolute left-10 bottom-10 flex flex-col items-center gap-3 pointer-events-none"
                            >
                                <motion.div
                                    initial={{ y: 0 }}
                                    animate={{ y: -10 }}
                                    transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.6 }}
                                    className="flex items-center gap-2"
                                >
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full blur-sm opacity-60"></div>
                                        <ArrowUp className="w-8 h-8 text-white relative z-10 drop-shadow-[0_2px_8px_rgba(251,191,36,0.8)] stroke-[3]" />
                                    </div>
                                    <span className="text-base font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wide">SWIPE UP</span>
                                </motion.div>
                                <motion.div
                                    initial={{ y: 0 }}
                                    animate={{ y: 10 }}
                                    transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.6 }}
                                    className="flex items-center gap-2"
                                >
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-t from-yellow-400 to-orange-500 rounded-full blur-sm opacity-60"></div>
                                        <ArrowUp className="w-8 h-8 rotate-180 text-white relative z-10 drop-shadow-[0_2px_8px_rgba(251,191,36,0.8)] stroke-[3]" />
                                    </div>
                                    <span className="text-base font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wide">SWIPE DOWN</span>
                                </motion.div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Poop Button with Ammo */}
                    <motion.button 
                        whileTap={{ scale: 0.9 }}
                        className="pointer-events-auto w-28 h-28 rounded-full shadow-[0_8px_0_#0f5d55] active:shadow-none active:translate-y-2 transition-all overflow-hidden bg-transparent border-0 p-0 absolute right-6 bottom-6 z-50"
                        onClick={handlePoop}
                        onTouchStart={handlePoop}
                        onMouseUp={(e) => e.stopPropagation()}
                        onTouchEnd={(e) => e.stopPropagation()}
                    >
                         <img 
                            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/1ebab497f_FrnkdieTaubeiconkake.png" 
                            className="w-full h-full object-contain"
                            alt="Poop"
                        />
                    </motion.button>
                </>
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

                            {/* Speed Selection */}
                            <div className="bg-slate-900/50 p-2 rounded-xl mb-4 flex justify-between gap-1">
                                {['slow', 'normal', 'quick'].map((speed) => (
                                    <button
                                        key={speed}
                                        onClick={(e) => { e.stopPropagation(); setGameSpeed(speed); }}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                                            gameSpeed === speed 
                                            ? 'bg-teal-500 text-white shadow-lg scale-105' 
                                            : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                        }`}
                                    >
                                        {speed}
                                    </button>
                                ))}
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
                        
                        <div className="flex justify-center gap-4 mt-6">
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
            )}

            {/* Game Over Screen */}
            {gameState === 'gameover' && finalStats && (
                <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 gap-6">
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0, y: -20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        className="w-full max-w-sm"
                    >
                        <img 
                            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/f9fab063b_Gameover1.png" 
                            alt="Game Over" 
                            className="w-full h-auto drop-shadow-2xl"
                        />
                    </motion.div>

                    {/* Stats */}
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="flex justify-center gap-8"
                    >
                        <div className="text-center">
                            <div className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Score</div>
                            <div className="text-4xl font-black text-white drop-shadow-lg">{finalStats.score}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Coins</div>
                            <div className="text-4xl font-black text-yellow-400 drop-shadow-lg">{finalStats.coins}</div>
                        </div>
                    </motion.div>

                    {/* Taube mit Buttons */}
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="w-full max-w-sm relative mt-4"
                    >
                        <img 
                            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/1962860d7_gameover4.png" 
                            alt="Fränk Game Over" 
                            className="w-full h-auto drop-shadow-2xl"
                        />

                        {/* Invisible Button Overlays */}
                        <div className="absolute bottom-[8%] left-[7%] w-[38%] h-[18%]">
                            <button 
                              onClick={(e) => { e.stopPropagation(); startGame(); }}
                              className="w-full h-full rounded-full active:bg-white/20 transition-colors"
                            />
                        </div>
                        <div className="absolute bottom-[8%] right-[7%] w-[38%] h-[18%]">
                            <Link to={createPageUrl('Home')} className="block w-full h-full">
                              <button className="w-full h-full rounded-full active:bg-white/20 transition-colors" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            )}

            <LoginModal open={showLoginModal} onClose={() => {
                setShowLoginModal(false);
                navigate(createPageUrl('Home'));
            }} />
        </div>
    );
}
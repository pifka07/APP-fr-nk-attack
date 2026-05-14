import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';
import GameEngine from '@/components/game/GameEngine';
import BackroomsEngine from '@/components/game/BackroomsEngine';
import { Pause, Play, Home as HomeIcon, Trophy, Music, Music2, Volume2, VolumeX, ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import LoginModal from "../components/auth/LoginModal";

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
  const [skinImageUrl, setSkinImageUrl] = useState('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/a638c62a8_frankbild.png');
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameSpeed, setGameSpeed] = useState('normal');
  const runSessionIdRef = useRef(null);
  const runStartTimeRef = useRef(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [assetsReady, setAssetsReady] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const currentLevel = urlParams.get('level') || 'downtown';

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const [user, playerUpgrades, upgrades, skins] = await Promise.all([
          base44.auth.me(),
          base44.entities.PlayerUpgrade.list(),
          base44.entities.Upgrade.list(),
          base44.entities.Skin.list()
        ]);

        setSkin(user.equipped_skin || 'default');

        if (user.equipped_skin && user.equipped_skin !== 'default') {
          const equippedSkin = skins.find((s) => s.key === user.equipped_skin);
          if (equippedSkin?.image_url) {
            setSkinImageUrl(equippedSkin.image_url);
          }
        }

        let config = {
          poopTankCapacity: 11,
          cooldownReduction: 0,
          agility: 1,
          comboDuration: 2000
        };

        playerUpgrades.forEach((pu) => {
          const upgrade = upgrades.find((u) => u.id === pu.upgrade_id);
          if (upgrade) {
            const totalEffect = upgrade.effect_per_level * pu.level;
            switch (upgrade.key) {
              case 'poop_tank': config.poopTankCapacity = 11 + pu.level * 3; break;
              case 'poop_cooldown': config.cooldownReduction = pu.level * 0.1; break;
              case 'wing_speed': config.agility += totalEffect; break;
              case 'combo_booster': config.comboDuration += totalEffect * 1000; break;
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
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        try {
          const response = await base44.functions.invoke('startRun', {
            missionId: null,
            difficulty: gameSpeed
          });
          if (response.data.success) {
            runSessionIdRef.current = response.data.run_session_id;
            runStartTimeRef.current = new Date(response.data.started_at);
          }
        } catch (sessionError) {
          console.warn("Failed to create run session, playing without saving:", sessionError);
          runSessionIdRef.current = null;
          runStartTimeRef.current = new Date();
        }
      } else {
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
      setGameState('playing');
      setScore(0);
      setCoins(0);
      setHealth(100);
      setDistance(0);
      setCombo(0);
      setFinalStats(null);
      if (engineRef.current) engineRef.current.start();
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

  const quitGame = async () => {
    await handleGameOver({ score, coins, distance });
    navigate(createPageUrl('Home'));
  };

  const handleGameOver = async (stats) => {
    setGameState('gameover');
    setFinalStats(stats);

    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) {
      setShowLoginModal(true);
      return;
    }

    setSaving(true);
    try {
      if (!runSessionIdRef.current) {
        toast.error("Invalid game session");
        setSaving(false);
        return;
      }

      const now = new Date();
      let durationMs = runStartTimeRef.current ? now - runStartTimeRef.current : stats.duration || 60000;
      if (durationMs <= 0) durationMs = 1000;

      const response = await base44.functions.invoke('finishRun', {
        run_session_id: runSessionIdRef.current,
        score: stats.score,
        coinsCollected: stats.coins,
        distance: stats.distance,
        durationMs: durationMs,
        missionId: null,
        difficulty: gameSpeed,
        level: currentLevel
      });

      if (!response.data.success) {
        toast.error("Session Error: " + response.data.reason);
        setSaving(false);
        return;
      }

      if (response.data.isHighscore) {
        toast.success("🎉 New Personal Best!");
      } else {
        toast.success("Run saved!");
      }

      base44.analytics.track({
        eventName: "level_completed",
        properties: {
          level: currentLevel,
          score: stats.score,
          coins: stats.coins,
          distance: stats.distance,
          difficulty: gameSpeed,
          is_highscore: response.data.isHighscore
        }
      });

      setFinalStats({ ...stats, serverStats: response.data.stats });
    } catch (error) {
      console.error("Failed to save run", error);
      toast.error("Failed to save stats: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const touchYRef = useRef(null);
  const touchXRef = useRef(null);

  const handleInputStart = (e) => {
    if (e.target.closest('button')) return;
    if (gameState === 'playing' && engineRef.current) {
      engineRef.current.startInput();
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      touchYRef.current = clientY;
      touchXRef.current = clientX;
    }
  };

  const handleInputMove = (e) => {
    if (gameState === 'playing' && engineRef.current && touchYRef.current !== null) {
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const deltaY = clientY - touchYRef.current;
      const deltaX = clientX - (touchXRef.current ?? clientX);

      if (currentLevel === 'backrooms') {
        engineRef.current.movePlayer(deltaY * 0.7);
        if (engineRef.current.moveLateral) engineRef.current.moveLateral(deltaX * 0.7);
      } else {
        engineRef.current.movePlayer(deltaY * 1.2);
      }

      touchYRef.current = clientY;
      touchXRef.current = clientX;
    }
  };

  const handleInputEnd = () => {
    touchYRef.current = null;
    touchXRef.current = null;
    if (gameState === 'playing' && engineRef.current) {
      engineRef.current.endInput();
    }
  };

  const handlePoop = (e) => {
    e.stopPropagation();
    if (gameState === 'playing' && engineRef.current) {
      engineRef.current.poop();
    }
  };

  return (
    <div
      className="relative w-full h-screen bg-black overflow-hidden select-none touch-none"
      onMouseDown={handleInputStart}
      onTouchStart={handleInputStart}
      onMouseMove={handleInputMove}
      onTouchMove={handleInputMove}
      onMouseUp={handleInputEnd}
      onTouchEnd={handleInputEnd}
      onMouseLeave={handleInputEnd}>

      {/* Game Engine Canvas */}
      <div className="absolute top-0 bottom-0 left-0 right-0 z-0">
        {currentLevel === 'backrooms' ?
          <BackroomsEngine
            ref={engineRef}
            config={gameConfig}
            musicEnabled={musicEnabled}
            soundEnabled={soundEnabled}
            onGameOver={handleGameOver}
            onScoreUpdate={(s, c, d) => { setScore(s); setCoins(c); setDistance(d); }}
            onHealthUpdate={setHealth}
            onComboUpdate={setCombo}
            onAmmoUpdate={setAmmo}
            onAssetsLoaded={() => setAssetsReady(true)} /> :
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
            onAssetsLoaded={() => setAssetsReady(true)} />
        }
      </div>

      {/* HUD */}
      {gameState !== 'start' &&
        <div className="absolute top-[30px] left-0 right-0 p-3 z-10 pointer-events-none">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full border-2 border-white shadow-md overflow-hidden bg-blue-400 flex items-center justify-center">
                  <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/b686e47c1_FrnkdieTaubeicon9.png" alt="Energy" className="w-full h-full object-cover" />
                </div>
                <div className="w-24 h-3 bg-slate-800 rounded-full border border-slate-600 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-teal-400 to-teal-300 transition-all duration-300" style={{ width: `${health}%` }} />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full border-2 border-amber-400 shadow-md overflow-hidden bg-amber-100 flex items-center justify-center">
                  <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/06c8c939e_Frnkkrner.png" alt="Körner" className="w-full h-full object-cover" />
                </div>
                <div className="w-24 h-3 bg-slate-800 rounded-full border border-slate-600 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-600 to-yellow-400 transition-all duration-300" style={{ width: `${ammo / gameConfig.poopTankCapacity * 100}%` }} />
                </div>
                <span className="text-[10px] text-white font-bold">{ammo}/{gameConfig.poopTankCapacity}</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full border-2 border-yellow-400 shadow-md overflow-hidden bg-yellow-100 flex items-center justify-center">
                  <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/a3d089aef_FrnkdieTaubecoin.png" alt="Coin" className="w-full h-full object-cover" />
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

            <AnimatePresence>
              {combo > 1 &&
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1.2, rotate: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                  key="combo"
                  className="absolute top-16 left-4">
                  <div className="bg-purple-600 text-white font-black text-xl px-3 py-1 rounded-lg shadow-lg border-2 border-white transform -rotate-6">
                    {combo}x COMBO!
                  </div>
                </motion.div>
              }
            </AnimatePresence>

            <Button
              variant="ghost"
              size="icon"
              className="pointer-events-auto bg-slate-800 text-white border-4 border-slate-900 shadow-[0_4px_0_#0f172a] active:shadow-none active:translate-y-1 rounded-full w-14 h-14 flex items-center justify-center hover:bg-slate-700"
              onClick={(e) => { e.stopPropagation(); pauseGame(); }}>
              <Pause className="w-6 h-6" />
            </Button>
          </div>
        </div>
      }

      {/* Controls Overlay */}
      {gameState === 'playing' &&
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
                className={`absolute ${currentLevel === 'backrooms' ? 'left-4 bottom-[140px]' : 'left-10 bottom-[120px]'} flex flex-col items-center gap-3 pointer-events-none`}>

                {currentLevel === 'backrooms' ?
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xs font-black text-yellow-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] tracking-wide">DRAG TO FLY</span>
                    <div className="grid grid-cols-3 gap-1">
                      <div />
                      <motion.div animate={{ y: [-4, 4] }} transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.5 }} className="flex justify-center"><ArrowUp className="w-6 h-6 text-yellow-300 stroke-[3]" /></motion.div>
                      <div />
                      <motion.div animate={{ x: [-4, 4] }} transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.5 }} className="flex justify-center"><ArrowUp className="w-6 h-6 -rotate-90 text-yellow-300 stroke-[3]" /></motion.div>
                      <div className="w-6 h-6 rounded-full bg-yellow-400/30 border border-yellow-400/60" />
                      <motion.div animate={{ x: [4, -4] }} transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.5 }} className="flex justify-center"><ArrowUp className="w-6 h-6 rotate-90 text-yellow-300 stroke-[3]" /></motion.div>
                      <div />
                      <motion.div animate={{ y: [4, -4] }} transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.5 }} className="flex justify-center"><ArrowUp className="w-6 h-6 rotate-180 text-yellow-300 stroke-[3]" /></motion.div>
                      <div />
                    </div>
                  </div> :
                  <>
                    <motion.div initial={{ y: 0 }} animate={{ y: -10 }} transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.6 }} className="flex items-center gap-2">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full blur-sm opacity-60"></div>
                        <ArrowUp className="w-8 h-8 text-white relative z-10 drop-shadow-[0_2px_8px_rgba(251,191,36,0.8)] stroke-[3]" />
                      </div>
                      <span className="text-base font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wide">SWIPE UP</span>
                    </motion.div>
                    <motion.div initial={{ y: 0 }} animate={{ y: 10 }} transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.6 }} className="flex items-center gap-2">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-yellow-400 to-orange-500 rounded-full blur-sm opacity-60"></div>
                        <ArrowUp className="w-8 h-8 rotate-180 text-white relative z-10 drop-shadow-[0_2px_8px_rgba(251,191,36,0.8)] stroke-[3]" />
                      </div>
                      <span className="text-base font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wide">SWIPE DOWN</span>
                    </motion.div>
                  </>
                }
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Poop Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="pointer-events-auto w-28 h-28 rounded-full shadow-[0_8px_0_#0f5d55] active:shadow-none active:translate-y-2 transition-all overflow-hidden bg-transparent border-0 p-0 absolute right-6 bottom-[64px] z-50"
            onClick={handlePoop}
            onTouchStart={(e) => { e.stopPropagation(); handlePoop(e); }}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}>
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/1ebab497f_FrnkdieTaubeiconkake.png"
              className="w-full h-full object-contain"
              alt="Poop" />
          </motion.button>
        </>
      }

      {/* Start Screen */}
      {gameState === 'start' &&
        <div
          className="absolute top-0 left-0 right-0 bottom-0 z-50 flex flex-col items-center justify-center p-6"
          style={currentLevel === 'backrooms' ? {
            backgroundImage: 'url(https://media.base44.com/images/public/6961111599b5db08cf38f4b2/60fdf89c9_FrnkPOV2.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          } : { background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(4px)' }}>

          {!assetsReady ?
            <div className="text-center">
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-teal-400 to-purple-600 mb-8 drop-shadow-lg">
                LOADING...
              </h1>
              <div className="w-64 h-4 bg-slate-800 rounded-full overflow-hidden border-2 border-slate-700">
                <motion.div
                  className="h-full bg-gradient-to-r from-teal-400 to-purple-600"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, ease: "easeInOut" }} />
              </div>
              <p className="text-slate-400 text-sm mt-4">Preparing Fränk for action...</p>
            </div> :
            <>
              <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-teal-400 to-purple-600 mb-6 drop-shadow-lg text-center">
                READY TO POOP?
              </h1>

              {/* Main Panel */}
              <div className="bg-slate-800/90 border border-slate-600 rounded-3xl p-5 w-full max-w-xs space-y-4 shadow-2xl">

                {/* Skin Image */}
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-teal-400 shadow-lg bg-teal-900">
                    <img
                      src={currentLevel === 'backrooms'
                        ? 'https://media.base44.com/images/public/6961111599b5db08cf38f4b2/38268ae57_FrnkPOV-Kopie.png'
                        : skinImageUrl}
                      alt="Skin"
                      className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* Mission Label */}
                <div className="text-center">
                  <div className="text-teal-400 font-black text-xs uppercase tracking-widest">Mission</div>
                  <div className="text-white font-black text-base uppercase">Poop on Everything</div>
                </div>

                {/* Speed Selector */}
                <div className="flex gap-1 bg-slate-900/80 rounded-full p-1 border border-slate-700">
                  {['slow', 'normal', 'quick'].map(speed => (
                    <button
                      key={speed}
                      onClick={(e) => { e.stopPropagation(); setGameSpeed(speed); }}
                      className={`flex-1 py-2 rounded-full text-xs font-black uppercase transition-all ${gameSpeed === speed ? 'bg-teal-400 text-slate-900' : 'text-slate-400 hover:text-white'}`}>
                      {speed}
                    </button>
                  ))}
                </div>

                {/* Play Button */}
                <button
                  onClick={(e) => { e.stopPropagation(); startGame(); }}
                  className="w-full h-14 bg-orange-500 hover:bg-orange-400 active:bg-orange-600 text-white font-black text-2xl uppercase rounded-full border-4 border-orange-700 shadow-[0_6px_0_#c2410c] active:shadow-none active:translate-y-1 transition-all">
                  PLAY
                </button>

                {/* Menu Button */}
                <button
                  onClick={(e) => { e.stopPropagation(); navigate('/Home'); }}
                  className="w-full h-11 bg-slate-700 hover:bg-slate-600 text-white font-black text-sm uppercase rounded-full border-4 border-slate-900 shadow-[0_4px_0_#0f172a] active:shadow-none active:translate-y-1 transition-all">
                  MENU
                </button>

                {/* Highscores Button */}
                <button
                  onClick={(e) => { e.stopPropagation(); navigate('/Leaderboard'); }}
                  className="w-full h-11 bg-yellow-600 hover:bg-yellow-500 text-white font-black text-sm uppercase rounded-full border-4 border-yellow-800 shadow-[0_4px_0_#713f12] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2">
                  <Trophy className="w-4 h-4" /> HIGHSCORES
                </button>

                {/* Music & Sound Toggles */}
                <div className="flex justify-center gap-4 pt-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); setMusicEnabled(!musicEnabled); }}
                    className={`w-11 h-11 rounded-full border-4 border-slate-900 shadow-[0_4px_0_#0f172a] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center ${musicEnabled ? 'bg-teal-500' : 'bg-slate-600'}`}>
                    {musicEnabled ? <Music className="w-5 h-5 text-white" /> : <Music2 className="w-5 h-5 text-slate-400" />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSoundEnabled(!soundEnabled); }}
                    className={`w-11 h-11 rounded-full border-4 border-slate-900 shadow-[0_4px_0_#0f172a] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center ${soundEnabled ? 'bg-purple-500' : 'bg-slate-600'}`}>
                    {soundEnabled ? <Volume2 className="w-5 h-5 text-white" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
                  </button>
                </div>
              </div>
            </>
          }
        </div>
      }

      {/* Pause Screen */}
      {gameState === 'paused' &&
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6">
          <h2 className="text-4xl font-bold text-white mb-8">PAUSED</h2>
          <div className="space-y-4 w-full max-w-xs">
            <Button
              size="lg"
              className="w-full h-14 font-titan text-xl bg-teal-500 hover:bg-teal-400 text-white border-4 border-slate-900 shadow-[0_4px_0_#0f172a] active:shadow-none active:translate-y-1 rounded-full uppercase"
              onClick={(e) => { e.stopPropagation(); resumeGame(); }}>
              <Play className="mr-2 w-5 h-5 fill-current" /> RESUME
            </Button>
            <Button
              size="lg"
              className="w-full h-14 font-titan text-xl bg-red-500 hover:bg-red-400 text-white border-4 border-slate-900 shadow-[0_4px_0_#0f172a] active:shadow-none active:translate-y-1 rounded-full uppercase"
              onClick={(e) => { e.stopPropagation(); quitGame(); }}>
              <HomeIcon className="mr-2 w-5 h-5" /> SAVE & QUIT
            </Button>

            <div className="flex justify-center gap-4 mt-6">
              <Button
                size="icon"
                onClick={(e) => { e.stopPropagation(); setMusicEnabled(!musicEnabled); }}
                className={`w-14 h-14 rounded-full border-4 border-slate-900 shadow-[0_4px_0_#0f172a] active:shadow-none active:translate-y-1 transition-all ${musicEnabled ? 'bg-teal-500 hover:bg-teal-400' : 'bg-slate-600 hover:bg-slate-500'}`}>
                {musicEnabled ? <Music className="w-7 h-7 text-white" /> : <Music2 className="w-7 h-7 text-slate-400" />}
              </Button>
              <Button
                size="icon"
                onClick={(e) => { e.stopPropagation(); setSoundEnabled(!soundEnabled); }}
                className={`w-14 h-14 rounded-full border-4 border-slate-900 shadow-[0_4px_0_#0f172a] active:shadow-none active:translate-y-1 transition-all ${soundEnabled ? 'bg-purple-500 hover:bg-purple-400' : 'bg-slate-600 hover:bg-slate-500'}`}>
                {soundEnabled ? <Volume2 className="w-7 h-7 text-white" /> : <VolumeX className="w-7 h-7 text-slate-400" />}
              </Button>
            </div>
          </div>
        </div>
      }

      {/* Game Over Screen */}
      {gameState === 'gameover' && finalStats &&
        <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 gap-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="w-full max-w-sm">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/f9fab063b_Gameover1.png"
              alt="Game Over"
              className="w-full h-auto drop-shadow-2xl" />
          </motion.div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center gap-8">
            <div className="text-center">
              <div className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Score</div>
              <div className="text-4xl font-black text-white drop-shadow-lg">{finalStats.score}</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Coins</div>
              <div className="text-4xl font-black text-yellow-400 drop-shadow-lg">{finalStats.coins}</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-sm relative mt-4">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/1962860d7_gameover4.png"
              alt="Fränk Game Over"
              className="w-full h-auto drop-shadow-2xl" />

            <div className="absolute bottom-[8%] left-[7%] w-[38%] h-[18%]">
              <button
                onClick={(e) => { e.stopPropagation(); startGame(); }}
                className="w-full h-full rounded-full active:bg-white/20 transition-colors" />
            </div>
            <div className="absolute bottom-[8%] right-[7%] w-[38%] h-[18%]">
              <Link to={createPageUrl('Home')} className="block w-full h-full">
                <button className="w-full h-full rounded-full active:bg-white/20 transition-colors" />
              </Link>
            </div>
          </motion.div>
        </div>
      }

      <LoginModal open={showLoginModal} onClose={() => {
        setShowLoginModal(false);
        navigate(createPageUrl('Home'));
      }} />
    </div>
  );
}
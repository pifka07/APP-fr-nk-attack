import React, { useEffect, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Lock, Coins, Clock, RefreshCw, Trophy, Play } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function DailyMissions() {
    const [missions, setMissions] = useState([]);
    const [secondsUntilReset, setSecondsUntilReset] = useState(0);
    const [loading, setLoading] = useState(true);
    const [claimingId, setClaimingId] = useState(null);
    const [totalCoins, setTotalCoins] = useState(0);

    const loadMissions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await base44.functions.invoke('getDailyMissions', {});
            const data = res.data;
            if (data.success) {
                setMissions(data.missions);
                setSecondsUntilReset(data.seconds_until_reset);
            }
        } catch (e) {
            toast.error('Missionen konnten nicht geladen werden');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMissions();
        // Load user coins
        base44.auth.me().then(u => {
            if (u) setTotalCoins(u.total_coins || 0);
        }).catch(() => {});
    }, [loadMissions]);

    // Countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            setSecondsUntilReset(prev => prev > 0 ? prev - 1 : 0);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const getMissionIcon = (type) => {
        switch (type) {
            case 'distance': return '📏';
            case 'coins': return '🪙';
            case 'score': return '⭐';
            case 'duration': return '⏱️';
            default: return '🎯';
        }
    };

    const formatProgress = (type, value) => {
        if (type === 'duration') {
            const seconds = Math.floor(value / 1000);
            return `${seconds}s`;
        }
        if (type === 'distance') return `${Math.floor(value)}m`;
        return Math.floor(value);
    };

    const handleClaim = async (missionId, reward) => {
        setClaimingId(missionId);
        try {
            const res = await base44.functions.invoke('claimDailyMission', { mission_id: missionId });
            const data = res.data;
            if (data.success) {
                setMissions(prev => prev.map(m => m.id === missionId ? { ...m, claimed: true } : m));
                setTotalCoins(data.total_coins);
                toast.success(`${reward} Münzen erhalten!`);
            } else {
                toast.error(data.reason || 'Belohnung konnte nicht abgeholt werden');
            }
        } catch (e) {
            toast.error('Fehler beim Abholen der Belohnung');
        } finally {
            setClaimingId(null);
        }
    };

    const allCompleted = missions.length > 0 && missions.every(m => m.completed && m.claimed);
    const completedCount = missions.filter(m => m.completed && m.claimed).length;
    const totalReward = missions.reduce((sum, m) => sum + (m.reward_coins || 0), 0);

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-4 pt-16 pb-20">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg">
                        <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Tägliche Missionen</h1>
                        <p className="text-sm text-slate-400">Fliege jeden Tag für Belohnungen</p>
                    </div>
                </div>

                {/* Reset timer */}
                <div className="flex items-center justify-between bg-slate-800/80 rounded-2xl p-3 border border-slate-700">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Clock className="w-4 h-4" />
                        <span>Neue Missionen in</span>
                    </div>
                    <span className="font-mono text-lg font-bold text-amber-400">{formatTime(secondsUntilReset)}</span>
                </div>

                {/* Coins display */}
                <div className="flex items-center justify-between mt-2 bg-slate-800/50 rounded-2xl p-3 border border-slate-700/50">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Coins className="w-4 h-4 text-amber-400" />
                        <span>Deine Münzen</span>
                    </div>
                    <span className="font-bold text-amber-400">{totalCoins}</span>
                </div>
            </div>

            {/* Progress summary */}
            {missions.length > 0 && (
                <div className="mb-6 bg-gradient-to-r from-amber-500/10 to-orange-600/10 rounded-2xl p-4 border border-amber-500/20">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-slate-300">Fortschritt heute</span>
                        <span className="text-sm text-amber-400">{completedCount}/{missions.length} erledigt</span>
                    </div>
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(completedCount / missions.length) * 100}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Verfügbare Belohnungen: {totalReward} Münzen</p>
                </div>
            )}

            {/* Missions list */}
            {loading ? (
                <div className="flex flex-col gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 animate-pulse h-32" />
                    ))}
                </div>
            ) : missions.length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                    <p>Keine Missionen verfügbar</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    <AnimatePresence>
                        {missions.map((mission, idx) => {
                            const progressPercent = Math.min(100, (mission.progress / mission.goal_value) * 100);
                            const canClaim = mission.completed && !mission.claimed;

                            return (
                                <motion.div
                                    key={mission.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className={`relative rounded-2xl p-4 border transition-all ${
                                        mission.claimed
                                            ? 'bg-slate-800/30 border-slate-700/50 opacity-60'
                                            : canClaim
                                            ? 'bg-gradient-to-br from-amber-500/20 to-orange-600/10 border-amber-400/50 shadow-lg shadow-amber-500/10'
                                            : 'bg-slate-800/80 border-slate-700'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Mission icon */}
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                                            mission.claimed ? 'bg-slate-700' : canClaim ? 'bg-amber-500/20' : 'bg-slate-700'
                                        }`}>
                                            {mission.claimed ? (
                                                <CheckCircle2 className="w-6 h-6 text-green-500" />
                                            ) : (
                                                getMissionIcon(mission.mission_type)
                                            )}
                                        </div>

                                        {/* Mission details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <h3 className="font-bold text-sm truncate">{mission.title}</h3>
                                                <div className="flex items-center gap-1 text-amber-400 text-sm font-bold flex-shrink-0">
                                                    <Coins className="w-3.5 h-3.5" />
                                                    {mission.reward_coins}
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-400 mb-2">{mission.description}</p>

                                            {/* Progress bar */}
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-2.5 bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${
                                                            mission.claimed
                                                                ? 'bg-green-500'
                                                                : canClaim
                                                                ? 'bg-amber-400'
                                                                : 'bg-teal-500'
                                                        }`}
                                                        style={{ width: `${progressPercent}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-mono text-slate-400 flex-shrink-0">
                                                    {formatProgress(mission.mission_type, Math.min(mission.progress, mission.goal_value))}
                                                    /
                                                    {formatProgress(mission.mission_type, mission.goal_value)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Claim button */}
                                    {canClaim && (
                                        <motion.button
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            onClick={() => handleClaim(mission.id, mission.reward_coins)}
                                            disabled={claimingId === mission.id}
                                            className="w-full mt-3 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold text-sm hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {claimingId === mission.id ? (
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Coins className="w-4 h-4" />
                                                    Belohnung abholen ({mission.reward_coins} Münzen)
                                                </>
                                            )}
                                        </motion.button>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* All completed banner */}
            {allCompleted && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6 text-center p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-teal-500/10 border border-green-500/20"
                >
                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <p className="font-bold text-green-400">Alle Missionen erledigt!</p>
                    <p className="text-sm text-slate-400 mt-1">Komm morgen wieder für neue Missionen</p>
                </motion.div>
            )}

            {/* Play button */}
            {!loading && missions.length > 0 && (
                <Link to={createPageUrl('Missions')}>
                    <motion.div
                        whileTap={{ scale: 0.97 }}
                        className="mt-6 w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg"
                    >
                        <Play className="w-5 h-5 fill-white" />
                        Losfliegen!
                    </motion.div>
                </Link>
            )}
        </div>
    );
}
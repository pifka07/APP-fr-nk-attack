import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trophy, Medal, User } from "lucide-react";
import { base44 } from '@/api/base44Client';
import { motion } from "framer-motion";

export default function Leaderboard() {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch top 10 leaderboard entries sorted by score descending
                const [topScores, user] = await Promise.all([
                    base44.entities.LeaderboardEntry.list('-score', 10),
                    base44.auth.me().catch(() => null)
                ]);
                setLeaders(topScores);
                setCurrentUser(user);
            } catch (error) {
                console.error("Failed to fetch leaderboard", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getRankIcon = (index) => {
        switch (index) {
            case 0: return <Medal className="w-6 h-6 text-yellow-400 fill-yellow-400/20" />;
            case 1: return <Medal className="w-6 h-6 text-slate-300 fill-slate-300/20" />;
            case 2: return <Medal className="w-6 h-6 text-amber-600 fill-amber-600/20" />;
            default: return <span className="text-slate-500 font-bold w-6 text-center">{index + 1}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-4 relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8 relative z-10">
                <Link to={createPageUrl('Home')}>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 uppercase tracking-wider">
                    Highscores
                </h1>
            </div>

            <div className="max-w-md mx-auto space-y-4 relative z-10 pb-20">
                {loading ? (
                    <div className="text-center py-20 text-slate-500 animate-pulse">
                        Loading champions...
                    </div>
                ) : (
                    <>
                        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-yellow-400 uppercase tracking-widest text-sm">
                                    <Trophy className="w-4 h-4" /> Top 10 Players
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {leaders.length === 0 ? (
                                    <div className="p-8 text-center text-slate-500">
                                        No records yet. Be the first!
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-700/50">
                                        {leaders.map((player, index) => (
                                            <motion.div
                                                key={player.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className={`flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors ${currentUser && player.user_id === currentUser.id ? 'bg-slate-700/40 border-l-4 border-teal-500' : ''}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-shrink-0 w-8 flex justify-center">
                                                        {getRankIcon(index)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className={`font-bold ${currentUser && player.user_id === currentUser.id ? 'text-teal-400' : 'text-white'}`}>
                                                            {player.username || 'Anonymous Bird'}
                                                        </span>
                                                        {currentUser && player.user_id === currentUser.id && (
                                                            <span className="text-[10px] text-teal-500/70 uppercase font-bold">That's You!</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="font-mono font-black text-xl text-slate-200">
                                                    {player.score?.toLocaleString() || 0}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Current User Stats Summary if not in top 10 */}
                        {currentUser && !leaders.find(l => l.user_id === currentUser.id) && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 flex items-center justify-between mt-8"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-8 text-center text-slate-500 font-bold">-</div>
                                    <div>
                                        <div className="text-teal-400 font-bold">You</div>
                                        <div className="text-xs text-slate-500">Keep pooping!</div>
                                    </div>
                                </div>
                                <div className="font-mono font-black text-xl text-slate-200">
                                    {currentUser.best_score?.toLocaleString() || 0}
                                </div>
                            </motion.div>
                        )}
                    </>
                )}
            </div>

            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
        </div>
    );
}
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Trophy, MapPin, Coins, Hash, User as UserIcon } from "lucide-react";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [runs, setRuns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const userData = await base44.auth.me();
                const runsData = await base44.entities.Run.list({ sort: { score: -1 }, limit: 10 });
                setUser(userData);
                setRuns(runsData);
            } catch (error) {
                console.error("Error fetching profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-teal-400">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-4 pb-20">
            <div className="flex items-center gap-2 mb-6 sticky top-0 bg-slate-900/90 backdrop-blur-md z-20 py-4 border-b border-slate-800">
                <Link to={createPageUrl('Home')}>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-purple-400">PROFILE</h1>
            </div>

            {/* Profile Header */}
            <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-teal-500 flex items-center justify-center mb-4 shadow-lg overflow-hidden">
                    <img 
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/5cbdbe7c2_Frnkprofilbild.png" 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                    />
                </div>
                <h2 className="text-xl font-bold text-white">{user?.email?.split('@')[0] || 'Pilot'}</h2>
                <p className="text-slate-400 text-sm">Level 1 Pigeon</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <Trophy className="w-8 h-8 text-yellow-400 mb-2" />
                        <div className="text-2xl font-bold text-white">{user?.best_score || 0}</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider">High Score</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <MapPin className="w-8 h-8 text-teal-400 mb-2" />
                        <div className="text-2xl font-bold text-white">{user?.best_distance || 0}m</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider">Fartherst Flight</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <Coins className="w-8 h-8 text-yellow-500 mb-2" />
                        <div className="text-2xl font-bold text-white">{user?.total_coins || 0}</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider">Total Coins</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <Hash className="w-8 h-8 text-purple-400 mb-2" />
                        <div className="text-2xl font-bold text-white">{runs.length}</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider">Total Runs</div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Runs */}
            <h3 className="text-lg font-bold mb-4 text-teal-300">Recent Runs</h3>
            <div className="space-y-2">
                {runs.length === 0 ? (
                    <div className="text-slate-500 text-center py-4">No runs recorded yet. Go poop!</div>
                ) : (
                    runs.map((run) => (
                        <div key={run.id} className="bg-slate-800/50 rounded-lg p-3 flex justify-between items-center border border-slate-700/50">
                            <div>
                                <div className="font-bold text-white">{run.score} pts</div>
                                <div className="text-xs text-slate-400">{new Date(run.created_date).toLocaleDateString()}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-teal-400 text-sm">{run.distance}m</div>
                                <div className="text-yellow-500 text-xs">+{run.coins_earned} coins</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Target, Trophy, Lock } from "lucide-react";

export default function Missions() {
    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMissions = async () => {
            try {
                const data = await base44.entities.Mission.list({ order: 1 }, 50);
                setMissions(data);
            } catch (error) {
                console.error("Error fetching missions", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMissions();
    }, []);

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-4 pb-20">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6 sticky top-0 bg-slate-900/90 backdrop-blur-md z-20 py-4 border-b border-slate-800">
                <Link to={createPageUrl('Home')}>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-purple-400">MISSIONS</h1>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="text-center text-slate-500">Loading Missions...</div>
                ) : (
                    missions.map((mission, index) => (
                        <Card key={mission.id} className="bg-slate-800 border-slate-700 relative overflow-hidden">
                            {/* Decorative index number */}
                            <div className="absolute -right-4 -top-4 text-6xl font-black text-slate-800/50 select-none">
                                #{index + 1}
                            </div>
                            
                            <CardHeader className="pb-2 relative z-10">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-teal-300">{mission.title}</CardTitle>
                                        <CardDescription className="text-slate-400">{mission.description}</CardDescription>
                                    </div>
                                    <Badge variant="outline" className="border-yellow-500 text-yellow-500 bg-yellow-500/10">
                                        {mission.reward_coins} Coins
                                    </Badge>
                                </div>
                            </CardHeader>
                            
                            <CardFooter className="pt-2">
                                <div className="w-full">
                                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                                        <span>Progress</span>
                                        <span>0 / {mission.goal_value}</span>
                                    </div>
                                    <Progress value={0} className="h-2 bg-slate-900" indicatorClassName="bg-teal-500" />
                                </div>
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
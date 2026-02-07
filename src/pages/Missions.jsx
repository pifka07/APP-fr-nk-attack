import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Play, Lock, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import MobileHeader from '@/components/MobileHeader';

export default function Missions() {



    const levels = [];

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 pb-20 select-none">
            <MobileHeader title="MISSIONS" />
            
            <div className="p-4">

            <div className="space-y-6">
                {levels.map((level, index) => (
                    <motion.div
                        key={level.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Link 
                            to={level.locked ? '#' : (level.id === 'europa' ? createPageUrl('Europa') : `${createPageUrl('Game')}?level=${level.id}`)}
                        >
                            <Card className={`relative overflow-hidden border-4 transition-all duration-300 group select-none ${level.locked ? 'border-slate-700 opacity-70' : 'border-slate-700 hover:border-teal-500 hover:shadow-[0_0_20px_rgba(45,212,191,0.3)]'}`}>
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
                                        <div>
                                            <h2 className="text-3xl font-black text-white font-titan uppercase stroke-black drop-shadow-lg">{level.name}</h2>
                                            <p className="text-slate-200 text-sm font-medium drop-shadow-md max-w-[80%]">{level.description}</p>
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
                    </motion.div>
                    ))}

                    {/* Training Mission Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0 }}
                    >
                        <Link to={createPageUrl('Training')}>
                            <Card className="relative overflow-hidden border-4 transition-all duration-300 group border-slate-700 hover:border-yellow-500 hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] select-none">
                                <div className="absolute inset-0 z-0">
                                    <img 
                                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/08af38dd2_Level1Hintergrund.png" 
                                        alt="Training" 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                                </div>

                                <CardContent className="relative z-10 p-6 h-40 flex flex-col justify-end">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h2 className="text-3xl font-black text-white font-titan uppercase stroke-black drop-shadow-lg">Training</h2>
                                            <p className="text-slate-200 text-sm font-medium drop-shadow-md max-w-[80%]">Practice makes perfect</p>
                                        </div>

                                        <div className="bg-yellow-500 p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                                            <Play className="w-6 h-6 text-white fill-current" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </motion.div>

                    {/* Europa Mission Card */}
                    <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Link to={createPageUrl('Europa')}>
                                <Card className="relative overflow-hidden border-4 transition-all duration-300 group border-slate-700 hover:border-teal-500 hover:shadow-[0_0_20px_rgba(45,212,191,0.3)] select-none">
                                    <div className="absolute inset-0 z-0">
                                        <img 
                                            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/98fa42c68_file_000000001534722f810de02738a4050d.png" 
                                            alt="Europa" 
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                                    </div>

                                    <CardContent className="relative z-10 p-6 h-40 flex flex-col justify-end">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <h2 className="text-3xl font-black text-white font-titan uppercase stroke-black drop-shadow-lg">EUROPA</h2>
                                                <p className="text-slate-200 text-sm font-medium drop-shadow-md max-w-[80%]">5 legendary cities await you!</p>
                                            </div>

                                            <div className="bg-teal-500 p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                                                <Play className="w-6 h-6 text-white fill-current" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>

                        {/* North America Mission Card - Coming Soon */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="relative overflow-hidden border-4 transition-all duration-300 border-slate-700 opacity-70 select-none">
                                <div className="absolute inset-0 z-0">
                                    <img 
                                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/08af38dd2_Level1Hintergrund.png" 
                                        alt="North America" 
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                                </div>

                                <CardContent className="relative z-10 p-6 h-40 flex flex-col justify-end">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h2 className="text-3xl font-black text-white font-titan uppercase stroke-black drop-shadow-lg">NORTH AMERICA</h2>
                                            <p className="text-slate-200 text-sm font-medium drop-shadow-md max-w-[80%]">Coming Soon</p>
                                        </div>

                                        <div className="bg-slate-900/80 p-3 rounded-full">
                                            <Lock className="w-6 h-6 text-slate-500" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* South America Mission Card - Coming Soon */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card className="relative overflow-hidden border-4 transition-all duration-300 border-slate-700 opacity-70">
                                <div className="absolute inset-0 z-0">
                                    <img 
                                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/08af38dd2_Level1Hintergrund.png" 
                                        alt="South America" 
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                                </div>

                                <CardContent className="relative z-10 p-6 h-40 flex flex-col justify-end">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h2 className="text-3xl font-black text-white font-titan uppercase stroke-black drop-shadow-lg">SOUTH AMERICA</h2>
                                            <p className="text-slate-200 text-sm font-medium drop-shadow-md max-w-[80%]">Coming Soon</p>
                                        </div>

                                        <div className="bg-slate-900/80 p-3 rounded-full">
                                            <Lock className="w-6 h-6 text-slate-500" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Africa Mission Card - Coming Soon */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Card className="relative overflow-hidden border-4 transition-all duration-300 border-slate-700 opacity-70">
                                <div className="absolute inset-0 z-0">
                                    <img 
                                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/08af38dd2_Level1Hintergrund.png" 
                                        alt="Africa" 
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                                </div>

                                <CardContent className="relative z-10 p-6 h-40 flex flex-col justify-end">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h2 className="text-3xl font-black text-white font-titan uppercase stroke-black drop-shadow-lg">AFRICA</h2>
                                            <p className="text-slate-200 text-sm font-medium drop-shadow-md max-w-[80%]">Coming Soon</p>
                                        </div>

                                        <div className="bg-slate-900/80 p-3 rounded-full">
                                            <Lock className="w-6 h-6 text-slate-500" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Asia Mission Card - Coming Soon */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Card className="relative overflow-hidden border-4 transition-all duration-300 border-slate-700 opacity-70">
                                <div className="absolute inset-0 z-0">
                                    <img 
                                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/08af38dd2_Level1Hintergrund.png" 
                                        alt="Asia" 
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                                </div>

                                <CardContent className="relative z-10 p-6 h-40 flex flex-col justify-end">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h2 className="text-3xl font-black text-white font-titan uppercase stroke-black drop-shadow-lg">ASIA</h2>
                                            <p className="text-slate-200 text-sm font-medium drop-shadow-md max-w-[80%]">Coming Soon</p>
                                        </div>

                                        <div className="bg-slate-900/80 p-3 rounded-full">
                                            <Lock className="w-6 h-6 text-slate-500" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
            </div>
        </div>
    );
}
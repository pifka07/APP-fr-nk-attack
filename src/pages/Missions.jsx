import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Play, Lock, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function Missions() {



    const levels = [
        {
            id: 'downtown',
            name: 'Downtown',
            description: 'The busy streets. Perfect for dropping.',
            image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/cd46a805a_FrnkdieTaube6.png',
            locked: false
        },
        {
            id: 'rooftop',
            name: 'Rooftop',
            description: 'High above the city. Watch out for drones!',
            image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/08af38dd2_Level1Hintergrund.png',
            locked: false
        },
        {
            id: 'park',
            name: 'Park',
            description: 'Nature calls. Dogs and picnics everywhere.',
            image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/2bf59f945_Level3Park.png',
            locked: false
        }
    ];

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

            <div className="space-y-6">
                {levels.map((level, index) => (
                    <motion.div
                        key={level.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Link 
                            to={level.locked ? '#' : `${createPageUrl('Game')}?level=${level.id}`}
                        >
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
            </div>
        </div>
    );
}
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Play } from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import MobileHeader from '@/components/MobileHeader';

export default function Nordamerika() {
    const navigate = useNavigate();
    const dragX = useMotionValue(0);
    const background = useTransform(dragX, [0, 300], ['rgba(15, 23, 42, 1)', 'rgba(239, 68, 68, 0.1)']);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(false);
        const handleBackButton = (e) => {
            e.preventDefault();
            navigate(createPageUrl('Missions'));
        };
        window.addEventListener('popstate', handleBackButton);
        return () => window.removeEventListener('popstate', handleBackButton);
    }, [navigate]);

    const handleDragEnd = (event, info) => {
        if (info.offset.x > 200) {
            navigate(createPageUrl('Missions'));
        }
    };

    const northAmericanLevels = [
        {
            id: 'detroit',
            name: 'Detroit',
            description: 'Motor City! Industrie, alte Fabriken und amerikanische Straßen.',
            image: 'https://media.base44.com/images/public/6961111599b5db08cf38f4b2/1048f9b4b_generated_image.png',
            locked: false
        }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center text-red-400">
                Loading...
            </div>
        );
    }

    return (
        <motion.div 
            className="min-h-screen bg-slate-900 text-slate-100 pb-20"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0, right: 0.5 }}
            onDragEnd={handleDragEnd}
            style={{ background }}
        >
            <MobileHeader title="NORDAMERIKA" showBack={true} backTo={createPageUrl('Missions')} />
            
            <div className="p-4">
                <div className="space-y-6">
                    {northAmericanLevels.map((level, index) => (
                        <motion.div
                            key={level.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link to={level.locked ? '#' : `${createPageUrl('Game')}?level=${level.id}`}>
                                <Card className={`relative overflow-hidden border-4 transition-all duration-300 group ${level.locked ? 'border-slate-700 opacity-70' : 'border-slate-700 hover:border-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]'}`}>
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
                                            <div className="flex-1 max-w-[70%]">
                                                <h2 className="text-2xl font-black text-white font-titan uppercase stroke-black drop-shadow-lg leading-tight">{level.name}</h2>
                                                <p className="text-slate-200 text-xs font-medium drop-shadow-md line-clamp-2 mt-1">{level.description}</p>
                                                {!level.locked && (
                                                    <div className="mt-1.5 inline-block bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                        FREI VERFÜGBAR
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="bg-red-500 p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                                                <Play className="w-6 h-6 text-white fill-current" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
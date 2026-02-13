import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Play, Lock } from "lucide-react";
import { motion } from "framer-motion";
import MobileHeader from '@/components/MobileHeader';

export default function Training() {
    const navigate = useNavigate();

    const trainingMissions = [
        {
            id: "park",
            name: "Park",
            description: "Natural obstacles ahead",
            image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/2bf59f945_Level3Park.png",
            locked: false
        },
        {
            id: "rooftop",
            name: "Rooftop",
            description: "Fly high above the city",
            image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/08af38dd2_Level1Hintergrund.png",
            locked: false
        },
        {
            id: "gelsenkirchen",
            name: "Gelsenkirchen",
            description: "Rhine city adventure",
            image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/5d06e0a92_Hintergrund.png",
            locked: false
        }
    ];

    const handleMissionSelect = (missionId) => {
        if (!trainingMissions.find(m => m.id === missionId)?.locked) {
            navigate(createPageUrl("Game") + `?level=${missionId}`);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
            <MobileHeader title="TRAINING" showBack={true} backTo={createPageUrl('Missions')} />
            
            <div className="p-4">

            <div className="grid grid-cols-1 gap-4">
                {trainingMissions.map((mission, index) => (
                    <motion.div
                        key={mission.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div
                            onClick={() => handleMissionSelect(mission.id)}
                            className={`relative h-32 rounded-xl overflow-hidden border-2 ${
                                mission.locked
                                    ? "border-slate-700 opacity-50"
                                    : "border-teal-500/50 hover:border-teal-400 cursor-pointer"
                            } transition-all`}
                        >
                            <div className="absolute inset-0">
                                <img
                                    src={mission.image}
                                    alt={mission.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
                            </div>
                            <div className="relative z-10 p-4 flex flex-col justify-end h-full">
                                <h3 className="text-xl font-bold text-white mb-1">
                                    {mission.name}
                                </h3>
                                <p className="text-sm text-slate-300">
                                    {mission.description}
                                </p>
                            </div>
                            <div className="absolute top-4 right-4">
                                {mission.locked ? (
                                    <Lock className="w-6 h-6 text-slate-400" />
                                ) : (
                                    <Play className="w-8 h-8 text-teal-400" />
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
            </div>
        </div>
    );
}
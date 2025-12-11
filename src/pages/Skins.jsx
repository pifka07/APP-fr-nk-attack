import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Check, Lock, ShoppingBag } from "lucide-react";
import { base44 } from '@/api/base44Client';
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function Skins() {
    const [skins, setSkins] = useState([]);
    const [playerSkins, setPlayerSkins] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [allSkins, mySkins, currentUser] = await Promise.all([
                    base44.entities.Skin.list(),
                    base44.entities.PlayerSkin.list(),
                    base44.auth.me()
                ]);
                setSkins(allSkins);
                setPlayerSkins(mySkins);
                setUser(currentUser);
            } catch (error) {
                console.error("Failed to fetch skins", error);
                toast.error("Could not load skins");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleEquip = async (skin) => {
        try {
            await base44.auth.updateMe({ equipped_skin: skin.key });
            setUser({ ...user, equipped_skin: skin.key });
            toast.success(`${skin.name} equipped!`);
        } catch (error) {
            console.error("Failed to equip skin", error);
            toast.error("Failed to equip skin");
        }
    };

    const isOwned = (skinId) => {
        // Check if default skin by key
        const defaultSkin = skins.find(s => s.id === skinId && s.key === 'default');
        return playerSkins.some(ps => ps.skin_id === skinId) || defaultSkin;
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-4 relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8 relative z-10">
                <Link to={createPageUrl('Profile')}>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 uppercase tracking-wider">
                    My Skins
                </h1>
            </div>

            <div className="max-w-md mx-auto relative z-10 pb-20">
                {loading ? (
                    <div className="text-center py-20 text-slate-500 animate-pulse">
                        Loading wardrobe...
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {skins.map((skin) => {
                            const owned = isOwned(skin.id);
                            const equipped = user?.equipped_skin === skin.key;

                            return (
                                <motion.div
                                    key={skin.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    whileHover={{ scale: 1.02 }}
                                    className="relative"
                                >
                                    <Card className={`border-2 overflow-hidden h-full flex flex-col ${equipped ? 'border-teal-500 bg-slate-800' : 'border-slate-700 bg-slate-800/50'}`}>
                                        <CardContent className="p-4 flex flex-col items-center flex-grow">
                                            {/* Preview Circle */}
                                            <div 
                                                        className="w-24 h-24 rounded-full mb-4 shadow-lg flex items-center justify-center relative"
                                                        style={{ 
                                                            background: `linear-gradient(135deg, ${skin.color_primary || '#ccc'}, ${skin.color_secondary || '#666'})` 
                                                        }}
                                                    >
                                                        {!owned && (
                                                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                                                                <Lock className="w-8 h-8 text-white/70" />
                                                            </div>
                                                        )}
                                                        <img 
                                                            src={skin.image_url || "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/d027d1bd2_ChatGPTImage4Dez202509_43_52.png"}
                                                            alt={skin.name}
                                                            className="w-20 h-20 object-contain"
                                                        />
                                                    </div>

                                            <h3 className="font-bold text-lg text-white mb-1 text-center">{skin.name}</h3>
                                            <p className="text-xs text-slate-400 text-center mb-4 line-clamp-2">{skin.description}</p>

                                            <div className="mt-auto w-full">
                                                {equipped ? (
                                                    <Button className="w-full bg-teal-500/20 text-teal-400 border border-teal-500/50 cursor-default hover:bg-teal-500/20">
                                                        <Check className="w-4 h-4 mr-2" /> Equipped
                                                    </Button>
                                                ) : owned ? (
                                                    <Button 
                                                        onClick={() => handleEquip(skin)}
                                                        className="w-full bg-slate-700 hover:bg-slate-600 text-white"
                                                    >
                                                        Equip
                                                    </Button>
                                                ) : (
                                                    <Link to={createPageUrl('Shop')}>
                                                        <Button variant="outline" className="w-full border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700">
                                                            <ShoppingBag className="w-4 h-4 mr-2" /> Shop
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
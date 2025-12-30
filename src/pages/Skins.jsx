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

    const fetchData = async () => {
        try {
            const allSkins = await base44.entities.Skin.list();
            setSkins(allSkins);

            // Check if logged in for user-specific data
            const isAuth = await base44.auth.isAuthenticated();
            if (isAuth) {
                try {
                    const [mySkins, currentUser] = await Promise.all([
                        base44.entities.PlayerSkin.list(),
                        base44.auth.me()
                    ]);
                    setPlayerSkins(mySkins);
                    setUser(currentUser);
                } catch (e) {
                    console.log("Not logged in");
                }
            }
        } catch (error) {
            console.error("Failed to fetch skins", error);
            toast.error("Could not load skins");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        
        // Reload data when page becomes visible (user returns from shop)
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchData();
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    const handleEquip = async (skin) => {
        if (!user) {
            toast.error("Please login to equip skins!");
            return;
        }
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
        // Check if default/free skin
        const skin = skins.find(s => s.id === skinId);
        const isFree = skin && (skin.key === 'default' || skin.cost_coins === 0);
        return playerSkins.some(ps => ps.skin_id === skinId) || isFree;
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
                        {skins.sort((a, b) => (a.cost_coins || 0) - (b.cost_coins || 0)).map((skin) => {
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
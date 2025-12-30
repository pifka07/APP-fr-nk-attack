import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Coins, Zap, Palette, Lock, Check } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Shop() {
    const [user, setUser] = useState(null);
    const [upgrades, setUpgrades] = useState([]);
    const [skins, setSkins] = useState([]);
    const [playerUpgrades, setPlayerUpgrades] = useState([]);
    const [playerSkins, setPlayerSkins] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            // Load shop data (always visible)
            const [upgradesData, skinsData] = await Promise.all([
                base44.entities.Upgrade.list(),
                base44.entities.Skin.list()
            ]);

            // Check if logged in for user-specific data
            const isAuth = await base44.auth.isAuthenticated();
            let userData = null;
            let pUpgradesData = [];
            let pSkinsData = [];

            if (isAuth) {
                try {
                    userData = await base44.auth.me();
                    [pUpgradesData, pSkinsData] = await Promise.all([
                        base44.entities.PlayerUpgrade.list(),
                        base44.entities.PlayerSkin.list()
                    ]);
                } catch (e) {
                    console.log("Not logged in");
                }
            }

            setUser(userData);
            setUpgrades(upgradesData);
            setSkins(skinsData);
            setPlayerUpgrades(pUpgradesData);
            setPlayerSkins(pSkinsData);
        } catch (error) {
            console.error("Error fetching shop data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleBuyUpgrade = async (upgrade) => {
        if (!user) {
            toast.error("Please login to purchase!");
            return;
        }

        const currentLevel = playerUpgrades.find(pu => pu.upgrade_id === upgrade.id)?.level || 0;
        if (currentLevel >= upgrade.max_level) return;

        const cost = Math.floor(upgrade.base_cost * Math.pow(upgrade.cost_multiplier, currentLevel));

        if ((user?.total_coins || 0) < cost) {
            toast.error("Not enough coins!");
            return;
        }

        try {
            await base44.auth.updateMe({ 
                total_coins: (user.total_coins || 0) - cost 
            });
            
            const existingPu = playerUpgrades.find(pu => pu.upgrade_id === upgrade.id);
            if (existingPu) {
                await base44.entities.PlayerUpgrade.update(existingPu.id, { level: existingPu.level + 1 });
            } else {
                await base44.entities.PlayerUpgrade.create({ 
                    upgrade_id: upgrade.id, 
                    user_id: user.id,
                    level: 1 
                });
            }

            toast.success(`Upgraded ${upgrade.name}!`);
            fetchData();
        } catch (error) {
            console.error("Purchase failed", error);
            toast.error("Purchase failed. Try again.");
        }
    };

    const handleBuySkin = async (skin) => {
        if (!user) {
            toast.error("Please login to purchase!");
            return;
        }

        try {
            console.log('Calling buySkin with skin.id:', skin.id);
            const response = await base44.functions.invoke('buySkin', { 
                skin_id: skin.id 
            });

            console.log('Buy skin response:', response);

            if (!response.data.success) {
                const reason = response.data.reason;
                if (reason === 'NOT_ENOUGH_COINS') {
                    toast.error("Not enough coins!");
                } else if (reason === 'SKIN_ALREADY_OWNED') {
                    toast.error("You already own this skin!");
                } else {
                    toast.error("Purchase failed: " + reason);
                }
                return;
            }

            toast.success(`Unlocked ${skin.name}!`);
            fetchData();
        } catch (error) {
            console.error("Skin purchase error:", error);
            toast.error("Purchase failed: " + (error.message || "Unknown error"));
        }
    };

    const handleEquipSkin = async (skinKey) => {
        if (!user) {
            toast.error("Please login to equip skins!");
            return;
        }

        try {
            await base44.auth.updateMe({ equipped_skin: skinKey });
            toast.success("Skin Equipped!");
            fetchData();
        } catch (error) {
            toast.error("Failed to equip skin.");
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen text-teal-400">Loading Shop...</div>;

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-4 pb-20">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-900/90 backdrop-blur-md z-20 py-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                    <Link to={createPageUrl('Home')}>
                        <Button className="bg-slate-800 text-white border-4 border-slate-900 shadow-[0_4px_0_#0f172a] active:shadow-none active:translate-y-1 rounded-full w-12 h-12 flex items-center justify-center hover:bg-slate-700">
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-purple-400 ml-2">SHOP</h1>
                </div>
                <div className="flex items-center bg-slate-800 px-4 py-2 rounded-full border-2 border-yellow-500/50 shadow-lg">
                    <Coins className="w-5 h-5 text-yellow-400 mr-2" />
                    <span className="font-mono font-bold text-xl text-yellow-400">{user?.total_coins || 0}</span>
                </div>
            </div>

            <Tabs defaultValue="skins" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-800 mb-6">
                    <TabsTrigger value="skins" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                        <Palette className="w-4 h-4 mr-2" /> Skins
                    </TabsTrigger>
                    <TabsTrigger value="upgrades" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                        <Zap className="w-4 h-4 mr-2" /> Upgrades
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="skins" className="grid grid-cols-2 gap-4">
                    {skins.sort((a, b) => a.cost_coins - b.cost_coins).map(skin => {
                        const isOwned = playerSkins.some(ps => ps.skin_id === skin.id) || skin.key === 'default';
                        const isEquipped = user?.equipped_skin === skin.key;
                        const canAfford = (user?.total_coins || 0) >= skin.cost_coins;

                        return (
                            <motion.div key={skin.id} whileTap={{ scale: 0.95 }}>
                                <Card className={`bg-slate-800 border-2 overflow-hidden h-full flex flex-col ${isEquipped ? 'border-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.3)]' : 'border-slate-700'}`}>
                                    <div className="h-24 flex items-center justify-center relative" style={{ background: `linear-gradient(135deg, ${skin.color_primary || '#333'}, ${skin.color_secondary || '#000'})` }}>
                                        <img 
                                            src={skin.image_url || "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/d027d1bd2_ChatGPTImage4Dez202509_43_52.png"}
                                            alt={skin.name}
                                            className="w-24 h-24 object-contain z-10"
                                        />
                                        {isEquipped && <div className="absolute top-2 right-2 bg-purple-600 text-xs px-2 py-1 rounded-full font-bold">EQUIPPED</div>}
                                    </div>
                                    <CardContent className="p-4 flex-grow">
                                        <h3 className="font-bold text-white mb-1">{skin.name}</h3>
                                        <p className="text-xs text-slate-400">{skin.description}</p>
                                    </CardContent>
                                    <CardFooter className="p-3 pt-0 mt-auto">
                                        {isOwned ? (
                                            <Button 
                                                onClick={() => handleEquipSkin(skin.key)}
                                                disabled={isEquipped}
                                                className={`w-full h-10 text-xs border-4 ${isEquipped ? 'bg-purple-600 border-slate-900 text-white opacity-50' : 'bg-slate-700 border-slate-900 text-white hover:bg-purple-500 shadow-[0_3px_0_#0f172a] active:shadow-none active:translate-y-1'} rounded-full font-titan tracking-wide uppercase`}
                                            >
                                                {isEquipped ? <><Check className="w-3 h-3 mr-1" /> Active</> : "Equip"}
                                            </Button>
                                        ) : (
                                            <Button 
                                                onClick={() => handleBuySkin(skin)}
                                                disabled={!canAfford}
                                                className={`w-full h-10 text-xs border-4 border-slate-900 shadow-[0_3px_0_#0f172a] active:shadow-none active:translate-y-1 rounded-full font-titan tracking-wide uppercase ${canAfford ? 'bg-yellow-500 hover:bg-yellow-400 text-slate-900' : 'bg-slate-700 text-slate-500'}`}
                                            >
                                                <Coins className="w-3 h-3 mr-1" /> {skin.cost_coins}
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        );
                    })}
                </TabsContent>

                <TabsContent value="upgrades" className="space-y-4">
                    {upgrades.filter(u => u.key === 'poop_tank' || u.key === 'poop_cooldown').map(upgrade => {
                        const currentPu = playerUpgrades.find(pu => pu.upgrade_id === upgrade.id);
                        const currentLevel = currentPu?.level || 0;
                        const isMaxed = currentLevel >= upgrade.max_level;
                        const nextCost = Math.floor(upgrade.base_cost * Math.pow(upgrade.cost_multiplier, currentLevel));
                        const canAfford = (user?.total_coins || 0) >= nextCost;

                        return (
                            <Card key={upgrade.id} className="bg-slate-800 border-slate-700">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between">
                                        <CardTitle className="text-lg font-bold text-teal-300">{upgrade.name}</CardTitle>
                                        <Badge variant={isMaxed ? "default" : "outline"} className={isMaxed ? "bg-teal-500" : "text-teal-400 border-teal-400"}>
                                            Lvl {currentLevel} / {upgrade.max_level}
                                        </Badge>
                                    </div>
                                    <CardDescription className="text-slate-400">{upgrade.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-teal-500 transition-all duration-500" 
                                            style={{ width: `${(currentLevel / upgrade.max_level) * 100}%` }}
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    {isMaxed ? (
                                        <Button disabled className="w-full h-12 border-4 border-slate-800 bg-slate-800 text-slate-500 rounded-full font-titan tracking-wide uppercase">Maxed</Button>
                                    ) : (
                                        <Button 
                                            onClick={() => handleBuyUpgrade(upgrade)}
                                            disabled={!canAfford}
                                            className={`w-full h-12 font-titan tracking-wide border-4 border-slate-900 shadow-[0_4px_0_#0f172a] active:shadow-none active:translate-y-1 rounded-full uppercase ${canAfford ? 'bg-yellow-500 hover:bg-yellow-400 text-slate-900' : 'bg-slate-700 text-slate-500'}`}
                                        >
                                            <Coins className="w-4 h-4 mr-2" /> 
                                            Upgrade ({nextCost})
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })}
                </TabsContent>
            </Tabs>
        </div>
    );
}
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Play, ShoppingCart, Trophy, UserIcon } from "lucide-react";
import { motion } from "framer-motion";
import LoginModal from "../components/auth/LoginModal";

export default function StartScreen() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // ========================
  //  USER LADEN
  // ========================
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {
        setUser(null);
      }
      setLoadingUser(false);
    };

    loadUser();
  }, []);

  if (loadingUser)
    return <div style={{ color: "white" }}>Loading...</div>;

  const handlePlay = () => {
    navigate(createPageUrl("Missions"));
  };

  return (
    <div className="flex flex-col items-center justify-end min-h-screen bg-slate-900 p-6 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/b3b7d6b41_ChatGPTImage3Dez202518_19_15.png" 
          alt="Background" 
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
      </div>

      {/* Title Section */}
      <div className="text-center mb-8 z-10 relative">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-4 flex flex-col items-center"
        >
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/81c474281_FrnkdieTaube3-Kopie.png" 
            alt="Fränk Character" 
            className="w-40 h-40 object-contain mb-2 drop-shadow-2xl filter brightness-110"
          />
          <h1 className="text-6xl font-black text-white drop-shadow-[0_4px_0_#000] tracking-wider" style={{ fontFamily: 'Impact, sans-serif' }}>
            FRÄNK
          </h1>
        </motion.div>
      </div>

      {/* Menu Buttons */}
      <div className="w-full max-w-xs space-y-4 z-10">
        <Button 
          onClick={handlePlay}
          className="w-full h-16 text-2xl font-titan bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-white border-4 border-slate-900 shadow-[0_6px_0_#0f172a] active:shadow-none active:translate-y-1.5 transition-all mb-4 rounded-full uppercase tracking-wider"
        >
          <Play className="mr-2 w-6 h-6" /> PLAY
        </Button>

        <div className="grid grid-cols-2 gap-4">
          <Link to={createPageUrl('Shop')}>
            <Button className="w-full h-14 font-titan text-lg bg-purple-600 hover:bg-purple-500 text-white border-4 border-slate-900 shadow-[0_4px_0_#0f172a] active:shadow-none active:translate-y-1 rounded-full uppercase">
              <ShoppingCart className="mr-2 w-5 h-5" /> Shop
            </Button>
          </Link>
          <Link to={createPageUrl('Leaderboard')}>
            <Button className="w-full h-14 font-titan text-lg bg-teal-500 hover:bg-teal-400 text-white border-4 border-slate-900 shadow-[0_4px_0_#0f172a] active:shadow-none active:translate-y-1 rounded-full uppercase">
              <Trophy className="mr-2 w-5 h-5" /> Score
            </Button>
          </Link>
        </div>

        {user ? (
          <Link to={createPageUrl('Profile')}>
            <Button className="w-full h-12 font-titan text-lg bg-slate-700 hover:bg-slate-600 text-slate-200 border-4 border-slate-900 shadow-[0_4px_0_#0f172a] active:shadow-none active:translate-y-1 rounded-full uppercase">
              <UserIcon className="mr-2 w-5 h-5" /> Profile & Stats
            </Button>
          </Link>
        ) : (
          <Button 
            onClick={() => setShowLoginModal(true)}
            className="w-full h-12 font-titan text-lg bg-teal-600 hover:bg-teal-500 text-white border-4 border-slate-900 shadow-[0_4px_0_#0f172a] active:shadow-none active:translate-y-1 rounded-full uppercase"
          >
            <UserIcon className="mr-2 w-5 h-5" /> Login
          </Button>
        )}
      </div>

      {/* Footer */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-1">
        <a href="https://pifka07.de" target="_blank" rel="noopener noreferrer" className="text-white/30 font-titan text-sm italic hover:text-white/60 transition-colors">
          by pifka07
        </a>
      </div>

      <div className="absolute bottom-2 left-0 right-0 z-20 flex justify-center">
        <Link to={createPageUrl('PrivacyPolicy')} className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors uppercase tracking-widest font-bold">
          Privacy Policy
        </Link>
      </div>

      <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}
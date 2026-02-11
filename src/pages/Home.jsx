import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

export default function StartScreen() {
  const navigate = useNavigate();
  const [loadingUser, setLoadingUser] = useState(true);

  // ========================
  //  USER LADEN
  // ========================
  useEffect(() => {
    const loadUser = async () => {
      setLoadingUser(false);
    };

    loadUser();
  }, []);

  if (loadingUser)
    return <div style={{ color: "white" }}>Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-end min-h-screen bg-slate-900 p-6 pb-[15px] pt-[15px] relative overflow-hidden">


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
      <div className="text-center z-10 relative flex-1 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center"
        >
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/81c474281_FrnkdieTaube3-Kopie.png" 
            alt="Fränk Character" 
            className="w-48 h-48 object-contain mb-4 drop-shadow-2xl filter brightness-110"
          />
          <h1 className="text-7xl font-black text-white drop-shadow-[0_4px_0_#000] tracking-wider" style={{ fontFamily: 'Impact, sans-serif' }}>
            FRÄNK
          </h1>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="absolute top-[31px] right-4 z-20 flex flex-col items-end gap-1">
        <a href="https://pifka07.de" target="_blank" rel="noopener noreferrer" className="text-white/30 font-titan text-sm italic hover:text-white/60 transition-colors">
          by pifka
        </a>
      </div>

      <div className="absolute bottom-[48px] left-0 right-0 z-20 flex justify-center">
        <Link to={createPageUrl('PrivacyPolicy')} className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors uppercase tracking-widest font-bold">
          Privacy Policy
        </Link>
      </div>
    </div>
  );
}
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Toaster } from "@/components/ui/sonner";
import BottomNav from '@/components/BottomNav';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout({ children, currentPageName }) {
    const location = useLocation();
    
    // Hide bottom nav on Game page
    const hideBottomNav = currentPageName === 'Game';

    return (
        <div className="min-h-screen bg-slate-900 font-sans text-slate-100 selection:bg-purple-500 selection:text-white overflow-x-hidden">
            <link href="https://fonts.googleapis.com/css2?family=Titan+One&display=swap" rel="stylesheet" />
            <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2590841526378095" crossOrigin="anonymous"></script>
            <style>{`
                .font-titan {
                    font-family: 'Titan One', cursive;
                }
                :root {
                    --color-primary: #2DD4BF;
                    --color-secondary: #9333EA;
                    --color-accent: #FACC15;
                }
                body {
                    overscroll-behavior: none;
                }
                /* Safe area insets for mobile notches */
                .safe-area-pt {
                    padding-top: env(safe-area-inset-top);
                }
                .safe-area-pb {
                    padding-bottom: env(safe-area-inset-bottom);
                }
                .safe-area-p {
                    padding-top: env(safe-area-inset-top);
                    padding-bottom: env(safe-area-inset-bottom);
                }
            `}</style>
            
            <main className="w-full max-w-md mx-auto min-h-screen bg-slate-900 relative shadow-2xl overflow-hidden border-x border-slate-800 safe-area-p">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className={hideBottomNav ? '' : 'pb-16'}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>
            
            {!hideBottomNav && <BottomNav />}
            
            <Toaster position="top-center" />
        </div>
    );
}
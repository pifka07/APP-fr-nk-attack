import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { createPageUrl } from '@/utils';

export default function MobileHeader({ title, showBack = false, backTo = null }) {
    const navigate = useNavigate();
    const location = useLocation();
    
    const rootPages = [
        createPageUrl('Home'),
        createPageUrl('Missions'),
        createPageUrl('Shop'),
        createPageUrl('Leaderboard'),
        createPageUrl('Profile')
    ];
    
    const isRootPage = rootPages.includes(location.pathname);
    const shouldShowBack = showBack || !isRootPage;
    
    const handleBack = () => {
        if (backTo) {
            navigate(backTo);
        } else {
            navigate(-1);
        }
    };
    
    return (
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md z-50 border-b border-slate-800 safe-area-pt">
            <div className="flex items-center gap-3 px-4 py-3">
                {shouldShowBack && (
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleBack}
                        className="text-slate-400 hover:text-white hover:bg-slate-800 select-none"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                )}
                <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-purple-400 uppercase tracking-wider">
                    {title}
                </h1>
            </div>
        </div>
    );
}
import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Lock, LogIn } from "lucide-react";
import { base44 } from '@/api/base44Client';

export default function LoginModal({ open, onClose }) {
    const handleLogin = () => {
        // Redirect to Base44's built-in login with proper next URL
        const nextUrl = window.location.pathname + window.location.search;
        base44.auth.redirectToLogin(nextUrl);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-sm">
                <DialogHeader>
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center">
                            <Lock className="w-8 h-8 text-teal-400" />
                        </div>
                    </div>
                    <DialogTitle className="text-2xl text-center text-white">Login erforderlich</DialogTitle>
                    <DialogDescription className="text-center text-slate-300 text-base pt-2">
                        Bitte einloggen, damit wir deine Punkte, Münzen und Highscores speichern können.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-3 mt-4">
                    <Button 
                        onClick={handleLogin}
                        className="w-full h-12 bg-teal-500 hover:bg-teal-400 text-white font-bold text-lg border-4 border-slate-900 shadow-[0_4px_0_#0f172a] active:shadow-none active:translate-y-1 rounded-full"
                    >
                        <LogIn className="w-5 h-5 mr-2" />
                        Einloggen
                    </Button>
                    
                    <Button 
                        onClick={onClose}
                        variant="outline"
                        className="w-full h-12 bg-slate-700 hover:bg-slate-600 text-white font-bold border-4 border-slate-900 shadow-[0_4px_0_#0f172a] active:shadow-none active:translate-y-1 rounded-full"
                    >
                        Abbrechen
                    </Button>
                </div>
                
                <p className="text-xs text-slate-400 text-center mt-4">
                    Ohne Login können keine Spielstände gespeichert werden.
                </p>
            </DialogContent>
        </Dialog>
    );
}
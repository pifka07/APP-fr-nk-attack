import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Toaster } from "@/components/ui/sonner";

export default function Layout({ children }) {
    return (
        <div className="min-h-screen bg-slate-900 font-sans text-slate-100 selection:bg-purple-500 selection:text-white overflow-x-hidden">
            <link href="https://fonts.googleapis.com/css2?family=Titan+One&display=swap" rel="stylesheet" />
            <style>{`
                .font-titan {
                    font-family: 'Titan One', cursive;
                }
                :root {
                    --color-primary: #2DD4BF; /* Teal 400 */
                    --color-secondary: #9333EA; /* Purple 600 */
                    --color-accent: #FACC15; /* Yellow 400 */
                }
                body {
                    overscroll-behavior: none;
                }
            `}</style>
            
            <main className="w-full max-w-md mx-auto min-h-screen bg-slate-900 relative shadow-2xl overflow-hidden border-x border-slate-800">
                {children}
            </main>
            
            <Toaster position="top-center" />
        </div>
    );
}
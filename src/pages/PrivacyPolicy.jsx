import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-6 pb-20 font-sans">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8 sticky top-0 bg-slate-900/95 backdrop-blur py-4 border-b border-slate-800 z-10 flex items-center gap-4">
                    <Link to={createPageUrl('Home')}>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-teal-400">Datenschutzerklärung</h1>
                </div>

                <div className="space-y-6 text-slate-300 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-white mb-2">1. Allgemeines</h2>
                        <p>
                            Der Schutz Ihrer persönlichen Daten ist uns wichtig. Diese Datenschutzerklärung informiert Sie darüber, 
                            wie wir mit Daten in der App "FRÄNK – The Poop From Above" umgehen.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-2">2. Datenerfassung</h2>
                        <p>
                            Wir erfassen keine personenbezogenen Daten (wie Name, Adresse, E-Mail oder Telefonnummer) durch die Nutzung dieser App, 
                            es sei denn, Sie stellen uns diese freiwillig zur Verfügung (z.B. bei Support-Anfragen).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-2">3. Speicherung von Spielständen</h2>
                        <p>
                            Spielstände, Highscores und Einstellungen werden lokal auf Ihrem Gerät oder verknüpft mit Ihrem Account gespeichert, 
                            um die Funktionalität des Spiels zu gewährleisten.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-2">4. Kontakt</h2>
                        <p>
                            Bei Fragen zum Datenschutz wenden Sie sich bitte an den Entwickler dieser App.
                        </p>
                    </section>
                    
                    <div className="pt-8 text-sm text-slate-500 border-t border-slate-800">
                        Stand: Dezember 2025
                    </div>
                </div>
            </div>
        </div>
    );
}
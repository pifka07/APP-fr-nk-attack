import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
    return (
        <>
            <style dangerouslySetInnerHTML={{__html: `
                :root {
                  --bg: #0f172a;
                  --bg-card: #1e293b;
                  --accent: #2dd4bf;
                  --accent-soft: rgba(45, 212, 191, 0.15);
                  --text: #f1f5f9;
                  --muted: #94a3b8;
                  --border: rgba(148, 163, 184, 0.2);
                  --danger: #f87171;
                  --highlight: #a78bfa;
                  --radius-lg: 16px;
                  --radius-pill: 999px;
                  --shadow-soft: 0 10px 30px rgba(0, 0, 0, 0.5);
                }

                .privacy-page * {
                  box-sizing: border-box;
                  margin: 0;
                  padding: 0;
                }

                .privacy-page {
                  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                  background: #0f172a;
                  color: var(--text);
                  line-height: 1.6;
                  padding: 0;
                  min-height: 100vh;
                }
                
                .privacy-page .header-bar {
                  position: sticky;
                  top: 0;
                  z-index: 50;
                  background: rgba(15, 23, 42, 0.95);
                  backdrop-filter: blur(12px);
                  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
                  padding: 16px;
                  display: flex;
                  align-items: center;
                  gap: 12px;
                }

                .privacy-page .page-wrapper {
                  max-width: 960px;
                  margin: 0 auto;
                  padding: 24px 16px 64px;
                }

                .privacy-page .badge {
                  display: inline-flex;
                  align-items: center;
                  gap: 6px;
                  font-size: 13px;
                  padding: 4px 12px;
                  border-radius: var(--radius-pill);
                  background: var(--accent-soft);
                  color: var(--accent);
                  border: 1px solid rgba(45, 212, 191, 0.3);
                  margin-bottom: 12px;
                }

                .privacy-page .badge-dot {
                  width: 8px;
                  height: 8px;
                  border-radius: 999px;
                  background: var(--accent);
                  box-shadow: 0 0 10px rgba(34, 197, 94, 0.8);
                }

                .privacy-page header {
                  margin-bottom: 28px;
                }

                .privacy-page h1 {
                  font-size: clamp(28px, 4vw, 36px);
                  letter-spacing: 0.02em;
                  margin-bottom: 8px;
                }

                .privacy-page h1 span {
                  color: var(--accent);
                }

                .privacy-page .subtitle {
                  font-size: 15px;
                  color: var(--muted);
                  max-width: 540px;
                }

                .privacy-page .grid {
                  display: grid;
                  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1.1fr);
                  gap: 24px;
                  margin-top: 24px;
                  margin-bottom: 32px;
                  align-items: flex-start;
                }

                @media (max-width: 800px) {
                  .privacy-page .grid {
                    grid-template-columns: 1fr;
                  }
                }

                .privacy-page .card {
                  background: #1e293b;
                  border-radius: var(--radius-lg);
                  border: 1px solid var(--border);
                  padding: 18px 18px 16px;
                  box-shadow: var(--shadow-soft);
                  position: relative;
                  overflow: hidden;
                }

                .privacy-page .card h2 {
                  font-size: 18px;
                  margin-bottom: 8px;
                }

                .privacy-page .pill-row {
                  display: flex;
                  flex-wrap: wrap;
                  gap: 8px;
                  margin-top: 4px;
                  margin-bottom: 8px;
                }

                .privacy-page .pill {
                  font-size: 11px;
                  text-transform: uppercase;
                  letter-spacing: 0.08em;
                  padding: 4px 10px;
                  border-radius: var(--radius-pill);
                  border: 1px solid rgba(148, 163, 184, 0.5);
                  color: var(--muted);
                  background: rgba(15, 23, 42, 0.7);
                }

                .privacy-page .pill--good {
                  border-color: rgba(45, 212, 191, 0.5);
                  color: var(--accent);
                  background: rgba(45, 212, 191, 0.1);
                }

                .privacy-page .pill--warn {
                  border-color: rgba(248, 113, 113, 0.7);
                  color: var(--danger);
                  background: rgba(127, 29, 29, 0.3);
                }

                .privacy-page p {
                  font-size: 14px;
                  margin-bottom: 8px;
                  color: #e5e7eb;
                }

                .privacy-page .muted {
                  color: var(--muted);
                  font-size: 13px;
                }

                .privacy-page .list {
                  margin: 6px 0 4px 18px;
                  font-size: 14px;
                  color: #e5e7eb;
                }

                .privacy-page .list li {
                  margin-bottom: 4px;
                }

                .privacy-page .section-title {
                  font-size: 18px;
                  margin: 22px 0 8px;
                }

                .privacy-page .section-kicker {
                  font-size: 12px;
                  text-transform: uppercase;
                  letter-spacing: 0.15em;
                  color: var(--muted);
                  margin-top: 16px;
                  margin-bottom: -4px;
                }

                .privacy-page .highlight {
                  color: var(--highlight);
                }

                .privacy-page .tagline {
                  font-size: 13px;
                  color: var(--muted);
                  margin-top: 2px;
                }

                .privacy-page .kv {
                  font-size: 13px;
                  color: var(--muted);
                  margin-top: 8px;
                }

                .privacy-page .kv strong {
                  color: var(--text);
                }

                .privacy-page .key-points {
                  display: grid;
                  gap: 8px;
                  margin-top: 8px;
                }

                .privacy-page .key-point {
                  display: flex;
                  align-items: flex-start;
                  gap: 8px;
                  font-size: 13px;
                  color: var(--muted);
                }

                .privacy-page .key-point span.icon {
                  width: 18px;
                  height: 18px;
                  border-radius: 999px;
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 11px;
                  background: rgba(45, 212, 191, 0.15);
                  border: 1px solid rgba(45, 212, 191, 0.5);
                  color: var(--accent);
                  flex-shrink: 0;
                  margin-top: 1px;
                }

                .privacy-page .divider {
                  height: 1px;
                  background: linear-gradient(to right, transparent, rgba(148, 163, 184, 0.4), transparent);
                  margin: 24px 0 18px;
                  border-radius: 999px;
                }

                .privacy-page footer {
                  margin-top: 16px;
                  font-size: 12px;
                  color: var(--muted);
                  text-align: left;
                }
            `}} />
            
            <div className="privacy-page">
                <div className="header-bar">
                    <Link to={createPageUrl('Home')}>
                        <Button className="bg-slate-800 text-white border-4 border-slate-900 shadow-[0_4px_0_#0f172a] active:shadow-none active:translate-y-1 rounded-full w-12 h-12 flex items-center justify-center hover:bg-slate-700">
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                    <h1 style={{fontSize: '20px', fontWeight: 'bold', color: 'var(--accent)', margin: 0}}>Datenschutz & Sicherheit</h1>
                </div>
                <div className="page-wrapper">
                    <header>
                        <div className="badge">
                            <span className="badge-dot"></span>
                            Fair Play & Datenschutz in <strong>Fränk</strong>
                        </div>
                        <h1><span>Wie Fränk</span> deine Spielstände schützt</h1>
                        <p className="subtitle">
                            Wir wollen, dass sich jede Runde fair anfühlt – ohne Cheater, ohne gefälschte Highscores und ohne unnötige Datensammelei.
                            Hier erklären wir dir, wie das technisch funktioniert.
                        </p>
                    </header>

                    <main>
                        <div className="grid">
                            <section className="card">
                                <h2>🎮 Fair Play für alle</h2>
                                <div className="pill-row">
                                    <span className="pill pill--good">Serverseitige Auswertung</span>
                                    <span className="pill">Keine Client-Manipulation</span>
                                </div>
                                <p>
                                    Punkte, Münzen und Highscores können in <strong>Fränk</strong> nicht einfach „hochgedreht"
                                    werden. Alle wichtigen Werte werden ausschließlich auf dem Server geprüft und gespeichert – nicht in der App.
                                </p>
                                <ul className="list">
                                    <li>Kein direkter Schreibzugriff des Clients auf Spielstände</li>
                                    <li>Alle Runs werden serverseitig validiert</li>
                                    <li>Leaderboard-Einträge können nicht gefälscht werden</li>
                                </ul>
                                <p className="muted">
                                    Ergebnis: Wer oben steht, hat sich das auch wirklich erspielt.
                                </p>
                            </section>

                            <section className="card">
                                <h2>🔐 Deine Daten, dein Spiel</h2>
                                <div className="pill-row">
                                    <span className="pill pill--good">Datensparsam</span>
                                    <span className="pill">Keine Standortdaten</span>
                                </div>
                                <p>
                                    Wir speichern nur das, was für das Spiel wirklich nötig ist: deine Runs, deine Münzen, deine
                                    Highscores und welche Skins du freigeschaltet hast.
                                </p>
                                <p className="kv">
                                    <strong>Wir sammeln NICHT:</strong> Kontakte, Standort, Adressbuch, sensible oder persönliche Inhalte.
                                </p>
                                <div className="key-points">
                                    <div className="key-point">
                                        <span className="icon">✓</span>
                                        <span>Spielerdaten wie Coins, Highscores und Skins sind privat und nur dir zugeordnet.</span>
                                    </div>
                                    <div className="key-point">
                                        <span className="icon">✓</span>
                                        <span>Keine Weitergabe an Dritte, keine Werbung mit deinen Daten.</span>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div className="section-kicker">Technische Umsetzung</div>
                        <h2 className="section-title">🛡️ Anti-Cheat & Replay-Schutz</h2>

                        <section>
                            <p>
                                Damit Cheating keine Chance hat, nutzt <strong>Fränk</strong> mehrere Schutzschichten, die alle auf dem Server laufen.
                            </p>

                            <h3 className="section-title" style={{fontSize: '16px'}}>1. Einmalige Run-Sessions</h3>
                            <p>
                                Wenn du auf <strong>Play</strong> drückst, erzeugt der Server eine
                                <span className="highlight"> einmalige Session-ID</span> (run_session_id). Diese ist:
                            </p>
                            <ul className="list">
                                <li>nur für genau diesen Run gültig</li>
                                <li>an deinen Account gebunden</li>
                                <li>zeitlich begrenzt (z. B. 30 Minuten)</li>
                                <li>nur einmal verwendbar</li>
                            </ul>
                            <p className="muted">
                                Wird dieselbe Session-ID mehrfach verwendet, blockt der Server den Versuch als Replay-Cheat.
                            </p>

                            <h3 className="section-title" style={{fontSize: '16px'}}>2. Zeit-Validierung (Anti-Speedhack)</h3>
                            <p>
                                Der Server merkt sich den Startzeitpunkt deines Runs. Beim Spielende meldet die App die vergangene Zeit.
                                Wir vergleichen:
                            </p>
                            <ul className="list">
                                <li>gemeldete Dauer aus der App</li>
                                <li>berechnete Dauer aus Server-Sicht</li>
                            </ul>
                            <p>
                                Weicht die Zeit zu stark ab (z. B. mehr als ein paar Sekunden), wird der Run als
                                <span className="highlight"> Speedhack-Versuch</span> gewertet und nicht gezählt.
                            </p>

                            <h3 className="section-title" style={{fontSize: '16px'}}>3. Logik-Checks für Score & Münzen</h3>
                            <p>
                                Um unfaire Werte zu verhindern, gibt es serverseitige Obergrenzen und Plausibilitätsprüfungen.
                            </p>
                            <ul className="list">
                                <li>Maximal erlaubter Score pro Run</li>
                                <li>Maximale Münzanzahl pro Run</li>
                                <li>Berechnung von Score pro Sekunde (Score / Spielzeit)</li>
                            </ul>
                            <p className="muted">
                                Liegt ein Wert weit außerhalb des Erwartbaren, wird der Run verworfen – bevor irgendetwas gespeichert wird.
                            </p>

                            <h3 className="section-title" style={{fontSize: '16px'}}>4. Mission & Schwierigkeitsprüfung</h3>
                            <p>
                                Die vom Client gemeldete Mission und Schwierigkeit müssen genau zu der Session passen, die beim Start erzeugt wurde.
                                Wird versucht, dies nachträglich zu ändern, blockt der Server den Run.
                            </p>
                        </section>

                        <div className="divider"></div>

                        <section>
                            <div className="section-kicker">Leaderboard & Fairness</div>
                            <h2 className="section-title">🏆 Schutz des Leaderboards</h2>
                            <p>
                                Highscores im Leaderboard werden nur dann aktualisiert, wenn ein Run alle Sicherheitsprüfungen bestanden hat.
                                Der Client kann Leaderboard-Einträge nicht direkt anlegen oder bearbeiten.
                            </p>
                            <ul className="list">
                                <li>Leaderboard-Einträge werden ausschließlich serverseitig geschrieben</li>
                                <li>Jeder neue Highscore wird auf Plausibilität geprüft</li>
                                <li>Manipulation über Netzwerk-Tools oder Modifikationen der App führen nicht zu gültigen Einträgen</li>
                            </ul>
                            <p className="muted">
                                So bleibt der Wettbewerb fair – unabhängig davon, auf welchem Gerät du spielst.
                            </p>
                        </section>

                        <div className="divider"></div>

                        <section>
                            <div className="section-kicker">Datenschutz</div>
                            <h2 className="section-title">🌍 Was wir NICHT tun</h2>
                            <p>
                                Uns interessiert, dass du Spaß im Spiel hast – nicht, wie dein Privatleben aussieht. Deshalb:
                            </p>
                            <ul className="list">
                                <li>kein Zugriff auf deine Kontakte oder Fotos</li>
                                <li>keine Standortverfolgung</li>
                                <li>keine Analyse persönlicher Inhalte</li>
                                <li>keine Weitergabe deiner Daten an Dritte</li>
                            </ul>
                            <p className="muted">
                                Die Speicherung erfolgt auf sicheren Servern und nach dem Prinzip der Datensparsamkeit.
                            </p>
                        </section>
                    </main>

                    <footer>
                        <p>
                            Fragen zu Sicherheit oder Datenschutz in <strong>Fränk</strong>?<br />
                            Melde dich gerne per Mail: <a href="mailto:umdieecke7@gmail.com" style={{color: 'var(--accent)', textDecoration: 'none'}}>umdieecke7@gmail.com</a>
                        </p>
                        <p style={{marginTop: '12px', opacity: '0.6'}}>
                            © 2025 pifka07
                        </p>
                    </footer>
                </div>
            </div>
        </>
    );
}
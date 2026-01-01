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
                    <h1 style={{fontSize: '20px', fontWeight: 'bold', color: 'var(--accent)', margin: 0}}>Privacy & Security</h1>
                </div>
                <div className="page-wrapper">
                    <header>
                        <div className="badge">
                            <span className="badge-dot"></span>
                            Fair Play & Privacy in <strong>Fränk</strong>
                        </div>
                        <h1><span>How Fränk</span> Protects Your Game Progress</h1>
                        <p className="subtitle">
                            We want every round to feel fair – without cheaters, fake highscores, or unnecessary data collection.
                            Here's how we make that happen technically.
                        </p>
                    </header>

                    <main>
                        <div className="grid">
                            <section className="card">
                                <h2>🎮 Fair Play for Everyone</h2>
                                <div className="pill-row">
                                    <span className="pill pill--good">Server-Side Validation</span>
                                    <span className="pill">No Client Manipulation</span>
                                </div>
                                <p>
                                    Points, coins, and highscores in <strong>Fränk</strong> cannot be simply "boosted".
                                    All critical values are verified and stored exclusively on the server – not in the app.
                                </p>
                                <ul className="list">
                                    <li>No direct client write access to game progress</li>
                                    <li>All runs are validated server-side</li>
                                    <li>Leaderboard entries cannot be faked</li>
                                </ul>
                                <p className="muted">
                                    Result: If you're at the top, you actually earned it.
                                </p>
                            </section>

                            <section className="card">
                                <h2>🔐 Your Data, Your Game</h2>
                                <div className="pill-row">
                                    <span className="pill pill--good">Minimal Data</span>
                                    <span className="pill">No Location Data</span>
                                </div>
                                <p>
                                    We only store what's really necessary for the game: your runs, your coins, your
                                    highscores, and which skins you've unlocked.
                                </p>
                                <p className="kv">
                                    <strong>We DO NOT collect:</strong> Contacts, location, address book, sensitive or personal content.
                                </p>
                                <div className="key-points">
                                    <div className="key-point">
                                        <span className="icon">✓</span>
                                        <span>Player data like coins, highscores, and skins are private and linked only to you.</span>
                                    </div>
                                    <div className="key-point">
                                        <span className="icon">✓</span>
                                        <span>No sharing with third parties, no ads using your data.</span>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div className="section-kicker">Technical Implementation</div>
                        <h2 className="section-title">🛡️ Anti-Cheat & Replay Protection</h2>

                        <section>
                            <p>
                                To prevent cheating, <strong>Fränk</strong> uses multiple security layers that all run on the server.
                            </p>

                            <h3 className="section-title" style={{fontSize: '16px'}}>1. One-Time Run Sessions</h3>
                            <p>
                                When you press <strong>Play</strong>, the server generates a
                                <span className="highlight"> unique session ID</span> (run_session_id). This is:
                            </p>
                            <ul className="list">
                                <li>valid only for this specific run</li>
                                <li>linked to your account</li>
                                <li>time-limited (e.g., 30 minutes)</li>
                                <li>usable only once</li>
                            </ul>
                            <p className="muted">
                                If the same session ID is used multiple times, the server blocks the attempt as a replay cheat.
                            </p>

                            <h3 className="section-title" style={{fontSize: '16px'}}>2. Time Validation (Anti-Speedhack)</h3>
                            <p>
                                The server remembers your run's start time. At game end, the app reports the elapsed time.
                                We compare:
                            </p>
                            <ul className="list">
                                <li>reported duration from the app</li>
                                <li>calculated duration from server perspective</li>
                            </ul>
                            <p>
                                If the time deviates too much (e.g., more than a few seconds), the run is marked as a
                                <span className="highlight"> speedhack attempt</span> and not counted.
                            </p>

                            <h3 className="section-title" style={{fontSize: '16px'}}>3. Logic Checks for Score & Coins</h3>
                            <p>
                                To prevent unfair values, there are server-side limits and plausibility checks.
                            </p>
                            <ul className="list">
                                <li>Maximum allowed score per run</li>
                                <li>Maximum coin count per run</li>
                                <li>Calculation of score per second (score / playtime)</li>
                            </ul>
                            <p className="muted">
                                If a value is far outside the expected range, the run is rejected – before anything is saved.
                            </p>

                            <h3 className="section-title" style={{fontSize: '16px'}}>4. Mission & Difficulty Verification</h3>
                            <p>
                                The mission and difficulty reported by the client must exactly match the session created at start.
                                If someone tries to change this afterwards, the server blocks the run.
                            </p>
                        </section>

                        <div className="divider"></div>

                        <section>
                            <div className="section-kicker">Leaderboard & Fairness</div>
                            <h2 className="section-title">🏆 Leaderboard Protection</h2>
                            <p>
                                Highscores in the leaderboard are only updated when a run passes all security checks.
                                The client cannot directly create or edit leaderboard entries.
                            </p>
                            <ul className="list">
                                <li>Leaderboard entries are written exclusively server-side</li>
                                <li>Each new highscore is checked for plausibility</li>
                                <li>Manipulation via network tools or app modifications do not result in valid entries</li>
                            </ul>
                            <p className="muted">
                                This keeps the competition fair – regardless of which device you play on.
                            </p>
                        </section>

                        <div className="divider"></div>

                        <section>
                            <div className="section-kicker">Privacy</div>
                            <h2 className="section-title">🌍 What We DO NOT Do</h2>
                            <p>
                                We care about you having fun in the game – not about your private life. Therefore:
                            </p>
                            <ul className="list">
                                <li>no access to your contacts or photos</li>
                                <li>no location tracking</li>
                                <li>no analysis of personal content</li>
                                <li>no sharing of your data with third parties</li>
                            </ul>
                            <p className="muted">
                                Data is stored on secure servers following the principle of data minimization.
                            </p>
                        </section>

                        <div className="divider"></div>

                        <section>
                            <div className="section-kicker">Child Safety</div>
                            <h2 className="section-title">👶 Children's Privacy & Protection</h2>
                            <p>
                                <strong>Fränk</strong> is designed to be safe for all ages. We take children's privacy seriously and comply with international child protection standards.
                            </p>
                            <ul className="list">
                                <li>No collection of personal information from children under 13</li>
                                <li>No in-app purchases requiring payment methods</li>
                                <li>No third-party advertising or tracking</li>
                                <li>No social features that could expose children to strangers</li>
                                <li>Parental oversight encouraged for younger players</li>
                            </ul>
                            <p className="muted">
                                The game is free to play with optional cosmetic upgrades earned through gameplay. All player data is anonymized and secure.
                            </p>
                            <p>
                                If you believe your child's information has been collected, please contact us at 
                                <a href="mailto:umdieecke7@gmail.com" style={{color: 'var(--accent)', textDecoration: 'none'}}> umdieecke7@gmail.com</a> and we will promptly remove it.
                            </p>
                        </section>
                    </main>

                    <footer>
                        <p>
                            Questions about security or privacy in <strong>Fränk</strong>?<br />
                            Feel free to contact us: <a href="mailto:umdieecke7@gmail.com" style={{color: 'var(--accent)', textDecoration: 'none'}}>umdieecke7@gmail.com</a>
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
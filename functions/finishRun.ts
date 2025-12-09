export default async function finishRun(
    { run_session_id, score, coinsCollected, durationMs, missionId, difficulty },
    { user, base44 }
) {
    // 1. User prüfen
    if (!user || !user.id) {
        return { success: false, reason: "NOT_LOGGED_IN" };
    }

    try {
        // 2. PendingRun laden
        const pendingRuns = await base44.asServiceRole.entities.PendingRun.filter({
            id: run_session_id
        });

        const pending = pendingRuns.length > 0 ? pendingRuns[0] : null;

        if (!pending || pending.user_id !== user.id) {
            return { success: false, reason: "CHEAT_INVALID_SESSION" };
        }

        if (pending.used) {
            return { success: false, reason: "CHEAT_REPLAY" };
        }

        if (new Date() > new Date(pending.expires_at)) {
            return { success: false, reason: "CHEAT_EXPIRED" };
        }

        // 3. Dauer checken (leichter Speedhack-Schutz)
        const serverDuration = Date.now() - new Date(pending.started_at).getTime();
        if (Math.abs(serverDuration - durationMs) > 3000) {
            return { success: false, reason: "CHEAT_SPEEDHACK" };
        }

        // 4. Mission / Difficulty abgleichen
        if (missionId !== pending.mission_id || difficulty !== pending.difficulty) {
            return { success: false, reason: "CHEAT_WRONG_MISSION" };
        }

        // 5. Plausi-Checks (einfache Limits)
        if (score < 0 || score > 500000) {
            return { success: false, reason: "CHEAT_SCORE" };
        }
        if (coinsCollected < 0 || coinsCollected > 2000) {
            return { success: false, reason: "CHEAT_COINS" };
        }

        if (durationMs > 0) {
            const sps = score / (durationMs / 1000);
            if (sps > 300) {
                return { success: false, reason: "CHEAT_SPS" };
            }
        }

        // 6. PendingRun als benutzt markieren
        await base44.asServiceRole.entities.PendingRun.update(pending.id, {
            used: true
        });

        // 7. Run speichern
        await base44.asServiceRole.entities.Run.create({
            user_id: user.id,
            score: score,
            distance: 0,
            coins_earned: coinsCollected,
            combos_max: 0,
            duration_ms: durationMs,
            mission_id: missionId || null,
            difficulty: difficulty || 'normal',
            mode: missionId ? "mission" : "endless"
        });

        // 8. PlayerStats holen & updaten
        let statsRecords = await base44.asServiceRole.entities.PlayerStats.filter({
            user_id: user.id
        });

        let stats = statsRecords.length > 0 ? statsRecords[0] : null;

        if (!stats) {
            stats = await base44.asServiceRole.entities.PlayerStats.create({
                user_id: user.id,
                total_score: 0,
                total_coins: 0,
                total_runs: 0,
                best_score: 0,
                best_distance: 0
            });
        }

        const newTotalScore = (stats.total_score || 0) + score;
        const newCoins = (stats.total_coins || 0) + coinsCollected;
        const newRuns = (stats.total_runs || 0) + 1;
        const isHighscore = score > (stats.best_score || 0);

        await base44.asServiceRole.entities.PlayerStats.update(stats.id, {
            total_score: newTotalScore,
            total_coins: newCoins,
            total_runs: newRuns,
            best_score: isHighscore ? score : stats.best_score
        });

        // 9. Leaderboard aktualisieren, falls Highscore
        if (isHighscore) {
            const existingEntries = await base44.asServiceRole.entities.LeaderboardEntry.filter({
                user_id: user.id
            });

            if (existingEntries.length > 0) {
                await base44.asServiceRole.entities.LeaderboardEntry.update(existingEntries[0].id, {
                    score: score,
                    date: new Date().toISOString()
                });
            } else {
                await base44.asServiceRole.entities.LeaderboardEntry.create({
                    user_id: user.id,
                    username: user.full_name || user.email,
                    score: score,
                    date: new Date().toISOString()
                });
            }
        }

        // 10. Antwort an Client
        return {
            success: true,
            stats: {
                total_score: newTotalScore,
                total_coins: newCoins,
                total_runs: newRuns,
                best_score: isHighscore ? score : stats.best_score
            },
            isHighscore: isHighscore
        };
    } catch (error) {
        console.error("Error in finishRun:", error);
        return {
            success: false,
            reason: "SERVER_ERROR",
            error: error.message
        };
    }
}
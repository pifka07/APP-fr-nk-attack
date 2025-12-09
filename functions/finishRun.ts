export default async function finishRun({ run_session_id, score, coinsCollected, durationMs, missionId, difficulty }, { user, base44 }) {
    // Check if user is logged in
    if (!user || !user.id) {
        return {
            success: false,
            reason: "NOT_LOGGED_IN"
        };
    }

    // Anti-cheat: Validate session exists and matches user
    const pendingRuns = await base44.asServiceRole.entities.PendingRun.filter({
        user_id: user.id
    });
    
    const session = pendingRuns.find(pr => 
        run_session_id && run_session_id.startsWith(`${pr.user_id}_`)
    );

    if (!session) {
        return {
            success: false,
            reason: "CHEAT_INVALID_SESSION"
        };
    }

    // Check if already used
    if (session.used) {
        return {
            success: false,
            reason: "CHEAT_REPLAY"
        };
    }

    // Check expiration
    if (new Date() > new Date(session.expires_at)) {
        return {
            success: false,
            reason: "CHEAT_EXPIRED"
        };
    }

    // Check mission/difficulty match
    if (session.mission_id !== missionId || session.difficulty !== difficulty) {
        return {
            success: false,
            reason: "CHEAT_INVALID_SESSION"
        };
    }

    // Time validation (speedhack check)
    const serverDuration = new Date() - new Date(session.started_at);
    const timeDiff = Math.abs(serverDuration - durationMs);
    
    if (timeDiff > 10000) { // Allow 10 seconds tolerance
        return {
            success: false,
            reason: "CHEAT_SPEEDHACK"
        };
    }

    // Score validation (max reasonable score)
    const maxScore = 100000;
    const maxCoins = 10000;
    const maxScorePerSecond = 200;

    if (score > maxScore || coinsCollected > maxCoins) {
        return {
            success: false,
            reason: "CHEAT_DETECTED"
        };
    }

    if (durationMs > 0) {
        const scorePerSecond = (score / durationMs) * 1000;
        if (scorePerSecond > maxScorePerSecond) {
            return {
                success: false,
                reason: "CHEAT_DETECTED"
            };
        }
    }

    // Mark session as used
    await base44.asServiceRole.entities.PendingRun.update(session.id, {
        used: true
    });

    // Save run
    await base44.asServiceRole.entities.Run.create({
        user_id: user.id,
        score: score,
        distance: 0,
        coins_earned: coinsCollected,
        combos_max: 0,
        duration_ms: durationMs,
        mission_id: missionId,
        difficulty: difficulty,
        mode: missionId ? 'mission' : 'endless'
    });

    // Update PlayerStats
    const stats = await base44.asServiceRole.entities.PlayerStats.filter({ user_id: user.id });
    let playerStats;
    
    if (stats.length === 0) {
        playerStats = await base44.asServiceRole.entities.PlayerStats.create({
            user_id: user.id,
            total_coins: coinsCollected,
            total_score: score,
            best_score: score,
            best_distance: 0,
            total_runs: 1
        });
    } else {
        playerStats = stats[0];
        const isHighscore = score > (playerStats.best_score || 0);
        
        await base44.asServiceRole.entities.PlayerStats.update(playerStats.id, {
            total_coins: (playerStats.total_coins || 0) + coinsCollected,
            total_score: (playerStats.total_score || 0) + score,
            best_score: isHighscore ? score : playerStats.best_score,
            total_runs: (playerStats.total_runs || 0) + 1
        });

        // Update leaderboard if highscore
        if (isHighscore) {
            const existingEntry = await base44.asServiceRole.entities.LeaderboardEntry.filter({ user_id: user.id });
            
            if (existingEntry.length > 0) {
                await base44.asServiceRole.entities.LeaderboardEntry.update(existingEntry[0].id, {
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

        return {
            success: true,
            isHighscore: isHighscore,
            stats: {
                total_coins: (playerStats.total_coins || 0) + coinsCollected,
                best_score: isHighscore ? score : playerStats.best_score
            }
        };
    }

    return {
        success: true,
        isHighscore: true,
        stats: playerStats
    };
}
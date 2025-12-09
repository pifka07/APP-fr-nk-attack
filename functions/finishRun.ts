export default async function finishRun({ run_session_id, score, coinsCollected, durationMs, missionId, difficulty }, { user, base44 }) {
    // Check if user is logged in
    if (!user) {
        return {
            success: false,
            reason: "NOT_LOGGED_IN"
        };
    }

    // Fetch the pending run session
    const pendingRuns = await base44.asServiceRole.entities.PendingRun.filter({
        id: run_session_id,
        user_id: user.id
    });

    if (!pendingRuns || pendingRuns.length === 0) {
        return {
            success: false,
            reason: "CHEAT_INVALID_SESSION"
        };
    }

    const pendingRun = pendingRuns[0];

    // Check if already used
    if (pendingRun.used) {
        return {
            success: false,
            reason: "CHEAT_REPLAY"
        };
    }

    // Check if expired
    const now = new Date();
    const expiresAt = new Date(pendingRun.expires_at);
    if (now > expiresAt) {
        return {
            success: false,
            reason: "CHEAT_EXPIRED"
        };
    }

    // Validate time (anti-speedhack)
    const startedAt = new Date(pendingRun.started_at);
    const serverDuration = now - startedAt;
    const timeDifference = Math.abs(serverDuration - durationMs);
    
    // Allow 10 seconds tolerance
    if (timeDifference > 10000) {
        return {
            success: false,
            reason: "CHEAT_SPEEDHACK"
        };
    }

    // Validate score and coins (anti-cheat logic checks)
    const maxScorePerSecond = 500; // Adjust based on game mechanics
    const maxCoinsPerSecond = 50;
    const durationSeconds = durationMs / 1000;

    if (score > maxScorePerSecond * durationSeconds * 2) {
        return {
            success: false,
            reason: "CHEAT_DETECTED"
        };
    }

    if (coinsCollected > maxCoinsPerSecond * durationSeconds * 2) {
        return {
            success: false,
            reason: "CHEAT_DETECTED"
        };
    }

    // Mark session as used
    await base44.asServiceRole.entities.PendingRun.update(pendingRun.id, {
        used: true
    });

    // Create run record
    const run = await base44.asServiceRole.entities.Run.create({
        user_id: user.id,
        score: score,
        distance: 0,
        coins_earned: coinsCollected,
        combos_max: 0,
        duration_ms: durationMs,
        mission_id: missionId,
        difficulty: difficulty || 'normal',
        mode: missionId ? 'mission' : 'endless'
    });

    // Update player stats
    const playerStatsList = await base44.asServiceRole.entities.PlayerStats.filter({
        user_id: user.id
    });

    let playerStats;
    if (playerStatsList.length === 0) {
        // Create new stats
        playerStats = await base44.asServiceRole.entities.PlayerStats.create({
            user_id: user.id,
            total_coins: coinsCollected,
            total_score: score,
            best_score: score,
            best_distance: 0,
            total_runs: 1
        });
    } else {
        playerStats = playerStatsList[0];
        await base44.asServiceRole.entities.PlayerStats.update(playerStats.id, {
            total_coins: playerStats.total_coins + coinsCollected,
            total_score: playerStats.total_score + score,
            best_score: Math.max(playerStats.best_score, score),
            total_runs: playerStats.total_runs + 1
        });
    }

    // Update user coins
    await base44.asServiceRole.entities.User.update(user.id, {
        total_coins: (user.total_coins || 0) + coinsCollected
    });

    // Update leaderboard if high score
    const isHighscore = score > (playerStats.best_score || 0);
    if (isHighscore) {
        // Check if user already has leaderboard entry
        const existingEntries = await base44.asServiceRole.entities.LeaderboardEntry.filter({
            user_id: user.id
        });

        if (existingEntries.length > 0) {
            // Update existing entry
            await base44.asServiceRole.entities.LeaderboardEntry.update(existingEntries[0].id, {
                score: score,
                date: new Date().toISOString()
            });
        } else {
            // Create new entry
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
            total_coins: (user.total_coins || 0) + coinsCollected,
            best_score: Math.max(playerStats.best_score || 0, score)
        }
    };
}
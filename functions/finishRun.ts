/**
 * Server Action: finishRun
 * 
 * Anti-Cheat enabled Run submission endpoint
 * Runs in admin context to prevent client manipulation
 * 
 * ANTI-CHEAT CONFIGURATION:
 * - MAX_SCORE_PER_RUN = 500000
 * - MAX_COINS_PER_RUN = 2000
 * - MIN_RUN_DURATION = 5000 (5 seconds)
 * - MAX_RUN_DURATION = 1200000 (20 minutes)
 * - MAX_SCORE_PER_SECOND = 300
 */

// Anti-Cheat Constants
const MAX_SCORE_PER_RUN = 500000;
const MAX_COINS_PER_RUN = 2000;
const MIN_RUN_DURATION = 5000;
const MAX_RUN_DURATION = 1200000;
const MAX_SCORE_PER_SECOND = 300;

export default async function finishRun({ base44, user }, { score, coinsCollected, durationMs, missionId, difficulty }) {
    // Validate user is authenticated
    if (!user || !user.id) {
        return { 
            success: false, 
            reason: "UNAUTHORIZED" 
        };
    }

    // Anti-Cheat Validation
    
    // Check score bounds
    if (score < 0 || score > MAX_SCORE_PER_RUN) {
        return { 
            success: false, 
            reason: "CHEAT_DETECTED",
            details: "Invalid score range"
        };
    }

    // Check coins bounds
    if (coinsCollected < 0 || coinsCollected > MAX_COINS_PER_RUN) {
        return { 
            success: false, 
            reason: "CHEAT_DETECTED",
            details: "Invalid coins range"
        };
    }

    // Check duration bounds
    if (durationMs < MIN_RUN_DURATION || durationMs > MAX_RUN_DURATION) {
        return { 
            success: false, 
            reason: "CHEAT_DETECTED",
            details: "Invalid duration"
        };
    }

    // Check score per second ratio
    const scorePerSecond = score / (durationMs / 1000);
    if (scorePerSecond > MAX_SCORE_PER_SECOND) {
        return { 
            success: false, 
            reason: "CHEAT_DETECTED",
            details: "Score rate too high"
        };
    }

    // All checks passed - proceed with server-side operations
    try {
        // Use admin context to bypass security rules
        const adminBase44 = base44.asServiceRole;

        // 1. Create Run record
        const newRun = await adminBase44.entities.Run.create({
            user_id: user.id,
            score: score,
            coins_earned: coinsCollected,
            duration_ms: durationMs,
            mission_id: missionId || null,
            difficulty: difficulty || null,
            mode: missionId ? "mission" : "endless"
        });

        // 2. Get or create PlayerStats
        let statsArray = await adminBase44.entities.PlayerStats.filter({ user_id: user.id });
        let stats;

        if (statsArray.length === 0) {
            // Create new stats if not exists
            stats = await adminBase44.entities.PlayerStats.create({
                user_id: user.id,
                total_coins: coinsCollected,
                total_score: score,
                best_score: score,
                best_distance: 0,
                total_runs: 1
            });
        } else {
            // Update existing stats
            stats = statsArray[0];
            const updatedStats = {
                total_coins: stats.total_coins + coinsCollected,
                total_score: (stats.total_score || 0) + score,
                total_runs: stats.total_runs + 1
            };

            // Check if new high score
            if (score > stats.best_score) {
                updatedStats.best_score = score;
            }

            stats = await adminBase44.entities.PlayerStats.update(stats.id, updatedStats);
        }

        // 3. Update Leaderboard if high score
        let isHighscore = false;
        if (score > (statsArray.length > 0 ? statsArray[0].best_score : 0)) {
            isHighscore = true;

            // Check if user already has a leaderboard entry
            const existingEntries = await adminBase44.entities.LeaderboardEntry.filter({ user_id: user.id });
            
            const username = user.username || user.full_name || user.email?.split('@')[0] || 'Player';

            if (existingEntries.length > 0) {
                // Update existing entry
                await adminBase44.entities.LeaderboardEntry.update(existingEntries[0].id, {
                    score: score,
                    username: username,
                    date: new Date().toISOString()
                });
            } else {
                // Create new leaderboard entry
                await adminBase44.entities.LeaderboardEntry.create({
                    user_id: user.id,
                    username: username,
                    score: score,
                    date: new Date().toISOString()
                });
            }
        }

        // 4. Return success response
        return {
            success: true,
            stats: stats,
            isHighscore: isHighscore,
            run: newRun
        };

    } catch (error) {
        console.error("Error finishing run:", error);
        return {
            success: false,
            reason: "SERVER_ERROR",
            details: error.message
        };
    }
}
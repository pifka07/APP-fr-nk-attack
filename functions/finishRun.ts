import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        console.log("finishRun called - User:", user?.email);

        if (!user) {
            console.log("User not logged in");
            return Response.json({
                success: false,
                reason: "NOT_LOGGED_IN"
            }, { status: 401 });
        }

        const body = await req.json();
        console.log("finishRun request body:", JSON.stringify(body));
        const { run_session_id, score, coinsCollected, durationMs, missionId, difficulty, distance, level } = body;

        // Get all pending runs (no filter to see everything)
        const allPendingRunsGlobal = await base44.asServiceRole.entities.PendingRun.list();
        console.log("Total pending runs in database:", allPendingRunsGlobal?.length || 0);

        // Get all pending runs for this user
        const allPendingRuns = await base44.asServiceRole.entities.PendingRun.filter({
            user_id: user.id
        });

        console.log("All pending runs for user:", allPendingRuns?.length || 0);
        console.log("User ID:", user.id);
        console.log("Looking for session:", run_session_id);

        // Find the specific session
        const pendingRun = allPendingRuns.find(pr => pr.id === run_session_id);

        // ANTI-CHEAT CHECKS DISABLED
        /*
        if (!pendingRun) {
            console.log("No pending run found for session:", run_session_id);
            console.log("Available sessions:", allPendingRuns.map(pr => ({ id: pr.id, user_id: pr.user_id })));
            console.log("All global sessions:", allPendingRunsGlobal.map(pr => ({ id: pr.id, user_id: pr.user_id })));
            return Response.json({
                success: false,
                reason: "CHEAT_INVALID_SESSION"
            }, { status: 400 });
        }

        if (pendingRun.used) {
            return Response.json({
                success: false,
                reason: "CHEAT_REPLAY"
            }, { status: 400 });
        }

        const now = new Date();
        const expiresAt = new Date(pendingRun.expires_at);
        if (now > expiresAt) {
            return Response.json({
                success: false,
                reason: "CHEAT_EXPIRED"
            }, { status: 400 });
        }

        const startedAt = new Date(pendingRun.started_at);
        const serverDuration = now - startedAt;
        const timeDifference = Math.abs(serverDuration - durationMs);

        console.log("Time check - serverDuration:", serverDuration, "durationMs:", durationMs, "difference:", timeDifference);

        if (durationMs < 0) {
            console.log("Negative durationMs detected:", durationMs);
            return Response.json({
                success: false,
                reason: "CHEAT_SPEEDHACK"
            }, { status: 400 });
        }

        // Allow more time tolerance (30 seconds) for mobile devices and network delays
        if (timeDifference > 30000) {
            console.log("Time difference too large:", timeDifference);
            return Response.json({
                success: false,
                reason: "CHEAT_SPEEDHACK"
            }, { status: 400 });
        }

        // Adjust limits based on difficulty
        const speedMultiplier = difficulty === 'quick' ? 1.4 : (difficulty === 'slow' ? 0.7 : 1);
        const maxScorePerSecond = 500 * speedMultiplier;
        const maxCoinsPerSecond = 50 * speedMultiplier;
        const durationSeconds = durationMs / 1000;

        if (score > maxScorePerSecond * durationSeconds * 3) {
            return Response.json({
                success: false,
                reason: "CHEAT_DETECTED"
            }, { status: 400 });
        }

        if (coinsCollected > maxCoinsPerSecond * durationSeconds * 3) {
            return Response.json({
                success: false,
                reason: "CHEAT_DETECTED"
            }, { status: 400 });
        }
        */

        // Mark session as used (if exists)
        if (pendingRun) {
            await base44.asServiceRole.entities.PendingRun.update(pendingRun.id, {
                used: true
            });
        }

        const run = await base44.asServiceRole.entities.Run.create({
            user_id: user.id,
            score: score,
            distance: distance || 0,
            coins_earned: coinsCollected,
            combos_max: 0,
            duration_ms: durationMs,
            mission_id: missionId,
            difficulty: difficulty || 'normal',
            mode: missionId ? 'mission' : 'endless'
        });

        // Update PlayerStats
        console.log('📊 Updating PlayerStats for user:', user.id);
        const playerStats = await base44.asServiceRole.entities.PlayerStats.filter({ user_id: user.id });
        console.log('📊 Found PlayerStats:', playerStats.length);
        
        if (playerStats.length > 0) {
            const stats = playerStats[0];
            console.log('📊 Current stats:', stats);
            const updatedStats = {
                total_score: (stats.total_score || 0) + score,
                total_coins: (stats.total_coins || 0) + coinsCollected,
                total_distance: (stats.total_distance || 0) + (distance || 0),
                total_runs: (stats.total_runs || 0) + 1,
                best_score: Math.max(stats.best_score || 0, score),
                best_distance: Math.max(stats.best_distance || 0, distance || 0)
            };
            console.log('📊 Updating with:', updatedStats);
            await base44.asServiceRole.entities.PlayerStats.update(stats.id, updatedStats);
            console.log('✅ PlayerStats updated');
        } else {
            console.log('📊 Creating new PlayerStats');
            const newStats = {
                user_id: user.id,
                total_score: score,
                total_coins: coinsCollected,
                total_distance: distance || 0,
                total_runs: 1,
                best_score: score,
                best_distance: distance || 0
            };
            console.log('📊 Creating with:', newStats);
            const created = await base44.asServiceRole.entities.PlayerStats.create(newStats);
            console.log('✅ PlayerStats created:', created);
        }
        
        const newTotalCoins = playerStats.length > 0 ? (playerStats[0].total_coins || 0) + coinsCollected : coinsCollected;
        const newBestScore = playerStats.length > 0 ? Math.max(playerStats[0].best_score || 0, score) : score;

        // Check existing leaderboard entries
        const existingEntries = await base44.asServiceRole.entities.LeaderboardEntry.filter({
            user_id: user.id
        });

        const isHighscore = score > (user.best_score || 0);

        // Update or create leaderboard entry if it's a highscore OR if no entry exists yet
        if (isHighscore || existingEntries.length === 0) {
            if (existingEntries.length > 0) {
                // Update existing entry only if new score is better
                if (score > existingEntries[0].score) {
                    await base44.asServiceRole.entities.LeaderboardEntry.update(existingEntries[0].id, {
                        score: score,
                        username: user.username || user.full_name || user.email,
                        level: level || 'downtown',
                        date: new Date().toISOString()
                    });
                }
            } else {
                // Create new entry
                await base44.asServiceRole.entities.LeaderboardEntry.create({
                    user_id: user.id,
                    username: user.username || user.full_name || user.email,
                    score: score,
                    level: level || 'downtown',
                    date: new Date().toISOString()
                });
            }
        }

        // Keep only top 10 entries
        const allEntries = await base44.asServiceRole.entities.LeaderboardEntry.list('-score');
        if (allEntries.length > 10) {
            const toDelete = allEntries.slice(10);
            for (const entry of toDelete) {
                await base44.asServiceRole.entities.LeaderboardEntry.delete(entry.id);
            }
        }

        return Response.json({
            success: true,
            isHighscore,
            stats: {
                total_coins: newTotalCoins,
                best_score: newBestScore
            }
        });
    } catch (error) {
        console.error("Error in finishRun:", error);
        return Response.json({ 
            success: false, 
            reason: error.message 
        }, { status: 500 });
    }
});
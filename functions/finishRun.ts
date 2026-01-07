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
        const { run_session_id, score, coinsCollected, durationMs, missionId, difficulty, distance } = body;

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
        
        if (timeDifference > 10000) {
            return Response.json({
                success: false,
                reason: "CHEAT_SPEEDHACK"
            }, { status: 400 });
        }

        const maxScorePerSecond = 500;
        const maxCoinsPerSecond = 50;
        const durationSeconds = durationMs / 1000;

        if (score > maxScorePerSecond * durationSeconds * 2) {
            return Response.json({
                success: false,
                reason: "CHEAT_DETECTED"
            }, { status: 400 });
        }

        if (coinsCollected > maxCoinsPerSecond * durationSeconds * 2) {
            return Response.json({
                success: false,
                reason: "CHEAT_DETECTED"
            }, { status: 400 });
        }

        await base44.asServiceRole.entities.PendingRun.update(pendingRun.id, {
            used: true
        });

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

        // Load or create PlayerStats for this user
        let playerStats;
        const existingStats = await base44.asServiceRole.entities.PlayerStats.filter({ user_id: user.id });

        if (existingStats.length > 0) {
            // Use existing stats (first one if duplicates exist)
            playerStats = existingStats[0];
            console.log('Found existing PlayerStats:', playerStats.id);

            // Delete any duplicates immediately
            if (existingStats.length > 1) {
                console.log('⚠️ Deleting', existingStats.length - 1, 'duplicate PlayerStats');
                for (let i = 1; i < existingStats.length; i++) {
                    await base44.asServiceRole.entities.PlayerStats.delete(existingStats[i].id);
                }
            }

            // Update existing stats
            await base44.asServiceRole.entities.PlayerStats.update(playerStats.id, {
                total_score: (playerStats.total_score || 0) + score,
                total_coins: (playerStats.total_coins || 0) + coinsCollected,
                total_distance: (playerStats.total_distance || 0) + (distance || 0),
                total_runs: (playerStats.total_runs || 0) + 1,
                best_score: Math.max(playerStats.best_score || 0, score),
                best_distance: Math.max(playerStats.best_distance || 0, distance || 0)
            });

            const newTotalScore = (playerStats.total_score || 0) + score;
            const newTotalCoins = (playerStats.total_coins || 0) + coinsCollected;
            const newBestScore = Math.max(playerStats.best_score || 0, score);

            playerStats = { ...playerStats, total_coins: newTotalCoins, best_score: newBestScore };
        } else {
            // First run - create new PlayerStats
            console.log('Creating first PlayerStats for user');
            playerStats = await base44.asServiceRole.entities.PlayerStats.create({
                user_id: user.id,
                total_score: score,
                total_coins: coinsCollected,
                total_distance: distance || 0,
                total_runs: 1,
                best_score: score,
                best_distance: distance || 0
            });
        }

        const newTotalCoins = playerStats.total_coins;
        const newBestScore = playerStats.best_score;

        // Check existing leaderboard entries
        const existingEntries = await base44.asServiceRole.entities.LeaderboardEntry.filter({
            user_id: user.id
        });

        const isHighscore = score > (playerStats.best_score || 0);

        // Update or create leaderboard entry if it's a highscore OR if no entry exists yet
        if (isHighscore || existingEntries.length === 0) {
            if (existingEntries.length > 0) {
                // Update existing entry only if new score is better
                if (score > existingEntries[0].score) {
                    await base44.asServiceRole.entities.LeaderboardEntry.update(existingEntries[0].id, {
                        score: score,
                        username: user.username || user.full_name || user.email,
                        date: new Date().toISOString()
                    });
                }
            } else {
                // Create new entry
                await base44.asServiceRole.entities.LeaderboardEntry.create({
                    user_id: user.id,
                    username: user.username || user.full_name || user.email,
                    score: score,
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
            isHighscore: isHighscore,
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
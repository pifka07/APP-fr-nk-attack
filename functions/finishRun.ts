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
        const { run_session_id, score, coinsCollected, durationMs, missionId, difficulty } = body;

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
            distance: 0,
            coins_earned: coinsCollected,
            combos_max: 0,
            duration_ms: durationMs,
            mission_id: missionId,
            difficulty: difficulty || 'normal',
            mode: missionId ? 'mission' : 'endless'
        });

        // Load PlayerStats for this user
        const playerStatsList = await base44.asServiceRole.entities.PlayerStats.filter({
            user_id: user.id
        });

        let playerStats;
        // Create PlayerStats if doesn't exist yet (first game)
        if (playerStatsList.length === 0) {
            playerStats = await base44.asServiceRole.entities.PlayerStats.create({
                user_id: user.id,
                total_score: 0,
                total_coins: 0,
                total_distance: 0,
                total_runs: 0,
                best_score: 0,
                best_distance: 0
            });
        } else {
            playerStats = playerStatsList[0];
        }

        // Calculate updated values
        const newTotalScore = playerStats.total_score + score;
        const newTotalCoins = playerStats.total_coins + coinsCollected;
        const newTotalDistance = playerStats.total_distance + 0; // distance not yet implemented
        const newTotalRuns = playerStats.total_runs + 1;
        const newBestScore = Math.max(playerStats.best_score, score);

        // Update PlayerStats
        await base44.asServiceRole.entities.PlayerStats.update(playerStats.id, {
            total_score: newTotalScore,
            total_coins: newTotalCoins,
            total_distance: newTotalDistance,
            total_runs: newTotalRuns,
            best_score: newBestScore
        });

        await base44.asServiceRole.entities.User.update(user.id, {
            total_coins: (user.total_coins || 0) + coinsCollected,
            total_runs: (user.total_runs || 0) + 1
        });

        const isHighscore = score > (playerStats.best_score || 0);
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

        return Response.json({
            success: true,
            isHighscore: isHighscore,
            stats: {
                total_coins: (user.total_coins || 0) + coinsCollected,
                best_score: Math.max(playerStats.best_score || 0, score)
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
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({
                success: false,
                reason: "NOT_LOGGED_IN"
            }, { status: 401 });
        }

        const { run_session_id, score, coinsCollected, durationMs, missionId, difficulty } = await req.json();

        const pendingRuns = await base44.asServiceRole.entities.PendingRun.filter({
            id: run_session_id,
            user_id: user.id
        });

        if (!pendingRuns || pendingRuns.length === 0) {
            return Response.json({
                success: false,
                reason: "CHEAT_INVALID_SESSION"
            }, { status: 400 });
        }

        const pendingRun = pendingRuns[0];

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

        const playerStatsList = await base44.asServiceRole.entities.PlayerStats.filter({
            user_id: user.id
        });

        let playerStats;
        if (playerStatsList.length === 0) {
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

        await base44.asServiceRole.entities.User.update(user.id, {
            total_coins: (user.total_coins || 0) + coinsCollected
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
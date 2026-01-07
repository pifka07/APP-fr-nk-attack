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

        // Load User entity to get player_stats_id
        const userEntityList = await base44.asServiceRole.entities.User.filter({ id: user.id });
        const userEntity = userEntityList[0];
        console.log('User entity player_stats_id:', userEntity?.player_stats_id);
        
        // Load or create PlayerStats for this user using player_stats_id from User
        let playerStats;
        let newTotalCoins, newBestScore;
        
        if (userEntity?.player_stats_id) {
            // User already has PlayerStats - load it by ID
            console.log('Loading PlayerStats by ID:', userEntity.player_stats_id);
            try {
                const statsList = await base44.asServiceRole.entities.PlayerStats.filter({ id: userEntity.player_stats_id });
                if (statsList.length > 0) {
                    playerStats = statsList[0];
                    console.log('Found PlayerStats by ID, current coins:', playerStats.total_coins);
                    
                    // Update existing stats
                    newTotalCoins = (playerStats.total_coins || 0) + coinsCollected;
                    newBestScore = Math.max(playerStats.best_score || 0, score);
                    
                    await base44.asServiceRole.entities.PlayerStats.update(playerStats.id, {
                        total_score: (playerStats.total_score || 0) + score,
                        total_coins: newTotalCoins,
                        total_distance: (playerStats.total_distance || 0) + (distance || 0),
                        total_runs: (playerStats.total_runs || 0) + 1,
                        best_score: newBestScore,
                        best_distance: Math.max(playerStats.best_distance || 0, distance || 0)
                    });
                    console.log('Updated PlayerStats, new coins:', newTotalCoins);
                } else {
                    throw new Error('PlayerStats not found');
                }
            } catch (e) {
                console.log('PlayerStats ID invalid, creating new one');
                playerStats = null;
            }
        }
        
        if (!playerStats) {
            // First run - create new PlayerStats and link to user
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
            
            newTotalCoins = coinsCollected;
            newBestScore = score;
            
            // Save PlayerStats ID to user
            await base44.asServiceRole.entities.User.update(user.id, {
                player_stats_id: playerStats.id
            });
            console.log('Linked PlayerStats to User, ID:', playerStats.id);
        }

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
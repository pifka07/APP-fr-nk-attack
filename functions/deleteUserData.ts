import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        }

        // Delete all user-related data using service role
        const userId = user.id;

        // Get all entities to delete
        const [playerStats, runs, playerSkins, playerUpgrades, playerMissions, leaderboardEntries, pendingRuns] = await Promise.all([
            base44.asServiceRole.entities.PlayerStats.filter({ user_id: userId }),
            base44.asServiceRole.entities.Run.filter({ user_id: userId }),
            base44.asServiceRole.entities.PlayerSkin.filter({ user_id: userId }),
            base44.asServiceRole.entities.PlayerUpgrade.filter({ user_id: userId }),
            base44.asServiceRole.entities.PlayerMission.filter({ user_id: userId }),
            base44.asServiceRole.entities.LeaderboardEntry.filter({ user_id: userId }),
            base44.asServiceRole.entities.PendingRun.filter({ user_id: userId })
        ]);

        // Delete all records
        const deletePromises = [];

        for (const stat of playerStats) {
            deletePromises.push(base44.asServiceRole.entities.PlayerStats.delete(stat.id));
        }
        for (const run of runs) {
            deletePromises.push(base44.asServiceRole.entities.Run.delete(run.id));
        }
        for (const skin of playerSkins) {
            deletePromises.push(base44.asServiceRole.entities.PlayerSkin.delete(skin.id));
        }
        for (const upgrade of playerUpgrades) {
            deletePromises.push(base44.asServiceRole.entities.PlayerUpgrade.delete(upgrade.id));
        }
        for (const mission of playerMissions) {
            deletePromises.push(base44.asServiceRole.entities.PlayerMission.delete(mission.id));
        }
        for (const entry of leaderboardEntries) {
            deletePromises.push(base44.asServiceRole.entities.LeaderboardEntry.delete(entry.id));
        }
        for (const pending of pendingRuns) {
            deletePromises.push(base44.asServiceRole.entities.PendingRun.delete(pending.id));
        }

        await Promise.all(deletePromises);

        // Delete the user account
        await base44.asServiceRole.entities.User.delete(userId);

        return Response.json({ success: true });
    } catch (error) {
        console.error('Error deleting user data:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ success: false, reason: "NOT_LOGGED_IN" }, { status: 401 });
        }

        const body = await req.json();
        const { mission_id } = body;

        if (!mission_id) {
            return Response.json({ success: false, reason: "MISSING_MISSION_ID" }, { status: 400 });
        }

        // Find the mission (user-scoped read ensures ownership)
        const missions = await base44.entities.DailyMission.filter({
            user_id: user.id,
            id: mission_id
        });

        if (missions.length === 0) {
            return Response.json({ success: false, reason: "MISSION_NOT_FOUND" }, { status: 404 });
        }

        const mission = missions[0];

        if (mission.claimed) {
            return Response.json({ success: false, reason: "ALREADY_CLAIMED" }, { status: 400 });
        }

        if (!mission.completed) {
            return Response.json({ success: false, reason: "NOT_COMPLETED" }, { status: 400 });
        }

        // Mark as claimed
        await base44.entities.DailyMission.update(mission_id, {
            claimed: true
        });

        // Add reward coins to player's total
        const updatedUser = await base44.auth.updateMe({
            total_coins: (user.total_coins || 0) + mission.reward_coins
        });

        return Response.json({
            success: true,
            reward_coins: mission.reward_coins,
            total_coins: updatedUser.total_coins
        });
    } catch (error) {
        console.error("Error in claimDailyMission:", error);
        return Response.json({ success: false, reason: error.message }, { status: 500 });
    }
});
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

        const { missionId, difficulty } = await req.json();

        const now = new Date();
        const expiresAt = new Date(now.getTime() + 30 * 60 * 1000);

        const pendingRun = await base44.asServiceRole.entities.PendingRun.create({
            user_id: user.id,
            mission_id: missionId || null,
            difficulty: difficulty || 'normal',
            started_at: now.toISOString(),
            expires_at: expiresAt.toISOString(),
            used: false
        });

        return Response.json({
            success: true,
            run_session_id: pendingRun.id,
            started_at: pendingRun.started_at
        });
    } catch (error) {
        console.error("Error in startRun:", error);
        return Response.json({ 
            success: false, 
            reason: error.message 
        }, { status: 500 });
    }
});
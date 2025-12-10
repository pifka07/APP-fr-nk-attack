import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        console.log("startRun called - User:", user?.email);

        if (!user) {
            console.log("User not logged in");
            return Response.json({
                success: false,
                reason: "NOT_LOGGED_IN"
            }, { status: 401 });
        }

        const body = await req.json();
        console.log("startRun request body:", JSON.stringify(body));
        const { missionId, difficulty } = body;

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

        console.log("PendingRun created:", pendingRun.id);

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
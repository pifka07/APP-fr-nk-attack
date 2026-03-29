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

        console.log("About to create PendingRun with data:", {
            user_id: user.id,
            mission_id: missionId || null,
            difficulty: difficulty || 'normal',
            started_at: now.toISOString(),
            expires_at: expiresAt.toISOString(),
            used: false
        });

        const pendingRun = await base44.asServiceRole.entities.PendingRun.create({
            user_id: user.id,
            mission_id: missionId || null,
            difficulty: difficulty || 'normal',
            started_at: now.toISOString(),
            expires_at: expiresAt.toISOString(),
            used: false
        });

        console.log("PendingRun created successfully:", JSON.stringify(pendingRun));

        // Verify it was actually created
        const verify = await base44.asServiceRole.entities.PendingRun.filter({ id: pendingRun.id });
        console.log("Verification - found runs with this ID:", verify?.length || 0);
        if (verify.length > 0) {
            console.log("Verified run data:", JSON.stringify(verify[0]));
        }

        const allRuns = await base44.asServiceRole.entities.PendingRun.list();
        console.log("Total runs in database after creation:", allRuns?.length || 0);

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
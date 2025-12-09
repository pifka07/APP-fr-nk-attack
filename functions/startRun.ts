/**
 * Server Action: startRun
 * 
 * Creates a PendingRun session to prevent replay attacks
 * Must be called before starting a game run
 */

export default async function startRun({ base44, user }, { missionId, difficulty }) {
    // Validate user is authenticated
    if (!user || !user.id) {
        return { 
            success: false, 
            reason: "UNAUTHORIZED" 
        };
    }

    try {
        const adminBase44 = base44.asServiceRole;
        
        // Calculate timestamps
        const started_at = new Date();
        const expires_at = new Date(started_at.getTime() + 30 * 60 * 1000); // 30 minutes

        // Create PendingRun session
        const pendingRun = await adminBase44.entities.PendingRun.create({
            user_id: user.id,
            mission_id: missionId || null,
            difficulty: difficulty || null,
            started_at: started_at.toISOString(),
            expires_at: expires_at.toISOString(),
            used: false
        });

        return {
            success: true,
            run_session_id: pendingRun.id,
            started_at: started_at.toISOString()
        };

    } catch (error) {
        console.error("Error starting run:", error);
        return {
            success: false,
            reason: "SERVER_ERROR",
            details: error.message
        };
    }
}
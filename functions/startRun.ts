export default async function startRun({ missionId, difficulty }, { user, base44 }) {
    // Check if user is logged in
    if (!user || !user.id) {
        return {
            success: false,
            reason: "NOT_LOGGED_IN"
        };
    }

    // Generate unique session ID
    const run_session_id = `${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const started_at = new Date().toISOString();
    const expires_at = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes

    // Create PendingRun record
    await base44.asServiceRole.entities.PendingRun.create({
        user_id: user.id,
        mission_id: missionId,
        difficulty: difficulty,
        started_at: started_at,
        used: false,
        expires_at: expires_at
    });

    return {
        success: true,
        run_session_id: run_session_id,
        started_at: started_at
    };
}
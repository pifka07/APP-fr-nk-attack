export default async function startRun({ missionId, difficulty }, { user, base44 }) {
    // Check if user is logged in
    if (!user) {
        return {
            success: false,
            reason: "NOT_LOGGED_IN"
        };
    }

    // Create a new pending run session
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes expiry

    const pendingRun = await base44.asServiceRole.entities.PendingRun.create({
        user_id: user.id,
        mission_id: missionId || null,
        difficulty: difficulty || 'normal',
        started_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        used: false
    });

    return {
        success: true,
        run_session_id: pendingRun.id,
        started_at: pendingRun.started_at
    };
}
export default async function startRun({ missionId, difficulty }, { user, base44 }) {
    // 1. User prüfen
    if (!user || !user.id) {
        return {
            success: false,
            reason: "NOT_LOGGED_IN"
        };
    }

    try {
        // 2. run_session_id erzeugen (UUID-ähnlich)
        const runSessionId = `${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date();
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 Minuten

        // 3. PendingRun speichern (admin context via asServiceRole)
        await base44.asServiceRole.entities.PendingRun.create({
            id: runSessionId,
            user_id: user.id,
            mission_id: missionId || null,
            difficulty: difficulty || 'normal',
            started_at: now.toISOString(),
            used: false,
            expires_at: expiresAt.toISOString()
        });

        // 4. Antwort an Client
        return {
            success: true,
            run_session_id: runSessionId,
            started_at: now.toISOString()
        };
    } catch (error) {
        console.error("Error in startRun:", error);
        return {
            success: false,
            reason: "SERVER_ERROR",
            error: error.message
        };
    }
}
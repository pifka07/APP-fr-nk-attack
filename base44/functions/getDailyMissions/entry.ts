import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const MISSION_POOL = [
    { mission_type: "distance", goal_value: 800,  reward_coins: 15, title: "Fernflieger I",  description: "Fliege insgesamt 800 Meter" },
    { mission_type: "distance", goal_value: 2000, reward_coins: 30, title: "Fernflieger II", description: "Fliege insgesamt 2000 Meter" },
    { mission_type: "distance", goal_value: 4000, reward_coins: 50, title: "Fernflieger III", description: "Fliege insgesamt 4000 Meter" },
    { mission_type: "coins",    goal_value: 15,   reward_coins: 20, title: "Münzjäger I",    description: "Sammle 15 Münzen" },
    { mission_type: "coins",    goal_value: 40,   reward_coins: 35, title: "Münzjäger II",   description: "Sammle 40 Münzen" },
    { mission_type: "score",    goal_value: 3000, reward_coins: 20, title: "Punkteking I",   description: "Erziele 3000 Punkte" },
    { mission_type: "score",    goal_value: 8000, reward_coins: 40, title: "Punkteking II",  description: "Erziele 8000 Punkte" },
    { mission_type: "duration", goal_value: 45000,  reward_coins: 15, title: "Überlebenskünstler I",  description: "Überlebe insgesamt 45 Sekunden" },
    { mission_type: "duration", goal_value: 120000, reward_coins: 30, title: "Überlebenskünstler II", description: "Überlebe insgesamt 120 Sekunden" },
];

function getDateStringBerlin() {
    const now = new Date();
    const berlinTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Berlin" }));
    const yyyy = berlinTime.getFullYear();
    const mm = String(berlinTime.getMonth() + 1).padStart(2, '0');
    const dd = String(berlinTime.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

// Deterministic pick of 3 missions per day (same for everyone, rotates daily)
function pickDailyMissions(dateStr) {
    // Simple hash from date string
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
        hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
        hash |= 0;
    }
    const seed = Math.abs(hash);

    // Pick 3 missions with different mission_types
    const types = ["distance", "coins", "score", "duration"];
    const shuffledTypes = [];
    for (let i = 0; i < 4; i++) {
        const idx = (seed + i * 7) % types.length;
        const t = types.splice(idx % types.length, 1)[0];
        shuffledTypes.push(t);
    }

    const picked = shuffledTypes.slice(0, 3).map(type => {
        const pool = MISSION_POOL.filter(m => m.mission_type === type);
        const variantIdx = seed % pool.length;
        return pool[variantIdx];
    });

    return picked;
}

function getTimeUntilMidnightBerlin() {
    const now = new Date();
    const berlinParts = now.toLocaleString("en-US", { timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit", hour12: false }).split(":");
    const berlinHour = parseInt(berlinParts[0]);
    const berlinMin = parseInt(berlinParts[1]);

    // Approximate seconds until midnight Berlin
    const secondsElapsed = berlinHour * 3600 + berlinMin * 60;
    const secondsUntilMidnight = 86400 - secondsElapsed;
    return secondsUntilMidnight;
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ success: false, reason: "NOT_LOGGED_IN" }, { status: 401 });
        }

        const dateStr = getDateStringBerlin();

        // Check if player already has missions for today
        const existing = await base44.entities.DailyMission.filter({
            user_id: user.id,
            date_string: dateStr
        });

        if (existing.length > 0) {
            const allCompleted = existing.every(m => m.completed && m.claimed);
            return Response.json({
                success: true,
                missions: existing,
                date_string: dateStr,
                seconds_until_reset: getTimeUntilMidnightBerlin(),
                all_completed: allCompleted
            });
        }

        // Generate new daily missions
        const templates = pickDailyMissions(dateStr);
        const created = [];
        for (const t of templates) {
            const mission = await base44.entities.DailyMission.create({
                user_id: user.id,
                date_string: dateStr,
                mission_type: t.mission_type,
                goal_value: t.goal_value,
                progress: 0,
                completed: false,
                claimed: false,
                reward_coins: t.reward_coins,
                title: t.title,
                description: t.description
            });
            created.push(mission);
        }

        return Response.json({
            success: true,
            missions: created,
            date_string: dateStr,
            seconds_until_reset: getTimeUntilMidnightBerlin(),
            all_completed: false
        });
    } catch (error) {
        console.error("Error in getDailyMissions:", error);
        return Response.json({ success: false, reason: error.message }, { status: 500 });
    }
});
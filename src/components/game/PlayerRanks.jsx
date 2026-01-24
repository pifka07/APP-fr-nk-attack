// Player Rank System
// progress_value = total_score * 0.7 + total_distance * 0.3

const RANKS = [
    { level: 1, name: 'Street Sparrow', threshold: 0 },
    { level: 2, name: 'Urban Pigeon', threshold: 10000 },
    { level: 3, name: 'Sky Runner', threshold: 50000 },
    { level: 4, name: 'Apex Eagle', threshold: 150000 },
    { level: 5, name: 'Legendary Fränk', threshold: 300000 }
];

export function calculatePlayerRank(total_score = 0, total_distance = 0) {
    const progress_value = Math.floor(total_score * 0.7 + total_distance * 0.3);
    
    let currentRank = RANKS[0];
    let nextRank = RANKS[1];
    
    for (let i = RANKS.length - 1; i >= 0; i--) {
        if (progress_value >= RANKS[i].threshold) {
            currentRank = RANKS[i];
            nextRank = RANKS[i + 1] || null;
            break;
        }
    }
    
    return {
        player_level: currentRank.level,
        player_rank_name: currentRank.name,
        progress_value: progress_value,
        current_threshold: currentRank.threshold,
        next_level_threshold: nextRank ? nextRank.threshold : null,
        progress_percentage: nextRank 
            ? Math.min(100, ((progress_value - currentRank.threshold) / (nextRank.threshold - currentRank.threshold)) * 100)
            : 100
    };
}
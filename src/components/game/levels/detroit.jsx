// Detroit Level Enemy Spawning - North America
// Custom Detroit/USA-themed NPCs

const GROUND_NPCS = [
    { spriteType: 'detroit_cop', weight: 15, isVehicle: false },
    { spriteType: 'detroit_muscle_car', weight: 14, isVehicle: true },
    { spriteType: 'detroit_hotdog_vendor', weight: 12, isVehicle: false },
    { spriteType: 'detroit_football_player', weight: 12, isVehicle: false },
    { spriteType: 'detroit_pickup_truck', weight: 10, isVehicle: true },
];

const AIR_NPCS = [
    { spriteType: 'eagle', weight: 30 },
    { spriteType: 'seagull', weight: 25 },
    { spriteType: 'detroit_drone', weight: 25 },
    { spriteType: 'balloon', weight: 10 },
];

function weightedRandom(items) {
    const total = items.reduce((sum, i) => sum + i.weight, 0);
    let r = Math.random() * total;
    for (const item of items) {
        r -= item.weight;
        if (r <= 0) return item;
    }
    return items[items.length - 1];
}

export function spawnDetroitEnemy(width, height, groundY, scrollSpeed) {
    const isAir = Math.random() < 0.35;

    if (isAir) {
        const npc = weightedRandom(AIR_NPCS);
        const w = npc.spriteType === 'eagle' ? 80 : (npc.spriteType === 'balloon' ? 60 : 55);
        return {
            x: width + 20,
            y: 40 + Math.random() * (groundY * 0.6),
            vx: -scrollSpeed,
            width: w,
            height: w,
            spriteType: npc.spriteType,
            hp: 1,
            isTarget: true,
            isObstacle: false,
            scoreValue: 120,
            erratic: false,
        };
    } else {
        const npc = weightedRandom(GROUND_NPCS);
        const isVehicle = npc.isVehicle;
        const w = isVehicle ? 130 : 65;
        const h = isVehicle ? 65 : 95;
        return {
            x: width + 20,
            y: groundY - h,
            vx: isVehicle ? -scrollSpeed * 1.5 : -scrollSpeed,
            width: w,
            height: h,
            spriteType: npc.spriteType,
            hp: 1,
            isTarget: true,
            isObstacle: isVehicle,
            scoreValue: isVehicle ? 200 : 100,
        };
    }
}
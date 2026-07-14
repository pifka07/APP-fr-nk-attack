// Detroit Level Enemy Spawning - North America
// All NPCs are obstacles that damage Fränk on collision

const GROUND_NPCS = [
    // Cars
    { spriteType: 'detroit_muscle_car', weight: 18, isVehicle: true },
    { spriteType: 'detroit_sedan', weight: 18, isVehicle: true },
    { spriteType: 'detroit_pickup_truck', weight: 16, isVehicle: true },
    // Ground obstacles
    { spriteType: 'detroit_barrel', weight: 12, isVehicle: false },
    { spriteType: 'detroit_dumpster', weight: 10, isVehicle: false },
    { spriteType: 'detroit_hydrant', weight: 10, isVehicle: false },
];

const AIR_NPCS = [
    { spriteType: 'detroit_crow', weight: 30 },
    { spriteType: 'detroit_broken_drone', weight: 25 },
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
        const w = 70;
        const h = 70;
        return {
            x: width + 20,
            y: 40 + Math.random() * (groundY * 0.6),
            vx: -scrollSpeed,
            width: w,
            height: h,
            spriteType: npc.spriteType,
            hp: 1,
            isTarget: true,
            isObstacle: true,
            scoreValue: 120,
            erratic: npc.spriteType === 'detroit_crow',
        };
    } else {
        const npc = weightedRandom(GROUND_NPCS);
        const isVehicle = npc.isVehicle;
        // Cars 1.2x bigger than previous (was 220x130)
        const w = isVehicle ? 264 : 70;
        const h = isVehicle ? 156 : 90;
        return {
            x: width + 20,
            y: groundY - h,
            vx: isVehicle ? -scrollSpeed * 1.5 : -scrollSpeed,
            width: w,
            height: h,
            spriteType: npc.spriteType,
            hp: 1,
            isTarget: true,
            isObstacle: true,
            scoreValue: isVehicle ? 200 : 100,
        };
    }
}
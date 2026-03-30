// USA Level - uses existing NPC sprite types already loaded in GameEngine

const GROUND_NPCS = [
    { spriteType: 'cop', weight: 15 },
    { spriteType: 'tourist', weight: 10 },
    { spriteType: 'business_person', weight: 10 },
    { spriteType: 'worker', weight: 10 },
    { spriteType: 'london_car', weight: 20 },
    { spriteType: 'granny', weight: 10 },
    { spriteType: 'dog', weight: 10 },
    { spriteType: 'london_cop', weight: 15 },
];

const AIR_NPCS = [
    { spriteType: 'eagle', weight: 30 },
    { spriteType: 'seagull', weight: 25 },
    { spriteType: 'london_drone', weight: 20 },
    { spriteType: 'balloon', weight: 10 },
    { spriteType: 'london_pigeon', weight: 15 },
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

export function spawnUSAEnemy(width, height, groundY, scrollSpeed) {
    const isAir = Math.random() < 0.35;

    if (isAir) {
        const npc = weightedRandom(AIR_NPCS);
        const w = npc.spriteType === 'eagle' ? 80 : (npc.spriteType === 'balloon' ? 60 : 55);
        return {
            x: width + 20,
            y: 40 + Math.random() * (groundY * 0.6),
            vx: -scrollSpeed,
            width: w, height: w,
            spriteType: npc.spriteType,
            hp: 1,
            isTarget: true,
            isObstacle: false,
            scoreValue: 120,
            erratic: npc.spriteType.includes('pigeon'),
        };
    } else {
        const npc = weightedRandom(GROUND_NPCS);
        const isVehicle = npc.spriteType === 'london_car';
        const w = isVehicle ? 120 : 60;
        const h = isVehicle ? 60 : 90;
        return {
            x: width + 20,
            y: groundY - h,
            vx: isVehicle ? -scrollSpeed * 1.5 : -scrollSpeed,
            width: w, height: h,
            spriteType: npc.spriteType,
            hp: 1,
            isTarget: true,
            isObstacle: isVehicle,
            scoreValue: isVehicle ? 200 : 100,
        };
    }
}
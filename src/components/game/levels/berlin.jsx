// Berlin Level Enemy Configuration

const GROUND_ENEMIES = [
    { type: 'berlin_npc1', weight: 1 },
    { type: 'berlin_npc2', weight: 1 },
    { type: 'berlin_npc3', weight: 1 },
    { type: 'berlin_npc4', weight: 1 },
    { type: 'berlin_npc5', weight: 1 },
    { type: 'berlin_npc6', weight: 1 },
    { type: 'berlin_npc7', weight: 1 },
    { type: 'berlin_npc8', weight: 1 },
    { type: 'berlin_npc9', weight: 1 },
    { type: 'berlin_npc10', weight: 1 }
];

const AIR_ENEMIES = [
    { type: 'rooftop_sparrow', weight: 3 },
    { type: 'fly', weight: 2 },
    { type: 'eagle', weight: 1 },
    { type: 'drone_l2', weight: 1 },
    { type: 'gelsenkirchen_drone1', weight: 1 },
    { type: 'gelsenkirchen_drone2', weight: 1 },
    { type: 'paris_balloon', weight: 2 },
    { type: 'balloon', weight: 2 }
];

export function spawnBerlinEnemy(width, height, groundY, scrollSpeed) {
    const isAir = Math.random() < 0.5;
    
    const pool = isAir ? AIR_ENEMIES : GROUND_ENEMIES;
    const totalWeight = pool.reduce((sum, e) => sum + e.weight, 0);
    let rand = Math.random() * totalWeight;
    
    let selectedType = pool[0].type;
    for (const enemy of pool) {
        rand -= enemy.weight;
        if (rand <= 0) {
            selectedType = enemy.type;
            break;
        }
    }

    const baseHeight = 100;
    
    const enemy = {
        x: width + 50,
        y: isAir ? 50 + Math.random() * (groundY * 0.67 - 50) : groundY - 120,
        width: baseHeight * 0.7, // Auto aspect ratio
        height: baseHeight,
        vx: -scrollSpeed,
        hp: 1,
        isTarget: true,
        isObstacle: true,
        scoreValue: 10,
        spriteType: selectedType,
        maintainAspect: true
    };

    // Specific adjustments
    if (selectedType.includes('drone')) {
        enemy.height = 80;
        enemy.width = 120;
        enemy.scoreValue = 20;
    } else if (selectedType.includes('bird')) {
        enemy.height = 80;
        enemy.width = 80;
        enemy.scoreValue = 15;
    }

    return enemy;
}
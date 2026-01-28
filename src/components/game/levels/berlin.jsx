// Berlin Level Enemy Configuration

const GROUND_ENEMIES = [
    { type: 'gelsenkirchen_npc1', weight: 1 },
    { type: 'gelsenkirchen_npc2', weight: 1 },
    { type: 'gelsenkirchen_npc3', weight: 1 },
    { type: 'gelsenkirchen_npc4', weight: 1 },
    { type: 'gelsenkirchen_npc5', weight: 1 },
    { type: 'gelsenkirchen_npc6', weight: 1 }
];

const AIR_ENEMIES = [
    { type: 'gelsenkirchen_bird1', weight: 2 },
    { type: 'gelsenkirchen_bird2', weight: 2 },
    { type: 'gelsenkirchen_bird3', weight: 2 },
    { type: 'gelsenkirchen_drone1', weight: 1 },
    { type: 'gelsenkirchen_drone2', weight: 1 },
    { type: 'gelsenkirchen_drone3', weight: 1 }
];

export function spawnBerlinEnemy(width, height, groundY, scrollSpeed) {
    const isAir = Math.random() < 0.3;
    
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

    const enemy = {
        x: width + 50,
        y: isAir ? 50 + Math.random() * (groundY - 150) : groundY - 50,
        width: 50,
        height: 50,
        vx: -scrollSpeed,
        hp: 1,
        isTarget: true,
        isObstacle: false,
        scoreValue: 10,
        spriteType: selectedType
    };

    // Specific adjustments
    if (selectedType.includes('drone')) {
        enemy.width = 60;
        enemy.height = 40;
        enemy.scoreValue = 20;
    } else if (selectedType.includes('bird')) {
        enemy.width = 40;
        enemy.height = 40;
        enemy.scoreValue = 15;
    }

    return enemy;
}
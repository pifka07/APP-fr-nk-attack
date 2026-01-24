// Gelsenkirchen Level Enemy Spawning

// Ground enemy types with spawn weights
const groundEnemyTypes = [
    { type: 'gelsenkirchen_npc1', weight: 1 },
    { type: 'gelsenkirchen_npc2', weight: 1 },
    { type: 'gelsenkirchen_npc3', weight: 1 },
    { type: 'gelsenkirchen_npc4', weight: 1 },
    { type: 'gelsenkirchen_npc5', weight: 1 },
    { type: 'gelsenkirchen_npc6', weight: 1 },
    { type: 'gelsenkirchen_npc7', weight: 1 },
    { type: 'gelsenkirchen_npc8', weight: 1 },
    { type: 'gelsenkirchen_npc9', weight: 1 },
    { type: 'gelsenkirchen_npc10', weight: 1 },
    { type: 'gelsenkirchen_npc11', weight: 1 }
];

// Air enemy types (birds and drones)
const airEnemyTypes = [
    { type: 'gelsenkirchen_bird1', weight: 2 },
    { type: 'gelsenkirchen_bird2', weight: 2 },
    { type: 'gelsenkirchen_bird3', weight: 2 },
    { type: 'gelsenkirchen_drone1', weight: 1 },
    { type: 'gelsenkirchen_drone2', weight: 1 },
    { type: 'gelsenkirchen_drone3', weight: 1 },
    { type: 'gelsenkirchen_drone4', weight: 1 },
    { type: 'gelsenkirchen_drone5', weight: 1 },
    { type: 'gelsenkirchen_drone6', weight: 1 }
];

export function spawnGelsenkirchenEnemy(width, height, groundY, scrollSpeed) {
    const enemy = {
        x: width + 50,
        y: 0,
        vx: -scrollSpeed,
        vy: 0,
        hp: 1,
        spriteType: '',
        isTarget: true,
        isObstacle: true,
        width: 80,
        height: 120,
        scoreValue: 10
    };

    // 50% air, 50% ground
    const spawnAir = Math.random() < 0.5;
    const enemyTypes = spawnAir ? airEnemyTypes : groundEnemyTypes;

    // Select random enemy type
    const totalWeight = enemyTypes.reduce((sum, t) => sum + t.weight, 0);
    let random = Math.random() * totalWeight;
    let selectedType = enemyTypes[0].type;

    for (const enemyType of enemyTypes) {
        random -= enemyType.weight;
        if (random <= 0) {
            selectedType = enemyType.type;
            break;
        }
    }

    enemy.spriteType = selectedType;
    
    if (spawnAir) {
        // Air enemies: from groundY - 90 to top (50px margin)
        enemy.width = 60;
        enemy.height = 60;
        enemy.y = 50 + Math.random() * (groundY - 90 - 50);
        enemy.erratic = true;
    } else {
        // Ground enemies: max 70px above ground
        const minY = groundY - 70;
        const maxY = groundY - enemy.height;
        enemy.y = minY + Math.random() * (maxY - minY);
    }

    return enemy;
}
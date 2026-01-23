// Düsseldorf Level Enemy Spawning

// Enemy types with spawn weights
const groundEnemyTypes = [
    { type: 'dusseldorf_npc1', weight: 1 },
    { type: 'dusseldorf_npc2', weight: 1 },
    { type: 'dusseldorf_npc3', weight: 1 },
    { type: 'dusseldorf_npc4', weight: 1 },
    { type: 'dusseldorf_npc5', weight: 1 },
    { type: 'dusseldorf_npc6', weight: 1 },
    { type: 'dusseldorf_npc7', weight: 1 },
    { type: 'dusseldorf_npc8', weight: 1 },
    { type: 'dusseldorf_npc9', weight: 1 },
    { type: 'dusseldorf_npc10', weight: 1 },
    { type: 'dusseldorf_npc11', weight: 1 },
    { type: 'dusseldorf_npc12', weight: 1 }
];

export function spawnDusseldorfEnemy(width, height, groundY, scrollSpeed) {
    const enemy = {
        x: width + 50,
        y: 0,
        vx: -scrollSpeed,
        vy: 0,
        hp: 1,
        spriteType: '',
        isTarget: true,
        isObstacle: false,
        width: 60,
        height: 100,
        scoreValue: 10
    };

    // Select random ground NPC
    const totalWeight = groundEnemyTypes.reduce((sum, t) => sum + t.weight, 0);
    let random = Math.random() * totalWeight;
    let selectedType = groundEnemyTypes[0].type;

    for (const enemyType of groundEnemyTypes) {
        random -= enemyType.weight;
        if (random <= 0) {
            selectedType = enemyType.type;
            break;
        }
    }

    enemy.spriteType = selectedType;
    enemy.y = groundY - enemy.height;

    return enemy;
}
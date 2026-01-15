// Madrid Level Configuration

export function spawnMadridEnemy(width, height, groundY, scrollSpeed) {
    const enemyTypes = [
        // Ground enemies (70%)
        { type: 'madrid_tourist', weight: 20 },
        { type: 'madrid_street_performer', weight: 15 },
        { type: 'madrid_police', weight: 10 },
        { type: 'madrid_vendor', weight: 15 },
        { type: 'madrid_car', weight: 10 },
        
        // Air obstacles/enemies (30%)
        { type: 'madrid_balloon', weight: 10 },
        { type: 'madrid_pigeon', weight: 15 },
        { type: 'madrid_drone', weight: 5 }
    ];

    // Decide if ground or air spawn
    const isGroundSpawn = Math.random() < 0.7;

    let selectedType;
    if (isGroundSpawn) {
        const groundTypes = enemyTypes.filter(e => ['madrid_tourist', 'madrid_street_performer', 'madrid_police', 'madrid_vendor', 'madrid_car'].includes(e.type));
        const totalWeight = groundTypes.reduce((sum, e) => sum + e.weight, 0);
        let rand = Math.random() * totalWeight;
        selectedType = groundTypes.find(e => {
            rand -= e.weight;
            return rand <= 0;
        }).type;
    } else {
        const airTypes = enemyTypes.filter(e => ['madrid_balloon', 'madrid_pigeon', 'madrid_drone'].includes(e.type));
        const totalWeight = airTypes.reduce((sum, e) => sum + e.weight, 0);
        let rand = Math.random() * totalWeight;
        selectedType = airTypes.find(e => {
            rand -= e.weight;
            return rand <= 0;
        }).type;
    }

    let enemy = {
        x: width + 20,
        vx: -scrollSpeed,
        hp: 1,
        spriteType: selectedType,
        isTarget: true,
        isObstacle: false,
        scoreValue: 10
    };

    // Configure based on type
    switch (selectedType) {
        case 'madrid_tourist':
            enemy.y = groundY - 45;
            enemy.width = 40;
            enemy.height = 45;
            enemy.scoreValue = 15;
            break;

        case 'madrid_street_performer':
            enemy.y = groundY - 50;
            enemy.width = 45;
            enemy.height = 50;
            enemy.scoreValue = 20;
            break;

        case 'madrid_police':
            enemy.y = groundY - 50;
            enemy.width = 40;
            enemy.height = 50;
            enemy.scoreValue = 25;
            break;

        case 'madrid_vendor':
            enemy.y = groundY - 45;
            enemy.width = 50;
            enemy.height = 45;
            enemy.scoreValue = 15;
            break;

        case 'madrid_car':
            enemy.y = groundY - 35;
            enemy.width = 70;
            enemy.height = 35;
            enemy.scoreValue = 30;
            enemy.isObstacle = true;
            enemy.isTarget = false;
            break;

        case 'madrid_balloon':
            enemy.y = 80 + Math.random() * 100;
            enemy.width = 40;
            enemy.height = 50;
            enemy.vx = -scrollSpeed * 0.5;
            enemy.scoreValue = 20;
            break;

        case 'madrid_pigeon':
            enemy.y = 100 + Math.random() * 150;
            enemy.width = 35;
            enemy.height = 30;
            enemy.scoreValue = 15;
            enemy.erratic = true;
            break;

        case 'madrid_drone':
            enemy.y = 120 + Math.random() * 100;
            enemy.width = 45;
            enemy.height = 30;
            enemy.scoreValue = 25;
            enemy.isObstacle = true;
            enemy.isTarget = false;
            break;
    }

    return enemy;
}
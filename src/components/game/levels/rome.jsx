// Rome Level Configuration

export function spawnRomeEnemy(width, height, groundY, scrollSpeed) {
    const enemyTypes = [
        // Ground enemies (70%)
        { type: 'rome_tourist', weight: 15 },
        { type: 'rome_priest', weight: 10 },
        { type: 'rome_gladiator', weight: 8 },
        { type: 'rome_pizza_chef', weight: 12 },
        { type: 'rome_vespa_driver', weight: 10 },
        { type: 'rome_car', weight: 8 },
        { type: 'rome_old_lady', weight: 7 },
        
        // Air obstacles/enemies (30%)
        { type: 'rome_balloon', weight: 5 },
        { type: 'rome_pigeon', weight: 10 },
        { type: 'rome_seagull', weight: 10 },
        { type: 'rome_drone', weight: 5 }
    ];

    // Decide if ground or air spawn
    const isGroundSpawn = Math.random() < 0.7;

    let selectedType;
    if (isGroundSpawn) {
        const groundTypes = enemyTypes.filter(e => ['rome_tourist', 'rome_priest', 'rome_gladiator', 'rome_pizza_chef', 'rome_vespa_driver', 'rome_car', 'rome_old_lady'].includes(e.type));
        const totalWeight = groundTypes.reduce((sum, e) => sum + e.weight, 0);
        let rand = Math.random() * totalWeight;
        selectedType = groundTypes.find(e => {
            rand -= e.weight;
            return rand <= 0;
        }).type;
    } else {
        const airTypes = enemyTypes.filter(e => ['rome_balloon', 'rome_pigeon', 'rome_seagull', 'rome_drone'].includes(e.type));
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
        case 'rome_tourist':
            enemy.y = groundY - 100;
            enemy.width = 90;
            enemy.height = 100;
            enemy.scoreValue = 18;
            enemy.isObstacle = true;
            break;

        case 'rome_priest':
            enemy.y = groundY - 110;
            enemy.width = 85;
            enemy.height = 110;
            enemy.scoreValue = 25;
            enemy.isObstacle = true;
            break;

        case 'rome_gladiator':
            enemy.y = groundY - 120;
            enemy.width = 100;
            enemy.height = 120;
            enemy.scoreValue = 30;
            enemy.isObstacle = true;
            break;

        case 'rome_pizza_chef':
            enemy.y = groundY - 100;
            enemy.width = 95;
            enemy.height = 100;
            enemy.scoreValue = 20;
            enemy.isObstacle = true;
            break;

        case 'rome_vespa_driver':
            enemy.y = groundY - 90;
            enemy.width = 110;
            enemy.height = 90;
            enemy.scoreValue = 22;
            enemy.isObstacle = true;
            break;

        case 'rome_car':
            enemy.y = groundY - 50;
            enemy.width = 250;
            enemy.height = 200;
            enemy.scoreValue = 30;
            enemy.isObstacle = true;
            enemy.isTarget = false;
            break;

        case 'rome_old_lady':
            enemy.y = groundY - 95;
            enemy.width = 85;
            enemy.height = 95;
            enemy.scoreValue = 15;
            enemy.isObstacle = true;
            break;

        case 'rome_balloon':
            enemy.y = 80 + Math.random() * 100;
            enemy.width = 40;
            enemy.height = 50;
            enemy.vx = -scrollSpeed * 0.5;
            enemy.scoreValue = 20;
            break;

        case 'rome_pigeon':
            enemy.y = 100 + Math.random() * 150;
            enemy.width = 45;
            enemy.height = 40;
            enemy.scoreValue = 15;
            enemy.erratic = true;
            enemy.isObstacle = true;
            enemy.isTarget = true;
            break;

        case 'rome_seagull':
            enemy.y = 80 + Math.random() * 120;
            enemy.width = 50;
            enemy.height = 45;
            enemy.scoreValue = 18;
            enemy.erratic = true;
            enemy.isObstacle = true;
            enemy.isTarget = true;
            break;

        case 'rome_drone':
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
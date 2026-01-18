// Rome Level Configuration

export function spawnRomeEnemy(width, height, groundY, scrollSpeed) {
    const enemyTypes = [
        // Ground enemies (70%)
        { type: 'rome_tourist', weight: 10 },
        { type: 'rome_priest', weight: 7 },
        { type: 'rome_gladiator', weight: 6 },
        { type: 'rome_pizza_chef', weight: 8 },
        { type: 'rome_vespa_driver', weight: 6 },
        { type: 'rome_car', weight: 6 },
        { type: 'rome_old_lady', weight: 5 },
        { type: 'rome_couple_bench', weight: 8 },
        { type: 'rome_couple_standing', weight: 8 },
        { type: 'rome_musician', weight: 7 },
        { type: 'rome_couple_bench2', weight: 6 },
        { type: 'rome_couple_vespa', weight: 7 },
        { type: 'rome_girl_basket', weight: 6 },
        
        // Air enemies (30%)
        { type: 'rome_bird1', weight: 7 },
        { type: 'rome_bird2', weight: 7 },
        { type: 'rome_bird3', weight: 7 },
        { type: 'rome_bird4', weight: 7 },
        { type: 'rome_bird5', weight: 7 }
    ];

    // Decide if ground or air spawn
    const isGroundSpawn = Math.random() < 0.7;

    let selectedType;
    if (isGroundSpawn) {
        const groundTypes = enemyTypes.filter(e => ['rome_tourist', 'rome_priest', 'rome_gladiator', 'rome_pizza_chef', 'rome_vespa_driver', 'rome_car', 'rome_old_lady', 'rome_couple_bench', 'rome_couple_standing', 'rome_musician', 'rome_couple_bench2', 'rome_couple_vespa', 'rome_girl_basket'].includes(e.type));
        const totalWeight = groundTypes.reduce((sum, e) => sum + e.weight, 0);
        let rand = Math.random() * totalWeight;
        selectedType = groundTypes.find(e => {
            rand -= e.weight;
            return rand <= 0;
        }).type;
    } else {
        const airTypes = enemyTypes.filter(e => ['rome_bird1', 'rome_bird2', 'rome_bird3', 'rome_bird4', 'rome_bird5'].includes(e.type));
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
            enemy.y = groundY - 100 + (Math.random() * 100 - 50);
            enemy.width = 90;
            enemy.height = 100;
            enemy.scoreValue = 18;
            enemy.isObstacle = true;
            break;

        case 'rome_priest':
            enemy.y = groundY - 110 + (Math.random() * 100 - 50);
            enemy.width = 85;
            enemy.height = 110;
            enemy.scoreValue = 25;
            enemy.isObstacle = true;
            break;

        case 'rome_gladiator':
            enemy.y = groundY - 120 + (Math.random() * 100 - 50);
            enemy.width = 100;
            enemy.height = 120;
            enemy.scoreValue = 30;
            enemy.isObstacle = true;
            break;

        case 'rome_pizza_chef':
            enemy.y = groundY - 100 + (Math.random() * 100 - 50);
            enemy.width = 95;
            enemy.height = 100;
            enemy.scoreValue = 20;
            enemy.isObstacle = true;
            break;

        case 'rome_vespa_driver':
            enemy.y = groundY - 90 + (Math.random() * 100 - 50);
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
            enemy.y = groundY - 95 + (Math.random() * 100 - 50);
            enemy.width = 85;
            enemy.height = 95;
            enemy.scoreValue = 15;
            enemy.isObstacle = true;
            break;

        case 'rome_couple_bench':
            enemy.y = groundY - 85 + (Math.random() * 100 - 50);
            enemy.width = 150;
            enemy.height = 85;
            enemy.scoreValue = 25;
            enemy.isObstacle = true;
            break;

        case 'rome_couple_standing':
            enemy.y = groundY - 100 + (Math.random() * 100 - 50);
            enemy.width = 100;
            enemy.height = 100;
            enemy.scoreValue = 22;
            enemy.isObstacle = true;
            break;

        case 'rome_musician':
            enemy.y = groundY - 105 + (Math.random() * 100 - 50);
            enemy.width = 75;
            enemy.height = 105;
            enemy.scoreValue = 20;
            enemy.isObstacle = true;
            break;

        case 'rome_couple_bench2':
            enemy.y = groundY - 90 + (Math.random() * 100 - 50);
            enemy.width = 140;
            enemy.height = 90;
            enemy.scoreValue = 24;
            enemy.isObstacle = true;
            break;

        case 'rome_couple_vespa':
            enemy.y = groundY - 95 + (Math.random() * 100 - 50);
            enemy.width = 120;
            enemy.height = 95;
            enemy.scoreValue = 28;
            enemy.isObstacle = true;
            break;

        case 'rome_girl_basket':
            enemy.y = groundY - 100 + (Math.random() * 100 - 50);
            enemy.width = 70;
            enemy.height = 100;
            enemy.scoreValue = 18;
            enemy.isObstacle = true;
            break;

        case 'rome_bird1':
            enemy.y = 80 + Math.random() * 150;
            enemy.width = 60;
            enemy.height = 50;
            enemy.scoreValue = 15;
            enemy.isTarget = true;
            break;

        case 'rome_bird2':
            enemy.y = 90 + Math.random() * 140;
            enemy.width = 65;
            enemy.height = 55;
            enemy.scoreValue = 18;
            enemy.isTarget = true;
            break;

        case 'rome_bird3':
            enemy.y = 75 + Math.random() * 145;
            enemy.width = 62;
            enemy.height = 52;
            enemy.scoreValue = 20;
            enemy.isTarget = true;
            break;

        case 'rome_bird4':
            enemy.y = 85 + Math.random() * 135;
            enemy.width = 58;
            enemy.height = 48;
            enemy.scoreValue = 22;
            enemy.isTarget = true;
            break;

        case 'rome_bird5':
            enemy.y = 70 + Math.random() * 150;
            enemy.width = 60;
            enemy.height = 50;
            enemy.scoreValue = 22;
            enemy.isTarget = true;
            break;
    }

    return enemy;
}
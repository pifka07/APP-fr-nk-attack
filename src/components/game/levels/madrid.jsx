// Madrid Level Configuration

export function spawnMadridEnemy(width, height, groundY, scrollSpeed) {
    const enemyTypes = [
        // Ground enemies (70%)
        { type: 'madrid_waiter', weight: 15 },
        { type: 'madrid_flamenco', weight: 15 },
        { type: 'madrid_tourist_girl', weight: 10 },
        { type: 'madrid_flower_girl', weight: 10 },
        { type: 'madrid_elderly', weight: 8 },
        { type: 'madrid_flight_attendant', weight: 7 },
        { type: 'madrid_boy_tourist', weight: 7 },
        { type: 'madrid_car', weight: 8 },
        
        // Air obstacles/enemies (30%)
        { type: 'madrid_balloon', weight: 5 },
        { type: 'madrid_pigeon', weight: 10 },
        { type: 'madrid_parrot', weight: 10 },
        { type: 'madrid_sparrow', weight: 10 },
        { type: 'madrid_drone', weight: 5 }
    ];

    // Decide if ground or air spawn
    const isGroundSpawn = Math.random() < 0.7;

    let selectedType;
    if (isGroundSpawn) {
        const groundTypes = enemyTypes.filter(e => ['madrid_waiter', 'madrid_flamenco', 'madrid_tourist_girl', 'madrid_flower_girl', 'madrid_elderly', 'madrid_flight_attendant', 'madrid_boy_tourist', 'madrid_car'].includes(e.type));
        const totalWeight = groundTypes.reduce((sum, e) => sum + e.weight, 0);
        let rand = Math.random() * totalWeight;
        selectedType = groundTypes.find(e => {
            rand -= e.weight;
            return rand <= 0;
        }).type;
    } else {
        const airTypes = enemyTypes.filter(e => ['madrid_balloon', 'madrid_pigeon', 'madrid_parrot', 'madrid_sparrow', 'madrid_drone'].includes(e.type));
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
        case 'madrid_waiter':
            enemy.y = groundY - 100;
            enemy.width = 90;
            enemy.height = 100;
            enemy.scoreValue = 20;
            break;

        case 'madrid_flamenco':
            enemy.y = groundY - 100;
            enemy.width = 120;
            enemy.height = 100;
            enemy.scoreValue = 25;
            break;

        case 'madrid_tourist_girl':
            enemy.y = groundY - 96;
            enemy.width = 90;
            enemy.height = 96;
            enemy.scoreValue = 18;
            break;

        case 'madrid_flower_girl':
            enemy.y = groundY - 100;
            enemy.width = 100;
            enemy.height = 100;
            enemy.scoreValue = 20;
            break;

        case 'madrid_elderly':
            enemy.y = groundY - 96;
            enemy.width = 110;
            enemy.height = 96;
            enemy.scoreValue = 30;
            break;

        case 'madrid_flight_attendant':
            enemy.y = groundY - 96;
            enemy.width = 80;
            enemy.height = 96;
            enemy.scoreValue = 18;
            break;

        case 'madrid_boy_tourist':
            enemy.y = groundY - 90;
            enemy.width = 80;
            enemy.height = 90;
            enemy.scoreValue = 15;
            break;

        case 'madrid_car':
            enemy.y = groundY - 70;
            enemy.width = 140;
            enemy.height = 70;
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
            enemy.width = 45;
            enemy.height = 40;
            enemy.scoreValue = 15;
            enemy.erratic = true;
            break;

        case 'madrid_parrot':
            enemy.y = 80 + Math.random() * 120;
            enemy.width = 40;
            enemy.height = 35;
            enemy.scoreValue = 18;
            enemy.erratic = true;
            break;

        case 'madrid_sparrow':
            enemy.y = 120 + Math.random() * 100;
            enemy.width = 35;
            enemy.height = 30;
            enemy.scoreValue = 12;
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
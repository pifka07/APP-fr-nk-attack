// Rooftop Level Configuration

export const spawnRooftopEnemy = (width, height, groundY, scrollSpeed) => {
    const walkingNpcY = groundY * 0.98;
    const rand = Math.random();
    const isAir = Math.random() > 0.6;

    let enemy = {
        x: width + 50,
        y: groundY - 50,
        width: 60,
        height: 60,
        hp: 1,
        isTarget: true,
        isObstacle: true,
        scoreValue: 10,
        vx: -scrollSpeed,
        spriteType: 'worker'
    };

    if (!isAir) {
        // Ground (Rooftop surface)
        const heightVariation = Math.random() * 100; // 0 to 100 pixels variation (-100 to 0)
        
        if (rand < 0.2) {
            // Worker
            enemy.spriteType = 'worker';
            enemy.isTarget = true;
            enemy.width = 80;
            enemy.height = 100;
            enemy.y = walkingNpcY - 100 + heightVariation;
            enemy.vx = -scrollSpeed;
            enemy.scoreValue = 40;
        } else if (rand < 0.4) {
            // Cat
            enemy.spriteType = 'cat';
            enemy.isTarget = true;
            enemy.width = 60;
            enemy.height = 50;
            enemy.y = walkingNpcY - 80 + heightVariation;
            enemy.vx = -scrollSpeed;
            enemy.scoreValue = 60;
        } else if (rand < 0.6) {
            // Ninja
            enemy.spriteType = 'rooftop_ninja';
            enemy.isTarget = true;
            enemy.width = 140;
            enemy.height = 100;
            enemy.y = walkingNpcY - 100 + heightVariation;
            enemy.vx = -scrollSpeed;
            enemy.scoreValue = 50;
        } else if (rand < 0.8) {
            // Fitness Person
            enemy.spriteType = 'rooftop_fitness';
            enemy.isTarget = true;
            enemy.width = 100;
            enemy.height = 120;
            enemy.y = walkingNpcY - 100 + heightVariation;
            enemy.vx = -scrollSpeed;
            enemy.scoreValue = 45;
        } else {
            // AC Unit (Obstacle)
            enemy.spriteType = 'ac_unit';
            enemy.isTarget = false;
            enemy.isObstacle = true;
            enemy.width = 70;
            enemy.height = 70;
            enemy.y = walkingNpcY - 80 + heightVariation;
            enemy.vx = -scrollSpeed;
        }
    } else {
        // Air - Multiple flying objects (some are dangerous enemies that damage on contact)
        // Birds fly in upper two thirds of screen
        const airRand = Math.random();
        const flyHeight = groundY * 0.12 + Math.random() * (groundY * 0.68);
        
        if (airRand < 0.2) {
            enemy.spriteType = 'rooftop_sparrow';
            enemy.isTarget = true;
            enemy.isObstacle = true;
            enemy.y = flyHeight;
            enemy.width = 60;
            enemy.height = 50;
            enemy.vx = -scrollSpeed;
            enemy.scoreValue = 40;
        } else if (airRand < 0.4) {
            enemy.spriteType = 'rooftop_pigeon';
            enemy.isTarget = true;
            enemy.isObstacle = true;
            enemy.y = flyHeight;
            enemy.width = 70;
            enemy.height = 60;
            enemy.vx = -scrollSpeed;
            enemy.scoreValue = 50;
        } else if (airRand < 0.55) {
            // Seagull - aggressive enemy, damages on contact
            enemy.spriteType = 'seagull';
            enemy.isTarget = false;
            enemy.isObstacle = true;
            enemy.y = flyHeight;
            enemy.width = 65;
            enemy.height = 55;
            enemy.vx = -scrollSpeed * 1.3;
            enemy.scoreValue = 0;
        } else if (airRand < 0.7) {
            // Eagle - dangerous flying predator
            enemy.spriteType = 'eagle';
            enemy.isTarget = false;
            enemy.isObstacle = true;
            enemy.y = flyHeight;
            enemy.width = 85;
            enemy.height = 70;
            enemy.vx = -scrollSpeed * 1.5;
            enemy.scoreValue = 0;
        } else if (airRand < 0.85) {
            // Drone - dangerous obstacle
            enemy.spriteType = 'drone_l2';
            enemy.isTarget = false;
            enemy.isObstacle = true;
            enemy.y = flyHeight;
            enemy.width = 80;
            enemy.height = 60;
            enemy.vx = -scrollSpeed * 0.9;
            enemy.scoreValue = 0;
        } else {
            enemy.spriteType = 'paris_balloon';
            enemy.isTarget = true;
            enemy.isObstacle = true;
            enemy.y = flyHeight;
            enemy.width = 60;
            enemy.height = 80;
            enemy.vx = -scrollSpeed * 0.7;
            enemy.scoreValue = 35;
        }
    }

    return enemy;
};
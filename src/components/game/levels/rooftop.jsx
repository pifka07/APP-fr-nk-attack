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
        if (rand < 0.2) {
            // Worker
            enemy.spriteType = 'worker';
            enemy.isTarget = true;
            enemy.width = 100;
            enemy.height = 120;
            enemy.y = walkingNpcY - 260;
            enemy.vx = -scrollSpeed;
            enemy.scoreValue = 40;
        } else if (rand < 0.35) {
            // Cat
            enemy.spriteType = 'cat';
            enemy.isTarget = true;
            enemy.width = 80;
            enemy.height = 60;
            enemy.y = walkingNpcY - 200;
            enemy.vx = -scrollSpeed;
            enemy.scoreValue = 60;
        } else if (rand < 0.5) {
            // AC Unit (Obstacle)
            enemy.spriteType = 'ac_unit';
            enemy.isTarget = false;
            enemy.isObstacle = true;
            enemy.width = 100;
            enemy.height = 80;
            enemy.y = groundY - 130;
            enemy.vx = -scrollSpeed;
        } else if (rand < 0.65) {
            // Ninja
            enemy.spriteType = 'rooftop_ninja';
            enemy.isTarget = true;
            enemy.width = 120;
            enemy.height = 100;
            enemy.y = walkingNpcY - 240;
            enemy.vx = -scrollSpeed;
            enemy.scoreValue = 50;
        } else if (rand < 0.8) {
            // Sunbather
            enemy.spriteType = 'rooftop_sunbather';
            enemy.isTarget = true;
            enemy.width = 120;
            enemy.height = 70;
            enemy.y = walkingNpcY - 210;
            enemy.vx = -scrollSpeed;
            enemy.scoreValue = 35;
        } else if (rand < 0.9) {
            // Fitness Person
            enemy.spriteType = 'rooftop_fitness';
            enemy.isTarget = true;
            enemy.width = 90;
            enemy.height = 110;
            enemy.y = walkingNpcY - 250;
            enemy.vx = -scrollSpeed;
            enemy.scoreValue = 45;
        } else {
            // Worker 2
            enemy.spriteType = 'rooftop_worker2';
            enemy.isTarget = true;
            enemy.width = 110;
            enemy.height = 120;
            enemy.y = walkingNpcY - 260;
            enemy.vx = -scrollSpeed;
            enemy.scoreValue = 42;
        }
    } else {
        // Air - Seagull or Pigeon
        if (Math.random() < 0.5) {
            enemy.spriteType = 'seagull';
            enemy.isTarget = true;
            enemy.isObstacle = true;
            enemy.y = 20 + Math.random() * (groundY - 170);
            enemy.width = 70;
            enemy.height = 60;
            enemy.vx = -scrollSpeed;
            enemy.scoreValue = 40;
        } else {
            enemy.spriteType = 'rooftop_pigeon';
            enemy.isTarget = true;
            enemy.isObstacle = true;
            enemy.y = 20 + Math.random() * (groundY - 170);
            enemy.width = 90;
            enemy.height = 70;
            enemy.vx = -scrollSpeed;
            enemy.scoreValue = 50;
        }
    }

    return enemy;
};
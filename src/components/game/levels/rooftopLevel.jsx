// Rooftop Level Enemy Spawning

export function spawnRooftopEnemy(width, height, groundY, scrollSpeed) {
    const rand = Math.random();
    const isAir = Math.random() > 0.55;

    const enemy = {
        x: width + 50,
        y: groundY - 100,
        width: 80,
        height: 120,
        hp: 1,
        isTarget: true,
        isObstacle: true,
        scoreValue: 30,
        vx: -scrollSpeed,
        spriteType: 'rooftop_pigeon'
    };

    if (!isAir) {
        if (rand < 0.25) {
            enemy.spriteType = 'rooftop_pigeon';
            enemy.width = 80; enemy.height = 80;
            enemy.y = groundY - 100;
            enemy.scoreValue = 30;
        } else if (rand < 0.45) {
            enemy.spriteType = 'rooftop_ninja';
            enemy.width = 90; enemy.height = 130;
            enemy.y = groundY - 140;
            enemy.scoreValue = 60;
        } else if (rand < 0.6) {
            enemy.spriteType = 'rooftop_sunbather';
            enemy.width = 120; enemy.height = 100;
            enemy.y = groundY - 110;
            enemy.scoreValue = 50;
        } else if (rand < 0.75) {
            enemy.spriteType = 'rooftop_fitness';
            enemy.width = 90; enemy.height = 130;
            enemy.y = groundY - 140;
            enemy.scoreValue = 40;
        } else if (rand < 0.88) {
            enemy.spriteType = 'rooftop_worker2';
            enemy.width = 90; enemy.height = 130;
            enemy.y = groundY - 140;
            enemy.scoreValue = 35;
        } else {
            enemy.spriteType = 'ac_unit';
            enemy.width = 100; enemy.height = 80;
            enemy.y = groundY - 90;
            enemy.scoreValue = 20;
        }
    } else {
        // Air
        const airRand = Math.random();
        if (airRand < 0.6) {
            enemy.spriteType = 'sparrow';
            enemy.width = 60; enemy.height = 55;
            enemy.y = 40 + Math.random() * (groundY - 150);
            enemy.erratic = true;
            enemy.scoreValue = 40;
        } else {
            enemy.spriteType = 'drone_l2';
            enemy.width = 80; enemy.height = 50;
            enemy.y = 40 + Math.random() * (groundY * 0.5);
            enemy.scoreValue = 70;
        }
    }

    return enemy;
}
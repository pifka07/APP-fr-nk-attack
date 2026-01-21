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
        if (rand < 0.4) {
            // Worker
            enemy.spriteType = 'worker';
            enemy.isTarget = true;
            enemy.width = 160;
            enemy.height = 160;
            enemy.y = walkingNpcY - 150;
            enemy.vx = -scrollSpeed;
            enemy.scoreValue = 40;
        } else if (rand < 0.7) {
            // Cat
            enemy.spriteType = 'cat';
            enemy.isTarget = true;
            enemy.width = 60;
            enemy.height = 50;
            enemy.y = walkingNpcY - 130;
            enemy.vx = -scrollSpeed;
            enemy.scoreValue = 60;
        } else {
            // AC Unit (Obstacle)
            enemy.spriteType = 'ac_unit';
            enemy.isTarget = false;
            enemy.isObstacle = true;
            enemy.width = 70;
            enemy.height = 70;
            enemy.y = groundY - 140;
            enemy.vx = -scrollSpeed;
        }
    } else {
        // Air - Sparrow or Pigeon
        if (Math.random() < 0.5) {
            enemy.spriteType = 'rooftop_sparrow';
            enemy.isTarget = true;
            enemy.isObstacle = true;
            enemy.y = 20 + Math.random() * (groundY - 170);
            enemy.width = 60;
            enemy.height = 50;
            enemy.vx = -scrollSpeed;
            enemy.scoreValue = 40;
        } else {
            enemy.spriteType = 'rooftop_pigeon';
            enemy.isTarget = true;
            enemy.isObstacle = true;
            enemy.y = 20 + Math.random() * (groundY - 170);
            enemy.width = 70;
            enemy.height = 60;
            enemy.vx = -scrollSpeed;
            enemy.scoreValue = 50;
        }
    }

    return enemy;
};
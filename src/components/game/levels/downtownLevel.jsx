// Downtown Level Enemy Spawning

export function spawnDowntownEnemy(width, height, groundY, scrollSpeed) {
    const rand = Math.random();
    const isAir = Math.random() > 0.6;

    const enemy = {
        x: width + 50,
        y: groundY - 120,
        width: 80,
        height: 120,
        hp: 1,
        isTarget: true,
        isObstacle: true,
        scoreValue: 20,
        vx: -scrollSpeed,
        spriteType: 'cop'
    };

    if (!isAir) {
        if (rand < 0.2) {
            enemy.spriteType = 'cop';
            enemy.width = 90; enemy.height = 130;
            enemy.y = groundY - 140;
            enemy.scoreValue = 50;
        } else if (rand < 0.4) {
            enemy.spriteType = 'granny';
            enemy.width = 90; enemy.height = 130;
            enemy.y = groundY - 140;
            enemy.vx = -scrollSpeed * 0.6;
            enemy.scoreValue = 30;
        } else if (rand < 0.55) {
            enemy.spriteType = 'car';
            enemy.width = 200; enemy.height = 120;
            enemy.y = groundY - 120;
            enemy.vx = -scrollSpeed * 2;
            enemy.scoreValue = 60;
        } else if (rand < 0.7) {
            enemy.spriteType = 'fruit_vendor';
            enemy.width = 160; enemy.height = 170;
            enemy.y = groundY - 180;
            enemy.scoreValue = 70;
        } else if (rand < 0.85) {
            enemy.spriteType = 'dog';
            enemy.width = 100; enemy.height = 80;
            enemy.y = groundY - 90;
            enemy.scoreValue = 35;
        } else {
            enemy.spriteType = 'worker';
            enemy.width = 90; enemy.height = 130;
            enemy.y = groundY - 140;
            enemy.scoreValue = 40;
        }
    } else {
        // Air
        const airRand = Math.random();
        if (airRand < 0.6) {
            enemy.spriteType = 'eagle';
            enemy.width = 100; enemy.height = 80;
            enemy.y = 40 + Math.random() * (groundY * 0.5);
            enemy.scoreValue = 60;
        } else {
            enemy.spriteType = 'sparrow';
            enemy.width = 60; enemy.height = 55;
            enemy.y = 40 + Math.random() * (groundY - 150);
            enemy.erratic = true;
            enemy.scoreValue = 30;
        }
    }

    return enemy;
}
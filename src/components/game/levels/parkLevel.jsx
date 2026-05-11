// Park Level Enemy Spawning

export function spawnParkEnemy(width, height, groundY, scrollSpeed) {
    const rand = Math.random();
    const isAir = Math.random() > 0.6;

    const enemy = {
        x: width + 50,
        y: groundY - 80,
        width: 80,
        height: 80,
        hp: 1,
        isTarget: true,
        isObstacle: true,
        scoreValue: 20,
        vx: -scrollSpeed,
        spriteType: 'squirrel'
    };

    if (!isAir) {
        if (rand < 0.3) {
            enemy.spriteType = 'squirrel';
            enemy.width = 70; enemy.height = 70;
            enemy.y = groundY - 80;
            enemy.scoreValue = 30;
        } else if (rand < 0.55) {
            enemy.spriteType = 'trash_can';
            enemy.width = 80; enemy.height = 100;
            enemy.y = groundY - 110;
            enemy.scoreValue = 20;
        } else if (rand < 0.7) {
            enemy.spriteType = 'snail';
            enemy.width = 80; enemy.height = 60;
            enemy.y = groundY - 70;
            enemy.vx = -scrollSpeed * 0.5;
            enemy.scoreValue = 15;
        } else if (rand < 0.85) {
            enemy.spriteType = 'raccoon';
            enemy.width = 90; enemy.height = 90;
            enemy.y = groundY - 100;
            enemy.scoreValue = 40;
        } else {
            enemy.spriteType = 'dog';
            enemy.width = 100; enemy.height = 80;
            enemy.y = groundY - 90;
            enemy.scoreValue = 35;
        }
    } else {
        // Air
        const airRand = Math.random();
        if (airRand < 0.7) {
            enemy.spriteType = 'fly';
            enemy.width = 55; enemy.height = 50;
            enemy.y = 40 + Math.random() * (groundY - 140);
            enemy.erratic = true;
            enemy.scoreValue = 25;
        } else {
            enemy.spriteType = 'sparrow';
            enemy.width = 65; enemy.height = 60;
            enemy.y = 40 + Math.random() * (groundY * 0.6);
            enemy.erratic = true;
            enemy.scoreValue = 35;
        }
    }

    return enemy;
}
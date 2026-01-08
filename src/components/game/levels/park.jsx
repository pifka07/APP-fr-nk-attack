// Park Level Configuration

export const spawnParkEnemy = (width, height, groundY, scrollSpeed) => {
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
        spriteType: 'squirrel'
    };

    if (!isAir) {
        // Ground
        if (rand < 0.4) {
            // Squirrel (Fast runner)
            enemy.spriteType = 'squirrel';
            enemy.isTarget = true;
            enemy.width = 60;
            enemy.height = 60;
            enemy.y = walkingNpcY - 60;
            enemy.vx = -scrollSpeed;
            enemy.scoreValue = 50;
        } else if (rand < 0.7) {
            // Trash Can with Raccoon (Background/Obstacle)
            enemy.spriteType = 'trash_can';
            enemy.isTarget = true; 
            enemy.isObstacle = true;
            enemy.width = 50;
            enemy.height = 70;
            enemy.y = walkingNpcY - 70;
            enemy.vx = -scrollSpeed;
            enemy.scoreValue = 40;
        } else {
            // Snail (Slow, obstacle mainly?)
            enemy.spriteType = 'snail';
            enemy.isTarget = true;
            enemy.width = 50;
            enemy.height = 40;
            enemy.y = walkingNpcY - 40;
            enemy.vx = -scrollSpeed;
            enemy.scoreValue = 30;
        }
    } else {
        // Air - Fly/Wasp (Erratic movement?)
        enemy.spriteType = 'fly';
        enemy.isTarget = true;
        enemy.isObstacle = true;
        enemy.y = 20 + Math.random() * (groundY - 170);
        enemy.width = 40;
        enemy.height = 40;
        enemy.vx = -scrollSpeed;
    }

    return enemy;
};
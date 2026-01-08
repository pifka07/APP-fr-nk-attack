// Downtown Level (Gelsenkirchen) Configuration

export const spawnDowntownEnemy = (width, height, groundY, scrollSpeed) => {
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
        vx: 0,
        spriteType: 'car'
    };

    if (!isAir) {
        // Ground NPCs
        if (rand < 0.4) {
            // Car
            enemy.spriteType = 'car';
            enemy.isTarget = true;
            enemy.width = 180;
            enemy.height = 100;
            enemy.y = walkingNpcY - 100;
            enemy.vx = -scrollSpeed;
            enemy.scoreValue = 30;
        } else if (rand < 0.7) {
            // Cop
            enemy.spriteType = 'cop';
            enemy.isTarget = true;
            enemy.width = 200;
            enemy.height = 200;
            enemy.y = walkingNpcY - 200;
            enemy.vx = -scrollSpeed;
            enemy.scoreValue = 50;
        } else if (rand < 0.75) {
            // Granny (Obstacle!)
            enemy.spriteType = 'granny';
            enemy.isTarget = true;
            enemy.isObstacle = true;
            enemy.width = 50;
            enemy.height = 80;
            enemy.y = walkingNpcY - 100;
            enemy.vx = -scrollSpeed;
        } else if (rand < 0.9) {
            // Fruit Vendor
            enemy.spriteType = 'fruit_vendor';
            enemy.isTarget = true;
            enemy.width = 220;
            enemy.height = 220;
            enemy.y = walkingNpcY - 242;
            enemy.vx = -scrollSpeed;
            enemy.scoreValue = 70;
        } else {
            // Dog
            enemy.spriteType = 'dog';
            enemy.isTarget = true;
            enemy.isObstacle = true;
            enemy.width = 40;
            enemy.height = 40;
            enemy.y = walkingNpcY - 40;
            enemy.vx = -scrollSpeed;
        }
    } else {
        // Air NPCs
        if (Math.random() < 0.5) {
            enemy.spriteType = 'eagle';
            enemy.isTarget = true;
            enemy.isObstacle = true;
            enemy.y = 50 + Math.random() * (groundY - 270);
            enemy.width = 80;
            enemy.height = 60;
            enemy.vx = -scrollSpeed;
        } else {
            // Return sparrow formation (handled separately in GameEngine)
            return 'sparrow_formation';
        }
    }

    return enemy;
};

export const spawnSparrowFormation = (width, groundY, scrollSpeed) => {
    const baseY = 50 + Math.random() * (groundY - 250);
    const sparrows = [];
    for (let i = 0; i < 3; i++) {
        sparrows.push({
            x: width + 50 + (i * 30),
            y: baseY + (i * 25),
            width: 40,
            height: 40,
            hp: 1,
            isTarget: true,
            isObstacle: true,
            scoreValue: 20,
            vx: -scrollSpeed,
            spriteType: 'sparrow'
        });
    }
    return sparrows;
};
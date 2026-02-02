// Paris Level Configuration

export const spawnParisEnemy = (width, height, groundY, scrollSpeed) => {
    const parisGroundY = height * 0.85; // Paris NPCs at 85% height
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
        spriteType: 'tourist'
    };

    if (!isAir) {
        // Ground (Pedestrians & Vehicles)
        if (rand < 0.25) {
            // Tourist with beret
            enemy.spriteType = 'paris_tourist';
            enemy.isTarget = true;
            enemy.width = 130;
            enemy.height = 170;
            enemy.y = parisGroundY - 240;
            enemy.vx = -scrollSpeed;
            enemy.scoreValue = 50;
        } else if (rand < 0.45) {
            // Watch seller
            enemy.spriteType = 'watch_seller';
            enemy.isTarget = true;
            enemy.width = 140;
            enemy.height = 180;
            enemy.y = parisGroundY - 270;
            enemy.vx = -scrollSpeed;
            enemy.scoreValue = 60;
        } else if (rand < 0.65) {
            // Mime artist
            enemy.spriteType = 'paris_mime';
            enemy.isTarget = true;
            enemy.width = 120;
            enemy.height = 170;
            enemy.y = parisGroundY - 230;
            enemy.vx = -scrollSpeed;
            enemy.scoreValue = 70;
        } else if (rand < 0.8) {
            // French car
            enemy.spriteType = 'paris_car';
            enemy.isTarget = true;
            enemy.width = 360;
            enemy.height = 280;
            enemy.y = parisGroundY - 100;
            enemy.vx = -scrollSpeed * 2;
            enemy.scoreValue = 80;
        } else {
            // Police man
            enemy.spriteType = 'police_man';
            enemy.isTarget = true;
            enemy.width = 120;
            enemy.height = 170;
            enemy.y = parisGroundY - 200;
            enemy.vx = -scrollSpeed;
            enemy.scoreValue = 90;
        }
    } else {
        // Air
        const airRand = Math.random();
        if (airRand < 0.6) {
            // Paris pigeon
            enemy.spriteType = 'paris_pigeon';
            enemy.isTarget = true;
            enemy.isObstacle = true;
            enemy.y = 20 + Math.random() * (groundY - 170);
            enemy.width = 80;
            enemy.height = 70;
            enemy.vx = -scrollSpeed;
            enemy.erratic = true;
            enemy.scoreValue = 50;
        } else {
            // Hot air balloon
            enemy.spriteType = 'paris_balloon';
            enemy.isTarget = true;
            enemy.isObstacle = true;
            enemy.y = 30 + Math.random() * 100;
            enemy.width = 120;
            enemy.height = 120;
            enemy.vx = -scrollSpeed;
            enemy.scoreValue = 100;
        }
    }

    return enemy;
};
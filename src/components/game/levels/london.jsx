// London Level Configuration

export const spawnLondonEnemy = (width, height, groundY, scrollSpeed) => {
    const londonGroundY = height * 0.995; // London NPCs at 99.5% height
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
        spriteType: 'tourist'
    };

    if (!isAir) {
        // Ground (Pedestrians & Vehicles)
        if (rand < 0.2) {
            // Tourist with camera
            enemy.spriteType = 'tourist';
            enemy.isTarget = true;
            enemy.width = 110;
            enemy.height = 150;
            enemy.y = londonGroundY - 150;
            enemy.vx = 0;
            enemy.scoreValue = 50;
        } else if (rand < 0.4) {
            // Business Person with briefcase
            enemy.spriteType = 'business_person';
            enemy.isTarget = true;
            enemy.width = 120;
            enemy.height = 160;
            enemy.y = londonGroundY - 160;
            enemy.vx = 0;
            enemy.scoreValue = 40;
        } else if (rand < 0.55) {
            // London Bobby (Police)
            enemy.spriteType = 'london_cop';
            enemy.isTarget = true;
            enemy.width = 120;
            enemy.height = 160;
            enemy.y = londonGroundY - 160;
            enemy.vx = 0;
            enemy.scoreValue = 60;
        } else if (rand < 0.62) {
            // Street Vendor with food stall
            enemy.spriteType = 'street_vendor';
            enemy.isTarget = true;
            enemy.width = 240;
            enemy.height = 200;
            enemy.y = londonGroundY - 200;
            enemy.vx = 0;
            enemy.scoreValue = 80;
        } else if (rand < 0.85) {
            // Street Musician
            enemy.spriteType = 'street_musician';
            enemy.isTarget = true;
            enemy.width = 110;
            enemy.height = 150;
            enemy.y = londonGroundY - 150;
            enemy.vx = 0;
            enemy.scoreValue = 70;
        } else {
            // London Car
            enemy.spriteType = 'london_car';
            enemy.isTarget = true;
            enemy.width = 200;
            enemy.height = 120;
            enemy.y = londonGroundY - 120;
            enemy.vx = 0;
            enemy.scoreValue = 100;
        }
    } else {
        // Air
        const airRand = Math.random();
        if (airRand < 0.5) {
            // London Pigeon
            enemy.spriteType = 'london_pigeon';
            enemy.isTarget = true;
            enemy.isObstacle = true;
            enemy.y = 20 + Math.random() * (groundY - 170);
            enemy.width = 80;
            enemy.height = 70;
            enemy.vx = 0;
            enemy.erratic = true;
            enemy.scoreValue = 50;
        } else {
            // Hot Air Balloon
            enemy.spriteType = 'balloon';
            enemy.isTarget = true;
            enemy.isObstacle = true;
            enemy.y = 30 + Math.random() * 100;
            enemy.width = 100;
            enemy.height = 120;
            enemy.vx = 0;
            enemy.scoreValue = 100;
        }
    }

    return enemy;
};
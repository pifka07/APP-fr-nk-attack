// Downtown Level Enemy Spawning

const groundTypes = ['cop', 'granny', 'car', 'dog', 'fruit_vendor'];
const airTypes = ['eagle', 'sparrow'];

export function spawnDowntownEnemy(width, height, groundY, scrollSpeed) {
    const isAir = Math.random() < 0.4;
    const typeList = isAir ? airTypes : groundTypes;
    const spriteType = typeList[Math.floor(Math.random() * typeList.length)];

    return {
        x: width + 50,
        y: isAir ? (50 + Math.random() * (groundY - 150)) : (groundY - 120),
        vx: -scrollSpeed,
        vy: 0,
        hp: 1,
        spriteType,
        isTarget: true,
        isObstacle: true,
        width: isAir ? 60 : 80,
        height: isAir ? 60 : 120,
        scoreValue: 10
    };
}
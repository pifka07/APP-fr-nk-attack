// NPC Type Definitions
// All NPC properties (size, sprite, behavior) are defined here

export const NPC_TYPES = {
    // Downtown/Gelsenkirchen NPCs
    cop: {
        width: 200,
        height: 200,
        sprite: 'cop',
        isTarget: true,
        isObstacle: true,
        scoreValue: 50,
        onGround: true
    },
    granny: {
        width: 50,
        height: 80,
        sprite: 'granny',
        isTarget: true,
        isObstacle: true,
        scoreValue: 20,
        onGround: true
    },
    car: {
        width: 180,
        height: 100,
        sprite: 'car',
        isTarget: true,
        isObstacle: true,
        scoreValue: 30,
        onGround: true
    },
    fruit_vendor: {
        width: 180,
        height: 180,
        sprite: 'fruit_vendor',
        isTarget: true,
        isObstacle: true,
        scoreValue: 70,
        onGround: true
    },
    dog: {
        width: 40,
        height: 40,
        sprite: 'dog',
        isTarget: true,
        isObstacle: true,
        scoreValue: 15,
        onGround: true
    },
    eagle: {
        width: 80,
        height: 60,
        sprite: 'eagle',
        isTarget: true,
        isObstacle: true,
        scoreValue: 25,
        onGround: false,
        hasDropped: false
    },
    sparrow: {
        width: 40,
        height: 40,
        sprite: 'sparrow',
        isTarget: true,
        isObstacle: true,
        scoreValue: 20,
        onGround: false
    },

    // Rooftop NPCs
    worker: {
        width: 150,
        height: 150,
        sprite: 'worker',
        isTarget: true,
        isObstacle: true,
        scoreValue: 40,
        onGround: true
    },
    cat: {
        width: 60,
        height: 50,
        sprite: 'cat',
        isTarget: true,
        isObstacle: true,
        scoreValue: 60,
        onGround: true
    },
    ac_unit: {
        width: 70,
        height: 70,
        sprite: 'ac_unit',
        isTarget: false,
        isObstacle: true,
        scoreValue: 0,
        onGround: true,
        windTimer: 0,
        isBlowing: false
    },
    rooftop_sparrow: {
        width: 60,
        height: 50,
        sprite: 'rooftop_sparrow',
        isTarget: true,
        isObstacle: true,
        scoreValue: 40,
        onGround: false
    },
    rooftop_pigeon: {
        width: 70,
        height: 60,
        sprite: 'rooftop_pigeon',
        isTarget: true,
        isObstacle: true,
        scoreValue: 50,
        onGround: false
    },

    // Park NPCs
    squirrel: {
        width: 60,
        height: 60,
        sprite: 'squirrel',
        isTarget: true,
        isObstacle: true,
        scoreValue: 50,
        onGround: true
    },
    trash_can: {
        width: 50,
        height: 70,
        sprite: 'trash_can',
        isTarget: true,
        isObstacle: true,
        scoreValue: 40,
        onGround: true
    },
    snail: {
        width: 50,
        height: 40,
        sprite: 'snail',
        isTarget: true,
        isObstacle: true,
        scoreValue: 30,
        onGround: true
    },
    fly: {
        width: 40,
        height: 40,
        sprite: 'fly',
        isTarget: true,
        isObstacle: true,
        scoreValue: 35,
        onGround: false
    },

    // London NPCs
    tourist: {
        width: 110,
        height: 150,
        sprite: 'tourist',
        isTarget: true,
        isObstacle: true,
        scoreValue: 50,
        onGround: true
    },
    business_person: {
        width: 120,
        height: 160,
        sprite: 'business_person',
        isTarget: true,
        isObstacle: true,
        scoreValue: 40,
        onGround: true
    },
    london_cop: {
        width: 120,
        height: 160,
        sprite: 'london_cop',
        isTarget: true,
        isObstacle: true,
        scoreValue: 60,
        onGround: true
    },
    street_vendor: {
        width: 240,
        height: 200,
        sprite: 'street_vendor',
        isTarget: true,
        isObstacle: true,
        scoreValue: 80,
        onGround: true
    },
    street_musician: {
        width: 110,
        height: 150,
        sprite: 'street_musician',
        isTarget: true,
        isObstacle: true,
        scoreValue: 70,
        onGround: true
    },
    london_car: {
        width: 200,
        height: 120,
        sprite: 'london_car',
        isTarget: true,
        isObstacle: true,
        scoreValue: 100,
        onGround: true
    },
    london_pigeon: {
        width: 80,
        height: 70,
        sprite: 'london_pigeon',
        isTarget: true,
        isObstacle: true,
        scoreValue: 50,
        onGround: false,
        erratic: true
    },
    balloon: {
        width: 100,
        height: 120,
        sprite: 'balloon',
        isTarget: true,
        isObstacle: true,
        scoreValue: 100,
        onGround: false
    }
};

// Get NPC definition by type
export function getNPCType(type) {
    return NPC_TYPES[type];
}

// Get all ground NPCs for a level
export function getGroundNPCs(levelName) {
    const allNPCs = Object.keys(NPC_TYPES);
    return allNPCs.filter(npc => NPC_TYPES[npc].onGround);
}

// Get all air NPCs for a level
export function getAirNPCs(levelName) {
    const allNPCs = Object.keys(NPC_TYPES);
    return allNPCs.filter(npc => !NPC_TYPES[npc].onGround);
}
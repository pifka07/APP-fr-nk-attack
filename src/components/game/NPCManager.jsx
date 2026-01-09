// NPC Manager - Handles NPC spawning and behavior
import { getNPCType } from './npcs/npcTypes';

export class NPCManager {
    constructor(levelData, scrollSpeed) {
        this.levelData = levelData;
        this.scrollSpeed = scrollSpeed;
        this.spawnCounter = 0;
    }

    spawnNPC(width, height, groundY) {
        const isAir = Math.random() > 0.6;
        const npcPool = isAir ? this.levelData.airNPCs : this.levelData.groundNPCs;
        
        if (!npcPool || npcPool.length === 0) {
            return null;
        }

        // Select random NPC type from pool
        const npcType = npcPool[Math.floor(Math.random() * npcPool.length)];
        const npcDef = getNPCType(npcType);
        
        if (!npcDef) {
            console.warn(`NPC type not found: ${npcType}`);
            return null;
        }

        // Calculate Y position based on ground offset
        let yPos;
        if (npcDef.onGround) {
            const groundOffset = this.levelData.groundOffsets?.[npcType] || npcDef.height;
            yPos = (height * this.levelData.groundY) - groundOffset;
        } else {
            yPos = 20 + Math.random() * (height * 0.6);
        }

        // Create enemy object
        return {
            x: width + 50,
            y: yPos,
            width: npcDef.width,
            height: npcDef.height,
            hp: 1,
            isTarget: npcDef.isTarget,
            isObstacle: npcDef.isObstacle,
            scoreValue: npcDef.scoreValue,
            vx: -this.scrollSpeed,
            spriteType: npcType,
            ...npcDef.behavior
        };
    }

    spawnFormation(width, height, groundY, formationType) {
        if (formationType === 'sparrow_v') {
            return this.spawnSparrowFormation(width, groundY);
        }
        return [];
    }

    spawnSparrowFormation(width, groundY) {
        const baseY = 50 + Math.random() * (groundY * 0.4);
        const sparrows = [];
        const npcDef = getNPCType('sparrow');
        
        for (let i = 0; i < 3; i++) {
            sparrows.push({
                x: width + 50 + (i * 30),
                y: baseY + (i * 25),
                width: npcDef.width,
                height: npcDef.height,
                hp: 1,
                isTarget: npcDef.isTarget,
                isObstacle: npcDef.isObstacle,
                scoreValue: npcDef.scoreValue,
                vx: -this.scrollSpeed,
                spriteType: 'sparrow'
            });
        }
        return sparrows;
    }

    updateScrollSpeed(newSpeed) {
        this.scrollSpeed = newSpeed;
    }
}
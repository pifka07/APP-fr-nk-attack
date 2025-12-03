import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';

const GRAVITY = 0.4;
const FLAP_STRENGTH = -7; // Jump height
const GROUND_Y_PCT = 0.85; // Ground level at 85% height
const SPAWN_RATE_INITIAL = 100; // Frames between spawns
const SCROLL_SPEED_INITIAL = 3;

// Assets & Sprite Maps
const SPRITE_MAP = {
    player: {
        // Animations defined as arrays of frames
        idle: [{ x: 0, y: 0, w: 0.33, h: 0.5 }, { x: 0, y: 0.5, w: 0.33, h: 0.5 }], // Bobbing
        fly: [{ x: 0.33, y: 0, w: 0.33, h: 0.5 }, { x: 0, y: 0, w: 0.33, h: 0.5 }], // Flap (Wing up/down)
        action: [{ x: 0.66, y: 0, w: 0.33, h: 0.5 }], // Pooping frame
        angry: [{ x: 0.33, y: 0.5, w: 0.33, h: 0.5 }],
        dead: [{ x: 0.66, y: 0.5, w: 0.33, h: 0.5 }]
    },
    enemies: {
        // Simulating animation for single-frame assets by bobbing/rotating in render
        car: [{ x: 0.02, y: 0.05, w: 0.25, h: 0.25 }], 
        cop: [{ x: 0.35, y: 0.05, w: 0.2, h: 0.45 }], 
        granny: [{ x: 0.7, y: 0.05, w: 0.25, h: 0.45 }],
        dog: [{ x: 0.05, y: 0.35, w: 0.2, h: 0.25 }],
        poop: [{ x: 0.1, y: 0.7, w: 0.2, h: 0.2 }],
        drone: [{ x: 0.4, y: 0.8, w: 0.25, h: 0.15 }],
        eagle: [{ x: 0.6, y: 0.55, w: 0.35, h: 0.3 }]
    },
    powerups: {
        speed: { x: 0.1, y: 0.7, w: 0.2, h: 0.2 }, // Placeholder: reuse poop shape but colored
        shield: { x: 0.1, y: 0.7, w: 0.2, h: 0.2 }
    }
};

const GameEngine = forwardRef(({ onGameOver, onScoreUpdate, onHealthUpdate, onComboUpdate, config = {}, skin = 'default', difficultyMultiplier = 1 }, ref) => {
    const canvasRef = useRef(null);
    const assetsLoaded = useRef(false);
    const IMAGES = useRef({
        sky: new Image(),
        city: new Image(),
        playerSheet: new Image(),
        enemiesSheet: new Image(),
        uiAtlas: new Image()
    });

    useEffect(() => {
        // Load Images
        IMAGES.current.sky.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/0bb12c266_ChatGPTImage3Dez202518_19_15.png";
        IMAGES.current.city.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/d8d333126_ChatGPTImage3Dez202518_25_08.png";
        IMAGES.current.playerSheet.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/973061496_ChatGPTImage3Dez202518_18_26.png";
        IMAGES.current.enemiesSheet.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/c18e80915_ChatGPTImage3Dez202518_18_31.png";
        IMAGES.current.uiAtlas.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/8759edce6_ChatGPTImage3Dez202518_37_35.png";

        let loadedCount = 0;
        const checkLoad = () => {
            loadedCount++;
            if (loadedCount >= 5) assetsLoaded.current = true;
        };
        Object.values(IMAGES.current).forEach(img => {
            img.onload = checkLoad;
            // Handle cached images
            if (img.complete) checkLoad();
        });
    }, []);
    const requestRef = useRef();
    const frameRef = useRef(0);
    const gameStateRef = useRef({
        isPlaying: false,
        score: 0,
        coins: 0,
        distance: 0,
        health: 100,
        player: { x: 50, y: 100, vy: 0, radius: 20 },
        poops: [],
        enemies: [], 
        powerups: [],
        particles: [],
        scrollSpeed: SCROLL_SPEED_INITIAL,
        lastTime: 0,
        lastPoopTime: 0,
        combo: 0,
        comboTimer: 0,
        maxPoops: 3, // Dynamic ammo
        currentPoops: 3,
        animFrame: 0 // Global animation tick
    });

    // Apply config
    const getEffectiveConfig = () => ({
        maxPoops: config.maxPoops || 3,
        cooldown: Math.max(100, 500 - (config.cooldownReduction || 0) * 50), // Base 500ms
        flapStrength: FLAP_STRENGTH * (config.agility || 1),
        comboDuration: config.comboDuration || 2000
    });

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
        start: () => {
            gameStateRef.current.isPlaying = true;
            gameStateRef.current.lastTime = performance.now();
            gameStateRef.current.health = 100;
            gameStateRef.current.score = 0;
            gameStateRef.current.coins = 0;
            gameStateRef.current.distance = 0;
            gameStateRef.current.enemies = [];
            gameStateRef.current.poops = [];
            gameStateRef.current.particles = [];
            gameStateRef.current.player.y = 100;
            gameStateRef.current.player.vy = 0;
            gameStateRef.current.combo = 0;
            gameStateRef.current.comboTimer = 0;
            
            requestRef.current = requestAnimationFrame(gameLoop);
        },
        poop: () => {
            if (!gameStateRef.current.isPlaying) return;
            spawnPoop();
        },
        flap: () => {
            if (!gameStateRef.current.isPlaying) return;
            gameStateRef.current.player.vy = getEffectiveConfig().flapStrength;
        },
        stop: () => {
            gameStateRef.current.isPlaying = false;
            cancelAnimationFrame(requestRef.current);
        }
    }));

    const spawnPoop = () => {
        const state = gameStateRef.current;
        const now = performance.now();
        const effectiveConfig = getEffectiveConfig();

        // Cooldown check
        if (now - state.lastPoopTime < effectiveConfig.cooldown) return;
        
        // Ammo check (reloading mechanism)
        if (state.currentPoops <= 0) return; // Out of ammo

        state.currentPoops--;
        state.lastPoopTime = now;
        state.poops.push({
            x: state.player.x,
            y: state.player.y + 20,
            vx: 2, // slight forward momentum
            vy: 5, // initial drop speed
            active: true
        });
    };

    const spawnEnemy = (width, height) => {
        const { enemies, scrollSpeed } = gameStateRef.current;
        const groundY = height * GROUND_Y_PCT;
        
        let enemy = {
            x: width + 50,
            y: groundY - 50,
            width: 60,
            height: 60,
            hp: 1,
            isTarget: true,
            isObstacle: false,
            scoreValue: 10,
            vx: -scrollSpeed,
            spriteType: 'car' // default
        };

        const rand = Math.random();
        const isAir = Math.random() > 0.6;

        if (!isAir) {
            // Ground
            if (rand < 0.4) {
                // Car
                enemy.spriteType = 'car';
                enemy.isTarget = true;
                enemy.width = 90;
                enemy.height = 70;
                enemy.vx = -scrollSpeed - 2;
                enemy.scoreValue = 30;
            } else if (rand < 0.7) {
                // Cop
                enemy.spriteType = 'cop';
                enemy.isTarget = true;
                enemy.width = 50;
                enemy.height = 80;
                enemy.y = groundY - 70;
                enemy.scoreValue = 50;
            } else if (rand < 0.85) {
                // Granny (Obstacle!)
                enemy.spriteType = 'granny';
                enemy.isTarget = false;
                enemy.isObstacle = true;
                enemy.width = 50;
                enemy.height = 80;
                enemy.y = groundY - 70;
            } else {
                // Dog
                enemy.spriteType = 'dog';
                enemy.isTarget = false; // Neutral/Obstacle
                enemy.isObstacle = true;
                enemy.width = 40;
                enemy.height = 40;
                enemy.y = groundY - 30;
            }
        } else {
            // Air
            if (Math.random() < 0.5) {
                enemy.spriteType = 'eagle';
                enemy.isTarget = false;
                enemy.isObstacle = true;
                enemy.y = Math.random() * (groundY - 200);
                enemy.width = 80;
                enemy.height = 60;
                enemy.vx = -scrollSpeed * 1.5;
            } else {
                enemy.spriteType = 'drone';
                enemy.isTarget = false;
                enemy.isObstacle = true;
                enemy.y = Math.random() * (groundY - 150);
                enemy.width = 60;
                enemy.height = 40;
                enemy.vx = -scrollSpeed * 1.2;
            }
        }

        enemies.push(enemy);
    };

    const spawnPowerup = (width, height) => {
        const state = gameStateRef.current;
        if (Math.random() > 0.01) return; // 1% chance per frame

        const typeRand = Math.random();
        let type = 'coin';
        if (typeRand > 0.8) type = 'ammo'; // Poop refill
        else if (typeRand > 0.9) type = 'energy'; // Speed/Invincibility

        state.powerups.push({
            x: width + 50,
            y: Math.random() * (height * 0.6) + 50,
            width: 40,
            height: 40,
            type,
            vx: -state.scrollSpeed,
            active: true
        });
    };

    const createParticles = (x, y, color, count = 5) => {
        for (let i = 0; i < count; i++) {
            gameStateRef.current.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1.0,
                color
            });
        }
    };

    const update = (deltaTime, width, height) => {
        const state = gameStateRef.current;
        if (!state.isPlaying) return;

        // Increase difficulty
        state.scrollSpeed += 0.0005;
        state.distance += (state.scrollSpeed / 10);
        state.animFrame++; // Tick animation

        // Player Physics
        state.player.vy += GRAVITY;
        state.player.y += state.player.vy;

        // Floor/Ceiling collision
        const groundY = height * GROUND_Y_PCT;
        if (state.player.y > groundY - state.player.radius) {
            state.player.y = groundY - state.player.radius;
            state.player.vy = 0;
        }
        if (state.player.y < state.player.radius) {
            state.player.y = state.player.radius;
            state.player.vy = 0;
        }

        // Poop Physics
        state.poops.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += GRAVITY * 0.5; // accelerate down
        });

        // Combo Timer
        if (state.combo > 0) {
            state.comboTimer -= deltaTime;
            if (state.comboTimer <= 0) {
                state.combo = 0;
                if (onComboUpdate) onComboUpdate(0);
            }
        }

        // Enemy/World Movement & Spawning
        frameRef.current++;
        if (frameRef.current % Math.max(20, Math.floor(SPAWN_RATE_INITIAL - state.scrollSpeed * 5)) === 0) {
            spawnEnemy(width, height);
        }
        spawnPowerup(width, height);

        // Reload Ammo slowly
        if (frameRef.current % 60 === 0 && state.currentPoops < getEffectiveConfig().maxPoops) {
            state.currentPoops++;
        }

        // Update Enemies
        state.enemies.forEach(e => {
            e.x += e.vx;
        });

        // Update Powerups
        state.powerups.forEach(p => {
            p.x += p.vx;
        });

        // Update Particles
        state.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.05;
        });

        // Collision Detection
        // 1. Poop hitting Targets
        state.poops.forEach(p => {
            if (!p.active) return;
            // Hit ground?
            if (p.y > groundY) {
                p.active = false;
                createParticles(p.x, p.y, '#8B4513', 3);
                return;
            }
            // Hit enemy?
            state.enemies.forEach(e => {
                if (e.hp > 0 && e.isTarget && 
                    p.x > e.x && p.x < e.x + e.width &&
                    p.y > e.y && p.y < e.y + e.height) {
                    
                    // HIT!
                    p.active = false;
                    e.hp = 0; // Die
                    
                    // Combo Logic
                    state.combo += 1;
                    state.comboTimer = getEffectiveConfig().comboDuration;
                    if (onComboUpdate) onComboUpdate(state.combo);

                    const multiplier = 1 + (state.combo / 10);
                    const points = Math.floor(e.scoreValue * multiplier);

                    state.score += points;
                    state.coins += 1; // 1 coin per hit base
                    createParticles(e.x + e.width/2, e.y + e.height/2, '#FFFF00', 10); // Sparkles
                    
                    // Notify React
                    onScoreUpdate(state.score, state.coins);
                }
            });
        });

        // 2. Player hitting Obstacles
        state.enemies.forEach(e => {
            if (e.hp > 0 && e.isObstacle) {
                const dx = state.player.x - (e.x + e.width/2);
                const dy = state.player.y - (e.y + e.height/2);
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if (dist < state.player.radius + (e.width/2)) {
                    // Crash!
                    e.hp = 0; // Destroy obstacle? or keep it? Let's destroy it to prevent multi-hit
                    state.health -= 20;
                    createParticles(state.player.x, state.player.y, '#FF0000', 10);
                    onHealthUpdate(state.health);
                    
                    if (state.health <= 0) {
                        state.isPlaying = false;
                        onGameOver({ score: state.score, coins: state.coins, distance: Math.floor(state.distance) });
                    }
                }
            }
        });

        // 3. Player collecting Powerups
        state.powerups.forEach(p => {
            if (!p.active) return;
            const dx = state.player.x - (p.x + p.width/2);
            const dy = state.player.y - (p.y + p.height/2);
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist < state.player.radius + (p.width/2)) {
                p.active = false;
                createParticles(p.x, p.y, '#FFFFFF', 5);
                
                if (p.type === 'coin') {
                    state.coins += 5;
                    state.score += 50;
                } else if (p.type === 'ammo') {
                    state.currentPoops = getEffectiveConfig().maxPoops; // Refill
                    createParticles(state.player.x, state.player.y, '#8B4513', 8);
                } else if (p.type === 'energy') {
                    state.health = Math.min(100, state.health + 20);
                    onHealthUpdate(state.health);
                    createParticles(state.player.x, state.player.y, '#00FFFF', 8);
                }
                onScoreUpdate(state.score, state.coins);
            }
        });

        // Cleanup
        state.poops = state.poops.filter(p => p.active && p.x < width && p.y < height);
        state.enemies = state.enemies.filter(e => e.x > -100 && e.hp > 0); // Remove offscreen or dead
        state.powerups = state.powerups.filter(p => p.active && p.x > -100);
        state.particles = state.particles.filter(p => p.life > 0);
    };

    const draw = (ctx, width, height) => {
        const state = gameStateRef.current;

        // Clear
        ctx.clearRect(0, 0, width, height);

        // --- PARALLAX RENDERING ---
        
        // 1. Sky (Slowest)
        if (assetsLoaded.current && IMAGES.current.sky) {
            const bg = IMAGES.current.sky;
            const scale = Math.max(width / bg.width, height / bg.height);
            const w = bg.width * scale;
            const h = bg.height * scale;
            const offset = (state.distance * 0.2) % w; // 0.2x speed
            
            ctx.drawImage(bg, -offset, 0, w, h);
            ctx.drawImage(bg, w - offset, 0, w, h);
        } else {
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(0, 0, width, height);
        }

        // 2. Midground City (Medium)
        if (assetsLoaded.current && IMAGES.current.city) {
            const city = IMAGES.current.city;
            // Align to bottom of ground
            const h = height * 0.6; // City takes up 60% height
            const w = city.width * (h / city.height); 
            const y = (height * GROUND_Y_PCT) - h + 20; // Slightly overlap ground
            const offset = (state.distance * 0.5) % w; // 0.5x speed
            
            ctx.drawImage(city, -offset, y, w, h);
            ctx.drawImage(city, w - offset, y, w, h);
            ctx.drawImage(city, (w * 2) - offset, y, w, h); // Safety 3rd tile
        }

        // 3. Foreground Ground (Fastest - Game Speed)
        const groundY = height * GROUND_Y_PCT;
        ctx.fillStyle = '#2D3748'; // Road color
        ctx.fillRect(0, groundY, width, height - groundY);
        
        // Road markings (Animated)
        ctx.fillStyle = '#FEFCBF'; // Yellow/White lines
        const lineSpacing = 100;
        const lineOffset = (state.distance * 1) % lineSpacing;
        for (let i = -1; i < width / lineSpacing + 1; i++) {
            ctx.fillRect((i * lineSpacing) - lineOffset, groundY + 40, 60, 10);
        }

        // Sidewalk
        ctx.fillStyle = '#4A5568'; 
        ctx.fillRect(0, groundY - 15, width, 15);

        // Draw Player
        if (assetsLoaded.current) {
            const sheet = IMAGES.current.playerSheet;
            let animKey = 'idle';
            
            if (state.player.vy < -2) animKey = 'fly';
            else if (state.player.vy > 2) animKey = 'action';
            if (skin === 'gangster') animKey = 'angry';

            const frames = SPRITE_MAP.player[animKey] || SPRITE_MAP.player.idle;
            // Cycle frames every 10 ticks
            const frameIndex = Math.floor(state.animFrame / 10) % frames.length;
            const spriteDef = frames[frameIndex];
            
            const sx = spriteDef.x * sheet.width;
            const sy = spriteDef.y * sheet.height;
            const sw = spriteDef.w * sheet.width;
            const sh = spriteDef.h * sheet.height;
            
            const playerSize = 90;
            
            ctx.save();
            ctx.translate(state.player.x, state.player.y);
            const rotation = Math.min(Math.max(state.player.vy * 0.05, -0.4), 0.4);
            ctx.rotate(rotation);
            
            ctx.drawImage(sheet, sx, sy, sw, sh, -playerSize/2, -playerSize/2, playerSize, playerSize);
            ctx.restore();
        } else {
            ctx.fillText('🐦', state.player.x, state.player.y);
        }

        // Draw Poops
        state.poops.forEach(p => {
            if (p.active) {
                 if (assetsLoaded.current) {
                    const sheet = IMAGES.current.enemiesSheet;
                    const def = SPRITE_MAP.enemies.poop[0];
                    
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    // Spin the poop!
                    ctx.rotate(state.animFrame * 0.2);
                    
                    ctx.drawImage(
                        sheet, 
                        def.x * sheet.width, def.y * sheet.height, 
                        def.w * sheet.width, def.h * sheet.height, 
                        -15, -15, 30, 30
                    );
                    ctx.restore();
                 } else {
                    ctx.fillText('💩', p.x, p.y);
                 }
            }
        });

        // Draw Enemies
        state.enemies.forEach(e => {
            if (assetsLoaded.current && e.spriteType) {
                const sheet = IMAGES.current.enemiesSheet;
                const frames = SPRITE_MAP.enemies[e.spriteType] || SPRITE_MAP.enemies.car;
                const def = frames[0]; // Enemies single frame for now, animate transform
                
                const sx = def.x * sheet.width;
                const sy = def.y * sheet.height;
                const sw = def.w * sheet.width;
                const sh = def.h * sheet.height;
                
                ctx.save();
                ctx.translate(e.x + e.width/2, e.y + e.height/2);
                
                // Simple animations based on type
                if (e.spriteType === 'car' || e.spriteType === 'cop') {
                    // Bounce
                    ctx.translate(0, Math.sin(state.animFrame * 0.5) * 2);
                } else if (e.spriteType === 'granny') {
                    // Waddle
                    ctx.rotate(Math.sin(state.animFrame * 0.2) * 0.1);
                }
                
                ctx.drawImage(sheet, sx, sy, sw, sh, -e.width/2, -e.height/2, e.width, e.height);
                ctx.restore();
            } else {
                ctx.font = '30px serif';
                ctx.fillText('📦', e.x + e.width/2, e.y + e.height/2);
            }
        });

        // Draw Powerups
        state.powerups.forEach(p => {
            if (!p.active) return;
            
            // Use the new atlas if possible, or fallback colors
            if (assetsLoaded.current && IMAGES.current.uiAtlas) {
                // Guessing coordinates from the provided image structure (Middle row)
                // Lightning, Poop, Coin
                const atlas = IMAGES.current.uiAtlas;
                let sx = 0, sy = atlas.height * 0.4, sw = atlas.width * 0.2, sh = atlas.height * 0.2;
                
                if (p.type === 'energy') { sx = atlas.width * 0.05; } // Lightning
                else if (p.type === 'ammo') { sx = atlas.width * 0.3; } // Poop
                else if (p.type === 'coin') { sx = atlas.width * 0.55; } // Coin

                // Pulse effect
                const scale = 1 + Math.sin(state.animFrame * 0.1) * 0.1;
                
                ctx.save();
                ctx.translate(p.x + p.width/2, p.y + p.height/2);
                ctx.scale(scale, scale);
                ctx.drawImage(atlas, sx, sy, sw, sh, -p.width/2, -p.height/2, p.width, p.height);
                ctx.restore();
            } else {
                ctx.fillStyle = p.type === 'coin' ? 'gold' : (p.type === 'ammo' ? 'brown' : 'cyan');
                ctx.beginPath();
                ctx.arc(p.x + p.width/2, p.y + p.height/2, p.width/2, 0, Math.PI*2);
                ctx.fill();
                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                ctx.font = '20px Arial';
                ctx.fillText(p.type === 'coin' ? '$' : (p.type === 'ammo' ? 'P' : 'E'), p.x + p.width/2, p.y + p.height/2 + 5);
            }
        });

        // Draw Particles
        state.particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        });
    };

    const gameLoop = (time) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Calculate delta time (capped)
        // const deltaTime = time - gameStateRef.current.lastTime;
        gameStateRef.current.lastTime = time;

        update(16, width, height); // Assume ~60fps for physics
        draw(ctx, width, height);

        if (gameStateRef.current.isPlaying) {
            requestRef.current = requestAnimationFrame(gameLoop);
        }
    };

    useEffect(() => {
        // Resize handling
        const handleResize = () => {
            if (canvasRef.current) {
                const parent = canvasRef.current.parentElement;
                canvasRef.current.width = parent.clientWidth;
                canvasRef.current.height = parent.clientHeight;
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <canvas 
            ref={canvasRef} 
            className="block w-full h-full"
        />
    );
});

export default GameEngine;
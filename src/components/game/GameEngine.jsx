import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';

const GRAVITY = 0.4;
const FLAP_STRENGTH = -7; // Jump height
const GROUND_Y_PCT = 0.85; // Ground level at 85% height
const SPAWN_RATE_INITIAL = 100; // Frames between spawns
const SCROLL_SPEED_INITIAL = 3;

// Assets (Emojis)
const SPRITES = {
    PLAYER: '🐦',
    POOP: '💩',
    PEDESTRIAN: '🚶',
    BUSINESSMAN: '🕴️',
    COP: '👮',
    CAR: '🚗',
    TAXI: '🚕',
    SIGN: '🛑',
    BIRD: '🦅',
    WATER: '💧'
};

const GameEngine = forwardRef(({ onGameOver, onScoreUpdate, onHealthUpdate, config = {}, difficultyMultiplier = 1 }, ref) => {
    const canvasRef = useRef(null);
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
        enemies: [], // Targets and obstacles
        particles: [],
        scrollSpeed: SCROLL_SPEED_INITIAL,
        lastTime: 0,
        lastPoopTime: 0
    });

    // Apply config
    const getEffectiveConfig = () => ({
        maxPoops: config.maxPoops || 3,
        cooldown: Math.max(100, 500 - (config.cooldownReduction || 0) * 50), // Base 500ms
        flapStrength: FLAP_STRENGTH * (config.agility || 1)
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
        
        // Max active poops check (optional based on upgrade)
        // if (state.poops.length >= effectiveConfig.maxPoops) return;

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
        const typeRoll = Math.random();
        const groundY = height * GROUND_Y_PCT;
        
        let enemy = {
            x: width + 50,
            y: groundY - 30, // Default ground entity
            type: 'pedestrian',
            emoji: SPRITES.PEDESTRIAN,
            width: 30,
            height: 30,
            isTarget: true,
            isObstacle: false,
            scoreValue: 10,
            vx: -scrollSpeed, // Moves with world or slightly different
            hp: 1
        };

        // 20% Obstacle (Air or Ground)
        if (Math.random() < 0.2 + (difficultyMultiplier * 0.05)) {
            enemy.isTarget = false;
            enemy.isObstacle = true;
            if (Math.random() > 0.5) {
                // Air obstacle (Bird/Drone)
                enemy.type = 'bird';
                enemy.emoji = SPRITES.BIRD;
                enemy.y = Math.random() * (groundY - 100); // Random air height
                enemy.vx = -scrollSpeed * 1.5; // Moves faster
            } else {
                // Ground obstacle (Sign)
                enemy.type = 'sign';
                enemy.emoji = SPRITES.SIGN;
                enemy.y = groundY - 40;
            }
        } else {
            // Target
            if (typeRoll > 0.9) {
                enemy.type = 'cop';
                enemy.emoji = SPRITES.COP;
                enemy.scoreValue = 50;
                enemy.vx = -scrollSpeed - 1; // Runs towards you? or away?
            } else if (typeRoll > 0.7) {
                enemy.type = 'car';
                enemy.emoji = SPRITES.CAR;
                enemy.scoreValue = 30;
                enemy.width = 60;
                enemy.vx = -scrollSpeed - 2; // Faster
            } else if (typeRoll > 0.6) {
                enemy.type = 'taxi';
                enemy.emoji = SPRITES.TAXI;
                enemy.scoreValue = 60;
                enemy.width = 60;
                enemy.vx = -scrollSpeed - 2.5;
            }
        }

        enemies.push(enemy);
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

        // Enemy/World Movement & Spawning
        frameRef.current++;
        if (frameRef.current % Math.max(20, Math.floor(SPAWN_RATE_INITIAL - state.scrollSpeed * 5)) === 0) {
            spawnEnemy(width, height);
        }

        // Update Enemies
        state.enemies.forEach(e => {
            e.x += e.vx;
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
                    state.score += e.scoreValue;
                    state.coins += 1; // 1 coin per hit base
                    createParticles(e.x + e.width/2, e.y + e.height/2, '#FFFF00', 10); // Sparkles
                    
                    // Notify React (throttled ideally, but direct here)
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

        // Cleanup
        state.poops = state.poops.filter(p => p.active && p.x < width && p.y < height);
        state.enemies = state.enemies.filter(e => e.x > -100 && e.hp > 0); // Remove offscreen or dead
        state.particles = state.particles.filter(p => p.life > 0);
    };

    const draw = (ctx, width, height) => {
        const state = gameStateRef.current;

        // Clear
        ctx.clearRect(0, 0, width, height);

        // Background (Simple gradient sky)
        // Already handled by CSS in parent, but maybe draw some clouds?
        // Draw Ground
        const groundY = height * GROUND_Y_PCT;
        ctx.fillStyle = '#2D3748'; // Road color
        ctx.fillRect(0, groundY, width, height - groundY);
        ctx.fillStyle = '#4A5568'; // Sidewalk
        ctx.fillRect(0, groundY - 10, width, 10);

        // Draw Player
        ctx.font = '40px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(SPRITES.PLAYER, state.player.x, state.player.y);

        // Draw Poops
        ctx.font = '20px serif';
        state.poops.forEach(p => {
            ctx.fillText(SPRITES.POOP, p.x, p.y);
        });

        // Draw Enemies
        state.enemies.forEach(e => {
            ctx.font = '30px serif';
            ctx.fillText(e.emoji, e.x + e.width/2, e.y + e.height/2);
        });

        // Draw Particles
        state.particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
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
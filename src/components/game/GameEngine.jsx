import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';

const GRAVITY = 0.4;
const FLAP_STRENGTH = -7; // Jump height
const GROUND_Y_PCT = 0.85; // Ground level at 85% height
const SPAWN_RATE_INITIAL = 100; // Frames between spawns
const SCROLL_SPEED_INITIAL = 3;

// Assets & Sprite Maps
const SPRITE_MAP = {
    player: {
        // Single frame image for now, utilizing code-based animation (rotation/bobbing)
        idle: [{ x: 0, y: 0, w: 1, h: 1 }],
        fly: [{ x: 0, y: 0, w: 1, h: 1 }],
        action: [{ x: 0, y: 0, w: 1, h: 1 }],
        angry: [{ x: 0, y: 0, w: 1, h: 1 }],
        dead: [{ x: 0, y: 0, w: 1, h: 1 }]
    },
    enemies: {
        // Simulating animation for single-frame assets by bobbing/rotating in render
        car: [{ x: 0.02, y: 0.05, w: 0.25, h: 0.25 }], 
        cop: [{ x: 0.35, y: 0.05, w: 0.2, h: 0.45 }], 
        granny: [{ x: 0.7, y: 0.05, w: 0.25, h: 0.45 }],
        dog: [{ x: 0.05, y: 0.35, w: 0.2, h: 0.25 }],
        poop: [{ x: 0.1, y: 0.7, w: 0.2, h: 0.2 }],
        drone: [{ x: 0.4, y: 0.8, w: 0.25, h: 0.15 }],
        eagle: [{ x: 0.6, y: 0.55, w: 0.35, h: 0.3 }],
        worker: [{ x: 0, y: 0, w: 1, h: 1 }],
        cat: [{ x: 0, y: 0, w: 1, h: 1 }],
        ac_unit: [{ x: 0, y: 0, w: 1, h: 1 }],
        seagull: [{ x: 0, y: 0, w: 1, h: 1 }],
        drone_l2: [{ x: 0, y: 0, w: 1, h: 1 }],
        squirrel: [{ x: 0, y: 0, w: 1, h: 1 }],
        snail: [{ x: 0, y: 0, w: 1, h: 1 }],
        fly: [{ x: 0, y: 0, w: 1, h: 1 }],
        raccoon: [{ x: 0, y: 0, w: 1, h: 1 }],
        trash_can: [{ x: 0, y: 0, w: 1, h: 1 }]
        },
    powerups: {
        speed: { x: 0.1, y: 0.7, w: 0.2, h: 0.2 }, // Placeholder: reuse poop shape but colored
        shield: { x: 0.1, y: 0.7, w: 0.2, h: 0.2 }
    }
};

const GameEngine = forwardRef(({ onGameOver, onScoreUpdate, onHealthUpdate, onComboUpdate, onAmmoUpdate, config = {}, skin = 'default', level = 'downtown', gameSpeed = 'normal', difficultyMultiplier = 1, musicEnabled = true, soundEnabled = true }, ref) => {
    const canvasRef = useRef(null);
    const assetsLoaded = useRef(false);
    const AUDIOS = useRef({
        bgm: new Audio("https://codeskulptor-demos.commondatastorage.googleapis.com/GalaxyInvaders/theme_01.mp3"),
        fart: new Audio("https://www.soundjay.com/human/sounds/fart-03.mp3"),
        explosion: new Audio("https://www.soundjay.com/mechanical/sounds/explosion-01.mp3"),
        ouch: new Audio("https://www.myinstants.com/media/sounds/roblox-death-sound_1.mp3")
    });

    const IMAGES = useRef({
        background: new Image(),
        playerSheet: new Image(), // Flying
        playerGlide: new Image(), // Gliding (input active)
        playerDead: new Image(),
        playerGround: new Image(), // Standing
        customSkin: new Image(), // Custom equipped skin
        enemiesSheet: new Image(),
        uiAtlas: new Image(),
        eagle: new Image(),
        cop: new Image(),
        granny: new Image(),
        car: new Image(),
        drone: new Image(),
        dog: new Image(),
        worker: new Image(),
        cat: new Image(),
        ac_unit: new Image(),
        seagull: new Image(),
        drone_l2: new Image(),
        squirrel: new Image(),
        snail: new Image(),
        fly: new Image(),
        raccoon: new Image(),
        trash_can: new Image(),
        coin: new Image(),
        poopProjectile: new Image(),
        energyIcon: new Image(),
        laserProjectile: new Image()
        });

    useEffect(() => {
        if (AUDIOS.current.bgm) {
            AUDIOS.current.bgm.muted = !musicEnabled;
            if (musicEnabled && gameStateRef.current.isPlaying) {
                AUDIOS.current.bgm.play().catch(e => console.log("BGM Play prevented"));
            }
        }
    }, [musicEnabled]);

    // Music Selection
    useEffect(() => {
        let musicUrl = "https://codeskulptor-demos.commondatastorage.googleapis.com/GalaxyInvaders/theme_01.mp3"; // Default/Downtown

        if (level === 'rooftop') {
            musicUrl = "https://codeskulptor-demos.commondatastorage.googleapis.com/pang/paza-moduless.mp3";
        } else if (level === 'park') {
            musicUrl = "https://codeskulptor-demos.commondatastorage.googleapis.com/descent/background%20music.mp3"; 
        }

        if (AUDIOS.current.bgm.src !== musicUrl) {
            AUDIOS.current.bgm.src = musicUrl;
            AUDIOS.current.bgm.load();
            if (gameStateRef.current.isPlaying && musicEnabled) {
                AUDIOS.current.bgm.play().catch(e => console.log("BGM Play prevented"));
            }
        }
    }, [level]);

    // Load custom skin when skin prop changes
    useEffect(() => {
        const loadCustomSkin = async () => {
            if (skin && skin !== 'default') {
                try {
                    const { base44 } = await import('@/api/base44Client');
                    const skins = await base44.entities.Skin.filter({ key: skin });
                    if (skins.length > 0 && skins[0].image_url) {
                        IMAGES.current.customSkin.src = skins[0].image_url;
                    }
                } catch (error) {
                    console.error('Failed to load custom skin:', error);
                }
            }
        };
        loadCustomSkin();
    }, [skin]);

    useEffect(() => {
        // Load Images
        if (level === 'rooftop') {
            IMAGES.current.background.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/08af38dd2_Level1Hintergrund.png";
        } else if (level === 'park') {
            IMAGES.current.background.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/2bf59f945_Level3Park.png";
        } else {
            IMAGES.current.background.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/cd46a805a_FrnkdieTaube6.png";
        }

        IMAGES.current.playerSheet.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/59fa7a8db_FrnkdieTaube2-Kopie.png";
        IMAGES.current.playerGlide.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/71a9e1eb7_frnkoriginal.png";
        IMAGES.current.playerDead.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/ae2c71989_FrnkdieTaube4-Kopie.png";
        IMAGES.current.playerGround.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/dc76f3fcb_FrnkdieTaube5-Kopie.png";
        IMAGES.current.enemiesSheet.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/c18e80915_ChatGPTImage3Dez202518_18_31.png";
        IMAGES.current.uiAtlas.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/8759edce6_ChatGPTImage3Dez202518_37_35.png";
        IMAGES.current.eagle.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/54503ca77_Falke.png";
        IMAGES.current.cop.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/3c287a339_Frnk-icon3.png";
        IMAGES.current.granny.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/4acddf445_Frnk-icon1.png";
        IMAGES.current.car.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/6beb89d0d_Frnk-icon4.png";
        IMAGES.current.drone.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/2661da5d3_Drone.png";
        IMAGES.current.dog.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/7aca9a3aa_Frnk-icon5.png";
        IMAGES.current.worker.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/3131e260e_Level1Gegner-Kopie5.png";
        IMAGES.current.cat.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/5b5df510c_Level1Gegner-Kopie4.png";
        IMAGES.current.ac_unit.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/a4450d5d4_Level1Gegner.png";
        IMAGES.current.seagull.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/88d04a76d_Level1Gegner-Kopie.png";
        IMAGES.current.drone_l2.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/61f1abf56_Level1Gegner-Kopie3.png";
        IMAGES.current.squirrel.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/34a772965_Level3sandy.png";
        IMAGES.current.snail.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/fbcc970e9_Level3Schnecke.png";
        IMAGES.current.fly.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/e9811e48b_Level3wespe.png";
        IMAGES.current.raccoon.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/8bbdd27ad_Level3Waschbr.png";
        IMAGES.current.trash_can.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/606803243_Level3Tonne.png";
        IMAGES.current.coin.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/a3d089aef_FrnkdieTaubecoin.png";
        IMAGES.current.poopProjectile.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/6fef2bdb0_Frnkkacke-Kopie-Kopie.png";
        IMAGES.current.poopTriple = new Image();
        IMAGES.current.poopTriple.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/d851cff29_Frnkkacke-Kopie.png";
        IMAGES.current.energyIcon.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/55c3a6a9f_FrnkdieTaubeicon9.png";
        IMAGES.current.laserProjectile.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/laser.png";
        IMAGES.current.ammoIcon = new Image();
        IMAGES.current.ammoIcon.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/18a5f342d_Frnkkacke.png";

        let loadedCount = 0;
        const checkLoad = () => {
            loadedCount++;
            if (loadedCount >= 15) assetsLoaded.current = true;
        };
        Object.values(IMAGES.current).forEach(img => {
            img.onload = checkLoad;
            // Handle cached images
            if (img.complete) checkLoad();
        });
        
        // Configure Audio
        AUDIOS.current.bgm.loop = true;
        AUDIOS.current.bgm.volume = 0.5;
        AUDIOS.current.fart.volume = 0.3;
        AUDIOS.current.explosion.volume = 0.6;
        AUDIOS.current.ouch.volume = 1.0;

        return () => {
            if (AUDIOS.current.bgm) {
                AUDIOS.current.bgm.pause();
                AUDIOS.current.bgm.currentTime = 0;
            }
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    const playSound = (name) => {
        if (!soundEnabled) return;
        const audio = AUDIOS.current[name];
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.error("Audio play failed", e));
        }
    };
    const requestRef = useRef();
    const frameRef = useRef(0);
    const gameStateRef = useRef({
        isPlaying: false,
        inputActive: false,
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
        animFrame: 0, // Global animation tick
        rapidFireUntil: 0,
        shotQueue: [],
        lastMilestone: 0 // Track last milestone reached
        });

    // Apply config
    const getEffectiveConfig = () => {
    let speedMult = 1;
    if (gameSpeed === 'slow') speedMult = 0.7;
    if (gameSpeed === 'quick') speedMult = 1.4;

    // Cooldown Curve: Level 0-10 (1.5s → 0.5s)
    const cooldownLevels = [1500, 1400, 1300, 1200, 1100, 1000, 900, 800, 700, 600, 500];
    const cooldownLevel = Math.round((config.cooldownReduction || 0) * 10);
    const baseCooldown = cooldownLevels[Math.min(cooldownLevel, 10)];

    return {
        maxPoops: config.poopTankCapacity || 10,
        cooldown: baseCooldown / speedMult,
        flapStrength: FLAP_STRENGTH * (config.agility || 1),
        comboDuration: config.comboDuration || 2000,
        speedMultiplier: speedMult
    };
    };

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
            gameStateRef.current.player.y = 2000;
            gameStateRef.current.player.vy = 0;
            gameStateRef.current.combo = 0;
            gameStateRef.current.comboTimer = 0;
            gameStateRef.current.lastMilestone = 0;

            // Initialize Poop Tank
            const config = getEffectiveConfig();
            gameStateRef.current.currentPoops = config.maxPoops;
            gameStateRef.current.maxPoops = config.maxPoops;
            gameStateRef.current.scrollSpeed = SCROLL_SPEED_INITIAL * config.speedMultiplier;

            // Update UI ammo display
            if (onAmmoUpdate) onAmmoUpdate(config.maxPoops);

            AUDIOS.current.bgm.play().catch(e => console.error("BGM failed", e));
            requestRef.current = requestAnimationFrame(gameLoop);
        },
        poop: () => {
            if (!gameStateRef.current.isPlaying) return;
            spawnPoop();
        },
        movePlayer: (dy) => {
            if (!gameStateRef.current.isPlaying) return;
            gameStateRef.current.player.y += dy;
            // Mock velocity for rotation animation
            gameStateRef.current.player.vy = dy; 
        },
        startInput: () => {
            if (!gameStateRef.current.isPlaying) return;
            gameStateRef.current.inputActive = true;
        },
        endInput: () => {
            gameStateRef.current.inputActive = false;
            gameStateRef.current.player.vy = 0; // Stop rotation when input ends
        },
        stop: () => {
            gameStateRef.current.isPlaying = false;
            AUDIOS.current.bgm.pause();
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

        playSound('fart');
        state.currentPoops--;
        if (onAmmoUpdate) onAmmoUpdate(state.currentPoops);
        state.lastPoopTime = now;
        
        // Helper to push a poop
        // Check if Rapid Fire is active
        const isRapidFire = now < state.rapidFireUntil;

        const pushPoop = () => {
            const isLaser = skin === 'neon';
            const isNinja = skin === 'ninja';
            const isAlien = skin === 'alien';
            const isGold = skin === 'gold';
            const isChristmas = skin === 'christmas';
            const isPink = skin === 'pink';
            const isBat = skin === 'bat';
            state.poops.push({
                x: state.player.x,
                y: state.player.y + 20,
                vx: isLaser ? 8 : (isNinja ? 6 : (isAlien ? 7 : (isGold ? 5 : (isChristmas ? 6 : (isPink ? 4 : (isBat ? 7 : 2)))))),
                vy: isLaser ? 4 : (isNinja ? 12 : (isAlien ? 6 : (isGold ? 8 : (isChristmas ? 8 : (isPink ? 3 : (isBat ? 10 : 5)))))),
                active: true,
                type: isLaser ? 'laser' : (isNinja ? 'shuriken' : (isAlien ? 'lightning' : (isGold ? 'goldbar' : (isChristmas ? 'candycane' : (isPink ? 'bubble' : (isBat ? 'batarang' : (isRapidFire ? 'triple' : 'normal'))))))),
                width: isLaser ? 40 : (isNinja ? 35 : (isAlien ? 45 : (isGold ? 10 : (isChristmas ? 20 : (isPink ? 25 : (isBat ? 40 : (isRapidFire ? 60 : 30))))))),
                height: isLaser ? 10 : (isNinja ? 35 : (isAlien ? 15 : (isGold ? 6 : (isChristmas ? 5 : (isPink ? 25 : (isBat ? 20 : (isRapidFire ? 60 : 30)))))))
            });
        };

        pushPoop();

        // Rapid Fire Logic - Now uses special graphic instead of queueing multiple shots
        // (Queue logic removed in favor of "Triple Poop" projectile)
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
            isObstacle: true,
            scoreValue: 10,
            vx: -scrollSpeed,
            spriteType: 'car' // default
        };

        const rand = Math.random();
        const isAir = Math.random() > 0.6;

        if (level === 'rooftop') {
            // ROOFTOP LEVEL ENEMIES
            if (!isAir) {
                // Ground (Rooftop surface)
                if (rand < 0.4) {
                    // Worker
                    enemy.spriteType = 'worker';
                    enemy.isTarget = true;
                    enemy.width = 50;
                    enemy.height = 80;
                    enemy.y = groundY - 70;
                    enemy.scoreValue = 40;
                } else if (rand < 0.7) {
                    // Cat
                    enemy.spriteType = 'cat';
                    enemy.isTarget = true;
                    enemy.width = 60;
                    enemy.height = 50;
                    enemy.y = groundY - 50; // On roof surface
                    enemy.vx = -scrollSpeed - 1; // Running
                    enemy.scoreValue = 60;
                } else {
                    // AC Unit (Obstacle)
                    enemy.spriteType = 'ac_unit';
                    enemy.isTarget = false; // Can't poop on AC? Or maybe just obstacle. Let's make it obstacle.
                    enemy.isObstacle = true;
                    enemy.width = 70;
                    enemy.height = 70;
                    enemy.y = groundY - 60;
                }
            } else {
                // Air
                // Drone L2 (Flying)
                enemy.spriteType = 'drone_l2';
                enemy.isTarget = true;
                enemy.isObstacle = true;
                enemy.y = 20 + Math.random() * (groundY - 170);
                enemy.width = 70;
                enemy.height = 50;
                enemy.vx = -scrollSpeed * 1.3;
                }
                } else if (level === 'park') {
                // PARK LEVEL ENEMIES
                if (!isAir) {
                // Ground
                if (rand < 0.4) {
                    // Squirrel (Fast runner)
                    enemy.spriteType = 'squirrel';
                    enemy.isTarget = true;
                    enemy.width = 60;
                    enemy.height = 60;
                    enemy.y = groundY - 60;
                    enemy.vx = -scrollSpeed * 1.5; // Fast!
                    enemy.scoreValue = 50;
                } else if (rand < 0.7) {
                    // Trash Can with Raccoon (Background/Obstacle)
                    enemy.spriteType = 'trash_can';
                    enemy.isTarget = true; 
                    enemy.isObstacle = true;
                    enemy.width = 50;
                    enemy.height = 70;
                    enemy.y = groundY - 70; // Slightly higher for "background" feel? Or just on ground.
                    enemy.vx = -scrollSpeed; // Normal speed
                    enemy.scoreValue = 40;
                } else {
                    // Snail (Slow, obstacle mainly?)
                    enemy.spriteType = 'snail';
                    enemy.isTarget = true;
                    enemy.width = 50;
                    enemy.height = 40;
                    enemy.y = groundY - 40;
                    enemy.vx = -scrollSpeed * 0.4; // Very Slow
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
                enemy.vx = -scrollSpeed * 1.2;
                }
                } else {
                // DOWNTOWN LEVEL ENEMIES (Original)
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
                    enemy.isTarget = true;
                    enemy.isObstacle = true;
                    enemy.width = 50;
                    enemy.height = 80;
                    enemy.y = groundY - 70;
                } else {
                    // Dog
                    enemy.spriteType = 'dog';
                    enemy.isTarget = true; // Neutral/Obstacle
                    enemy.isObstacle = true;
                    enemy.width = 40;
                    enemy.height = 40;
                    enemy.y = groundY - 30;
                }
            } else {
                // Air
                if (Math.random() < 0.5) {
                    enemy.spriteType = 'eagle';
                    enemy.isTarget = true;
                    enemy.isObstacle = true;
                    // Spawn slightly lower (approx 1cm / 50px)
                    enemy.y = 50 + Math.random() * (groundY - 270);
                    enemy.width = 80;
                    enemy.height = 60;
                    enemy.vx = -scrollSpeed * 1.5;
                } else {
                    enemy.spriteType = 'drone';
                    enemy.isTarget = true;
                    enemy.isObstacle = true;
                    enemy.y = 20 + Math.random() * (groundY - 170);
                    enemy.width = 60;
                    enemy.height = 40;
                    enemy.vx = -scrollSpeed * 1.2;
                }
            }
        }

        enemies.push(enemy);
    };

    const spawnPowerup = (width, height) => {
        const state = gameStateRef.current;
        if (Math.random() > 0.01) return;

        const typeRand = Math.random();
        let type = 'coin';
        if (typeRand > 0.85) type = 'energy';
        else if (typeRand > 0.7) type = 'ammo';

        state.powerups.push({
            x: width + 50,
            y: 20 + Math.random() * (height * 0.6 - 40) + 50,
            width: 40,
            height: 40,
            type,
            vx: -state.scrollSpeed,
            active: true
        });
    };

    const spawnMilestoneCoins = (width, height, numRows) => {
        const state = gameStateRef.current;
        const groundY = height * GROUND_Y_PCT;
        const spacing = 70; // Vertical spacing between coins
        const startY = 100; // Start from top (80 + 20px margin)

        // Spawn multiple columns for visibility
        for (let col = 0; col < 3; col++) {
            for (let row = 0; row < numRows; row++) {
                const y = startY + (row * spacing);
                if (y < groundY - 50) { // Don't spawn too close to ground
                    state.powerups.push({
                        x: width - 100 + (col * 60), // Spawn closer, spread horizontally
                        y: y,
                        width: 45,
                        height: 45,
                        type: 'coin',
                        vx: -state.scrollSpeed * 0.8, // Slower than enemies
                        active: true
                    });
                }
            }
        }
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

        const effectiveConfig = getEffectiveConfig();

        // Increase difficulty (scaled by speed multiplier so quick doesn't get impossible too fast)
        state.scrollSpeed += (0.0005 * effectiveConfig.speedMultiplier);
        state.distance += (state.scrollSpeed / 10);
        state.animFrame++; // Tick animation

        // Check for distance milestones
        const currentMilestone = Math.floor(state.distance / 1000);
        if (currentMilestone > state.lastMilestone && currentMilestone <= 10) {
            state.lastMilestone = currentMilestone;
            spawnMilestoneCoins(width, height, currentMilestone);
            createParticles(width/2, height/2, '#FFD700', 20); // Celebrate milestone
        }

        // Process Burst Fire Queue
        const now = performance.now();
        if (state.shotQueue.length > 0) {
            // Find shots that are due
            const dueShots = state.shotQueue.filter(t => t <= now);
            // Keep shots that are future
            state.shotQueue = state.shotQueue.filter(t => t > now);
            
            dueShots.forEach(() => {
                 state.poops.push({
                    x: state.player.x,
                    y: state.player.y + 20,
                    vx: 2,
                    vy: 5,
                    active: true
                });
            });
        }

        // Player Physics
        // Gravity removed for direct control. Position is updated via movePlayer()
        // Decay visual velocity for smooth rotation return to 0
        if (!state.inputActive) {
            state.player.vy *= 0.5;
        }

        // Floor/Ceiling collision
        const groundY = height * GROUND_Y_PCT;
        const topMargin = 20;
        const bottomMargin = 20;
        const deathZone = 20; // Bottom death zone

        // Check death zone at bottom
        if (state.player.y > height - deathZone) {
            state.health = 0;
            createParticles(state.player.x, state.player.y, '#FF0000', 20);
            onHealthUpdate(0);
        }

        if (state.player.y > groundY - state.player.radius - bottomMargin) {
            state.player.y = groundY - state.player.radius - bottomMargin;
            state.player.vy = 0;
        }
        if (state.player.y < state.player.radius + topMargin) {
            state.player.y = state.player.radius + topMargin;
            state.player.vy = 0;
        }

        // Poop Physics
        state.poops.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.type !== 'laser' && p.type !== 'shuriken' && p.type !== 'lightning' && p.type !== 'goldbar' && p.type !== 'bubble' && p.type !== 'batarang') {
                p.vy += GRAVITY * 0.5; // accelerate down
            }
            // Bubbles float slowly upward
            if (p.type === 'bubble') {
                p.vy -= 0.1;
            }
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

        // Natural Reload (disabled - only pickup refills now)
        // Poop must be collected, not auto-regenerate

        // Update Enemies
        const newEnemies = [];
        state.enemies.forEach(e => {
            e.x += e.vx;

            // Eagle behavior: Fly straight until middle of screen, then drop
            if (e.spriteType === 'eagle' && !e.hasDropped && e.x < width / 2) {
                e.y += 50; // Drop approx 1cm
                e.hasDropped = true;
            }



            // AC Unit Wind Logic
            if (e.spriteType === 'ac_unit') {
                if (e.windTimer === undefined) e.windTimer = Math.random() * 3000;
                e.windTimer += 16;

                if (e.isBlowing) {
                    // Blowing for 2 seconds
                    if (e.windTimer > 2000) {
                        e.isBlowing = false;
                        e.windTimer = 0;
                    }
                    // Apply Physics
                    if (state.player.x > e.x - 30 && state.player.x < e.x + e.width + 30 &&
                        state.player.y < e.y && state.player.y > e.y - 250) {
                        state.player.vy -= 0.6; // Updraft force
                    }
                } else {
                    // Idle for 3 seconds
                    if (e.windTimer > 3000) {
                        e.isBlowing = true;
                        e.windTimer = 0;
                    }
                }
            }

            // Smoke Behavior
            if (e.spriteType === 'smoke') {
                e.y += e.vy;
                e.width += 0.2;
                e.height += 0.2;
                e.vx *= 0.99; // Slow down horizontal drift? No, wind carries it.
            }
        });
        state.enemies.push(...newEnemies);

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

            // Play Sound
            if (['cop', 'granny', 'dog'].includes(e.spriteType)) {
                playSound('ouch');
            } else {
                playSound('explosion');
            }

            // Special Effect for Dog/Cat/Snail: Rapid Fire (Triple Shot)
            if (e.spriteType === 'dog' || e.spriteType === 'cat' || e.spriteType === 'snail') {
                state.rapidFireUntil = performance.now() + 5000;
                createParticles(e.x + e.width/2, e.y + e.height/2, '#FF00FF', 15); // Special purple particles
            }

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
            onScoreUpdate(state.score, state.coins, Math.floor(state.distance));
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
                    // Deduct points as requested
                    state.score = Math.max(0, state.score - 50);

                    createParticles(state.player.x, state.player.y, '#FF0000', 10);
                    onHealthUpdate(state.health);
                    onScoreUpdate(state.score, state.coins, Math.floor(state.distance)); // Update score display

                    if (state.health <= 0) {
                        state.isPlaying = false;
                        AUDIOS.current.bgm.pause();
                        AUDIOS.current.bgm.currentTime = 0;
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
                    const effectiveConfig = getEffectiveConfig();
                    const toAdd = Math.min(3, effectiveConfig.maxPoops - state.currentPoops);
                    state.currentPoops = Math.min(effectiveConfig.maxPoops, state.currentPoops + toAdd);
                    if (onAmmoUpdate) onAmmoUpdate(state.currentPoops);
                    createParticles(state.player.x, state.player.y, '#8B4513', 8);
                } else if (p.type === 'energy') {
                    state.health = Math.min(100, state.health + 20);
                    onHealthUpdate(state.health);
                    createParticles(state.player.x, state.player.y, '#00FFFF', 8);
                }
                onScoreUpdate(state.score, state.coins, Math.floor(state.distance));
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

        // --- BACKGROUND RENDERING ---
        if (assetsLoaded.current && IMAGES.current.background) {
            const bg = IMAGES.current.background;
            // Cover screen, maintain aspect ratio to fill
            const scale = Math.max(width / bg.width, height / bg.height);
            const w = bg.width * scale;
            const h = bg.height * scale;
            
            // Scroll at game speed (10x distance unit)
            const offset = (state.distance * 10) % w; 
            
            ctx.drawImage(bg, -offset, 0, w, h);
            ctx.drawImage(bg, w - offset, 0, w, h);
            if (w - offset < width) {
                ctx.drawImage(bg, (w * 2) - offset, 0, w, h);
            }
        } else {
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(0, 0, width, height);
        }

        // Draw Player
        if (assetsLoaded.current) {
            if (state.health <= 0) {
                // Draw Dead Player
                const deadImg = IMAGES.current.playerDead;
                const playerSize = 90;
                ctx.save();
                ctx.translate(state.player.x, state.player.y);
                ctx.rotate(Math.PI / 4); // Tilt down
                ctx.drawImage(deadImg, -playerSize/2, -playerSize/2, playerSize, playerSize);
                ctx.restore();
            } else {
                // Always draw flying player
                const playerSize = 90;
                ctx.save();
                ctx.translate(state.player.x, state.player.y);

                // Rotation based on vertical velocity
                const rotation = Math.min(Math.max(state.player.vy * 0.05, -0.4), 0.4);
                ctx.rotate(rotation);

                // Use custom skin if available, otherwise default
                const playerImage = (skin && skin !== 'default' && IMAGES.current.customSkin.complete && IMAGES.current.customSkin.src) 
                    ? IMAGES.current.customSkin 
                    : IMAGES.current.playerGlide;

                ctx.drawImage(playerImage, -playerSize/2, -playerSize/2, playerSize, playerSize);
                ctx.restore();
            }
        } else {
            ctx.fillText('🐦', state.player.x, state.player.y);
        }

        // Draw Poops
        state.poops.forEach(p => {
            if (p.active) {
                 if (assetsLoaded.current) {
                    ctx.save();
                    ctx.translate(p.x, p.y);

                    if (p.type === 'laser') {
                        // Draw laser beam
                        ctx.shadowColor = '#ff00ff';
                        ctx.shadowBlur = 15;
                        ctx.fillStyle = '#ff00ff';
                        ctx.fillRect(-p.width/2, -p.height/2, p.width, p.height);
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(-p.width/2 + 5, -p.height/2 + 2, p.width - 10, p.height - 4);
                        ctx.shadowBlur = 0;
                    } else if (p.type === 'lightning') {
                        // Draw lightning bolt
                        ctx.shadowColor = '#00ffff';
                        ctx.shadowBlur = 20;
                        ctx.strokeStyle = '#00ffff';
                        ctx.lineWidth = 4;
                        ctx.beginPath();
                        ctx.moveTo(-p.width/2, -p.height/2);
                        ctx.lineTo(-p.width/4, 0);
                        ctx.lineTo(p.width/4, -p.height/4);
                        ctx.lineTo(p.width/2, p.height/2);
                        ctx.stroke();
                        ctx.strokeStyle = '#ffffff';
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.moveTo(-p.width/2, -p.height/2);
                        ctx.lineTo(-p.width/4, 0);
                        ctx.lineTo(p.width/4, -p.height/4);
                        ctx.lineTo(p.width/2, p.height/2);
                        ctx.stroke();
                        ctx.shadowBlur = 0;
                        } else if (p.type === 'goldbar') {
                            // Draw gold bar with rotation
                            ctx.rotate(state.animFrame * 0.15);
                            ctx.shadowColor = '#ffd700';
                            ctx.shadowBlur = 15;

                            // Outer gold bar
                            ctx.fillStyle = '#ffd700';
                            ctx.fillRect(-p.width/2, -p.height/2, p.width, p.height);

                            // Inner highlight
                            ctx.fillStyle = '#ffed4e';
                            ctx.fillRect(-p.width/2 + 2, -p.height/2 + 2, p.width - 4, p.height - 4);

                            // Dark edge for depth
                            ctx.fillStyle = '#b8860b';
                            ctx.fillRect(p.width/2 - 2, -p.height/2, 2, p.height);
                            ctx.fillRect(-p.width/2, p.height/2 - 2, p.width, 2);

                            ctx.shadowBlur = 0;
                            } else if (p.type === 'candycane') {
                            // Draw rotating candy cane
                            ctx.rotate(state.animFrame * 0.25);
                            ctx.shadowColor = '#dc2626';
                            ctx.shadowBlur = 10;

                            // Red and white stripes
                            ctx.fillStyle = '#dc2626';
                            ctx.fillRect(-p.width/2, -p.height/2, p.width, p.height);

                            // White stripes
                            ctx.fillStyle = '#ffffff';
                            for (let i = 0; i < 3; i++) {
                                const offset = (i * p.width / 3) - p.width/2;
                                ctx.fillRect(offset, -p.height/2, p.width/6, p.height);
                            }

                            // Curved top like candy cane
                            ctx.beginPath();
                            ctx.arc(-p.width/3, -p.height/2, p.width/4, 0, Math.PI * 2);
                            ctx.fillStyle = '#dc2626';
                            ctx.fill();
                            ctx.beginPath();
                            ctx.arc(-p.width/3, -p.height/2, p.width/5, 0, Math.PI * 2);
                            ctx.fillStyle = '#ffffff';
                            ctx.fill();

                            ctx.shadowBlur = 0;
                            } else if (p.type === 'bubble') {
                            // Draw soap bubble with rainbow shimmer
                            const bubbleScale = 1 + Math.sin(state.animFrame * 0.15) * 0.1;
                            ctx.scale(bubbleScale, bubbleScale);

                            // Outer bubble
                            ctx.shadowColor = '#ec4899';
                            ctx.shadowBlur = 15;
                            ctx.fillStyle = 'rgba(236, 72, 153, 0.3)';
                            ctx.beginPath();
                            ctx.arc(0, 0, p.width/2, 0, Math.PI * 2);
                            ctx.fill();

                            // Inner lighter layer
                            ctx.fillStyle = 'rgba(244, 114, 182, 0.5)';
                            ctx.beginPath();
                            ctx.arc(-p.width/8, -p.height/8, p.width/3, 0, Math.PI * 2);
                            ctx.fill();

                            // Highlight shimmer
                            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                            ctx.beginPath();
                            ctx.arc(-p.width/6, -p.height/6, p.width/6, 0, Math.PI * 2);
                            ctx.fill();

                            // Outline
                            ctx.strokeStyle = 'rgba(236, 72, 153, 0.6)';
                            ctx.lineWidth = 2;
                            ctx.beginPath();
                            ctx.arc(0, 0, p.width/2, 0, Math.PI * 2);
                            ctx.stroke();

                            ctx.shadowBlur = 0;
                            } else if (p.type === 'batarang') {
                            // Draw batarang (Batman throwing knife)
                            ctx.rotate(state.animFrame * 0.35);
                            ctx.shadowColor = '#1f2937';
                            ctx.shadowBlur = 12;

                            // Bat wing shape
                            ctx.fillStyle = '#1f2937';
                            ctx.beginPath();
                            // Left wing
                            ctx.moveTo(0, 0);
                            ctx.quadraticCurveTo(-p.width/2, -p.height/4, -p.width/2, p.height/3);
                            ctx.quadraticCurveTo(-p.width/3, p.height/4, 0, 0);
                            // Right wing
                            ctx.moveTo(0, 0);
                            ctx.quadraticCurveTo(p.width/2, -p.height/4, p.width/2, p.height/3);
                            ctx.quadraticCurveTo(p.width/3, p.height/4, 0, 0);
                            ctx.fill();

                            // Yellow/gold accents
                            ctx.fillStyle = '#fbbf24';
                            ctx.beginPath();
                            ctx.arc(0, 0, p.width / 8, 0, Math.PI * 2);
                            ctx.fill();

                            // Sharp edges highlight
                            ctx.strokeStyle = '#4b5563';
                            ctx.lineWidth = 2;
                            ctx.beginPath();
                            ctx.moveTo(-p.width/2, p.height/3);
                            ctx.lineTo(0, 0);
                            ctx.lineTo(p.width/2, p.height/3);
                            ctx.stroke();

                            ctx.shadowBlur = 0;
                            } else if (p.type === 'shuriken') {
                            // Draw ninja star (shuriken)
                            ctx.rotate(state.animFrame * 0.3);
                            ctx.shadowColor = '#94a3b8';
                            ctx.shadowBlur = 10;

                            // Draw 4-pointed star
                            ctx.fillStyle = '#cbd5e1';
                            ctx.beginPath();
                            for (let i = 0; i < 4; i++) {
                                const angle = (i * Math.PI / 2) - Math.PI / 4;
                                const r = p.width / 2;
                                ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
                                ctx.lineTo(Math.cos(angle + Math.PI / 4) * (r * 0.4), Math.sin(angle + Math.PI / 4) * (r * 0.4));
                            }
                            ctx.closePath();
                            ctx.fill();

                            // Bright silver center
                            ctx.fillStyle = '#f1f5f9';
                            ctx.beginPath();
                            ctx.arc(0, 0, p.width / 6, 0, Math.PI * 2);
                            ctx.fill();

                            ctx.shadowBlur = 0;
                    } else {
                        const img = IMAGES.current.poopProjectile;
                        // Spin the poop!
                        ctx.rotate(state.animFrame * 0.2);

                        // Draw full image
                        if (p.type === 'triple' && IMAGES.current.poopTriple) {
                            ctx.drawImage(IMAGES.current.poopTriple, -p.width/2, -p.height/2, p.width, p.height);
                        } else {
                            ctx.drawImage(img, -p.width/2, -p.height/2, p.width, p.height);
                        }
                    }
                    ctx.restore();
                    } else {
                    ctx.fillText('💩', p.x, p.y);
                    }
            }
        });

        // Draw Enemies
        state.enemies.forEach(e => {
            if (assetsLoaded.current && e.spriteType) {
                let sheet, sx, sy, sw, sh;
                
                // Helper for single image sprites
                const useFullImage = (img) => {
                    sheet = img;
                    sx = 0; sy = 0; sw = img.width; sh = img.height;
                };

                if (e.spriteType === 'eagle') useFullImage(IMAGES.current.eagle);
                else if (e.spriteType === 'cop') useFullImage(IMAGES.current.cop);
                else if (e.spriteType === 'granny') useFullImage(IMAGES.current.granny);
                else if (e.spriteType === 'car') useFullImage(IMAGES.current.car);
                else if (e.spriteType === 'drone') useFullImage(IMAGES.current.drone);
                else if (e.spriteType === 'dog') useFullImage(IMAGES.current.dog);
                else if (e.spriteType === 'worker') useFullImage(IMAGES.current.worker);
                else if (e.spriteType === 'cat') useFullImage(IMAGES.current.cat);
                else if (e.spriteType === 'ac_unit') useFullImage(IMAGES.current.ac_unit);
                else if (e.spriteType === 'seagull') useFullImage(IMAGES.current.seagull);
                else if (e.spriteType === 'drone_l2') useFullImage(IMAGES.current.drone_l2);
                else if (e.spriteType === 'squirrel') useFullImage(IMAGES.current.squirrel);
                else if (e.spriteType === 'snail') useFullImage(IMAGES.current.snail);
                else if (e.spriteType === 'fly') useFullImage(IMAGES.current.fly);
                else if (e.spriteType === 'trash_can') useFullImage(IMAGES.current.trash_can);
                else {
                    // Fallback to sheet (e.g. for dog or future ones)
                    sheet = IMAGES.current.enemiesSheet;
                    const frames = SPRITE_MAP.enemies[e.spriteType] || SPRITE_MAP.enemies.car;
                    const def = frames[0]; 
                    sx = def.x * sheet.width;
                    sy = def.y * sheet.height;
                    sw = def.w * sheet.width;
                    sh = def.h * sheet.height;
                }
                
                ctx.save();
                ctx.translate(e.x + e.width/2, e.y + e.height/2);
                
                // Simple animations based on type
                if (e.spriteType === 'car' || e.spriteType === 'cop') {
                    // Bounce
                    ctx.translate(0, Math.sin(state.animFrame * 0.5) * 2);
                } else if (e.spriteType === 'granny' || e.spriteType === 'snail') {
                    // Waddle / crawl
                    ctx.rotate(Math.sin(state.animFrame * 0.2) * 0.1);
                } else if (e.spriteType === 'fly') {
                    // Buzzing erratic
                    ctx.translate(Math.sin(state.animFrame * 0.8) * 5, Math.cos(state.animFrame * 0.8) * 5);
                } else if (e.spriteType === 'squirrel') {
                    // Hop
                    ctx.translate(0, Math.abs(Math.sin(state.animFrame * 0.4)) * -10);
                    }
                    // Chimney drawing removed for cat as requested (sitting on background chimney)

                    // Special drawing for Trash Can (Raccoon jumping out)
                    if (e.spriteType === 'trash_can') {
                    // 1. Draw Raccoon jumping (behind the can effectively if we want it popping out, 
                    // but since we can't clip easily without complex canvas, let's draw it BEHIND the can layer-wise or just on top moving up)
                    // "Aus der Tonne springen" - best effect: Raccoon moves up/down relative to can.
                    // We'll draw the raccoon first (behind), then the can? Or just on top?
                    // Let's try: Draw Can. Draw Raccoon moving up/down *behind* the can's front? 
                    // Simplest: Draw Raccoon behind can, moving Y.

                    const jumpOffset = Math.abs(Math.sin(state.animFrame * 0.1)) * 40; // 0 to 40px up

                    // Draw Raccoon
                    if (IMAGES.current.raccoon) {
                        const rW = 50; 
                        const rH = 50;
                        ctx.drawImage(
                            IMAGES.current.raccoon, 
                            -rW/2, 
                            -e.height/2 - jumpOffset + 10, // Start slightly inside
                            rW, 
                            rH
                        );

                        // Label "Jan"
                        ctx.fillStyle = 'white';
                        ctx.font = 'bold 10px Arial';
                        ctx.textAlign = 'center';
                        ctx.shadowColor = 'black';
                        ctx.shadowBlur = 2;
                        ctx.fillText('Jan', 0, e.height/2 + 15); // Below the can
                        }

                    // Draw Can (Covering the bottom of raccoon?)
                    // We need the raccoon to appear from *inside*.
                    // So we draw the Can ON TOP of the lower part of the raccoon.
                    // But the can image is the whole can. 
                    // So simply drawing the can *after* the raccoon should hide the raccoon when it's "down" if the can image is opaque.
                    ctx.drawImage(sheet, sx, sy, sw, sh, -e.width/2, -e.height/2, e.width, e.height);

                    } else if (e.spriteType !== 'smoke') {
                        ctx.drawImage(sheet, sx, sy, sw, sh, -e.width/2, -e.height/2, e.width, e.height);
                        } else {
                    // Draw Smoke
                    ctx.fillStyle = 'rgba(150, 150, 150, 0.8)';
                    ctx.beginPath();
                    ctx.arc(0, 0, e.width/2, 0, Math.PI*2);
                    ctx.fill();
                    ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';
                    ctx.beginPath();
                    ctx.arc(5, -5, e.width/3, 0, Math.PI*2);
                    ctx.fill();
                }

                // Draw AC Wind Effects
                if (e.spriteType === 'ac_unit' && e.isBlowing) {
                    ctx.strokeStyle = 'rgba(200, 255, 255, 0.4)';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    const t = state.animFrame * 0.2;
                    for(let i=-1; i<=1; i++) {
                        const xOff = i * 15 + Math.sin(t + i) * 5;
                        const yOff = (state.animFrame * 2 + i * 20) % 100; // Moving up
                        ctx.moveTo(xOff, -e.height/2 - yOff);
                        ctx.lineTo(xOff, -e.height/2 - yOff - 30);
                    }
                    ctx.stroke();
                }

                ctx.restore();
                } else {
                ctx.font = '30px serif';
                ctx.fillText('📦', e.x + e.width/2, e.y + e.height/2);
            }
        });

        // Draw Powerups
        state.powerups.forEach(p => {
            if (!p.active) return;

            if (p.type === 'coin' && assetsLoaded.current) {
                const scale = 1 + Math.sin(state.animFrame * 0.1) * 0.1;
                ctx.save();
                ctx.translate(p.x + p.width/2, p.y + p.height/2);
                ctx.scale(scale, scale);
                ctx.drawImage(IMAGES.current.coin, -p.width/2, -p.height/2, p.width, p.height);
                ctx.restore();
            }
            else if (p.type === 'energy' && assetsLoaded.current) {
                const scale = 1 + Math.sin(state.animFrame * 0.1) * 0.1;
                ctx.save();
                ctx.translate(p.x + p.width/2, p.y + p.height/2);
                ctx.scale(scale, scale);
                ctx.drawImage(IMAGES.current.energyIcon, -p.width/2, -p.height/2, p.width, p.height);
                ctx.restore();
            }
            else if (p.type === 'ammo' && assetsLoaded.current) {
                const scale = 1 + Math.sin(state.animFrame * 0.1) * 0.1;
                ctx.save();
                ctx.translate(p.x + p.width/2, p.y + p.height/2);
                ctx.scale(scale, scale);
                ctx.drawImage(IMAGES.current.ammoIcon, -p.width/2, -p.height/2, p.width, p.height);
                ctx.restore();
            }
            else {
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
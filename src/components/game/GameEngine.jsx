import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { spawnRooftopEnemy } from './levels/rooftop';
import { spawnParkEnemy } from './levels/park';
import { spawnLondonEnemy } from './levels/london';
import { spawnParisEnemy } from './levels/paris';
import { spawnMadridEnemy } from './levels/madrid';
import { spawnRomeEnemy } from './levels/rome';
import { spawnGelsenkirchenEnemy } from './levels/gelsenkirchen';
import { spawnBerlinEnemy } from './levels/berlin';

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

const GameEngine = forwardRef(({ onGameOver, onScoreUpdate, onHealthUpdate, onComboUpdate, onAmmoUpdate, config = {}, skin = 'default', level = 'downtown', gameSpeed = 'normal', difficultyMultiplier = 1, musicEnabled = true, soundEnabled = true, onAssetsLoaded }, ref) => {
    const canvasRef = useRef(null);
    const assetsLoaded = useRef(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const AUDIOS = useRef({
        bgm: new Audio("https://codeskulptor-demos.commondatastorage.googleapis.com/GalaxyInvaders/theme_01.mp3"),
        fart: new Audio("https://www.soundjay.com/birds/sounds/hawk-screech-1.mp3"),
        explosion: new Audio("https://www.soundjay.com/nature/sounds/water-splash-1.mp3"),
        ouch: new Audio("https://www.myinstants.com/media/sounds/roblox-death-sound_1.mp3")
    });

    const IMAGES = useRef({
        background: new Image(),
        background2: new Image(), // Second background layer
        londonForeground1: new Image(), // London scrolling foreground 1
        londonForeground2: new Image(), // London scrolling foreground 2
        londonForeground3: new Image(), // London scrolling foreground 3
        rooftopForeground1: new Image(), // Rooftop scrolling foreground 1
        rooftopForeground2: new Image(), // Rooftop scrolling foreground 2
        rooftopForeground3: new Image() // Rooftop scrolling foreground 3
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
        } else if (level === 'london') {
            musicUrl = "https://codeskulptor-demos.commondatastorage.googleapis.com/sounddogs/soundtrack.mp3";
        } else if (level === 'paris') {
            musicUrl = "https://codeskulptor-demos.commondatastorage.googleapis.com/GalaxyInvaders/theme_01.mp3";
        } else if (level === 'rome') {
            musicUrl = "https://codeskulptor-demos.commondatastorage.googleapis.com/pang/paza-moduless.mp3";
        }

        const fullMusicUrl = musicUrl.startsWith('http') ? musicUrl : `https://codeskulptor-demos.commondatastorage.googleapis.com/${musicUrl}`;
        
        if (AUDIOS.current.bgm.src !== fullMusicUrl) {
            AUDIOS.current.bgm.src = fullMusicUrl;
            AUDIOS.current.bgm.load();
            if (gameStateRef.current.isPlaying && musicEnabled) {
                AUDIOS.current.bgm.play().catch(e => console.log("BGM Play prevented"));
            }
        }
    }, [level, musicEnabled]);

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
        // Load Images - create new Image object to force reload
        IMAGES.current.background = new Image();
        if (level === 'park') {
            IMAGES.current.background.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/e2de8800c_Level3Park.png";
        } else if (level === 'london') {
            IMAGES.current.background.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/7786d17f6_ChatGPTImage7Jan202610_45_40.png";
        } else if (level === 'paris') {
            IMAGES.current.background.src = "";
        } else if (level === 'rooftop') {
            IMAGES.current.background.src = "";
            IMAGES.current.rooftopBackground = new Image();
            IMAGES.current.rooftopBackground.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/f77ca6e93_Hintergrund.png";
            IMAGES.current.rooftopStreet = new Image();
            IMAGES.current.rooftopStreet.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/8143c6294_Ebene2.png";
        } else if (level === 'gelsenkirchen') {
            // Gelsenkirchen - New 5-layer structure
            IMAGES.current.background.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/5d06e0a92_Hintergrund.png";
            IMAGES.current.gelsenkirchenSidewalk = new Image();
            IMAGES.current.gelsenkirchenSidewalk.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/cafe8eadb_Gehweg.png";
        } else if (level === 'berlin') {
            // Berlin - Fixed background
            IMAGES.current.background.src = "";
        } else {
            // Downtown/Gelsenkirchen - New 5-layer structure
            IMAGES.current.background.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/2ea91ee38_ChatGPTImage20Jan202617_45_17.png";
        }

        IMAGES.current.playerSheet.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/59fa7a8db_FrnkdieTaube2-Kopie.png";
        IMAGES.current.playerGlide.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/71a9e1eb7_frnkoriginal.png";
        IMAGES.current.playerDead.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/ae2c71989_FrnkdieTaube4-Kopie.png";
        IMAGES.current.playerGround.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/dc76f3fcb_FrnkdieTaube5-Kopie.png";
        IMAGES.current.background2.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/d5ce2c1d7_ChatGPTImage7Jan202610_04_15.png";
        IMAGES.current.enemiesSheet.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/c18e80915_ChatGPTImage3Dez202518_18_31.png";
        IMAGES.current.uiAtlas.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/8759edce6_ChatGPTImage3Dez202518_37_35.png";
        IMAGES.current.eagle.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/4d3c96004_file_00000000e518720cb81ddd8c61248547.png";
        IMAGES.current.cop.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/fbf63d394_file_00000000cca471f5b646734e98c18298.png";
        IMAGES.current.granny.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/4acddf445_Frnk-icon1.png";
        IMAGES.current.car.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/6beb89d0d_Frnk-icon4.png";
        IMAGES.current.drone.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/d41521585_ChatGPTImage7Jan202612_01_33.png";
        IMAGES.current.sparrow = new Image();
        IMAGES.current.sparrow.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/06e3cfcff_Spatz.png";
        IMAGES.current.rooftop_pigeon = new Image();
        IMAGES.current.rooftop_pigeon.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/d902779c0_NPC-1-Kopie.png";
        IMAGES.current.rooftop_ninja = new Image();
        IMAGES.current.rooftop_ninja.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/0af6f95de_NPC-2--Kopie4.png";
        IMAGES.current.rooftop_sunbather = new Image();
        IMAGES.current.rooftop_sunbather.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/dbfb3d391_NPC-2--Kopie2.png";
        IMAGES.current.rooftop_fitness = new Image();
        IMAGES.current.rooftop_fitness.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/2cc71654e_NPC-2--Kopie6.png";
        IMAGES.current.rooftop_worker2 = new Image();
        IMAGES.current.rooftop_worker2.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/f29b2df1a_NPC-2--Kopie5.png";
        IMAGES.current.rooftop_ninja2 = new Image();
        IMAGES.current.rooftop_ninja2.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/984764d87_NPC-2--Kopie8.png";
        IMAGES.current.rooftop_ac2 = new Image();
        IMAGES.current.rooftop_ac2.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/45b059c60_NPC-2--Kopie3.png";
        IMAGES.current.rooftop_plant1 = new Image();
        IMAGES.current.rooftop_plant1.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/ba27f8b2c_Pflanzen-Kopie.png";
        IMAGES.current.rooftop_plant2 = new Image();
        IMAGES.current.rooftop_plant2.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/a6b861e55_Pflanzen-Kopie7.png";
        IMAGES.current.rooftop_plant3 = new Image();
        IMAGES.current.rooftop_plant3.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/de6eb187a_Pflanzen-Kopie8.png";
        IMAGES.current.dog.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/7aca9a3aa_Frnk-icon5.png";
        IMAGES.current.worker.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/f477b878f_NPC-1--Kopie.png";
        IMAGES.current.fruit_vendor = new Image();
        IMAGES.current.fruit_vendor.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/c2434ba2d_Obsthndler.png";
        IMAGES.current.cat.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/005166bcb_NPC-1--Kopie6.png";
        IMAGES.current.ac_unit.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/517f130c0_NPC-2--Kopie3.png";
        IMAGES.current.seagull.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/b66701ef4_NPC-1--Kopie5.png";
        IMAGES.current.drone_l2.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/eb4e66d17_ChatGPTImage7Jan202612_01_33.png";
        IMAGES.current.squirrel.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/34a772965_Level3sandy.png";
        IMAGES.current.snail.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/842ab2a34_Level3Schnecke.png";
        IMAGES.current.fly.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/e9811e48b_Level3wespe.png";
        IMAGES.current.raccoon.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/8bbdd27ad_Level3Waschbr.png";
        IMAGES.current.trash_can.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/606803243_Level3Tonne.png";
        
        // London Assets
        IMAGES.current.business_person = new Image();
        IMAGES.current.business_person.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/a7ef802e8_Buisnessman.png";
        IMAGES.current.tourist = new Image();
        IMAGES.current.tourist.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/2c4aec8be_Tourist.png";
        IMAGES.current.london_cop = new Image();
        IMAGES.current.london_cop.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/683f0fef7_ChatGPTImage7Jan202610_45_15.png";
        IMAGES.current.street_vendor = new Image();
        IMAGES.current.street_vendor.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/ddea851fc_Inder.png";
        IMAGES.current.street_musician = new Image();
        IMAGES.current.street_musician.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/507d69cbc_Musiker.png";
        IMAGES.current.london_car = new Image();
        IMAGES.current.london_car.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/51c40cf6b_FrnkdieTaube7-Kopie.png";
        IMAGES.current.pigeon = new Image();
        IMAGES.current.pigeon.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/88d04a76d_Level1Gegner-Kopie.png";
        IMAGES.current.balloon = new Image();
        IMAGES.current.balloon.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/61f1abf56_Level1Gegner-Kopie3.png";
        IMAGES.current.london_drone = new Image();
        IMAGES.current.london_drone.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/204dc8607_Drohne.png";
        IMAGES.current.london_pigeon = new Image();
        IMAGES.current.london_pigeon.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/ba609c1c4_Taube1.png";
        IMAGES.current.coin.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/a3d089aef_FrnkdieTaubecoin.png";
        IMAGES.current.poopProjectile.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/6fef2bdb0_Frnkkacke-Kopie-Kopie.png";
        IMAGES.current.poopTriple = new Image();
        IMAGES.current.poopTriple.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/d851cff29_Frnkkacke-Kopie.png";
        IMAGES.current.energyIcon.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/55c3a6a9f_FrnkdieTaubeicon9.png";
        IMAGES.current.laserProjectile.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/laser.png";
        IMAGES.current.ammoIcon = new Image();
        IMAGES.current.ammoIcon.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/06c8c939e_Frnkkrner.png";
        IMAGES.current.boneProjectile = new Image();
        IMAGES.current.boneProjectile.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/61f5618ec_image.png";
        IMAGES.current.paris_car = new Image();
        IMAGES.current.paris_car.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/bf69dde28_car.png";
        IMAGES.current.police_man = new Image();
        IMAGES.current.police_man.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/c72cd1a7e_police.png";
        IMAGES.current.paris_tourist = new Image();
        IMAGES.current.paris_tourist.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/0c5cdddb8_ChatGPTImage10Jan202617_03_15.png";
        IMAGES.current.watch_seller = new Image();
        IMAGES.current.watch_seller.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/c899b1ac3_watchseller.png";
        IMAGES.current.paris_mime = new Image();
        IMAGES.current.paris_mime.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/8ba5f201d_MimeArtist.png";
        IMAGES.current.paris_pigeon = new Image();
        IMAGES.current.paris_pigeon.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/2301b3f57_ChatGPTImage10Jan202618_52_29.png";
        IMAGES.current.paris_balloon = new Image();
        IMAGES.current.paris_balloon.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/71bfd2309_Baloons.png";
        IMAGES.current.londonForeground1.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/57b677041_Strasse-1.png";
        IMAGES.current.londonForeground2.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/a85523873_Strasse-2.png";
        IMAGES.current.londonForeground3.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/e5a89918f_Strasse-3.png";
        IMAGES.current.rooftopBackground = new Image();
        IMAGES.current.rooftopBackground.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/f77ca6e93_Hintergrund.png";
        IMAGES.current.parisStreet = new Image();
        IMAGES.current.parisStreet.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/25c8ad032_HintergrundStrasse.png";
        IMAGES.current.madridBackground = new Image();
        IMAGES.current.madridBackground.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/e8e4bed57_Hintergrund2.png";
        IMAGES.current.madridStreet = new Image();
        IMAGES.current.madridStreet.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/ee1bc0ec3_Strasse.png";
        IMAGES.current.madrid_waiter = new Image();
        IMAGES.current.madrid_waiter.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/14efbf717_NPCs-Kopie2.png";
        IMAGES.current.madrid_flamenco = new Image();
        IMAGES.current.madrid_flamenco.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/93179120a_NPCs-Kopie3.png";
        IMAGES.current.madrid_tourist_girl = new Image();
        IMAGES.current.madrid_tourist_girl.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/8ddcab53b_NPCs-Kopie5.png";
        IMAGES.current.madrid_flower_girl = new Image();
        IMAGES.current.madrid_flower_girl.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/949eb8bea_NPCs-Kopie7.png";
        IMAGES.current.madrid_elderly = new Image();
        IMAGES.current.madrid_elderly.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/bae882564_NPCs-Kopie.png";
        IMAGES.current.madrid_flight_attendant = new Image();
        IMAGES.current.madrid_flight_attendant.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/940bd67c4_NPC-Kopie3.png";
        IMAGES.current.madrid_boy_tourist = new Image();
        IMAGES.current.madrid_boy_tourist.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/e20a75045_NPC-Kopie5.png";
        IMAGES.current.madrid_car = new Image();
        IMAGES.current.madrid_car.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/bf69dde28_car.png";
        IMAGES.current.rome_car = new Image();
        IMAGES.current.rome_car.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/5acdb35aa_Auto.png";
        IMAGES.current.rome_tourist = new Image();
        IMAGES.current.rome_tourist.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/bf3ec66f5_NPCS-Kopie.png";
        IMAGES.current.rome_priest = new Image();
        IMAGES.current.rome_priest.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/26cf7434b_NPC-Kopie6.png";
        IMAGES.current.rome_pizza_chef = new Image();
        IMAGES.current.rome_pizza_chef.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/296df79ad_NPC-Kopie7.png";
        IMAGES.current.rome_vespa_driver = new Image();
        IMAGES.current.rome_vespa_driver.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/3c0279402_NPC-Kopie4.png";
        IMAGES.current.rome_old_lady = new Image();
        IMAGES.current.rome_old_lady.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/32cfa8ee1_NPC-Kopie2.png";
        IMAGES.current.rome_gladiator = new Image();
        IMAGES.current.rome_gladiator.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/faf37caee_NPC-Kopie.png";
        IMAGES.current.rome_couple_bench = new Image();
        IMAGES.current.rome_couple_bench.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/d65aee45d_NPCS-Kopie6.png";
        IMAGES.current.rome_couple_standing = new Image();
        IMAGES.current.rome_couple_standing.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/33cbd509e_NPCs-Kopie2.png";
        IMAGES.current.rome_musician = new Image();
        IMAGES.current.rome_musician.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/b3800614d_NPCs-Kopie3.png";
        IMAGES.current.rome_couple_bench2 = new Image();
        IMAGES.current.rome_couple_bench2.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/10899e4f8_NPCs-Kopie4-Kopie.png";
        IMAGES.current.rome_couple_vespa = new Image();
        IMAGES.current.rome_couple_vespa.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/c3a5131d6_NPCs-Kopie4.png";
        IMAGES.current.rome_girl_basket = new Image();
        IMAGES.current.rome_girl_basket.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/1d86a757a_NPCs-Kopie5-Kopie.png";
        IMAGES.current.rome_bird1 = new Image();
        IMAGES.current.rome_bird1.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/21b926600_Vogel-.png";
        IMAGES.current.rome_bird2 = new Image();
        IMAGES.current.rome_bird2.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/102f5692b_Vogel-Kopie2.png";
        IMAGES.current.rome_bird3 = new Image();
        IMAGES.current.rome_bird3.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/31b13c267_Vogel-Kopie3.png";
        IMAGES.current.rome_bird4 = new Image();
        IMAGES.current.rome_bird4.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/7e3809d80_Vogel-Kopie4.png";
        IMAGES.current.rome_bird5 = new Image();
        IMAGES.current.rome_bird5.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/f6464c319_Vogel-Kopie6.png";
        IMAGES.current.madrid_balloon = new Image();
        IMAGES.current.madrid_balloon.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/71bfd2309_Baloons.png";
        IMAGES.current.madrid_pigeon = new Image();
        IMAGES.current.madrid_pigeon.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/b8ed2c60b_Birds-Kopie.png";
        IMAGES.current.madrid_parrot = new Image();
        IMAGES.current.madrid_parrot.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/da3dee563_Birds-Kopie2.png";
        IMAGES.current.madrid_sparrow = new Image();
        IMAGES.current.madrid_sparrow.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/2a9103eb0_Birds-Kopie3.png";
        IMAGES.current.madrid_drone = new Image();
        IMAGES.current.madrid_drone.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/204dc8607_Drohne.png";

        // Gelsenkirchen NPCs
        IMAGES.current.gelsenkirchen_npc1 = new Image();
        IMAGES.current.gelsenkirchen_npc1.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/4ac8e458a_NPCs-Kopie.png";
        IMAGES.current.gelsenkirchen_npc2 = new Image();
        IMAGES.current.gelsenkirchen_npc2.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/65888fee0_NPC1.png";
        IMAGES.current.gelsenkirchen_npc3 = new Image();
        IMAGES.current.gelsenkirchen_npc3.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/e146e51fc_NPC3.png";
        IMAGES.current.gelsenkirchen_npc4 = new Image();
        IMAGES.current.gelsenkirchen_npc4.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/320e5030d_NPCs-Kopie4.png";
        IMAGES.current.gelsenkirchen_npc5 = new Image();
        IMAGES.current.gelsenkirchen_npc5.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/825453751_NPCs-Kopie5.png";
        IMAGES.current.gelsenkirchen_npc6 = new Image();
        IMAGES.current.gelsenkirchen_npc6.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/80ba153c3_NPCs-Kopie6.png";
        IMAGES.current.gelsenkirchen_npc7 = new Image();
        IMAGES.current.gelsenkirchen_npc7.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/c36442bd4_NPCs-Kopie7.png";
        IMAGES.current.gelsenkirchen_npc8 = new Image();
        IMAGES.current.gelsenkirchen_npc8.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/485892505_NPCs-Kopie8.png";
        IMAGES.current.gelsenkirchen_npc9 = new Image();
        IMAGES.current.gelsenkirchen_npc9.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/b8f91819b_NPCs-Kopie9.png";
        IMAGES.current.gelsenkirchen_npc10 = new Image();
        IMAGES.current.gelsenkirchen_npc10.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/3963cbac1_NPCs-Kopie10.png";
        IMAGES.current.gelsenkirchen_npc11 = new Image();
        IMAGES.current.gelsenkirchen_npc11.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/94afff8fe_ATA.png";
        
        // Gelsenkirchen Birds
        IMAGES.current.gelsenkirchen_bird1 = new Image();
        IMAGES.current.gelsenkirchen_bird1.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/384355eea_Vogel1-Kopie.png";
        IMAGES.current.gelsenkirchen_bird2 = new Image();
        IMAGES.current.gelsenkirchen_bird2.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/1645a294b_Vogel2.png";
        IMAGES.current.gelsenkirchen_bird3 = new Image();
        IMAGES.current.gelsenkirchen_bird3.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/b87ae8a69_Vogel3-Kopie.png";
        
        // Gelsenkirchen Drones
        IMAGES.current.gelsenkirchen_drone1 = new Image();
        IMAGES.current.gelsenkirchen_drone1.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/46a249e2b_Drohne-Kopie.png";
        IMAGES.current.gelsenkirchen_drone2 = new Image();
        IMAGES.current.gelsenkirchen_drone2.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/44c7a0181_Drohne-Kopie2.png";
        IMAGES.current.gelsenkirchen_drone3 = new Image();
        IMAGES.current.gelsenkirchen_drone3.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/21bacc964_Drohne-Kopie3.png";
        IMAGES.current.gelsenkirchen_drone4 = new Image();
        IMAGES.current.gelsenkirchen_drone4.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/87525eca0_Drohne-Kopie4.png";
        IMAGES.current.gelsenkirchen_drone5 = new Image();
        IMAGES.current.gelsenkirchen_drone5.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/43779f1a4_Drohne-Kopie5.png";
        IMAGES.current.gelsenkirchen_drone6 = new Image();
        IMAGES.current.gelsenkirchen_drone6.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/3a09ae431_Drohne-Kopie6.png";

        // Berlin NPCs
        IMAGES.current.berlin_npc1 = new Image();
        IMAGES.current.berlin_npc1.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/585e38b7e_NPCsausland-Kopie6.png";
        IMAGES.current.berlin_npc2 = new Image();
        IMAGES.current.berlin_npc2.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/307f1d6cc_NPCs-Kopie2.png";
        IMAGES.current.berlin_npc3 = new Image();
        IMAGES.current.berlin_npc3.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/da5fbd8c4_NPCs-Kopie3.png";
        IMAGES.current.berlin_npc4 = new Image();
        IMAGES.current.berlin_npc4.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/878c25123_NPCs-Kopie4.png";
        IMAGES.current.berlin_npc5 = new Image();
        IMAGES.current.berlin_npc5.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/a4b22dc4e_NPCs-Kopie5.png";
        IMAGES.current.berlin_npc6 = new Image();
        IMAGES.current.berlin_npc6.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/b03586517_NPCs-Kopie6.png";
        IMAGES.current.berlin_npc7 = new Image();
        IMAGES.current.berlin_npc7.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/b704d91a8_NPCsausland-Kopie2.png";
        IMAGES.current.berlin_npc8 = new Image();
        IMAGES.current.berlin_npc8.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/62250a871_NPCsausland-Kopie3.png";
        IMAGES.current.berlin_npc9 = new Image();
        IMAGES.current.berlin_npc9.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/70c0d25e3_NPCsausland-Kopie4.png";
        IMAGES.current.berlin_npc10 = new Image();
        IMAGES.current.berlin_npc10.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/967df675c_NPCsausland-Kopie5.png";
        
        // Berlin Birds (use gelsenkirchen birds)
        IMAGES.current.berlin_bird1 = new Image();
        IMAGES.current.berlin_bird1.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/384355eea_Vogel1-Kopie.png";
        IMAGES.current.berlin_bird2 = new Image();
        IMAGES.current.berlin_bird2.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/1645a294b_Vogel2.png";
        IMAGES.current.berlin_bird3 = new Image();
        IMAGES.current.berlin_bird3.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/b87ae8a69_Vogel3-Kopie.png";
        
        // Berlin Drones (use gelsenkirchen drones)
        IMAGES.current.berlin_drone1 = new Image();
        IMAGES.current.berlin_drone1.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/46a249e2b_Drohne-Kopie.png";
        IMAGES.current.berlin_drone2 = new Image();
        IMAGES.current.berlin_drone2.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/44c7a0181_Drohne-Kopie2.png";
        IMAGES.current.berlin_drone3 = new Image();
        IMAGES.current.berlin_drone3.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/21bacc964_Drohne-Kopie3.png";

        // Gelsenkirchen Street Holes
        IMAGES.current.gelsenkirchen_hole1 = new Image();
        IMAGES.current.gelsenkirchen_hole1.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/c7c6aee17_strassenloch1.png";
        IMAGES.current.gelsenkirchen_hole2 = new Image();
        IMAGES.current.gelsenkirchen_hole2.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/3789d288c_strassenloch2.png";

        // Gelsenkirchen Vegetation (Bushes/Trees)
        IMAGES.current.gelsenkirchen_vegetation = [
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/39dfa346d_Busch-Kopie.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/22884adb5_Busch-Kopie3.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/9e9ba4723_Busch-Kopie4.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/8658f55fe_Busch-Kopie5.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/1f21ad7a8_Busch-Kopie6.png" }
        ];
        IMAGES.current.gelsenkirchen_vegetation.forEach(veg => {
            veg.img.onerror = () => console.error('Failed to load Gelsenkirchen vegetation:', veg.src);
            veg.img.src = veg.src;
        });

        // Berlin Level
        IMAGES.current.berlinBackground = new Image();
        IMAGES.current.berlinBackground.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/00cf8f6f7_Hintergrund.png";
        IMAGES.current.berlinStreet = new Image();
        IMAGES.current.berlinStreet.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/b323ca9ea_HintergrundStrasse.png";

        // Berlin Buildings (Ebene 2.1)
        IMAGES.current.berlin_buildings = [
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/33aabd71e_HausLaden-Kopie.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/95d031b4e_HausLaden-Kopie2.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/713495504_HausLaden-Kopie3.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/0a208593d_HausLaden-Kopie4.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/53a83601a_HausLaden-Kopie5.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/e09921ce7_HausLaden-Kopie6.png" }
        ];
        IMAGES.current.berlin_buildings.forEach(building => {
            building.img.onerror = () => console.error('Failed to load Berlin building:', building.src);
            building.img.src = building.src;
        });

        // Berlin Buildings Large (Ebene 2.2 - 1.5x größer)
        IMAGES.current.berlin_buildings_large = [
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/c0c8f0b71_HausWohnen-Kopie.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/0cdcb7e23_HausOsi-Kopie5.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/eb55558fd_HausOsi-Kopie6.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/a5e5eeb1e_HausOsi-Kopie.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/732c2856b_HausWohnen-Kopie2.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/5946f869b_HausWohnen-Kopie3.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/3b196948e_HausWohnen-Kopie4.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/afc2bc45e_HausWohnen-Kopie5.png" }
        ];
        IMAGES.current.berlin_buildings_large.forEach(building => {
            building.img.onerror = () => console.error('Failed to load Berlin large building:', building.src);
            building.img.src = building.src;
        });


        
        // Downtown/Gelsenkirchen Buildings (Kneipen + Häuser)
        IMAGES.current.downtown_buildings = [
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/16f3db12f_Haus11-Kopie.png", size: 'small' },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/44ac7d542_Haus12-Kopie.png", size: 'small' },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/66aaff922_Haus17-Kopie.png", size: 'small' },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/64df19fb0_Haus18-Kopie.png", size: 'small' },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/8805c0fbf_Haus16-Kopie.png", size: 'large' },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/caf230fde_Haus7-Kopie.png", size: 'large' },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/176a375ad_Haus8-Kopie.png", size: 'large' },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/1e55abcfe_Haus9-Kopie.png", size: 'large' },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/384745fa4_Haus10-Kopie.png", size: 'large' },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/4f092b9bd_Haus13-Kopie.png", size: 'large' },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/a02066a3d_Haus14-Kopie.png", size: 'large' },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/9dd3074a2_Haus15-Kopie.png", size: 'large' },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/e9aaa6729_Haus6-Kopie.png", size: 'xlarge' },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/418b2d5bd_Haus1.png", size: 'xlarge' },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/34f35e4fb_Haus2-Kopie.png", size: 'xlarge' },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/cbfbca76f_Haus3-Kopie.png", size: 'xlarge' },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/a18420dd4_Haus4-Kopie.png", size: 'xlarge' },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/d8f92fbcf_Haus5-Kopie.png", size: 'xlarge' },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/de1220fa2_Haus5etgaen.png", size: 'xxlarge' },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/84182892a_Haus.png", size: 'xxlarge' }
        ];
        IMAGES.current.downtown_buildings.forEach(building => {
            building.img.onerror = () => console.error('Failed to load Downtown building:', building.src);
            building.img.src = building.src;
        });
        
        // Rome Assets
        IMAGES.current.romeBackground = new Image();
        IMAGES.current.romeBackground.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/562d13a4a_Hintergrund.png";

        // Rome Street
        IMAGES.current.romeStreet = new Image();
        IMAGES.current.romeStreet.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/86b7e1f7e_Street.png";

        // Rome Buildings
        IMAGES.current.rome_buildings = [
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/5f6f73bab_Haus2-Kopie.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/0d3efaf14_Haus1-Kopie2.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/b5c8bdf09_Haus1-Kopie3.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/2b6b5ac60_Haus1-Kopie4.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/ee4ecb6b5_Haus1-Kopie5.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/67ab36ce2_Haus1-Kopie6.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/a79bbf476_Haus1-Kopie.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/41f34fc19_Haus2-Kopie2.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/f7935fdf9_Haus2-Kopie3.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/9a4bab5b8_Haus2-Kopie4.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/4f9296d8b_Haus2-Kopie5.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/f1393ae2e_Haus2-Kopie6.png" }
        ];
        IMAGES.current.rome_buildings.forEach(building => {
            building.img.onerror = () => console.error('Failed to load Rome building:', building.src);
            building.img.src = building.src;
        });

        // Rome Trees
        IMAGES.current.rome_trees = [
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111550c60efef1894f9768b3/989b1364a_Pflanzen10-Kopie.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/ffa348c2e_Pflanzen3-Kopie.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/2e71626ca_Pflanzen4-Kopie.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/5e98ab898_Pflanzen5-Kopie.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/a3b1fc6e5_Pflanzen6-Kopie.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/a28b7a01e_Pflanzen7-Kopie.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/afb4070b0_Pflanzen8-Kopie.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/fca695d2d_Pflanzen9-Kopie.png" }
        ];
        IMAGES.current.rome_trees.forEach(tree => {
            tree.img.onerror = () => console.error('Failed to load Rome tree:', tree.src);
            tree.img.src = tree.src;
        });

        // Madrid Buildings
        // Paris Buildings
        IMAGES.current.paris_buildings = [
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/740df74f2_2-Vordergrund1.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/d8817be05_2-Vordergrund2.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/a863d9d95_2-Vordergrund3.png" }
        ];
        IMAGES.current.paris_buildings.forEach(building => {
            building.img.onerror = () => console.error('Failed to load Paris building:', building.src);
            building.img.src = building.src;
        });

        // Paris Trees/Bushes
        IMAGES.current.paris_trees = [
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/ce9a6acff_Hintergrund1.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/7f512e9b6_Hintergrund2.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/d8f288565_Hintergrund3.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/bf672941d_Hintergrund4.png" }
        ];
        IMAGES.current.paris_trees.forEach(tree => {
            tree.img.onerror = () => console.error('Failed to load Paris tree:', tree.src);
            tree.img.src = tree.src;
        });

        IMAGES.current.madrid_buildings = [
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/1a977495f_Haus3-Kopie3.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/800a80db8_Haus3-Kopie.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/e23877bc0_Haus1-Kopie2.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/6e57baaf4_Haus1-Kopie3.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/b22da4299_Haus1-Kopie4.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/895673462_Haus1-Kopie.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/5352275e8_Haus2-Kopie2.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/fdc86f645_Haus2-Kopie3.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/2cf0bff38_Haus2-Kopie.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/5b19c454c_Haus3-Kopie2.png" }
        ];
        IMAGES.current.madrid_buildings.forEach(building => {
            building.img.onerror = () => console.error('Failed to load building:', building.src);
            building.img.src = building.src;
        });

        // Madrid Trees/Bushes
        IMAGES.current.madrid_trees = [
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/8e8e51f72_Tree-Kopie6.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/07760b9b1_Tree-Kopie7.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/96c56d737_Tree-Kopie8.png" },
            { img: new Image(), src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/3d8f925cb_Tree-Kopie3.png" }
        ];
        IMAGES.current.madrid_trees.forEach(tree => {
            tree.img.onerror = () => console.error('Failed to load tree:', tree.src);
            tree.img.src = tree.src;
        });

        // Track all critical images that must load before game starts
        const criticalImages = [
            // Fränk (Player) - MUST load
            IMAGES.current.playerSheet,
            IMAGES.current.playerGlide,
            IMAGES.current.playerDead,
            IMAGES.current.playerGround,
            // Background
            IMAGES.current.background,
            // Essential powerups
            IMAGES.current.coin,
            IMAGES.current.poopProjectile
        ];

        // Add level-specific critical images (Background + Street)
        if (level === 'gelsenkirchen' && IMAGES.current.gelsenkirchenSidewalk) {
            criticalImages.push(IMAGES.current.gelsenkirchenSidewalk);
        }
        if (level === 'madrid') {
            if (IMAGES.current.madridBackground) criticalImages.push(IMAGES.current.madridBackground);
            if (IMAGES.current.madridStreet) criticalImages.push(IMAGES.current.madridStreet);
        }
        if (level === 'rome') {
            if (IMAGES.current.romeBackground) criticalImages.push(IMAGES.current.romeBackground);
            if (IMAGES.current.romeStreet) criticalImages.push(IMAGES.current.romeStreet);
        }
        if (level === 'rooftop') {
            if (IMAGES.current.rooftopBackground) criticalImages.push(IMAGES.current.rooftopBackground);
            if (IMAGES.current.rooftopStreet) criticalImages.push(IMAGES.current.rooftopStreet);
        }
        if (level === 'london') {
            if (IMAGES.current.londonForeground1) criticalImages.push(IMAGES.current.londonForeground1);
            if (IMAGES.current.londonForeground2) criticalImages.push(IMAGES.current.londonForeground2);
            if (IMAGES.current.londonForeground3) criticalImages.push(IMAGES.current.londonForeground3);
        }
        if (level === 'paris') {
            if (IMAGES.current.parisStreet) criticalImages.push(IMAGES.current.parisStreet);
        }

        let loadedCount = 0;
        const totalCritical = criticalImages.length;
        
        const checkLoad = () => {
            loadedCount++;
            const progress = Math.floor((loadedCount / totalCritical) * 100);
            setLoadingProgress(progress);
            
            if (loadedCount >= totalCritical) {
                assetsLoaded.current = true;
                if (onAssetsLoaded) onAssetsLoaded();
            }
        };
        
        criticalImages.forEach(img => {
            if (img && img.addEventListener) {
                img.onload = checkLoad;
                img.onerror = checkLoad; // Count errors too to avoid blocking
                // Handle cached images
                if (img.complete && img.naturalHeight > 0) checkLoad();
            } else {
                // If image is invalid, still count it to avoid blocking
                checkLoad();
            }
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
        }, [level]);

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
        player: { x: 50, y: 100, vy: 0, radius: 24 },
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
        lastMilestone: 0, // Track last milestone reached
        gelsenkirchenBuildings: [], // Gelsenkirchen scrolling buildings
        gelsenkirchenSidewalkX: 0, // Gelsenkirchen sidewalk scroll position
        gelsenkirchenHoles: [], // Gelsenkirchen street holes
        gelsenkirchenVegetation: [], // Gelsenkirchen background vegetation
        berlinBuildings: [], // Berlin scrolling buildings
        madridBuildings: [], // Madrid scrolling buildings
        madridTrees: [], // Madrid scrolling trees/buhses
        madridScenery: [], // Combined buildings and trees
        madridStreetX: 0, // Madrid street scroll position
        romeBuildings: [], // Rome scrolling buildings
        romeTrees: [], // Rome scrolling trees
        romeStreetX: 0, // Rome street scroll position
        rooftopStreetX: 0, // Rooftop street scroll position
        berlinStreetX: 0, // Berlin street scroll position
        parisStreetX: 0, // Paris street scroll position
        parisBuildings: [], // Paris scrolling buildings
        parisTrees: [] // Paris scrolling trees
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
            gameStateRef.current.gelsenkirchenBuildings = [];
            gameStateRef.current.gelsenkirchenSidewalkX = 0;
            gameStateRef.current.gelsenkirchenHoles = [];
            gameStateRef.current.gelsenkirchenVegetation = [];
            gameStateRef.current.madridBuildings = [];
            gameStateRef.current.madridTrees = [];
            gameStateRef.current.madridScenery = [];
            gameStateRef.current.madridStreetX = 0;
            gameStateRef.current.romeBuildings = [];
            gameStateRef.current.romeTrees = [];
            gameStateRef.current.romeStreetX = 0;
            gameStateRef.current.rooftopStreetX = 0;
            gameStateRef.current.parisStreetX = 0;
            gameStateRef.current.parisBuildings = [];
            gameStateRef.current.parisTrees = [];

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
            const isZombie = skin === 'zombie';
            const isGhost = skin === 'ghost';
            const isArmy = skin === 'army';
            const isWood = skin === 'wood';
            const isStone = skin === 'stone';
            const isSkeleton = skin === 'skeleton';
            const isFire = skin === 'fire';
            const isIce = skin === 'ice';

            state.poops.push({
                x: state.player.x,
                y: state.player.y + 20,
                vx: isLaser ? 8 : (isNinja ? 6 : (isAlien ? 7 : (isGold ? 5 : (isChristmas ? 6 : (isPink ? 4 : (isBat ? 7 : (isZombie ? 5 : (isGhost ? 3 : (isArmy ? 5 : (isWood ? 6 : (isStone ? 7 : (isSkeleton ? 5 : (isFire ? 6 : (isIce ? 5 : 2)))))))))))))),
                vy: isLaser ? 4 : (isNinja ? 12 : (isAlien ? 6 : (isGold ? 8 : (isChristmas ? 8 : (isPink ? 3 : (isBat ? 10 : (isZombie ? 7 : (isGhost ? 6 : (isArmy ? 6 : (isWood ? 8 : (isStone ? 9 : (isSkeleton ? 7 : (isFire ? 8 : (isIce ? 7 : 5)))))))))))))),
                active: true,
                type: isLaser ? 'laser' : (isNinja ? 'shuriken' : (isAlien ? 'lightning' : (isGold ? 'goldbar' : (isChristmas ? 'candycane' : (isPink ? 'bubble' : (isBat ? 'batarang' : (isZombie ? 'bone' : (isGhost ? 'ghost_poop' : (isArmy ? 'grenade' : (isWood ? 'plank' : (isStone ? 'stone' : (isSkeleton ? 'bone' : (isFire ? 'fireball' : (isRapidFire ? 'triple' : 'normal')))))))))))))),
                width: isLaser ? 40 : (isNinja ? 35 : (isAlien ? 45 : (isGold ? 10 : (isChristmas ? 20 : (isPink ? 25 : (isBat ? 40 : (isZombie ? 35 : (isGhost ? 30 : (isArmy ? 30 : (isWood ? 45 : (isStone ? 35 : (isSkeleton ? 35 : (isFire ? 40 : (isRapidFire ? 60 : 30)))))))))))))),
                height: isLaser ? 10 : (isNinja ? 35 : (isAlien ? 15 : (isGold ? 6 : (isChristmas ? 5 : (isPink ? 25 : (isBat ? 20 : (isZombie ? 15 : (isGhost ? 30 : (isArmy ? 30 : (isWood ? 15 : (isStone ? 35 : (isSkeleton ? 15 : (isFire ? 40 : (isRapidFire ? 60 : 30))))))))))))))
            });
        };

        pushPoop();

        // Rapid Fire Logic - Now uses special graphic instead of queueing multiple shots
        // (Queue logic removed in favor of "Triple Poop" projectile)
    };

    const spawnEnemy = (width, height) => {
        const { enemies, scrollSpeed } = gameStateRef.current;
        const groundY = height * GROUND_Y_PCT;

        let enemy;

        // Use level-specific spawn functions
        if (level === 'gelsenkirchen') {
            enemy = spawnGelsenkirchenEnemy(width, height, groundY, scrollSpeed);
        } else if (level === 'berlin') {
            enemy = spawnBerlinEnemy(width, height, groundY, scrollSpeed);
        } else if (level === 'rooftop') {
            enemy = spawnRooftopEnemy(width, height, groundY, scrollSpeed);
        } else if (level === 'park') {
            enemy = spawnParkEnemy(width, height, groundY, scrollSpeed);
        } else if (level === 'london') {
            enemy = spawnLondonEnemy(width, height, groundY, scrollSpeed);
        } else if (level === 'paris') {
            enemy = spawnParisEnemy(width, height, groundY, scrollSpeed);
        } else if (level === 'madrid') {
            enemy = spawnMadridEnemy(width, height, groundY, scrollSpeed);
        } else if (level === 'rome') {
            enemy = spawnRomeEnemy(width, height, groundY, scrollSpeed);
        } else {
            // Downtown/Gelsenkirchen
            enemy = spawnDowntownEnemy(width, height, groundY, scrollSpeed);
            
            // Handle sparrow formation special case
            if (enemy === 'sparrow_formation') {
                const sparrows = spawnSparrowFormation(width, groundY, scrollSpeed);
                enemies.push(...sparrows);
                return;
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

        // Increase difficulty (scaled by speed multiplier and deltaTime for consistent speed)
        state.scrollSpeed += (0.0005 * effectiveConfig.speedMultiplier * (deltaTime / 16));
        state.distance += (state.scrollSpeed / 10) * (deltaTime / 16);
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
            if (p.type !== 'laser' && p.type !== 'shuriken' && p.type !== 'lightning' && p.type !== 'goldbar' && p.type !== 'bubble' && p.type !== 'batarang' && p.type !== 'bone' && p.type !== 'stone' && p.type !== 'fireball' && p.type !== 'icecube') {
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

        // Madrid Street Scrolling
        if (level === 'madrid') {
            state.madridStreetX -= state.scrollSpeed;
        }

        // Rome Street Scrolling
        if (level === 'rome') {
            state.romeStreetX -= state.scrollSpeed;
        }

        // Rooftop Street Scrolling
        if (level === 'rooftop') {
            state.rooftopStreetX -= state.scrollSpeed;
        }

        // Berlin Street Scrolling
        if (level === 'berlin') {
            state.berlinStreetX -= state.scrollSpeed;
        }

        // Paris Street Scrolling
        if (level === 'paris') {
            state.parisStreetX -= state.scrollSpeed;
        }

        // Gelsenkirchen Sidewalk Scrolling
        if (level === 'gelsenkirchen') {
            state.gelsenkirchenSidewalkX -= state.scrollSpeed;
        }

        // Rome Buildings Management
        if (level === 'rome' && IMAGES.current.rome_buildings) {
            // Add new building if needed
            if (state.romeBuildings.length === 0 || state.romeBuildings[state.romeBuildings.length - 1].x < width - (500 + Math.random() * 800)) {
                const buildingData = IMAGES.current.rome_buildings[Math.floor(Math.random() * IMAGES.current.rome_buildings.length)];
                const buildingImg = buildingData?.img;

                if (buildingImg && buildingImg.complete && buildingImg.naturalHeight > 0 && buildingImg.naturalWidth > 0) {
                    const maxHeight = height * 0.5;
                    const scale = maxHeight / buildingImg.naturalHeight;
                    const buildingWidth = buildingImg.naturalWidth * scale;

                    state.romeBuildings.push({
                        x: width,
                        img: buildingImg,
                        width: buildingWidth,
                        height: maxHeight
                    });
                }
            }

            // Update positions and filter out offscreen buildings
            state.romeBuildings = state.romeBuildings.filter(building => {
                building.x -= state.scrollSpeed;
                return building.x > -building.width && 
                       building.img && 
                       building.img.complete && 
                       building.img.naturalHeight > 0 && 
                       building.img.naturalWidth > 0;
            });
        }

        // Berlin Buildings Management (beide Ebenen)
        if (level === 'berlin' && IMAGES.current.berlin_buildings && IMAGES.current.berlin_buildings_large) {
            // Add new building if needed
            if (state.berlinBuildings.length === 0 || state.berlinBuildings[state.berlinBuildings.length - 1].x < width - (400 + Math.random() * 600)) {
                // 30% Chance für Gruppe von 2-3 Häusern nebeneinander
                const spawnGroup = Math.random() < 0.3;
                const numBuildings = spawnGroup ? (2 + Math.floor(Math.random() * 2)) : 1; // 2-3 Häuser oder einzeln
                
                let currentX = width;
                for (let i = 0; i < numBuildings; i++) {
                    // 50% Chance für kleine (Ebene 2.1) oder große (Ebene 2.2) Gebäude
                    const useLarge = Math.random() < 0.5;
                    const buildingArray = useLarge ? IMAGES.current.berlin_buildings_large : IMAGES.current.berlin_buildings;
                    const buildingData = buildingArray[Math.floor(Math.random() * buildingArray.length)];
                    const buildingImg = buildingData?.img;

                    if (buildingImg && buildingImg.complete && buildingImg.naturalHeight > 0 && buildingImg.naturalWidth > 0) {
                        // Kleine Gebäude: height * 0.25, Große Gebäude: height * 0.375 (1.5x)
                        const maxHeight = useLarge ? (height * 0.5 * 0.5 * 1.5) : (height * 0.5 * 0.5);
                        const scale = maxHeight / buildingImg.naturalHeight;
                        const buildingWidth = buildingImg.naturalWidth * scale;

                        state.berlinBuildings.push({
                            x: currentX,
                            img: buildingImg,
                            width: buildingWidth,
                            height: maxHeight
                        });
                        
                        // Nächstes Haus direkt daneben (mit kleinem Abstand)
                        currentX += buildingWidth + (20 + Math.random() * 30);
                    }
                }
            }

            // Update positions and filter out offscreen buildings
            state.berlinBuildings = state.berlinBuildings.filter(building => {
                building.x -= state.scrollSpeed;
                return building.x > -building.width && 
                       building.img && 
                       building.img.complete && 
                       building.img.naturalHeight > 0 && 
                       building.img.naturalWidth > 0;
            });
        }

        // Rome Trees Management
        if (level === 'rome' && IMAGES.current.rome_trees) {
            // Add new tree if needed
            if (state.romeTrees.length === 0 || state.romeTrees[state.romeTrees.length - 1].x < width - (200 + Math.random() * 400)) {
                const treeData = IMAGES.current.rome_trees[Math.floor(Math.random() * IMAGES.current.rome_trees.length)];
                const treeImg = treeData?.img;

                if (treeImg && treeImg.complete && treeImg.naturalHeight > 0 && treeImg.naturalWidth > 0) {
                    const maxHeight = height * 0.35;
                    const scale = maxHeight / treeImg.naturalHeight;
                    const treeWidth = treeImg.naturalWidth * scale;

                    state.romeTrees.push({
                        x: width,
                        img: treeImg,
                        width: treeWidth,
                        height: maxHeight
                    });
                }
            }

            // Update positions and filter out offscreen trees
            state.romeTrees = state.romeTrees.filter(tree => {
                tree.x -= state.scrollSpeed;
                return tree.x > -tree.width && 
                       tree.img && 
                       tree.img.complete && 
                       tree.img.naturalHeight > 0 && 
                       tree.img.naturalWidth > 0;
            });
        }

        // Gelsenkirchen Vegetation Management (behind buildings)
        if (level === 'gelsenkirchen' && IMAGES.current.gelsenkirchen_vegetation) {
            // Add new vegetation if needed
            if (state.gelsenkirchenVegetation.length === 0 || state.gelsenkirchenVegetation[state.gelsenkirchenVegetation.length - 1].x < width - (400 + Math.random() * 600)) {
                const vegData = IMAGES.current.gelsenkirchen_vegetation[Math.floor(Math.random() * IMAGES.current.gelsenkirchen_vegetation.length)];
                const vegImg = vegData?.img;

                if (vegImg && vegImg.complete && vegImg.naturalHeight > 0 && vegImg.naturalWidth > 0) {
                    const vegHeight = 60 + Math.random() * 80; // Random height between 60-140
                    const scale = vegHeight / vegImg.naturalHeight;
                    const vegWidth = vegImg.naturalWidth * scale;

                    state.gelsenkirchenVegetation.push({
                        x: width,
                        img: vegImg,
                        width: vegWidth,
                        height: vegHeight
                    });
                }
            }

            // Update positions and filter out offscreen vegetation
            state.gelsenkirchenVegetation = state.gelsenkirchenVegetation.filter(veg => {
                veg.x -= state.scrollSpeed * 0.7; // Scroll slower than buildings for parallax
                return veg.x > -veg.width && 
                       veg.img && 
                       veg.img.complete && 
                       veg.img.naturalHeight > 0 && 
                       veg.img.naturalWidth > 0;
            });
        }

        // Gelsenkirchen Buildings Management
        if (level === 'gelsenkirchen' && IMAGES.current.downtown_buildings) {
            // Add new building if needed - variable spacing for variety
            const spacing = Math.random() < 0.05 ? Math.random() * 800 : (1800 + Math.random() * 2500);
            if (state.gelsenkirchenBuildings.length === 0 || state.gelsenkirchenBuildings[state.gelsenkirchenBuildings.length - 1].x < width - spacing) {
                const buildingData = IMAGES.current.downtown_buildings[Math.floor(Math.random() * IMAGES.current.downtown_buildings.length)];
                const buildingImg = buildingData?.img;

                if (buildingImg && buildingImg.complete && buildingImg.naturalHeight > 0 && buildingImg.naturalWidth > 0) {
                    // Different heights based on building size
                    let BUILDING_HEIGHT = 160; // Small (Kneipen)
                    if (buildingData.size === 'large') BUILDING_HEIGHT = 213; // 1/3 bigger
                    if (buildingData.size === 'xlarge') BUILDING_HEIGHT = 283; // 1/3 bigger than large
                    if (buildingData.size === 'xxlarge') BUILDING_HEIGHT = 377; // 1/3 bigger than xlarge
                    const scale = BUILDING_HEIGHT / buildingImg.naturalHeight;
                    const buildingWidth = buildingImg.naturalWidth * scale;

                    state.gelsenkirchenBuildings.push({
                        x: width,
                        img: buildingImg,
                        width: buildingWidth,
                        height: BUILDING_HEIGHT
                    });
                }
            }

            // Update positions and filter out offscreen buildings
            state.gelsenkirchenBuildings = state.gelsenkirchenBuildings.filter(building => {
                building.x -= state.scrollSpeed;
                return building.x > -building.width && 
                       building.img && 
                       building.img.complete && 
                       building.img.naturalHeight > 0 && 
                       building.img.naturalWidth > 0;
            });
        }

        // Gelsenkirchen Street Holes Management
        if (level === 'gelsenkirchen' && IMAGES.current.gelsenkirchen_hole1 && IMAGES.current.gelsenkirchen_hole2) {
            // Add new hole if needed
            if (state.gelsenkirchenHoles.length === 0 || state.gelsenkirchenHoles[state.gelsenkirchenHoles.length - 1].x < width - (800 + Math.random() * 1200)) {
                const holeImg = Math.random() < 0.5 ? IMAGES.current.gelsenkirchen_hole1 : IMAGES.current.gelsenkirchen_hole2;

                if (holeImg && holeImg.complete && holeImg.naturalHeight > 0 && holeImg.naturalWidth > 0) {
                    const holeHeight = 60 + Math.random() * 60; // Random height between 60 and 120
                    const scale = holeHeight / holeImg.naturalHeight;
                    const holeWidth = holeImg.naturalWidth * scale;

                    state.gelsenkirchenHoles.push({
                        x: width,
                        img: holeImg,
                        width: holeWidth,
                        height: holeHeight
                    });
                }
            }

            // Update positions and filter out offscreen holes
            state.gelsenkirchenHoles = state.gelsenkirchenHoles.filter(hole => {
                hole.x -= state.scrollSpeed;
                return hole.x > -hole.width && 
                       hole.img && 
                       hole.img.complete && 
                       hole.img.naturalHeight > 0 && 
                       hole.img.naturalWidth > 0;
            });
        }



        // Paris Buildings Management
        if (level === 'paris' && IMAGES.current.paris_buildings) {
            // Add new building if needed
            if (state.parisBuildings.length === 0 || state.parisBuildings[state.parisBuildings.length - 1].x < width - (400 + Math.random() * 600)) {
                const buildingData = IMAGES.current.paris_buildings[Math.floor(Math.random() * IMAGES.current.paris_buildings.length)];
                const buildingImg = buildingData?.img;

                if (buildingImg && buildingImg.complete && buildingImg.naturalHeight > 0 && buildingImg.naturalWidth > 0) {
                    const maxHeight = height * 0.5;
                    const scale = maxHeight / buildingImg.naturalHeight;
                    const buildingWidth = buildingImg.naturalWidth * scale;

                    state.parisBuildings.push({
                        x: width,
                        img: buildingImg,
                        width: buildingWidth,
                        height: maxHeight
                    });
                }
            }

            // Update positions and filter out offscreen buildings
            state.parisBuildings = state.parisBuildings.filter(building => {
                building.x -= state.scrollSpeed;
                return building.x > -building.width && 
                       building.img && 
                       building.img.complete && 
                       building.img.naturalHeight > 0 && 
                       building.img.naturalWidth > 0;
            });
        }

        // Paris Trees Management
        if (level === 'paris' && IMAGES.current.paris_trees) {
            // Add new tree if needed
            if (state.parisTrees.length === 0 || state.parisTrees[state.parisTrees.length - 1].x < width - (200 + Math.random() * 400)) {
                const treeData = IMAGES.current.paris_trees[Math.floor(Math.random() * IMAGES.current.paris_trees.length)];
                const treeImg = treeData?.img;

                if (treeImg && treeImg.complete && treeImg.naturalHeight > 0 && treeImg.naturalWidth > 0) {
                    const maxHeight = height * 0.35;
                    const scale = maxHeight / treeImg.naturalHeight;
                    const treeWidth = treeImg.naturalWidth * scale;

                    state.parisTrees.push({
                        x: width,
                        img: treeImg,
                        width: treeWidth,
                        height: maxHeight
                    });
                }
            }

            // Update positions and filter out offscreen trees
            state.parisTrees = state.parisTrees.filter(tree => {
                tree.x -= state.scrollSpeed;
                return tree.x > -tree.width && 
                       tree.img && 
                       tree.img.complete && 
                       tree.img.naturalHeight > 0 && 
                       tree.img.naturalWidth > 0;
            });
        }

        // Madrid Scenery Management (Buildings and Trees combined)
        if (level === 'madrid' && IMAGES.current.madrid_buildings && IMAGES.current.madrid_trees) {
            // Add new scenery item if needed
            if (state.madridScenery.length === 0 || state.madridScenery[state.madridScenery.length - 1].x < width - 400) {
                // Randomly choose between building (70%) or tree (30%)
                const isBuilding = Math.random() < 0.7;

                if (isBuilding) {
                    const buildingData = IMAGES.current.madrid_buildings[Math.floor(Math.random() * IMAGES.current.madrid_buildings.length)];
                    const buildingImg = buildingData?.img;

                    if (buildingImg && buildingImg.complete && buildingImg.naturalHeight > 0 && buildingImg.naturalWidth > 0) {
                        const maxHeight = height * 0.6;
                        const scale = maxHeight / buildingImg.naturalHeight;
                        const buildingWidth = buildingImg.naturalWidth * scale;

                        state.madridScenery.push({
                            x: width,
                            img: buildingImg,
                            width: buildingWidth,
                            height: maxHeight,
                            type: 'building'
                        });
                    }
                } else {
                    const treeData = IMAGES.current.madrid_trees[Math.floor(Math.random() * IMAGES.current.madrid_trees.length)];
                    const treeImg = treeData?.img;

                    if (treeImg && treeImg.complete && treeImg.naturalHeight > 0 && treeImg.naturalWidth > 0) {
                        const maxHeight = height * 0.3;
                        const scale = maxHeight / treeImg.naturalHeight;
                        const treeWidth = treeImg.naturalWidth * scale;

                        state.madridScenery.push({
                            x: width,
                            img: treeImg,
                            width: treeWidth,
                            height: maxHeight,
                            type: 'tree'
                        });
                    }
                }
            }

            // Update positions and filter out offscreen items
            state.madridScenery = state.madridScenery.filter(item => {
                item.x -= state.scrollSpeed;
                return item.x > -item.width && 
                       item.img && 
                       item.img.complete && 
                       item.img.naturalHeight > 0 && 
                       item.img.naturalWidth > 0;
            });
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

            // Pigeon erratic movement (London) - not for rooftop pigeons
            if ((e.spriteType === 'pigeon' || e.spriteType === 'london_pigeon') && e.erratic) {
                e.y += Math.sin(state.animFrame * 0.05 + e.x * 0.01) * 2;
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
            } else if (p.type === 'normal' || p.type === 'triple') {
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

                    createParticles(state.player.x, state.player.y, '#FFFFFF', 10);
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

    const isImageValid = (img) => {
        return img && img.complete && img.naturalHeight > 0 && img.naturalWidth > 0;
    };

    const draw = (ctx, width, height) => {
        const state = gameStateRef.current;

        // Clear
        ctx.clearRect(0, 0, width, height);

        // --- BACKGROUND RENDERING ---
        if (level === 'gelsenkirchen' && isImageValid(IMAGES.current.background)) {
            // Gelsenkirchen: Scrolling background (image width distributed over 20000 meters)
            const bg = IMAGES.current.background;
            const scale = Math.max(width / bg.width, height / bg.height);
            const w = bg.width * scale;
            const h = bg.height * scale;

            // Scroll: image width over 20000 meters distance
            const bgOffset = ((state.distance / 20000) * w) % w;

            ctx.drawImage(bg, -bgOffset, (height - h) / 2, w, h);
            ctx.drawImage(bg, w - bgOffset, (height - h) / 2, w, h);
        } else if (level === 'berlin' && isImageValid(IMAGES.current.berlinBackground)) {
            // Berlin: Fixed background (no scrolling)
            const bg = IMAGES.current.berlinBackground;
            const scale = Math.max(width / bg.width, height / bg.height);
            const w = bg.width * scale;
            const h = bg.height * scale;
            const x = (width - w) / 2;
            const y = (height - h) / 2;
            ctx.drawImage(bg, x, y, w, h);
        } else if (level === 'rome' && isImageValid(IMAGES.current.romeBackground)) {
            // Rome: Fixed background (no scrolling)
            const bg = IMAGES.current.romeBackground;
            const scale = Math.max(width / bg.width, height / bg.height);
            const w = bg.width * scale;
            const h = bg.height * scale;
            const x = (width - w) / 2;
            const y = (height - h) / 2;
            ctx.drawImage(bg, x, y, w, h);
        } else if (level === 'madrid' && isImageValid(IMAGES.current.madridBackground)) {
            // Madrid: Fixed background (no scrolling)
            const bg = IMAGES.current.madridBackground;
            const scale = Math.max(width / bg.width, height / bg.height);
            const w = bg.width * scale;
            const h = bg.height * scale;
            const x = (width - w) / 2;
            const y = (height - h) / 2;
            ctx.drawImage(bg, x, y, w, h);
        } else if (level === 'paris' && isImageValid(IMAGES.current.background)) {
            // Paris: Scrolling background (image width distributed over 20000 meters)
            const bg = IMAGES.current.background;
            const scale = Math.max(width / bg.width, height / bg.height);
            const w = bg.width * scale;
            const h = bg.height * scale;

            // Scroll: image width over 20000 meters distance
            const bgOffset = ((state.distance / 20000) * w) % w;

            ctx.drawImage(bg, -bgOffset, (height - h) / 2, w, h);
            ctx.drawImage(bg, w - bgOffset, (height - h) / 2, w, h);
        } else if (level === 'rooftop' && isImageValid(IMAGES.current.rooftopBackground)) {
            // Rooftop: Fixed background (no scrolling)
            const bg = IMAGES.current.rooftopBackground;
            const scale = Math.max(width / bg.width, height / bg.height);
            const w = bg.width * scale;
            const h = bg.height * scale;
            const x = (width - w) / 2;
            const y = (height - h) / 2;
            ctx.drawImage(bg, x, y, w, h);
        } else if (level === 'london' && assetsLoaded.current && isImageValid(IMAGES.current.background)) {
            // London: slow scrolling background (1/10 of foreground speed)
            const bg = IMAGES.current.background;
            const scale = Math.max(width / bg.width, height / bg.height);
            const w = bg.width * scale;
            const h = bg.height * scale;

            // Scroll at 1/10 of foreground speed (foreground is distance * 15, so this is distance * 1.5)
            const bgOffset = (state.distance * 1.5) % w;

            ctx.drawImage(bg, -bgOffset, 0, w, h);
            ctx.drawImage(bg, w - bgOffset, 0, w, h);
        } else if (level === 'park' && assetsLoaded.current && isImageValid(IMAGES.current.background)) {
            // Park: Single repeating background
            const bg = IMAGES.current.background;
            const scale = Math.max(width / bg.width, height / bg.height);
            const w = bg.width * scale;
            const h = bg.height * scale;

            const offset = (state.distance * 10) % w;
            ctx.drawImage(bg, -offset, 0, w, h);
            ctx.drawImage(bg, w - offset, 0, w, h);
        } else {
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(0, 0, width, height);
        }

        // Draw London scrolling foreground (3 images in sequence)
        if (level === 'london' && isImageValid(IMAGES.current.londonForeground1) && 
            isImageValid(IMAGES.current.londonForeground2) && isImageValid(IMAGES.current.londonForeground3)) {

            const fg1 = IMAGES.current.londonForeground1;
            const fg2 = IMAGES.current.londonForeground2;
            const fg3 = IMAGES.current.londonForeground3;

            // Scale all to same height
            const fgScale = height / fg1.height;
            const fgW1 = fg1.width * fgScale;
            const fgW2 = fg2.width * fgScale;
            const fgW3 = fg3.width * fgScale;
            const fgH = height;

            // Total width of all 3 images
            const totalWidth = fgW1 + fgW2 + fgW3;

            // Scroll faster than normal (1.5x game speed)
            const fgOffset = (state.distance * 15) % totalWidth;

            // Draw 20 pixels lower
            const fgY = height - fgH + 20;

            // Determine which images to draw based on offset
            if (fgOffset < fgW1) {
                // Show fg1, then fg2, then fg3
                ctx.drawImage(fg1, -fgOffset, fgY, fgW1, fgH);
                ctx.drawImage(fg2, fgW1 - fgOffset, fgY, fgW2, fgH);
                ctx.drawImage(fg3, fgW1 + fgW2 - fgOffset, fgY, fgW3, fgH);
            } else if (fgOffset < fgW1 + fgW2) {
                // fg1 scrolled off, show fg2, fg3, then fg1
                const offset2 = fgOffset - fgW1;
                ctx.drawImage(fg2, -offset2, fgY, fgW2, fgH);
                ctx.drawImage(fg3, fgW2 - offset2, fgY, fgW3, fgH);
                ctx.drawImage(fg1, fgW2 + fgW3 - offset2, fgY, fgW1, fgH);
            } else {
                // fg1 and fg2 scrolled off, show fg3, then fg1, then fg2
                const offset3 = fgOffset - fgW1 - fgW2;
                ctx.drawImage(fg3, -offset3, fgY, fgW3, fgH);
                ctx.drawImage(fg1, fgW3 - offset3, fgY, fgW1, fgH);
                ctx.drawImage(fg2, fgW3 + fgW1 - offset3, fgY, fgW2, fgH);
            }
        }

        // Draw Berlin scrolling street - below buildings
        if (level === 'berlin' && isImageValid(IMAGES.current.berlinStreet)) {
            const street = IMAGES.current.berlinStreet;
            const streetHeight = 220;
            const streetScale = streetHeight / street.height;
            const streetWidth = street.width * streetScale;
            const streetY = height - streetHeight;

            // Wrap around scrolling
            const offset = state.berlinStreetX % streetWidth;

            // Draw two copies for seamless scrolling
            ctx.drawImage(street, offset, streetY, streetWidth, streetHeight);
            ctx.drawImage(street, offset + streetWidth, streetY, streetWidth, streetHeight);
            if (offset < 0) {
                ctx.drawImage(street, offset - streetWidth, streetY, streetWidth, streetHeight);
            }
        }

        // Draw Berlin scrolling buildings - above street, behind NPCs
        if (level === 'berlin') {
            const groundY = height * GROUND_Y_PCT;

            state.berlinBuildings.forEach(building => {
                if (isImageValid(building.img)) {
                    const buildingY = groundY - building.height - 70; // 70 pixels higher
                    ctx.drawImage(building.img, building.x, buildingY, building.width, building.height);
                }
            });
        }

        // Draw Gelsenkirchen scrolling sidewalk and buildings
        if (level === 'gelsenkirchen') {
            const groundY = height * GROUND_Y_PCT;

            // Draw vegetation (behind buildings)
            state.gelsenkirchenVegetation.forEach(veg => {
                if (isImageValid(veg.img)) {
                    const vegY = groundY - veg.height - 90;
                    ctx.drawImage(veg.img, veg.x, vegY, veg.width, veg.height);
                }
            });

            // Draw sidewalk at bottom (first)
            if (isImageValid(IMAGES.current.gelsenkirchenSidewalk)) {
                const sidewalk = IMAGES.current.gelsenkirchenSidewalk;
                const sidewalkY = groundY - 100;
                const sidewalkHeight = height - sidewalkY;
                const sidewalkScale = sidewalkHeight / sidewalk.height;
                const sidewalkWidth = sidewalk.width * sidewalkScale;

                const offset = state.gelsenkirchenSidewalkX % sidewalkWidth;

                ctx.drawImage(sidewalk, offset, sidewalkY, sidewalkWidth, sidewalkHeight);
                ctx.drawImage(sidewalk, offset + sidewalkWidth, sidewalkY, sidewalkWidth, sidewalkHeight);
                if (offset < 0) {
                    ctx.drawImage(sidewalk, offset - sidewalkWidth, sidewalkY, sidewalkWidth, sidewalkHeight);
                }
            }

            // Draw street holes on sidewalk
            state.gelsenkirchenHoles.forEach(hole => {
                if (isImageValid(hole.img)) {
                    const holeY = height - hole.height - 10;
                    ctx.drawImage(hole.img, hole.x, holeY, hole.width, hole.height);
                }
            });

            // Draw buildings (on top of sidewalk)
            // All buildings should have their bottom edge at the same height
            const buildingBaseY = groundY; // Fixed bottom position for all buildings
            state.gelsenkirchenBuildings.forEach(building => {
                if (isImageValid(building.img)) {
                    const buildingY = buildingBaseY - building.height;
                    ctx.drawImage(building.img, building.x, buildingY, building.width, building.height);
                }
            });
            }



        // Draw Rome scrolling buildings - behind NPCs
        if (level === 'rome') {
            const groundY = height * GROUND_Y_PCT;

            state.romeBuildings.forEach(building => {
                if (isImageValid(building.img)) {
                    const buildingY = groundY - building.height - 30;
                    ctx.drawImage(building.img, building.x, buildingY, building.width, building.height);
                }
            });

            // Draw Rome scrolling trees - in front of buildings, behind street
            state.romeTrees.forEach(tree => {
                if (isImageValid(tree.img)) {
                    const treeY = groundY - tree.height - 20;
                    ctx.drawImage(tree.img, tree.x, treeY, tree.width, tree.height);
                }
            });
        }

        // Draw Rome scrolling street - below buildings, behind NPCs
        if (level === 'rome' && isImageValid(IMAGES.current.romeStreet)) {
            const street = IMAGES.current.romeStreet;
            const streetHeight = 180;
            const streetScale = streetHeight / street.height;
            const streetWidth = street.width * streetScale;
            const streetY = height - streetHeight;

            // Wrap around scrolling
            const offset = state.romeStreetX % streetWidth;

            // Draw two copies for seamless scrolling
            ctx.drawImage(street, offset, streetY, streetWidth, streetHeight);
            ctx.drawImage(street, offset + streetWidth, streetY, streetWidth, streetHeight);
            if (offset < 0) {
                ctx.drawImage(street, offset - streetWidth, streetY, streetWidth, streetHeight);
            }
        }

        // Draw Madrid scrolling street - below buildings
        if (level === 'madrid' && isImageValid(IMAGES.current.madridStreet)) {
            const groundY = height * GROUND_Y_PCT;
            const street = IMAGES.current.madridStreet;
            const streetHeight = 180; // Fixed height for street
            const streetScale = streetHeight / street.height;
            const streetWidth = street.width * streetScale;
            const streetY = height - streetHeight;

            // Wrap around scrolling
            const offset = state.madridStreetX % streetWidth;

            // Draw two copies for seamless scrolling
            ctx.drawImage(street, offset, streetY, streetWidth, streetHeight);
            ctx.drawImage(street, offset + streetWidth, streetY, streetWidth, streetHeight);
            if (offset < 0) {
                ctx.drawImage(street, offset - streetWidth, streetY, streetWidth, streetHeight);
            }
        }

        // Draw Madrid scrolling scenery (buildings and trees) - above street, behind NPCs
        if (level === 'madrid') {
            const groundY = height * GROUND_Y_PCT;

            state.madridScenery.forEach(item => {
                if (isImageValid(item.img)) {
                    const itemY = groundY - item.height - 50;
                    ctx.drawImage(item.img, item.x, itemY, item.width, item.height);
                }
            });
        }



        // Draw Rooftop scrolling street
        if (level === 'rooftop' && isImageValid(IMAGES.current.rooftopStreet)) {
            const street = IMAGES.current.rooftopStreet;
            const streetHeight = 240;
            const streetScale = streetHeight / street.height;
            const streetWidth = street.width * streetScale;
            const streetY = height - streetHeight;

            // Wrap around scrolling
            const offset = state.rooftopStreetX % streetWidth;

            // Draw two copies for seamless scrolling
            ctx.drawImage(street, offset, streetY, streetWidth, streetHeight);
            ctx.drawImage(street, offset + streetWidth, streetY, streetWidth, streetHeight);
            if (offset < 0) {
                ctx.drawImage(street, offset - streetWidth, streetY, streetWidth, streetHeight);
            }
        }

        // Draw Paris scrolling buildings - behind NPCs
        if (level === 'paris') {
            const groundY = height * GROUND_Y_PCT;

            state.parisBuildings.forEach(building => {
                if (isImageValid(building.img)) {
                    const buildingY = groundY - building.height - 30;
                    ctx.drawImage(building.img, building.x, buildingY, building.width, building.height);
                }
            });

            // Draw Paris scrolling trees - in front of buildings, behind street
            state.parisTrees.forEach(tree => {
                if (isImageValid(tree.img)) {
                    const treeY = groundY - tree.height - 20;
                    ctx.drawImage(tree.img, tree.x, treeY, tree.width, tree.height);
                }
            });
        }

        // Draw Paris scrolling street - below buildings, behind NPCs
        if (level === 'paris' && isImageValid(IMAGES.current.parisStreet)) {
            const street = IMAGES.current.parisStreet;
            const streetHeight = 220;
            const streetScale = streetHeight / street.height;
            const streetWidth = street.width * streetScale;
            const streetY = height - streetHeight;

            // Wrap around scrolling
            const offset = state.parisStreetX % streetWidth;

            // Draw two copies for seamless scrolling
            ctx.drawImage(street, offset, streetY, streetWidth, streetHeight);
            ctx.drawImage(street, offset + streetWidth, streetY, streetWidth, streetHeight);
            if (offset < 0) {
                ctx.drawImage(street, offset - streetWidth, streetY, streetWidth, streetHeight);
            }
        }



        // Draw Player
        if (assetsLoaded.current) {
            if (state.health <= 0) {
                // Draw Dead Player
                const deadImg = IMAGES.current.playerDead;
                const playerSize = 66;
                ctx.save();
                ctx.translate(state.player.x, state.player.y);
                ctx.rotate(Math.PI / 4); // Tilt down
                ctx.drawImage(deadImg, -playerSize/2, -playerSize/2, playerSize, playerSize);
                ctx.restore();
            } else {
                // Always draw flying player
                const playerSize = 66;
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
                            } else if (p.type === 'bone') {
                            // Draw bone projectile with custom image
                            ctx.rotate(state.animFrame * 0.25);
                            
                            if (isImageValid(IMAGES.current.boneProjectile)) {
                                ctx.drawImage(IMAGES.current.boneProjectile, -p.width/2, -p.height/2, p.width, p.height);
                            } else {
                                // Fallback if image not loaded
                                ctx.shadowColor = '#f5f5dc';
                                ctx.shadowBlur = 8;

                                // Draw bone shape
                                ctx.fillStyle = '#f5f5dc'; // Beige bone color
                                ctx.fillRect(-p.width/2, -p.height/2, p.width, p.height);

                                // Bone ends (knobs)
                                ctx.beginPath();
                                ctx.arc(-p.width/2, 0, p.height/1.5, 0, Math.PI * 2);
                                ctx.arc(p.width/2, 0, p.height/1.5, 0, Math.PI * 2);
                                ctx.fill();

                                // Darker outline
                                ctx.strokeStyle = '#d3c5a0';
                                ctx.lineWidth = 2;
                                ctx.beginPath();
                                ctx.arc(-p.width/2, 0, p.height/1.5, 0, Math.PI * 2);
                                ctx.stroke();
                                ctx.beginPath();
                                ctx.arc(p.width/2, 0, p.height/1.5, 0, Math.PI * 2);
                                ctx.stroke();
                                ctx.strokeRect(-p.width/2, -p.height/2, p.width, p.height);

                                ctx.shadowBlur = 0;
                            }
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
                    } else if (p.type === 'ghost_poop') {
                        // Draw white ghost poop
                        ctx.rotate(state.animFrame * 0.2);
                        ctx.shadowColor = '#ffffff';
                        ctx.shadowBlur = 10;

                        // White poop shape
                        ctx.fillStyle = '#ffffff';
                        ctx.beginPath();
                        ctx.arc(0, 0, p.width/2, 0, Math.PI * 2);
                        ctx.fill();

                        // Highlight
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                        ctx.beginPath();
                        ctx.arc(-p.width/6, -p.height/6, p.width/3, 0, Math.PI * 2);
                        ctx.fill();

                        ctx.shadowBlur = 0;
                    } else if (p.type === 'grenade') {
                        // Draw hand grenade
                        ctx.rotate(state.animFrame * 0.3);
                        ctx.shadowColor = '#2f4f2f';
                        ctx.shadowBlur = 10;

                        // Grenade body (olive green)
                        ctx.fillStyle = '#556b2f';
                        ctx.beginPath();
                        ctx.ellipse(0, 2, p.width/2.5, p.height/2, 0, 0, Math.PI * 2);
                        ctx.fill();

                        // Top cap (darker)
                        ctx.fillStyle = '#3d4f25';
                        ctx.fillRect(-p.width/4, -p.height/2, p.width/2, p.height/5);

                        // Pin ring
                        ctx.strokeStyle = '#ffd700';
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.arc(-p.width/3, -p.height/2.5, p.width/6, 0, Math.PI * 2);
                        ctx.stroke();

                        // Segments
                        ctx.strokeStyle = '#2f4f2f';
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.moveTo(0, -p.height/4);
                        ctx.lineTo(0, p.height/3);
                        ctx.moveTo(-p.width/4, 2);
                        ctx.lineTo(p.width/4, 2);
                        ctx.stroke();

                        ctx.shadowBlur = 0;
                    } else if (p.type === 'plank') {
                        // Draw wooden plank
                        ctx.rotate(state.animFrame * 0.25);
                        ctx.shadowColor = '#8B4513';
                        ctx.shadowBlur = 8;

                        // Wood plank (brown)
                        ctx.fillStyle = '#8B4513';
                        ctx.fillRect(-p.width/2, -p.height/2, p.width, p.height);

                        // Wood grain lines
                        ctx.strokeStyle = '#654321';
                        ctx.lineWidth = 2;
                        for (let i = 0; i < 3; i++) {
                            ctx.beginPath();
                            const offset = (i - 1) * p.height / 4;
                            ctx.moveTo(-p.width/2 + 5, offset);
                            ctx.lineTo(p.width/2 - 5, offset);
                            ctx.stroke();
                        }

                        // Lighter edge highlight
                        ctx.fillStyle = '#D2691E';
                        ctx.fillRect(-p.width/2, -p.height/2, p.width, 2);
                        ctx.fillRect(-p.width/2, -p.height/2, 2, p.height);

                        ctx.shadowBlur = 0;
                    } else if (p.type === 'stone') {
                        // Draw stone rock
                        ctx.rotate(state.animFrame * 0.2);
                        ctx.shadowColor = '#4a5568';
                        ctx.shadowBlur = 10;

                        // Main stone body (gray)
                        ctx.fillStyle = '#6b7280';
                        ctx.beginPath();
                        ctx.arc(0, 0, p.width/2, 0, Math.PI * 2);
                        ctx.fill();

                        // Darker cracks/texture
                        ctx.strokeStyle = '#4b5563';
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.moveTo(-p.width/3, -p.height/6);
                        ctx.lineTo(p.width/4, p.height/6);
                        ctx.moveTo(-p.width/4, p.height/4);
                        ctx.lineTo(p.width/3, -p.height/5);
                        ctx.stroke();

                        // Highlight spots
                        ctx.fillStyle = '#9ca3af';
                        ctx.beginPath();
                        ctx.arc(-p.width/4, -p.height/4, p.width/6, 0, Math.PI * 2);
                        ctx.fill();

                        ctx.shadowBlur = 0;
                    } else if (p.type === 'fireball') { // Added new projectile type
                        ctx.rotate(state.animFrame * 0.3);
                        ctx.shadowColor = '#ff4500'; // OrangeRed
                        ctx.shadowBlur = 20;

                        // Core of the fireball
                        ctx.fillStyle = '#ff4500'; // OrangeRed
                        ctx.beginPath();
                        ctx.arc(0, 0, p.width/2, 0, Math.PI * 2);
                        ctx.fill();

                        // Inner glow
                        ctx.fillStyle = '#ff8c00'; // DarkOrange
                        ctx.beginPath();
                        ctx.arc(0, 0, p.width/3, 0, Math.PI * 2);
                        ctx.fill();

                        // Brightest part
                        ctx.fillStyle = '#ffff00'; // Yellow
                        ctx.beginPath();
                        ctx.arc(-p.width/8, -p.height/8, p.width/6, 0, Math.PI * 2);
                        ctx.fill();

                        // Trailing embers/flames
                        for (let i = 0; i < 3; i++) {
                            const offset = i * 8; // Spread out
                            const size = (p.width/4) * (1 - i * 0.3); // Decrease size
                            ctx.fillStyle = i === 0 ? '#ff6600' : (i === 1 ? '#ff8800' : '#ffaa00'); // Different shades of orange
                            ctx.globalAlpha = 0.6 - i * 0.2; // Fade out
                            ctx.beginPath();
                            ctx.arc(-offset - p.width/2, Math.sin(state.animFrame * 0.2 + i) * 5, size, 0, Math.PI * 2);
                            ctx.fill();
                        }

                        ctx.globalAlpha = 1.0;
                        ctx.shadowBlur = 0;
                    } else if (p.type === 'icecube') {
                        // Draw ice cube
                        ctx.rotate(state.animFrame * 0.2);
                        ctx.shadowColor = '#00D4FF';
                        ctx.shadowBlur = 15;

                        // Main ice cube (light blue transparent)
                        ctx.fillStyle = 'rgba(135, 206, 235, 0.8)';
                        ctx.fillRect(-p.width/2, -p.height/2, p.width, p.height);

                        // Inner brighter layer
                        ctx.fillStyle = 'rgba(0, 212, 255, 0.6)';
                        ctx.fillRect(-p.width/2 + 4, -p.height/2 + 4, p.width - 8, p.height - 8);

                        // Highlight spots (white glow)
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                        ctx.fillRect(-p.width/3, -p.height/3, p.width/4, p.height/4);
                        ctx.fillRect(p.width/5, p.height/6, p.width/5, p.height/5);

                        // Frost patterns (cracks)
                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(-p.width/2, 0);
                        ctx.lineTo(p.width/2, 0);
                        ctx.moveTo(0, -p.height/2);
                        ctx.lineTo(0, p.height/2);
                        ctx.stroke();

                        // Outer border (ice edge)
                        ctx.strokeStyle = 'rgba(0, 180, 255, 0.8)';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(-p.width/2, -p.height/2, p.width, p.height);

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
                    if (isImageValid(img)) {
                        sheet = img;
                        sx = 0; sy = 0; sw = img.width; sh = img.height;
                        return true;
                    }
                    return false;
                };

                if (e.spriteType === 'eagle') useFullImage(IMAGES.current.eagle);
                else if (e.spriteType === 'cop') useFullImage(IMAGES.current.cop);
                else if (e.spriteType === 'granny') useFullImage(IMAGES.current.granny);
                else if (e.spriteType === 'car') useFullImage(IMAGES.current.car);
                else if (e.spriteType === 'drone') useFullImage(IMAGES.current.drone);
                else if (e.spriteType === 'dog') useFullImage(IMAGES.current.dog);
                else if (e.spriteType === 'worker') useFullImage(IMAGES.current.worker);
                else if (e.spriteType === 'fruit_vendor') useFullImage(IMAGES.current.fruit_vendor);
                else if (e.spriteType === 'sparrow') useFullImage(IMAGES.current.sparrow);
                else if (e.spriteType === 'rooftop_sparrow') useFullImage(IMAGES.current.sparrow);
                else if (e.spriteType === 'rooftop_pigeon') useFullImage(IMAGES.current.rooftop_pigeon);
                else if (e.spriteType === 'rooftop_ninja') useFullImage(IMAGES.current.rooftop_ninja);
                else if (e.spriteType === 'rooftop_sunbather') useFullImage(IMAGES.current.rooftop_sunbather);
                else if (e.spriteType === 'rooftop_fitness') useFullImage(IMAGES.current.rooftop_fitness);
                else if (e.spriteType === 'rooftop_worker2') useFullImage(IMAGES.current.rooftop_worker2);
                else if (e.spriteType === 'rooftop_ninja2') useFullImage(IMAGES.current.rooftop_ninja2);
                else if (e.spriteType === 'rooftop_ac2') useFullImage(IMAGES.current.rooftop_ac2);
                else if (e.spriteType === 'rooftop_plant1') useFullImage(IMAGES.current.rooftop_plant1);
                else if (e.spriteType === 'rooftop_plant2') useFullImage(IMAGES.current.rooftop_plant2);
                else if (e.spriteType === 'rooftop_plant3') useFullImage(IMAGES.current.rooftop_plant3);
                else if (e.spriteType === 'cat') useFullImage(IMAGES.current.cat);
                else if (e.spriteType === 'ac_unit') useFullImage(IMAGES.current.ac_unit);
                else if (e.spriteType === 'seagull') useFullImage(IMAGES.current.seagull);
                else if (e.spriteType === 'drone_l2') useFullImage(IMAGES.current.drone_l2);
                else if (e.spriteType === 'squirrel') useFullImage(IMAGES.current.squirrel);
                else if (e.spriteType === 'snail') useFullImage(IMAGES.current.snail);
                else if (e.spriteType === 'fly') useFullImage(IMAGES.current.fly);
                else if (e.spriteType === 'trash_can') useFullImage(IMAGES.current.trash_can);
                else if (e.spriteType === 'business_person') useFullImage(IMAGES.current.business_person);
                else if (e.spriteType === 'tourist') useFullImage(IMAGES.current.tourist);
                else if (e.spriteType === 'london_cop') useFullImage(IMAGES.current.london_cop);
                else if (e.spriteType === 'street_vendor') useFullImage(IMAGES.current.street_vendor);
                else if (e.spriteType === 'street_musician') useFullImage(IMAGES.current.street_musician);
                else if (e.spriteType === 'london_car') useFullImage(IMAGES.current.london_car);
                else if (e.spriteType === 'pigeon') useFullImage(IMAGES.current.pigeon);
                else if (e.spriteType === 'balloon') useFullImage(IMAGES.current.balloon);
                else if (e.spriteType === 'london_drone') useFullImage(IMAGES.current.london_drone);
                else if (e.spriteType === 'london_pigeon') useFullImage(IMAGES.current.london_pigeon);
                else if (e.spriteType === 'paris_car') useFullImage(IMAGES.current.paris_car);
                else if (e.spriteType === 'police_man') useFullImage(IMAGES.current.police_man);
                else if (e.spriteType === 'paris_tourist') useFullImage(IMAGES.current.paris_tourist);
                else if (e.spriteType === 'watch_seller') useFullImage(IMAGES.current.watch_seller);
                else if (e.spriteType === 'paris_mime') useFullImage(IMAGES.current.paris_mime);
                else if (e.spriteType === 'paris_pigeon') useFullImage(IMAGES.current.paris_pigeon);
                else if (e.spriteType === 'paris_balloon') useFullImage(IMAGES.current.paris_balloon);
                else if (e.spriteType === 'madrid_waiter') useFullImage(IMAGES.current.madrid_waiter);
                else if (e.spriteType === 'madrid_flamenco') useFullImage(IMAGES.current.madrid_flamenco);
                else if (e.spriteType === 'madrid_tourist_girl') useFullImage(IMAGES.current.madrid_tourist_girl);
                else if (e.spriteType === 'madrid_flower_girl') useFullImage(IMAGES.current.madrid_flower_girl);
                else if (e.spriteType === 'madrid_elderly') useFullImage(IMAGES.current.madrid_elderly);
                else if (e.spriteType === 'madrid_flight_attendant') useFullImage(IMAGES.current.madrid_flight_attendant);
                else if (e.spriteType === 'madrid_boy_tourist') useFullImage(IMAGES.current.madrid_boy_tourist);
                else if (e.spriteType === 'madrid_car') useFullImage(IMAGES.current.madrid_car);
                else if (e.spriteType === 'madrid_balloon') useFullImage(IMAGES.current.madrid_balloon);
                else if (e.spriteType === 'madrid_pigeon') useFullImage(IMAGES.current.madrid_pigeon);
                else if (e.spriteType === 'madrid_parrot') useFullImage(IMAGES.current.madrid_parrot);
                else if (e.spriteType === 'madrid_sparrow') useFullImage(IMAGES.current.madrid_sparrow);
                else if (e.spriteType === 'madrid_drone') useFullImage(IMAGES.current.madrid_drone);
                else if (e.spriteType === 'rome_car') useFullImage(IMAGES.current.rome_car);
                else if (e.spriteType === 'rome_tourist') useFullImage(IMAGES.current.rome_tourist);
                else if (e.spriteType === 'rome_priest') useFullImage(IMAGES.current.rome_priest);
                else if (e.spriteType === 'rome_pizza_chef') useFullImage(IMAGES.current.rome_pizza_chef);
                else if (e.spriteType === 'rome_vespa_driver') useFullImage(IMAGES.current.rome_vespa_driver);
                else if (e.spriteType === 'rome_old_lady') useFullImage(IMAGES.current.rome_old_lady);
                else if (e.spriteType === 'rome_gladiator') useFullImage(IMAGES.current.rome_gladiator);
                else if (e.spriteType === 'rome_couple_bench') useFullImage(IMAGES.current.rome_couple_bench);
                else if (e.spriteType === 'rome_couple_standing') useFullImage(IMAGES.current.rome_couple_standing);
                else if (e.spriteType === 'rome_musician') useFullImage(IMAGES.current.rome_musician);
                else if (e.spriteType === 'rome_couple_bench2') useFullImage(IMAGES.current.rome_couple_bench2);
                else if (e.spriteType === 'rome_couple_vespa') useFullImage(IMAGES.current.rome_couple_vespa);
                else if (e.spriteType === 'rome_girl_basket') useFullImage(IMAGES.current.rome_girl_basket);
                else if (e.spriteType === 'rome_bird1') useFullImage(IMAGES.current.rome_bird1);
                else if (e.spriteType === 'rome_bird2') useFullImage(IMAGES.current.rome_bird2);
                else if (e.spriteType === 'rome_bird3') useFullImage(IMAGES.current.rome_bird3);
                else if (e.spriteType === 'rome_bird4') useFullImage(IMAGES.current.rome_bird4);
                else if (e.spriteType === 'rome_bird5') useFullImage(IMAGES.current.rome_bird5);
                else if (e.spriteType === 'gelsenkirchen_npc1') useFullImage(IMAGES.current.gelsenkirchen_npc1);
                else if (e.spriteType === 'gelsenkirchen_npc2') useFullImage(IMAGES.current.gelsenkirchen_npc2);
                else if (e.spriteType === 'gelsenkirchen_npc3') useFullImage(IMAGES.current.gelsenkirchen_npc3);
                else if (e.spriteType === 'gelsenkirchen_npc4') useFullImage(IMAGES.current.gelsenkirchen_npc4);
                else if (e.spriteType === 'gelsenkirchen_npc5') useFullImage(IMAGES.current.gelsenkirchen_npc5);
                else if (e.spriteType === 'gelsenkirchen_npc6') useFullImage(IMAGES.current.gelsenkirchen_npc6);
                else if (e.spriteType === 'gelsenkirchen_npc7') useFullImage(IMAGES.current.gelsenkirchen_npc7);
                else if (e.spriteType === 'gelsenkirchen_npc8') useFullImage(IMAGES.current.gelsenkirchen_npc8);
                else if (e.spriteType === 'gelsenkirchen_npc9') useFullImage(IMAGES.current.gelsenkirchen_npc9);
                else if (e.spriteType === 'gelsenkirchen_npc10') useFullImage(IMAGES.current.gelsenkirchen_npc10);
                else if (e.spriteType === 'gelsenkirchen_npc11') useFullImage(IMAGES.current.gelsenkirchen_npc11);
                else if (e.spriteType === 'gelsenkirchen_bird1') useFullImage(IMAGES.current.gelsenkirchen_bird1);
                else if (e.spriteType === 'gelsenkirchen_bird2') useFullImage(IMAGES.current.gelsenkirchen_bird2);
                else if (e.spriteType === 'gelsenkirchen_bird3') useFullImage(IMAGES.current.gelsenkirchen_bird3);
                else if (e.spriteType === 'gelsenkirchen_drone1') useFullImage(IMAGES.current.gelsenkirchen_drone1);
                else if (e.spriteType === 'gelsenkirchen_drone2') useFullImage(IMAGES.current.gelsenkirchen_drone2);
                else if (e.spriteType === 'gelsenkirchen_drone3') useFullImage(IMAGES.current.gelsenkirchen_drone3);
                else if (e.spriteType === 'gelsenkirchen_drone4') useFullImage(IMAGES.current.gelsenkirchen_drone4);
                else if (e.spriteType === 'gelsenkirchen_drone5') useFullImage(IMAGES.current.gelsenkirchen_drone5);
                else if (e.spriteType === 'gelsenkirchen_drone6') useFullImage(IMAGES.current.gelsenkirchen_drone6);
                else if (e.spriteType === 'berlin_npc1') useFullImage(IMAGES.current.berlin_npc1);
                else if (e.spriteType === 'berlin_npc2') useFullImage(IMAGES.current.berlin_npc2);
                else if (e.spriteType === 'berlin_npc3') useFullImage(IMAGES.current.berlin_npc3);
                else if (e.spriteType === 'berlin_npc4') useFullImage(IMAGES.current.berlin_npc4);
                else if (e.spriteType === 'berlin_npc5') useFullImage(IMAGES.current.berlin_npc5);
                else if (e.spriteType === 'berlin_npc6') useFullImage(IMAGES.current.berlin_npc6);
                else if (e.spriteType === 'berlin_npc7') useFullImage(IMAGES.current.berlin_npc7);
                else if (e.spriteType === 'berlin_npc8') useFullImage(IMAGES.current.berlin_npc8);
                else if (e.spriteType === 'berlin_npc9') useFullImage(IMAGES.current.berlin_npc9);
                else if (e.spriteType === 'berlin_npc10') useFullImage(IMAGES.current.berlin_npc10);
                else if (e.spriteType === 'berlin_bird1') useFullImage(IMAGES.current.berlin_bird1);
                else if (e.spriteType === 'berlin_bird2') useFullImage(IMAGES.current.berlin_bird2);
                else if (e.spriteType === 'berlin_bird3') useFullImage(IMAGES.current.berlin_bird3);
                else if (e.spriteType === 'berlin_drone1') useFullImage(IMAGES.current.berlin_drone1);
                else if (e.spriteType === 'berlin_drone2') useFullImage(IMAGES.current.berlin_drone2);
                else if (e.spriteType === 'berlin_drone3') useFullImage(IMAGES.current.berlin_drone3);
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
                    } else if (e.spriteType === 'business_person' || e.spriteType === 'tourist') {
                    // Walking animation
                    ctx.translate(Math.sin(state.animFrame * 0.3) * 2, 0);
                    } else if (e.spriteType === 'pigeon' || e.spriteType === 'london_pigeon' || e.spriteType === 'rome_bird1' || e.spriteType === 'rome_bird2' || e.spriteType === 'rome_bird3' || e.spriteType === 'rome_bird4' || e.spriteType === 'rome_bird5' || e.spriteType === 'gelsenkirchen_bird1' || e.spriteType === 'gelsenkirchen_bird2' || e.spriteType === 'gelsenkirchen_bird3') {
                        // Flapping wings
                        ctx.translate(0, Math.sin(state.animFrame * 0.4) * 3);
                    } else if (e.spriteType === 'rooftop_sparrow') {
                    // Sparrow fast flapping
                    ctx.translate(0, Math.sin(state.animFrame * 0.6) * 2);
                    } else if (e.spriteType === 'berlin_npc1' || e.spriteType === 'berlin_npc2' || e.spriteType === 'berlin_npc3' || e.spriteType === 'berlin_npc4' || e.spriteType === 'berlin_npc5' || e.spriteType === 'berlin_npc6' || e.spriteType === 'berlin_npc7' || e.spriteType === 'berlin_npc8' || e.spriteType === 'berlin_npc9' || e.spriteType === 'berlin_npc10') {
                    // Berlin NPCs - minimal animation
                    ctx.translate(Math.sin(state.animFrame * 0.1) * 0.5, 0);
                    } else if (e.spriteType === 'berlin_bird1' || e.spriteType === 'berlin_bird2' || e.spriteType === 'berlin_bird3') {
                    // Berlin birds flapping
                    ctx.translate(0, Math.sin(state.animFrame * 0.4) * 3);
                    } else if (e.spriteType === 'berlin_drone1' || e.spriteType === 'berlin_drone2' || e.spriteType === 'berlin_drone3') {
                    // Berlin drones hovering
                    ctx.translate(0, Math.sin(state.animFrame * 0.3) * 2);
                    } else if (e.spriteType === 'balloon') {
                    // Gentle float
                    ctx.translate(Math.sin(state.animFrame * 0.1) * 3, Math.cos(state.animFrame * 0.08) * 4);
                    } else if (e.spriteType === 'london_drone' || e.spriteType === 'gelsenkirchen_drone1' || e.spriteType === 'gelsenkirchen_drone2' || e.spriteType === 'gelsenkirchen_drone3' || e.spriteType === 'gelsenkirchen_drone4' || e.spriteType === 'gelsenkirchen_drone5' || e.spriteType === 'gelsenkirchen_drone6') {
                    // Drone hovering
                    ctx.translate(0, Math.sin(state.animFrame * 0.3) * 2);
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
                    if (isImageValid(IMAGES.current.raccoon)) {
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
                    if (isImageValid(sheet)) {
                        ctx.drawImage(sheet, sx, sy, sw, sh, -e.width/2, -e.height/2, e.width, e.height);
                    }

                    } else if (e.spriteType !== 'smoke' && isImageValid(sheet)) {
                        ctx.drawImage(sheet, sx, sy, sw, sh, -e.width/2, -e.height/2, e.width, e.height);
                        } else if (e.spriteType === 'smoke') {
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

            if (p.type === 'coin' && isImageValid(IMAGES.current.coin)) {
                const scale = 1 + Math.sin(state.animFrame * 0.1) * 0.1;
                ctx.save();
                ctx.translate(p.x + p.width/2, p.y + p.height/2);
                ctx.scale(scale, scale);
                ctx.drawImage(IMAGES.current.coin, -p.width/2, -p.height/2, p.width, p.height);
                ctx.restore();
            }
            else if (p.type === 'energy' && isImageValid(IMAGES.current.energyIcon)) {
                const scale = 1 + Math.sin(state.animFrame * 0.1) * 0.1;
                ctx.save();
                ctx.translate(p.x + p.width/2, p.y + p.height/2);
                ctx.scale(scale, scale);
                ctx.drawImage(IMAGES.current.energyIcon, -p.width/2, -p.height/2, p.width, p.height);
                ctx.restore();
            }
            else if (p.type === 'ammo' && isImageValid(IMAGES.current.ammoIcon)) {
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

        // Calculate delta time (capped to prevent huge jumps)
        const deltaTime = Math.min(time - gameStateRef.current.lastTime, 32);
        gameStateRef.current.lastTime = time;

        update(deltaTime, width, height);
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
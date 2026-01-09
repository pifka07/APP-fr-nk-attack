// Asset Loader - Centralized asset management

export class AssetLoader {
    constructor() {
        this.images = {};
        this.audios = {};
        this.loaded = false;
    }

    loadImages() {
        // Background images
        this.images.background = new Image();
        this.images.background2 = new Image();
        this.images.londonForeground1 = new Image();
        this.images.londonForeground2 = new Image();
        this.images.londonForeground3 = new Image();
        this.images.rooftopForeground1 = new Image();
        this.images.rooftopForeground2 = new Image();
        this.images.rooftopForeground3 = new Image();

        // Player sprites
        this.images.playerSheet = new Image();
        this.images.playerGlide = new Image();
        this.images.playerDead = new Image();
        this.images.playerGround = new Image();
        this.images.customSkin = new Image();

        // NPC sprites
        this.images.eagle = new Image();
        this.images.cop = new Image();
        this.images.granny = new Image();
        this.images.car = new Image();
        this.images.drone = new Image();
        this.images.dog = new Image();
        this.images.worker = new Image();
        this.images.fruit_vendor = new Image();
        this.images.cat = new Image();
        this.images.ac_unit = new Image();
        this.images.seagull = new Image();
        this.images.drone_l2 = new Image();
        this.images.squirrel = new Image();
        this.images.snail = new Image();
        this.images.fly = new Image();
        this.images.raccoon = new Image();
        this.images.trash_can = new Image();
        this.images.sparrow = new Image();
        this.images.rooftop_pigeon = new Image();
        
        // London NPCs
        this.images.business_person = new Image();
        this.images.tourist = new Image();
        this.images.london_cop = new Image();
        this.images.street_vendor = new Image();
        this.images.street_musician = new Image();
        this.images.london_car = new Image();
        this.images.pigeon = new Image();
        this.images.balloon = new Image();
        this.images.london_drone = new Image();
        this.images.london_pigeon = new Image();

        // Powerups & Projectiles
        this.images.coin = new Image();
        this.images.poopProjectile = new Image();
        this.images.poopTriple = new Image();
        this.images.energyIcon = new Image();
        this.images.laserProjectile = new Image();
        this.images.ammoIcon = new Image();

        // Set image sources
        this.images.playerSheet.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/59fa7a8db_FrnkdieTaube2-Kopie.png";
        this.images.playerGlide.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/71a9e1eb7_frnkoriginal.png";
        this.images.playerDead.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/ae2c71989_FrnkdieTaube4-Kopie.png";
        this.images.playerGround.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/dc76f3fcb_FrnkdieTaube5-Kopie.png";
        
        this.images.background2.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/d5ce2c1d7_ChatGPTImage7Jan202610_04_15.png";
        
        this.images.eagle.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/4d3c96004_file_00000000e518720cb81ddd8c61248547.png";
        this.images.cop.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/fbf63d394_file_00000000cca471f5b646734e98c18298.png";
        this.images.granny.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/4acddf445_Frnk-icon1.png";
        this.images.car.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/6beb89d0d_Frnk-icon4.png";
        this.images.drone.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/d41521585_ChatGPTImage7Jan202612_01_33.png";
        this.images.sparrow.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/06e3cfcff_Spatz.png";
        this.images.rooftop_pigeon.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/b0c727bde_Taube1.png";
        this.images.dog.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/7aca9a3aa_Frnk-icon5.png";
        this.images.worker.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6961111599b5db08cf38f4b2/4b4a1688e_Level1Gegner-Kopie5.png";
        this.images.fruit_vendor.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/c2434ba2d_Obsthndler.png";
        this.images.cat.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/5b5df510c_Level1Gegner-Kopie4.png";
        this.images.ac_unit.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/a4450d5d4_Level1Gegner.png";
        this.images.seagull.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/88d04a76d_Level1Gegner-Kopie.png";
        this.images.drone_l2.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/eb4e66d17_ChatGPTImage7Jan202612_01_33.png";
        this.images.squirrel.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/34a772965_Level3sandy.png";
        this.images.snail.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/842ab2a34_Level3Schnecke.png";
        this.images.fly.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/e9811e48b_Level3wespe.png";
        this.images.raccoon.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/8bbdd27ad_Level3Waschbr.png";
        this.images.trash_can.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/606803243_Level3Tonne.png";
        
        this.images.business_person.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/a7ef802e8_Buisnessman.png";
        this.images.tourist.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/2c4aec8be_Tourist.png";
        this.images.london_cop.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/683f0fef7_ChatGPTImage7Jan202610_45_15.png";
        this.images.street_vendor.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/ddea851fc_Inder.png";
        this.images.street_musician.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/507d69cbc_Musiker.png";
        this.images.london_car.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/51c40cf6b_FrnkdieTaube7-Kopie.png";
        this.images.pigeon.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/88d04a76d_Level1Gegner-Kopie.png";
        this.images.balloon.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/61f1abf56_Level1Gegner-Kopie3.png";
        this.images.london_drone.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/204dc8607_Drohne.png";
        this.images.london_pigeon.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/ba609c1c4_Taube1.png";
        
        this.images.coin.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/a3d089aef_FrnkdieTaubecoin.png";
        this.images.poopProjectile.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/6fef2bdb0_Frnkkacke-Kopie-Kopie.png";
        this.images.poopTriple.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/d851cff29_Frnkkacke-Kopie.png";
        this.images.energyIcon.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/55c3a6a9f_FrnkdieTaubeicon9.png";
        this.images.laserProjectile.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/laser.png";
        this.images.ammoIcon.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/06c8c939e_Frnkkrner.png";
        
        this.images.londonForeground1.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/57b677041_Strasse-1.png";
        this.images.londonForeground2.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/a85523873_Strasse-2.png";
        this.images.londonForeground3.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/e5a89918f_Strasse-3.png";
        this.images.rooftopForeground1.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/51fb3855b_Rooftop1.png";
        this.images.rooftopForeground2.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/d3b217c6a_Rooftop2.png";
        this.images.rooftopForeground3.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/5358e6ade_Rooftop3.png";

        return this.waitForLoad();
    }

    loadAudio() {
        this.audios.bgm = new Audio("https://codeskulptor-demos.commondatastorage.googleapis.com/GalaxyInvaders/theme_01.mp3");
        this.audios.fart = new Audio("https://www.soundjay.com/birds/sounds/hawk-screech-1.mp3");
        this.audios.explosion = new Audio("https://www.soundjay.com/nature/sounds/water-splash-1.mp3");
        this.audios.ouch = new Audio("https://www.myinstants.com/media/sounds/roblox-death-sound_1.mp3");

        this.audios.bgm.loop = true;
        this.audios.bgm.volume = 0.5;
        this.audios.fart.volume = 0.3;
        this.audios.explosion.volume = 0.6;
        this.audios.ouch.volume = 1.0;
    }

    async waitForLoad() {
        let loadedCount = 0;
        const totalImages = Object.keys(this.images).length;
        
        return new Promise((resolve) => {
            const checkLoad = () => {
                loadedCount++;
                if (loadedCount >= totalImages) {
                    this.loaded = true;
                    resolve();
                }
            };

            Object.values(this.images).forEach(img => {
                img.onload = checkLoad;
                if (img.complete) checkLoad();
            });
        });
    }

    setLevelBackground(levelName) {
        if (levelName === 'park') {
            this.images.background.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/e2de8800c_Level3Park.png";
        } else if (levelName === 'london') {
            this.images.background.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/7786d17f6_ChatGPTImage7Jan202610_45_40.png";
        } else if (levelName === 'rooftop') {
            this.images.background.src = "";
        } else {
            this.images.background.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693033c50efef1894f9768b3/c7155d711_file_00000000404471f788411228f72d739a.png";
        }
    }

    getImage(name) {
        return this.images[name];
    }

    getAudio(name) {
        return this.audios[name];
    }
}
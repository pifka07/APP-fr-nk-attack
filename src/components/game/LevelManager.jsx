// Level Manager - Handles level loading and switching

export class LevelManager {
    constructor() {
        this.currentLevel = null;
        this.levelCache = {};
    }

    async loadLevel(levelName) {
        // Check cache first
        if (this.levelCache[levelName]) {
            this.currentLevel = this.levelCache[levelName];
            return this.currentLevel;
        }

        const levelData = this.getDefaultLevel(levelName);
        this.levelCache[levelName] = levelData;
        this.currentLevel = levelData;
        return levelData;
    }

    getDefaultLevel(levelName) {
        // Fallback for when JSON doesn't exist yet
        const defaults = {
            downtown: {
                name: 'Downtown',
                groundY: 0.85,
                music: 'https://codeskulptor-demos.commondatastorage.googleapis.com/GalaxyInvaders/theme_01.mp3',
                groundNPCs: ['cop', 'granny', 'car', 'fruit_vendor', 'dog'],
                airNPCs: ['eagle', 'sparrow'],
                groundOffsets: {
                    cop: 200,
                    granny: 120,
                    car: 100,
                    fruit_vendor: 198,
                    dog: 40
                }
            },
            rooftop: {
                name: 'Rooftop',
                groundY: 0.85,
                music: 'https://codeskulptor-demos.commondatastorage.googleapis.com/pang/paza-moduless.mp3',
                groundNPCs: ['worker', 'cat', 'ac_unit'],
                airNPCs: ['rooftop_sparrow', 'rooftop_pigeon'],
                groundOffsets: {
                    worker: 160,
                    cat: 50,
                    ac_unit: 70
                }
            },
            park: {
                name: 'Park',
                groundY: 0.85,
                music: 'https://codeskulptor-demos.commondatastorage.googleapis.com/descent/background%20music.mp3',
                groundNPCs: ['squirrel', 'trash_can', 'snail'],
                airNPCs: ['fly'],
                groundOffsets: {
                    squirrel: 60,
                    trash_can: 70,
                    snail: 40
                }
            },
            london: {
                name: 'London',
                groundY: 0.995,
                music: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg',
                groundNPCs: ['tourist', 'business_person', 'london_cop', 'street_vendor', 'street_musician', 'london_car'],
                airNPCs: ['london_pigeon', 'balloon'],
                groundOffsets: {
                    tourist: 170,
                    business_person: 180,
                    london_cop: 180,
                    street_vendor: 220,
                    street_musician: 170,
                    london_car: 120
                }
            },
            paris: {
                name: 'Paris',
                groundY: 0.995,
                music: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg',
                groundNPCs: [],
                airNPCs: []
            },
            madrid: {
                name: 'Madrid',
                groundY: 0.995,
                music: 'https://commondatastorage.googleapis.com/codeskulptor-demos/riceracer_assets/music/race2.ogg',
                groundNPCs: [],
                airNPCs: []
            },
            rome: {
                name: 'Rom',
                groundY: 0.995,
                music: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Evilution.ogg',
                groundNPCs: [],
                airNPCs: []
            },
            berlin: {
                name: 'Berlin',
                groundY: 1.015,
                music: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3',
                groundNPCs: [],
                airNPCs: []
            },
            backrooms: {
                name: 'Backrooms',
                groundY: 0.88,
                music: 'https://commondatastorage.googleapis.com/codeskulptor-demos/pang/paza-moduless.mp3',
                groundNPCs: ['backrooms_shadow', 'backrooms_shadow_tall', 'backrooms_shadow_low'],
                airNPCs: ['backrooms_shadow'],
                groundOffsets: {
                    backrooms_shadow: 90,
                    backrooms_shadow_tall: 110,
                    backrooms_shadow_low: 55
                }
            }
        };

        return defaults[levelName] || defaults.downtown;
    }

    getCurrentLevel() {
        return this.currentLevel;
    }

    resetLevel() {
        // Reset logic when restarting level
        return this.currentLevel;
    }

    nextLevel(currentLevelName) {
        const levels = ['downtown', 'rooftop', 'park', 'london'];
        const currentIndex = levels.indexOf(currentLevelName);
        
        if (currentIndex < levels.length - 1) {
            return levels[currentIndex + 1];
        }
        
        return null; // No more levels
    }
}
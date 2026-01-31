/**
 * Standardisierte Level-Layer-Struktur für Europa und zukünftige Level
 * 
 * Ebenen-Hierarchie (von hinten nach vorne):
 * 1. Hintergrund (fest, keine Bewegung)
 * 2. Gebäude (scrollen mit mittlerer Geschwindigkeit)
 * 3. Bäume und Büsche (scrollen schneller als Gebäude)
 * 4. Menschen/NPCs (scrollen mit voller Spielgeschwindigkeit)
 * 5. Vögel (scrollen mit variabler Geschwindigkeit)
 */

export const LAYER_CONFIG = {
    // Layer-Typen und ihre Standard-Scroll-Multiplikatoren
    BACKGROUND: {
        name: 'background',
        scrollMultiplier: 0.15, // Sehr langsam, über 10000m Flugdistanz skaliert
        renderOrder: 1,
        description: 'Hintergrund scrollt langsam über gesamte Leveldistanz (10000m)'
    },
    
    BUILDINGS: {
        name: 'buildings',
        scrollMultiplier: 0.4, // 40% der Spielgeschwindigkeit
        renderOrder: 2,
        description: 'Gebäude im Hintergrund'
    },
    
    TREES: {
        name: 'trees',
        scrollMultiplier: 0.7, // 70% der Spielgeschwindigkeit
        renderOrder: 3,
        description: 'Bäume, Büsche, Vegetation'
    },
    
    GROUND: {
        name: 'ground',
        scrollMultiplier: 1.0, // 100% der Spielgeschwindigkeit
        renderOrder: 4,
        description: 'Boden/Straßenebene'
    },
    
    NPCS: {
        name: 'npcs',
        scrollMultiplier: 1.0, // 100% der Spielgeschwindigkeit
        renderOrder: 5,
        description: 'Menschen, Autos, Bodencharaktere'
    },
    
    BIRDS: {
        name: 'birds',
        scrollMultiplier: 0.8, // 80% der Spielgeschwindigkeit (variabel)
        renderOrder: 6,
        description: 'Vögel und fliegende Objekte',
        speedVariation: { min: 0.6, max: 1.2 } // Vögel können 60-120% der Basisgeschwindigkeit haben
    }
};

/**
 * Helper-Funktion zum Erstellen von Layer-Objekten
 * @param {string} layerType - Typ aus LAYER_CONFIG
 * @param {Array} assets - Array von Asset-Objekten mit {img, src}
 * @param {number} width - Canvas-Breite
 * @param {number} height - Canvas-Höhe
 * @param {number} scrollSpeed - Aktuelle Spielgeschwindigkeit
 * @returns {Array} Array von Layer-Elementen
 */
export function createLayerElements(layerType, assets, width, height, scrollSpeed) {
    const config = LAYER_CONFIG[layerType.toUpperCase()];
    if (!config) return [];
    
    return assets.map((asset, index) => ({
        x: width + index * 200, // Initialer Abstand
        img: asset.img,
        src: asset.src,
        width: asset.width || 100,
        height: asset.height || 100,
        scrollSpeed: scrollSpeed * config.scrollMultiplier,
        layer: config.name,
        renderOrder: config.renderOrder
    }));
}

/**
 * Level-Template für neue europäische Level
 */
export const EUROPA_LEVEL_TEMPLATE = {
    // Hintergrund-Konfiguration
    background: {
        image: '', // URL zum Hintergrundbild
        fixed: false, // Scrollt langsam über 10000m
        scale: 'cover', // 'cover', 'contain', 'stretch'
        scrollMultiplier: 0.15 // 15% der Spielgeschwindigkeit
    },
    
    // Gebäude-Layer
    buildings: {
        assets: [], // Array von Bild-URLs
        spawnInterval: { min: 500, max: 800 }, // Abstand zwischen Gebäuden
        heightRange: { min: 0.3, max: 0.6 }, // Höhe relativ zur Canvas-Höhe
        yOffset: -50 // Pixel über dem Boden
    },
    
    // Bäume/Büsche-Layer
    trees: {
        assets: [], // Array von Bild-URLs
        spawnInterval: { min: 200, max: 400 },
        heightRange: { min: 0.2, max: 0.35 },
        yOffset: -20
    },
    
    // Boden/Straße
    ground: {
        image: '', // URL zur Bodenebene
        height: 180,
        repeat: true // Für nahtloses Scrollen
    },
    
    // NPCs (Menschen, Autos)
    npcs: {
        types: [], // Array von NPC-Typen
        spawnWeights: {}, // Gewichtung der Spawn-Wahrscheinlichkeiten
        groundRatio: 0.7, // 70% Boden-NPCs, 30% andere
    },
    
    // Vögel
    birds: {
        types: [], // Array von Vogel-Typen
        spawnWeights: {},
        heightRange: { min: 80, max: 250 }, // Y-Position vom oberen Rand
        speedVariation: true
    }
};

/**
 * Beispiel-Konfiguration für ein Europa-Level
 */
export const EXAMPLE_LEVEL_CONFIG = {
    levelId: 'berlin',
    name: 'Berlin',
    
    background: {
        image: 'URL_ZUM_BERLIN_HINTERGRUND',
        fixed: false,
        scale: 'cover',
        scrollMultiplier: 0.15
    },
    
    buildings: {
        assets: [
            'URL_ZU_GEBÄUDE_1',
            'URL_ZU_GEBÄUDE_2',
            'URL_ZU_GEBÄUDE_3'
        ],
        spawnInterval: { min: 600, max: 900 },
        heightRange: { min: 0.4, max: 0.6 },
        yOffset: -40
    },
    
    trees: {
        assets: [
            'URL_ZU_BAUM_1',
            'URL_ZU_BAUM_2'
        ],
        spawnInterval: { min: 250, max: 450 },
        heightRange: { min: 0.25, max: 0.35 },
        yOffset: -20
    },
    
    ground: {
        image: 'URL_ZUR_STRASSE',
        height: 270,
        repeat: true
    },
    
    npcs: {
        types: ['berlin_tourist', 'berlin_hipster', 'berlin_car'],
        spawnWeights: {
            'berlin_tourist': 10,
            'berlin_hipster': 8,
            'berlin_car': 5
        },
        groundRatio: 0.7
    },
    
    birds: {
        types: ['berlin_crow', 'berlin_sparrow'],
        spawnWeights: {
            'berlin_crow': 7,
            'berlin_sparrow': 8
        },
        heightRange: { min: 80, max: 250 },
        speedVariation: true
    }
};
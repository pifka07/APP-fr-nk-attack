// Utility to remove the checkerboard transparency pattern from AI-generated NPC images.
// The image generator renders "transparent" areas as a gray checkerboard (#333333 / #555555).
// This function converts those gray pixels to actual transparent pixels via canvas chroma-keying.

export function removeCheckerboard(img) {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Detect checkerboard gray pixels (R≈G≈B, value between 25-120)
            const isGray = Math.abs(r - g) < 12 && Math.abs(g - b) < 12 && r >= 25 && r <= 120;
            if (isGray) {
                data[i + 3] = 0; // Make fully transparent
            }
        }

        ctx.putImageData(imageData, 0, 0);
    } catch (e) {
        console.error('Failed to process image transparency:', e);
    }

    return canvas;
}

// Loads an NPC image and replaces the checkerboard with real transparency once loaded.
export function loadTransparentNPC(IMAGES, key, src) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
        IMAGES.current[key] = removeCheckerboard(img);
    };
    img.src = src;
    IMAGES.current[key] = img;
}
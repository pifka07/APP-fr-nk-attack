// Utility to remove the checkerboard transparency pattern from AI-generated NPC images.
// The image generator renders "transparent" areas as a gray checkerboard pattern.
// This function converts those background pixels to actual transparent pixels via canvas chroma-keying.

export function removeCheckerboard(img) {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const w = canvas.width;
        const h = canvas.height;

        // Sample all edge pixels to detect background colors (handles checkerboard with multiple shades)
        const edgePixels = [];
        for (let x = 0; x < w; x += Math.max(1, Math.floor(w / 50))) {
            edgePixels.push([x, 0], [x, h - 1]);
        }
        for (let y = 0; y < h; y += Math.max(1, Math.floor(h / 50))) {
            edgePixels.push([0, y], [w - 1, y]);
        }

        // Collect distinct background color clusters from edges
        const bgColors = [];
        const clusterTolerance = 30;
        edgePixels.forEach(([cx, cy]) => {
            const idx = (cy * w + cx) * 4;
            const r = data[idx], g = data[idx + 1], b = data[idx + 2];
            const found = bgColors.some(c =>
                Math.abs(r - c.r) < clusterTolerance &&
                Math.abs(g - c.g) < clusterTolerance &&
                Math.abs(b - c.b) < clusterTolerance
            );
            if (!found) bgColors.push({ r, g, b });
        });

        // Wide tolerance to catch both checkerboard shades and anti-aliased edges
        const tolerance = 55;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Check if pixel is close to any sampled background color
            const isBg = bgColors.some(c =>
                Math.abs(r - c.r) < tolerance &&
                Math.abs(g - c.g) < tolerance &&
                Math.abs(b - c.b) < tolerance
            );
            if (isBg) {
                data[i + 3] = 0; // Make fully transparent
            }
        }

        ctx.putImageData(imageData, 0, 0);
    } catch (e) {
        console.error('Failed to process image transparency:', e);
    }

    return canvas;
}

// Loads an NPC image via fetch+blob to avoid CORS/tainted-canvas issues,
// then removes the checkerboard background.
export function loadTransparentNPC(IMAGES, key, src) {
    const fallbackImg = new Image();
    fallbackImg.src = src;
    IMAGES.current[key] = fallbackImg; // Show raw image immediately as fallback

    fetch(src)
        .then(res => {
            if (!res.ok) throw new Error('Fetch failed: ' + res.status);
            return res.blob();
        })
        .then(blob => {
            const url = URL.createObjectURL(blob);
            const tempImg = new Image();
            tempImg.onload = () => {
                IMAGES.current[key] = removeCheckerboard(tempImg);
                URL.revokeObjectURL(url);
            };
            tempImg.onerror = () => {
                URL.revokeObjectURL(url);
            };
            tempImg.src = url;
        })
        .catch(err => {
            console.error('Failed to load transparent NPC:', key, err);
        });
}
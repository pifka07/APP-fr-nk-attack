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

        // Sample corner pixels to detect the actual background color dynamically
        const corners = [
            [0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1],
            [1, 1], [w - 2, 1], [1, h - 2], [w - 2, h - 2]
        ];

        let bgR = 0, bgG = 0, bgB = 0;
        let count = 0;
        corners.forEach(([cx, cy]) => {
            const idx = (cy * w + cx) * 4;
            bgR += data[idx];
            bgG += data[idx + 1];
            bgB += data[idx + 2];
            count++;
        });
        bgR = Math.round(bgR / count);
        bgG = Math.round(bgG / count);
        bgB = Math.round(bgB / count);

        // Wide tolerance to catch both checkerboard shades and anti-aliased edges
        const tolerance = 50;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Check if pixel is close to the sampled background color
            if (Math.abs(r - bgR) < tolerance &&
                Math.abs(g - bgG) < tolerance &&
                Math.abs(b - bgB) < tolerance) {
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
// Level Renderer - Handles background and parallax rendering

export class LevelRenderer {
    constructor(assetLoader, levelData) {
        this.assetLoader = assetLoader;
        this.levelData = levelData;
    }

    drawBackground(ctx, width, height, distance) {
        const levelType = this.levelData.name.toLowerCase();

        if (levelType === 'detroit') {
            this.drawDetroitBackground(ctx, width, height, distance);
        } else if (levelType === 'backrooms') {
            this.drawBackroomsBackground(ctx, width, height, distance);
        } else if (levelType === 'rooftop') {
            // Sky blue background
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(0, 0, width, height);
            this.drawRooftopForeground(ctx, width, height, distance);
        } else if (levelType === 'london') {
            this.drawLondonBackground(ctx, width, height, distance);
            this.drawLondonForeground(ctx, width, height, distance);
        } else if (levelType === 'paris') {
            this.drawParisBackground(ctx, width, height, distance);
            this.drawParisForeground(ctx, width, height, distance);
        } else if (levelType === 'park') {
            this.drawScrollingBackground(ctx, width, height, distance, 10);
        } else {
            // Downtown - alternating backgrounds
            this.drawDowntownBackgrounds(ctx, width, height, distance);
        }
    }

    drawDetroitBackground(ctx, width, height, distance) {
        const bg = this.assetLoader.getImage('detroitBackground');
        if (!bg || !bg.complete || bg.naturalWidth === 0) {
            // Fallback: industrial grey sky
            const grad = ctx.createLinearGradient(0, 0, 0, height);
            grad.addColorStop(0, '#6b6555');
            grad.addColorStop(0.5, '#8a7d68');
            grad.addColorStop(1, '#4a4640');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);
            return;
        }

        // Slow parallax scroll for the background
        const scale = Math.max(width / bg.width, height / bg.height);
        const w = bg.width * scale;
        const h = bg.height * scale;
        const bgOffset = (distance * 1.5) % w;

        ctx.drawImage(bg, -bgOffset, 0, w, h);
        ctx.drawImage(bg, w - bgOffset, 0, w, h);

        // Subtle smog/haze overlay at the bottom for industrial feel
        const hazeGrad = ctx.createLinearGradient(0, height * 0.6, 0, height);
        hazeGrad.addColorStop(0, 'rgba(80, 70, 55, 0)');
        hazeGrad.addColorStop(1, 'rgba(60, 50, 40, 0.3)');
        ctx.fillStyle = hazeGrad;
        ctx.fillRect(0, height * 0.6, width, height * 0.4);
    }

    drawBackroomsBackground(ctx, width, height, distance) {
        const bg = this.assetLoader.getImage('backroomsBackground');
        
        // Always draw base yellow/brown gradient as fallback
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#1a1500');
        gradient.addColorStop(0.3, '#2d2200');
        gradient.addColorStop(0.7, '#3d3000');
        gradient.addColorStop(1, '#1a1000');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Scrolling backrooms background image
        if (bg && bg.complete && bg.naturalWidth > 0) {
            const scale = Math.max(width / bg.width, height / bg.height);
            const w = bg.width * scale;
            const h = bg.height * scale;
            const offset = (distance * 8) % w;
            ctx.globalAlpha = 0.85;
            ctx.drawImage(bg, -offset, 0, w, h);
            ctx.drawImage(bg, w - offset, 0, w, h);
            ctx.globalAlpha = 1.0;
        }

        // Flickering fluorescent light overlay effect
        const t = Date.now() * 0.003;
        const flicker = 0.03 + Math.abs(Math.sin(t * 7.3) * Math.sin(t * 3.1)) * 0.06;
        ctx.fillStyle = `rgba(255, 240, 150, ${flicker})`;
        ctx.fillRect(0, 0, width, height);

        // Draw ceiling lights
        const lightCount = 4;
        const lightSpacing = width / lightCount;
        const lightOffset = (distance * 12) % lightSpacing;
        for (let i = -1; i <= lightCount + 1; i++) {
            const lx = i * lightSpacing - lightOffset;
            const flick = Math.random() > 0.02 ? 1 : 0.3;
            ctx.save();
            ctx.globalAlpha = 0.6 * flick;
            const lg = ctx.createRadialGradient(lx, 0, 0, lx, 0, 120);
            lg.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
            lg.addColorStop(1, 'rgba(255, 255, 200, 0)');
            ctx.fillStyle = lg;
            ctx.fillRect(lx - 120, 0, 240, 200);
            ctx.globalAlpha = 1.0;
            ctx.restore();
        }

        // Ground - stained carpet (yellowish brown)
        const groundY = height * 0.88;
        const carpetGrad = ctx.createLinearGradient(0, groundY, 0, height);
        carpetGrad.addColorStop(0, '#4a3800');
        carpetGrad.addColorStop(1, '#2d2200');
        ctx.fillStyle = carpetGrad;
        ctx.fillRect(0, groundY, width, height - groundY);

        // Carpet pattern lines
        ctx.strokeStyle = 'rgba(90, 70, 0, 0.5)';
        ctx.lineWidth = 2;
        const patternOffset = (distance * 15) % 40;
        for (let x = -patternOffset; x < width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, groundY);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
    }

    drawScrollingBackground(ctx, width, height, distance, speed) {
        const bg = this.assetLoader.getImage('background');
        if (!bg || !bg.complete) {
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(0, 0, width, height);
            return;
        }

        const scale = Math.max(width / bg.width, height / bg.height);
        const w = bg.width * scale;
        const h = bg.height * scale;
        const offset = (distance * speed) % w;

        ctx.drawImage(bg, -offset, 0, w, h);
        ctx.drawImage(bg, w - offset, 0, w, h);
    }

    drawDowntownBackgrounds(ctx, width, height, distance) {
        const bg1 = this.assetLoader.getImage('background');
        const bg2 = this.assetLoader.getImage('background2');

        if (!bg1 || !bg1.complete || !bg2 || !bg2.complete) {
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(0, 0, width, height);
            return;
        }

        const scale1 = Math.max(width / bg1.width, height / bg1.height);
        const w1 = bg1.width * scale1;
        const h1 = bg1.height * scale1;

        const scale2 = Math.max(width / bg2.width, height / bg2.height);
        const w2 = bg2.width * scale2;
        const h2 = bg2.height * scale2;

        const totalWidth = w1 + w2;
        const offset = (distance * 10) % totalWidth;

        if (offset < w1) {
            ctx.drawImage(bg1, -offset, 0, w1, h1);
            ctx.drawImage(bg2, w1 - offset, 0, w2, h2);
        } else {
            const offset2 = offset - w1;
            ctx.drawImage(bg2, -offset2, 0, w2, h2);
            ctx.drawImage(bg1, w2 - offset2, 0, w1, h1);
        }
    }

    drawLondonBackground(ctx, width, height, distance) {
        const bg = this.assetLoader.getImage('background');
        if (!bg || !bg.complete) {
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(0, 0, width, height);
            return;
        }

        const scale = Math.max(width / bg.width, height / bg.height);
        const w = bg.width * scale;
        const h = bg.height * scale;
        const bgOffset = (distance * 1.5) % w;

        ctx.drawImage(bg, -bgOffset, 0, w, h);
        ctx.drawImage(bg, w - bgOffset, 0, w, h);
    }

    drawLondonForeground(ctx, width, height, distance) {
        const fg1 = this.assetLoader.getImage('londonForeground1');
        const fg2 = this.assetLoader.getImage('londonForeground2');
        const fg3 = this.assetLoader.getImage('londonForeground3');

        if (!fg1.complete || !fg2.complete || !fg3.complete) return;

        const fgScale = height / fg1.height;
        const fgW1 = fg1.width * fgScale;
        const fgW2 = fg2.width * fgScale;
        const fgW3 = fg3.width * fgScale;
        const fgH = height;

        const totalWidth = fgW1 + fgW2 + fgW3;
        const fgOffset = (distance * 15) % totalWidth;
        const fgY = height - fgH + 20;

        if (fgOffset < fgW1) {
            ctx.drawImage(fg1, -fgOffset, fgY, fgW1, fgH);
            ctx.drawImage(fg2, fgW1 - fgOffset, fgY, fgW2, fgH);
            ctx.drawImage(fg3, fgW1 + fgW2 - fgOffset, fgY, fgW3, fgH);
        } else if (fgOffset < fgW1 + fgW2) {
            const offset2 = fgOffset - fgW1;
            ctx.drawImage(fg2, -offset2, fgY, fgW2, fgH);
            ctx.drawImage(fg3, fgW2 - offset2, fgY, fgW3, fgH);
            ctx.drawImage(fg1, fgW2 + fgW3 - offset2, fgY, fgW1, fgH);
        } else {
            const offset3 = fgOffset - fgW1 - fgW2;
            ctx.drawImage(fg3, -offset3, fgY, fgW3, fgH);
            ctx.drawImage(fg1, fgW3 - offset3, fgY, fgW1, fgH);
            ctx.drawImage(fg2, fgW3 + fgW1 - offset3, fgY, fgW2, fgH);
        }
    }

    drawParisBackground(ctx, width, height, distance) {
        const bg = this.assetLoader.getImage('parisBackground');
        if (!bg || !bg.complete) {
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(0, 0, width, height);
            return;
        }

        const scale = Math.max(width / bg.width, height / bg.height);
        const w = bg.width * scale;
        const h = bg.height * scale;
        const bgOffset = (distance * 1.5) % w;

        ctx.drawImage(bg, -bgOffset, 0, w, h);
        ctx.drawImage(bg, w - bgOffset, 0, w, h);
    }

    drawParisForeground(ctx, width, height, distance) {
        const fg1 = this.assetLoader.getImage('parisForeground1');
        const fg2 = this.assetLoader.getImage('parisForeground2');
        const fg3 = this.assetLoader.getImage('parisForeground3');
        const fg4 = this.assetLoader.getImage('parisForeground4');

        if (!fg1.complete || !fg2.complete || !fg3.complete || !fg4.complete) return;

        const fgScale = height / fg1.height;
        const fgW1 = fg1.width * fgScale;
        const fgW2 = fg2.width * fgScale;
        const fgW3 = fg3.width * fgScale;
        const fgW4 = fg4.width * fgScale;
        const fgH = height;

        const totalWidth = fgW1 + fgW2 + fgW3 + fgW4;
        const fgOffset = (distance * 15) % totalWidth;
        const fgY = height - fgH + 20;

        if (fgOffset < fgW1) {
            ctx.drawImage(fg1, -fgOffset, fgY, fgW1, fgH);
            ctx.drawImage(fg2, fgW1 - fgOffset, fgY, fgW2, fgH);
            ctx.drawImage(fg3, fgW1 + fgW2 - fgOffset, fgY, fgW3, fgH);
            ctx.drawImage(fg4, fgW1 + fgW2 + fgW3 - fgOffset, fgY, fgW4, fgH);
        } else if (fgOffset < fgW1 + fgW2) {
            const offset2 = fgOffset - fgW1;
            ctx.drawImage(fg2, -offset2, fgY, fgW2, fgH);
            ctx.drawImage(fg3, fgW2 - offset2, fgY, fgW3, fgH);
            ctx.drawImage(fg4, fgW2 + fgW3 - offset2, fgY, fgW4, fgH);
            ctx.drawImage(fg1, fgW2 + fgW3 + fgW4 - offset2, fgY, fgW1, fgH);
        } else if (fgOffset < fgW1 + fgW2 + fgW3) {
            const offset3 = fgOffset - fgW1 - fgW2;
            ctx.drawImage(fg3, -offset3, fgY, fgW3, fgH);
            ctx.drawImage(fg4, fgW3 - offset3, fgY, fgW4, fgH);
            ctx.drawImage(fg1, fgW3 + fgW4 - offset3, fgY, fgW1, fgH);
            ctx.drawImage(fg2, fgW3 + fgW4 + fgW1 - offset3, fgY, fgW2, fgH);
        } else {
            const offset4 = fgOffset - fgW1 - fgW2 - fgW3;
            ctx.drawImage(fg4, -offset4, fgY, fgW4, fgH);
            ctx.drawImage(fg1, fgW4 - offset4, fgY, fgW1, fgH);
            ctx.drawImage(fg2, fgW4 + fgW1 - offset4, fgY, fgW2, fgH);
            ctx.drawImage(fg3, fgW4 + fgW1 + fgW2 - offset4, fgY, fgW3, fgH);
        }
    }

    drawRooftopForeground(ctx, width, height, distance) {
        const fg1 = this.assetLoader.getImage('rooftopForeground1');
        const fg2 = this.assetLoader.getImage('rooftopForeground2');
        const fg3 = this.assetLoader.getImage('rooftopForeground3');

        if (!fg1.complete || !fg2.complete || !fg3.complete) return;

        const fgScale = height / fg1.height;
        const fgW1 = fg1.width * fgScale;
        const fgW2 = fg2.width * fgScale;
        const fgW3 = fg3.width * fgScale;
        const fgH = height;

        const totalWidth = fgW1 + fgW2 + fgW3;
        const fgOffset = (distance * 10) % totalWidth;
        const fgY = 0;

        if (fgOffset < fgW1) {
            ctx.drawImage(fg1, -fgOffset, fgY, fgW1, fgH);
            ctx.drawImage(fg2, fgW1 - fgOffset, fgY, fgW2, fgH);
            ctx.drawImage(fg3, fgW1 + fgW2 - fgOffset, fgY, fgW3, fgH);
        } else if (fgOffset < fgW1 + fgW2) {
            const offset2 = fgOffset - fgW1;
            ctx.drawImage(fg2, -offset2, fgY, fgW2, fgH);
            ctx.drawImage(fg3, fgW2 - offset2, fgY, fgW3, fgH);
            ctx.drawImage(fg1, fgW2 + fgW3 - offset2, fgY, fgW1, fgH);
        } else {
            const offset3 = fgOffset - fgW1 - fgW2;
            ctx.drawImage(fg3, -offset3, fgY, fgW3, fgH);
            ctx.drawImage(fg1, fgW3 - offset3, fgY, fgW1, fgH);
            ctx.drawImage(fg2, fgW3 + fgW1 - offset3, fgY, fgW2, fgH);
        }
    }
}
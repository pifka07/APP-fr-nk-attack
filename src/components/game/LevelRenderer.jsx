// Level Renderer - Handles background and parallax rendering

export class LevelRenderer {
    constructor(assetLoader, levelData) {
        this.assetLoader = assetLoader;
        this.levelData = levelData;
    }

    drawBackground(ctx, width, height, distance) {
        const levelType = this.levelData.name.toLowerCase();

        if (levelType === 'rooftop') {
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
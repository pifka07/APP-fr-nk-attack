// Helper to draw enemies on canvas - extracted to keep GameEngine under size limit

export function drawEnemies(ctx, enemies, IMAGES, animFrame, isImageValid, SPRITE_MAP) {
    enemies.forEach(e => {
        if (!e.spriteType) {
            ctx.font = '30px serif';
            ctx.fillText('📦', e.x + e.width/2, e.y + e.height/2);
            return;
        }

        let sheet, sx, sy, sw, sh;

        const setFullImage = (img) => {
            if (isImageValid(img)) { sheet = img; sx = 0; sy = 0; sw = img.width; sh = img.height; return true; }
            return false;
        };

        const imgKey = e.spriteType;
        if (IMAGES[imgKey] && isImageValid(IMAGES[imgKey])) {
            setFullImage(IMAGES[imgKey]);
        } else {
            sheet = IMAGES.enemiesSheet;
            const frames = SPRITE_MAP.enemies[e.spriteType] || SPRITE_MAP.enemies.car;
            const def = frames[0];
            sx = def.x * sheet.width; sy = def.y * sheet.height;
            sw = def.w * sheet.width; sh = def.h * sheet.height;
        }

        ctx.save();
        ctx.translate(e.x + e.width/2, e.y + e.height/2);
        const af = animFrame;
        const st = e.spriteType;
        if (st==='car'||st==='cop') ctx.translate(0,Math.sin(af*0.5)*2);
        else if (st==='granny'||st==='snail') ctx.rotate(Math.sin(af*0.2)*0.1);
        else if (st==='fly') ctx.translate(Math.sin(af*0.8)*5,Math.cos(af*0.8)*5);
        else if (st==='squirrel') ctx.translate(0,Math.abs(Math.sin(af*0.4))*-10);
        else if (st==='business_person'||st==='tourist') ctx.translate(Math.sin(af*0.3)*2,0);
        else if (st.includes('bird')||st.includes('pigeon')) ctx.translate(0,Math.sin(af*0.4)*3);
        else if (st==='rooftop_sparrow') ctx.translate(0,Math.sin(af*0.6)*2);
        else if (st.includes('drone')||st.includes('balloon')) ctx.translate(0,Math.sin(af*0.3)*2);
        else if (st.startsWith('berlin_npc')) ctx.translate(Math.sin(af*0.1)*0.5,0);
        else if (st.startsWith('backrooms_shadow')) {
            // Eerie floating/glitching effect for shadow entities
            ctx.translate(Math.sin(af*0.4)*3, Math.cos(af*0.3)*4);
            ctx.globalAlpha = 0.75 + Math.sin(af*0.8)*0.25;
        }

        if (st==='trash_can') {
            const jO=Math.abs(Math.sin(af*0.1))*40;
            if(isImageValid(IMAGES.raccoon))ctx.drawImage(IMAGES.raccoon,-25,-e.height/2-jO+10,50,50);
            if(isImageValid(sheet))ctx.drawImage(sheet,sx,sy,sw,sh,-e.width/2,-e.height/2,e.width,e.height);
        } else if (st.startsWith('backrooms_shadow')) {
            if (isImageValid(sheet)) {
                // Draw with dark tint for shadow effect
                ctx.drawImage(sheet,sx,sy,sw,sh,-e.width/2,-e.height/2,e.width,e.height);
                // Overlay black silhouette
                ctx.globalCompositeOperation = 'multiply';
                ctx.fillStyle = 'rgba(0,0,0,0.85)';
                ctx.fillRect(-e.width/2,-e.height/2,e.width,e.height);
                ctx.globalCompositeOperation = 'source-over';
                // Glowing white eyes
                ctx.fillStyle = 'rgba(255,255,255,0.9)';
                ctx.beginPath(); ctx.ellipse(-e.width*0.15,-e.height*0.18,4,2.5,0,0,Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.ellipse(e.width*0.15,-e.height*0.18,4,2.5,0,0,Math.PI*2); ctx.fill();
            } else {
                // Fallback: draw pure black silhouette
                ctx.fillStyle = 'rgba(0,0,0,0.9)';
                ctx.fillRect(-e.width/2,-e.height/2,e.width,e.height);
                ctx.fillStyle = 'rgba(255,255,255,0.9)';
                ctx.beginPath(); ctx.ellipse(-e.width*0.15,-e.height*0.18,4,2.5,0,0,Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.ellipse(e.width*0.15,-e.height*0.18,4,2.5,0,0,Math.PI*2); ctx.fill();
            }
            ctx.globalAlpha = 1.0;
        } else if (st!=='smoke'&&isImageValid(sheet)) {
            ctx.drawImage(sheet,sx,sy,sw,sh,-e.width/2,-e.height/2,e.width,e.height);
        } else if (st==='smoke') {
            ctx.fillStyle='rgba(150,150,150,0.8)'; ctx.beginPath(); ctx.arc(0,0,e.width/2,0,Math.PI*2); ctx.fill();
        }
        if (st==='ac_unit'&&e.isBlowing) {
            ctx.strokeStyle='rgba(200,255,255,0.4)'; ctx.lineWidth=3; ctx.beginPath();
            const t=af*0.2; for(let i=-1;i<=1;i++){const xO=i*15+Math.sin(t+i)*5,yO=(af*2+i*20)%100; ctx.moveTo(xO,-e.height/2-yO); ctx.lineTo(xO,-e.height/2-yO-30);} ctx.stroke();
        }
        ctx.restore();
    });
}
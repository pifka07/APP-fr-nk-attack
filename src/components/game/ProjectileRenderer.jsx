// Handles drawing of all projectile types for GameEngine
export function drawProjectiles(ctx, poops, animFrame, IMAGES, isImageValid) {
    poops.forEach(p => {
        if (!p.active) return;
        ctx.save();
        ctx.translate(p.x, p.y);

        if (p.type === 'laser') {
            ctx.shadowColor = '#ff00ff'; ctx.shadowBlur = 15;
            ctx.fillStyle = '#ff00ff'; ctx.fillRect(-p.width/2, -p.height/2, p.width, p.height);
            ctx.fillStyle = '#ffffff'; ctx.fillRect(-p.width/2+5, -p.height/2+2, p.width-10, p.height-4);
            ctx.shadowBlur = 0;
        } else if (p.type === 'lightning') {
            ctx.shadowColor = '#00ffff'; ctx.shadowBlur = 20; ctx.strokeStyle = '#00ffff'; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(-p.width/2,-p.height/2); ctx.lineTo(-p.width/4,0); ctx.lineTo(p.width/4,-p.height/4); ctx.lineTo(p.width/2,p.height/2); ctx.stroke();
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(-p.width/2,-p.height/2); ctx.lineTo(-p.width/4,0); ctx.lineTo(p.width/4,-p.height/4); ctx.lineTo(p.width/2,p.height/2); ctx.stroke();
            ctx.shadowBlur = 0;
        } else if (p.type === 'goldbar') {
            ctx.rotate(animFrame * 0.15); ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 15;
            ctx.fillStyle = '#ffd700'; ctx.fillRect(-p.width/2,-p.height/2,p.width,p.height);
            ctx.fillStyle = '#ffed4e'; ctx.fillRect(-p.width/2+2,-p.height/2+2,p.width-4,p.height-4);
            ctx.shadowBlur = 0;
        } else if (p.type === 'candycane') {
            ctx.rotate(animFrame * 0.25); ctx.shadowColor = '#dc2626'; ctx.shadowBlur = 10;
            ctx.fillStyle = '#dc2626'; ctx.fillRect(-p.width/2,-p.height/2,p.width,p.height);
            ctx.fillStyle = '#ffffff';
            for (let i=0;i<3;i++) { const o=(i*p.width/3)-p.width/2; ctx.fillRect(o,-p.height/2,p.width/6,p.height); }
            ctx.shadowBlur = 0;
        } else if (p.type === 'bubble') {
            const sc=1+Math.sin(animFrame*0.15)*0.1; ctx.scale(sc,sc);
            ctx.shadowColor='#ec4899'; ctx.shadowBlur=15; ctx.fillStyle='rgba(236,72,153,0.3)';
            ctx.beginPath(); ctx.arc(0,0,p.width/2,0,Math.PI*2); ctx.fill();
            ctx.fillStyle='rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.arc(-p.width/6,-p.height/6,p.width/6,0,Math.PI*2); ctx.fill();
            ctx.shadowBlur=0;
        } else if (p.type === 'batarang') {
            ctx.rotate(animFrame * 0.35); ctx.shadowColor = '#1f2937'; ctx.shadowBlur = 12;
            ctx.fillStyle='#1f2937'; ctx.beginPath();
            ctx.moveTo(0,0); ctx.quadraticCurveTo(-p.width/2,-p.height/4,-p.width/2,p.height/3); ctx.quadraticCurveTo(-p.width/3,p.height/4,0,0);
            ctx.moveTo(0,0); ctx.quadraticCurveTo(p.width/2,-p.height/4,p.width/2,p.height/3); ctx.quadraticCurveTo(p.width/3,p.height/4,0,0);
            ctx.fill(); ctx.shadowBlur=0;
        } else if (p.type === 'bone') {
            ctx.rotate(animFrame * 0.25);
            if (isImageValid(IMAGES.boneProjectile)) {
                ctx.drawImage(IMAGES.boneProjectile,-p.width/2,-p.height/2,p.width,p.height);
            } else {
                ctx.fillStyle='#f5f5dc'; ctx.fillRect(-p.width/2,-p.height/2,p.width,p.height);
            }
        } else if (p.type === 'shuriken') {
            ctx.rotate(animFrame * 0.3); ctx.shadowColor='#94a3b8'; ctx.shadowBlur=10;
            ctx.fillStyle='#cbd5e1'; ctx.beginPath();
            for(let i=0;i<4;i++){const a=(i*Math.PI/2)-Math.PI/4,r=p.width/2; ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r); ctx.lineTo(Math.cos(a+Math.PI/4)*(r*0.4),Math.sin(a+Math.PI/4)*(r*0.4));}
            ctx.closePath(); ctx.fill(); ctx.shadowBlur=0;
        } else if (p.type === 'ghost_poop') {
            ctx.rotate(animFrame * 0.2); ctx.shadowColor='#ffffff'; ctx.shadowBlur=10;
            ctx.fillStyle='#ffffff'; ctx.beginPath(); ctx.arc(0,0,p.width/2,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
        } else if (p.type === 'grenade') {
            ctx.rotate(animFrame * 0.3); ctx.fillStyle='#556b2f';
            ctx.beginPath(); ctx.ellipse(0,2,p.width/2.5,p.height/2,0,0,Math.PI*2); ctx.fill();
            ctx.strokeStyle='#ffd700'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(-p.width/3,-p.height/2.5,p.width/6,0,Math.PI*2); ctx.stroke();
        } else if (p.type === 'plank') {
            ctx.rotate(animFrame * 0.25); ctx.fillStyle='#8B4513'; ctx.fillRect(-p.width/2,-p.height/2,p.width,p.height);
            ctx.strokeStyle='#654321'; ctx.lineWidth=2;
            for(let i=0;i<3;i++){const o=(i-1)*p.height/4; ctx.beginPath(); ctx.moveTo(-p.width/2+5,o); ctx.lineTo(p.width/2-5,o); ctx.stroke();}
        } else if (p.type === 'stone') {
            ctx.rotate(animFrame * 0.2); ctx.fillStyle='#6b7280'; ctx.beginPath(); ctx.arc(0,0,p.width/2,0,Math.PI*2); ctx.fill();
        } else if (p.type === 'fireball') {
            ctx.rotate(animFrame * 0.3); ctx.shadowColor='#ff4500'; ctx.shadowBlur=20;
            ctx.fillStyle='#ff4500'; ctx.beginPath(); ctx.arc(0,0,p.width/2,0,Math.PI*2); ctx.fill();
            ctx.fillStyle='#ffff00'; ctx.beginPath(); ctx.arc(-p.width/8,-p.height/8,p.width/6,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
        } else if (p.type === 'icecube') {
            ctx.rotate(animFrame * 0.2); ctx.shadowColor='#00D4FF'; ctx.shadowBlur=15;
            ctx.fillStyle='rgba(135,206,235,0.8)'; ctx.fillRect(-p.width/2,-p.height/2,p.width,p.height);
            ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.fillRect(-p.width/3,-p.height/3,p.width/4,p.height/4); ctx.shadowBlur=0;
        } else {
            ctx.rotate(animFrame * 0.2);
            if (p.type === 'triple' && isImageValid(IMAGES.poopTriple)) {
                ctx.drawImage(IMAGES.poopTriple,-p.width/2,-p.height/2,p.width,p.height);
            } else if (isImageValid(IMAGES.poopProjectile)) {
                ctx.drawImage(IMAGES.poopProjectile,-p.width/2,-p.height/2,p.width,p.height);
            }
        }
        ctx.restore();
    });
}
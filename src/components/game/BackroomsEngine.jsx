import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';
import * as THREE from 'three';

const ROOM_W = 8;
const ROOM_H = 3.5;
const CORRIDOR_LEN = 12;
const SEGMENTS = 20; // How many corridor segments ahead

const BackroomsEngine = forwardRef(({ onGameOver, onScoreUpdate, onHealthUpdate, onComboUpdate, onAmmoUpdate, config = {}, soundEnabled = true, musicEnabled = true, onAssetsLoaded }, ref) => {
    const mountRef = useRef(null);
    const stateRef = useRef({
        isPlaying: false,
        speed: 0,
        lateralSpeed: 0,
        verticalSpeed: 0,
        posZ: 0,
        posX: 0,
        posY: 1.5,
        health: 100,
        score: 0,
        coins: 0,
        distance: 0,
        combo: 0,
        comboTimer: 0,
        ammo: 10,
        maxAmmo: 10,
        shadows: [],
        projectiles: [],
        particles: [],
        animFrame: 0,
        lastTime: 0,
    });
    const rendererRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rafRef = useRef(null);
    const corridorGroupRef = useRef(null);
    const shadowMeshesRef = useRef([]);
    const clockRef = useRef(new THREE.Clock());
    const [loadingDone, setLoadingDone] = useState(false);

    // Input state
    const inputRef = useRef({ up: false, down: false, left: false, right: false, dx: 0, dy: 0 });

    useImperativeHandle(ref, () => ({
        start: () => {
            const s = stateRef.current;
            s.isPlaying = true;
            s.health = 100;
            s.score = 0;
            s.coins = 0;
            s.distance = 0;
            s.combo = 0;
            s.posZ = 0;
            s.posX = 0;
            s.posY = 1.5;
            s.speed = 0.06;
            s.shadows = [];
            s.projectiles = [];
            s.particles = [];
            s.ammo = config.poopTankCapacity || 10;
            s.maxAmmo = config.poopTankCapacity || 10;
            if (onAmmoUpdate) onAmmoUpdate(s.ammo);
            if (onHealthUpdate) onHealthUpdate(100);
            loop();
        },
        stop: () => {
            stateRef.current.isPlaying = false;
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        },
        movePlayer: (dy) => {
            inputRef.current.dy += dy;
        },
        moveLateral: (dx) => {
            inputRef.current.dx += dx;
        },
        startInput: () => {},
        endInput: () => {},
        poop: () => {
            spawnProjectile();
        }
    }));

    const spawnProjectile = () => {
        const s = stateRef.current;
        if (!s.isPlaying || s.ammo <= 0) return;
        s.ammo--;
        if (onAmmoUpdate) onAmmoUpdate(s.ammo);

        // Create sphere for projectile
        const geo = new THREE.SphereGeometry(0.15, 8, 8);
        const mat = new THREE.MeshPhongMaterial({ color: 0x8B4513, emissive: 0x3d1f00 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(s.posX, s.posY, s.posZ - 1);
        sceneRef.current.add(mesh);
        s.projectiles.push({ mesh, vz: -0.5, vy: -0.02, active: true });
    };

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        // Scene
        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0xd4a017, 5, 40);
        scene.background = new THREE.Color(0xd4a017);
        sceneRef.current = scene;

        // Camera
        const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 60);
        camera.position.set(0, 1.5, 0);
        cameraRef.current = camera;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: false });
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        renderer.shadowMap.enabled = false;
        mount.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Lighting - fluorescent flicker effect
        const ambientLight = new THREE.AmbientLight(0xfff5c0, 0.4);
        scene.add(ambientLight);

        // Build corridor segments
        buildCorridor(scene);

        // Resize
        const handleResize = () => {
            if (!mount) return;
            camera.aspect = mount.clientWidth / mount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mount.clientWidth, mount.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        setLoadingDone(true);
        if (onAssetsLoaded) onAssetsLoaded();

        return () => {
            window.removeEventListener('resize', handleResize);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            renderer.dispose();
            if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
        };
    }, []);

    const buildCorridor = (scene) => {
        const group = new THREE.Group();
        corridorGroupRef.current = group;

        // Wallpaper yellow texture via canvas
        const wallCanvas = document.createElement('canvas');
        wallCanvas.width = 256; wallCanvas.height = 256;
        const wCtx = wallCanvas.getContext('2d');
        // Base yellow
        wCtx.fillStyle = '#c8a000';
        wCtx.fillRect(0, 0, 256, 256);
        // Grid pattern
        wCtx.strokeStyle = '#a07800';
        wCtx.lineWidth = 2;
        for (let i = 0; i < 256; i += 32) {
            wCtx.beginPath(); wCtx.moveTo(i, 0); wCtx.lineTo(i, 256); wCtx.stroke();
            wCtx.beginPath(); wCtx.moveTo(0, i); wCtx.lineTo(256, i); wCtx.stroke();
        }
        const wallTex = new THREE.CanvasTexture(wallCanvas);
        wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping;
        wallTex.repeat.set(4, 2);

        const floorCanvas = document.createElement('canvas');
        floorCanvas.width = 256; floorCanvas.height = 256;
        const fCtx = floorCanvas.getContext('2d');
        fCtx.fillStyle = '#b8a060';
        fCtx.fillRect(0, 0, 256, 256);
        fCtx.strokeStyle = '#8a7040';
        fCtx.lineWidth = 3;
        for (let i = 0; i < 256; i += 64) {
            fCtx.beginPath(); fCtx.moveTo(i, 0); fCtx.lineTo(i, 256); fCtx.stroke();
            fCtx.beginPath(); fCtx.moveTo(0, i); fCtx.lineTo(256, i); fCtx.stroke();
        }
        const floorTex = new THREE.CanvasTexture(floorCanvas);
        floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
        floorTex.repeat.set(2, 8);

        const ceilCanvas = document.createElement('canvas');
        ceilCanvas.width = 128; ceilCanvas.height = 128;
        const cCtx = ceilCanvas.getContext('2d');
        cCtx.fillStyle = '#d4c080';
        cCtx.fillRect(0, 0, 128, 128);
        const ceilTex = new THREE.CanvasTexture(ceilCanvas);
        ceilTex.wrapS = ceilTex.wrapT = THREE.RepeatWrapping;
        ceilTex.repeat.set(2, 6);

        const wallMat = new THREE.MeshLambertMaterial({ map: wallTex });
        const floorMat = new THREE.MeshLambertMaterial({ map: floorTex });
        const ceilMat = new THREE.MeshLambertMaterial({ map: ceilTex });
        const totalLen = CORRIDOR_LEN * SEGMENTS;

        // Floor
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(ROOM_W, totalLen),
            floorMat
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(0, 0, -totalLen / 2);
        group.add(floor);

        // Ceiling
        const ceil = new THREE.Mesh(
            new THREE.PlaneGeometry(ROOM_W, totalLen),
            ceilMat
        );
        ceil.rotation.x = Math.PI / 2;
        ceil.position.set(0, ROOM_H, -totalLen / 2);
        group.add(ceil);

        // Left wall
        const leftWall = new THREE.Mesh(
            new THREE.PlaneGeometry(totalLen, ROOM_H),
            wallMat
        );
        leftWall.rotation.y = Math.PI / 2;
        leftWall.position.set(-ROOM_W / 2, ROOM_H / 2, -totalLen / 2);
        group.add(leftWall);

        // Right wall
        const rightWall = new THREE.Mesh(
            new THREE.PlaneGeometry(totalLen, ROOM_H),
            wallMat.clone()
        );
        rightWall.rotation.y = -Math.PI / 2;
        rightWall.position.set(ROOM_W / 2, ROOM_H / 2, -totalLen / 2);
        group.add(rightWall);

        // Ceiling lights - fluorescent tubes every CORRIDOR_LEN
        for (let i = 0; i < SEGMENTS; i++) {
            const z = -i * CORRIDOR_LEN - 3;
            const lightGeo = new THREE.BoxGeometry(0.3, 0.05, 1.5);
            const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffc0 });
            const lightMesh = new THREE.Mesh(lightGeo, lightMat);
            lightMesh.position.set(0, ROOM_H - 0.05, z);
            group.add(lightMesh);

            const pointLight = new THREE.PointLight(0xffffc0, 1.5, CORRIDOR_LEN * 1.2);
            pointLight.position.set(0, ROOM_H - 0.2, z);
            group.add(pointLight);
        }

        // Column pillars every segment
        for (let i = 0; i < SEGMENTS; i++) {
            const z = -i * CORRIDOR_LEN;
            [-ROOM_W/2 + 0.3, ROOM_W/2 - 0.3].forEach(x => {
                const pillarGeo = new THREE.BoxGeometry(0.3, ROOM_H, 0.3);
                const pillarMat = new THREE.MeshLambertMaterial({ color: 0xa08020 });
                const pillar = new THREE.Mesh(pillarGeo, pillarMat);
                pillar.position.set(x, ROOM_H / 2, z);
                group.add(pillar);
            });
        }

        scene.add(group);

        // Spawn initial shadows
        spawnShadows(scene);
    };

    const spawnShadows = (scene) => {
        const s = stateRef.current;
        for (let i = 0; i < 8; i++) {
            spawnOneShadow(scene, -10 - i * 15);
        }
    };

    const spawnOneShadow = (scene, z) => {
        const s = stateRef.current;
        const spawnZ = z || (s.posZ - 20 - Math.random() * 30);
        const x = (Math.random() - 0.5) * (ROOM_W - 1.5);
        // Both types can fly - y from near floor to near ceiling
        const y = 0.5 + Math.random() * (ROOM_H - 1.0);

        const type = Math.random() < 0.5 ? 'blob' : 'spider';
        const group = new THREE.Group();
        group.position.set(x, y, spawnZ);

        if (type === 'blob') {
            // Black smoke blob with glowing white eyes and red grin
            const bodyGeo = new THREE.SphereGeometry(0.55, 12, 12);
            const bodyMat = new THREE.MeshLambertMaterial({ color: 0x080808, transparent: true, opacity: 0.92 });
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            group.add(body);

            // Smoke puffs around body
            for (let i = 0; i < 6; i++) {
                const pGeo = new THREE.SphereGeometry(0.28 + Math.random() * 0.18, 6, 6);
                const pMat = new THREE.MeshLambertMaterial({ color: 0x111111, transparent: true, opacity: 0.5 });
                const puff = new THREE.Mesh(pGeo, pMat);
                const angle = (i / 6) * Math.PI * 2;
                puff.position.set(Math.cos(angle) * 0.45, Math.sin(angle) * 0.3, 0);
                group.add(puff);
            }

            // White glowing eyes
            const eyeGeo = new THREE.SphereGeometry(0.08, 8, 8);
            const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
            eyeL.position.set(-0.18, 0.1, 0.5);
            const eyeR = new THREE.Mesh(eyeGeo, eyeMat.clone());
            eyeR.position.set(0.18, 0.1, 0.5);
            group.add(eyeL);
            group.add(eyeR);

            // Red grin (arc of teeth segments)
            const teethCount = 7;
            for (let i = 0; i < teethCount; i++) {
                const t = (i / (teethCount - 1)) - 0.5;
                const tGeo = new THREE.BoxGeometry(0.07, 0.09, 0.04);
                const tMat = new THREE.MeshBasicMaterial({ color: 0xff2200 });
                const tooth = new THREE.Mesh(tGeo, tMat);
                tooth.position.set(t * 0.5, -0.12 + Math.abs(t) * 0.08, 0.5);
                group.add(tooth);
            }

        } else {
            // Long-legged spider creature (black tendrils)
            const bodyGeo = new THREE.SphereGeometry(0.22, 8, 8);
            const bodyMat = new THREE.MeshLambertMaterial({ color: 0x060606 });
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            body.scale.set(1.4, 0.8, 1);
            group.add(body);

            // Long spindly legs (4 each side)
            const legMat = new THREE.MeshLambertMaterial({ color: 0x080808 });
            const legPositions = [-3, -1, 1, 3];
            legPositions.forEach((offset, i) => {
                [-1, 1].forEach(side => {
                    // Upper segment
                    const upGeo = new THREE.CylinderGeometry(0.025, 0.015, 0.7, 4);
                    const up = new THREE.Mesh(upGeo, legMat);
                    up.position.set(side * 0.2, -0.1, offset * 0.12);
                    up.rotation.z = side * (Math.PI / 4 + i * 0.1);
                    up.rotation.x = offset * 0.3;
                    group.add(up);

                    // Lower segment (longer, draping down)
                    const downGeo = new THREE.CylinderGeometry(0.015, 0.005, 1.1, 4);
                    const down = new THREE.Mesh(downGeo, legMat.clone());
                    const upEnd = new THREE.Vector3(
                        side * (0.2 + Math.cos(side * (Math.PI / 4 + i * 0.1)) * 0.35),
                        -0.1 + Math.sin(side * (Math.PI / 4 + i * 0.1)) * 0.35,
                        offset * 0.12
                    );
                    down.position.set(upEnd.x + side * 0.1, upEnd.y - 0.55, upEnd.z + offset * 0.1);
                    down.rotation.z = side * 0.3;
                    down.rotation.x = offset * 0.4;
                    group.add(down);
                });
            });

            // Red eyes
            const eyeGeo = new THREE.SphereGeometry(0.05, 6, 6);
            const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            for (let i = -1; i <= 1; i += 2) {
                const eye = new THREE.Mesh(eyeGeo, eyeMat.clone());
                eye.position.set(i * 0.1, 0.08, 0.22);
                group.add(eye);
            }
        }

        sceneRef.current.add(group);
        s.shadows.push({
            mesh: group,
            hp: 1,
            isTarget: true,
            isObstacle: true,
            scoreValue: type === 'spider' ? 35 : 25,
            vz: 0.015 + Math.random() * 0.025,
            type,
            floatOffset: Math.random() * Math.PI * 2,
            floatSpeed: 0.8 + Math.random() * 1.2,
        });
    };

    const loop = () => {
        const s = stateRef.current;
        if (!s.isPlaying) return;

        const delta = clockRef.current.getDelta();
        s.animFrame++;
        const t = Date.now() * 0.001;

        // Flicker lights
        sceneRef.current.children.forEach(child => {
            if (child instanceof THREE.PointLight) {
                child.intensity = 1.2 + Math.sin(t * 8 + child.position.z) * 0.3 + (Math.random() < 0.02 ? -0.8 : 0);
            }
        });

        // Move camera forward
        s.posZ -= s.speed * 60 * delta;
        s.distance += s.speed * 60 * delta * 0.5;

        // Apply input
        const lateralForce = inputRef.current.dx * 0.04;
        const verticalForce = inputRef.current.dy * 0.025;
        inputRef.current.dx *= 0.7;
        inputRef.current.dy *= 0.7;

        s.posX = Math.max(-ROOM_W/2 + 0.5, Math.min(ROOM_W/2 - 0.5, s.posX + lateralForce));
        s.posY = Math.max(0.4, Math.min(ROOM_H - 0.4, s.posY + verticalForce));

        // Subtle camera sway
        const swayX = Math.sin(t * 0.8) * 0.05;
        const swayY = Math.cos(t * 1.1) * 0.03;
        cameraRef.current.position.set(s.posX + swayX, s.posY + swayY, s.posZ);
        cameraRef.current.lookAt(s.posX + swayX, s.posY + swayY, s.posZ - 10);

        // Increase speed gradually - faster acceleration
        s.speed = Math.min(0.22, s.speed + 0.00008);

        // Score
        s.score += 1;
        onScoreUpdate(s.score, s.coins, Math.floor(s.distance));

        // Spawn more shadows
        const lastShadow = s.shadows[s.shadows.length - 1];
        if (!lastShadow || lastShadow.mesh.position.z > s.posZ - 25) {
            spawnOneShadow(sceneRef.current, s.posZ - 30 - Math.random() * 20);
        }

        // Update shadows - flying/floating movement
        s.shadows.forEach(sh => {
            sh.mesh.position.z += sh.vz;
            // Floating bob up/down
            sh.mesh.position.y += Math.sin(t * sh.floatSpeed + sh.floatOffset) * 0.008;
            // Slight lateral drift
            sh.mesh.position.x += Math.cos(t * (sh.floatSpeed * 0.5) + sh.floatOffset) * 0.003;
            // Clamp within corridor
            sh.mesh.position.x = Math.max(-ROOM_W/2 + 0.6, Math.min(ROOM_W/2 - 0.6, sh.mesh.position.x));
            sh.mesh.position.y = Math.max(0.3, Math.min(ROOM_H - 0.3, sh.mesh.position.y));
            // Face player
            sh.mesh.lookAt(s.posX, s.posY, s.posZ);
        });

        // Update projectiles
        s.projectiles.forEach(p => {
            if (!p.active) return;
            p.mesh.position.z += p.vz;
            p.mesh.position.y += p.vy;

            // Hit shadows
            s.shadows.forEach(sh => {
                if (sh.hp > 0) {
                    const dx = p.mesh.position.x - sh.mesh.position.x;
                    const dy = p.mesh.position.y - sh.mesh.position.y;
                    const dz = p.mesh.position.z - sh.mesh.position.z;
                    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 1 && Math.abs(dz) < 0.5) {
                        sh.hp = 0;
                        p.active = false;
                        sceneRef.current.remove(sh.mesh);
                        sceneRef.current.remove(p.mesh);
                        s.score += 50;
                        s.coins += 2;
                        s.combo++;
                        s.comboTimer = 2000;
                        if (onComboUpdate) onComboUpdate(s.combo);
                        onScoreUpdate(s.score, s.coins, Math.floor(s.distance));
                    }
                }
            });

            // Remove if too far
            if (p.mesh.position.z < s.posZ - 30) {
                p.active = false;
                sceneRef.current.remove(p.mesh);
            }
        });

        // Combo timer
        if (s.combo > 0) {
            s.comboTimer -= delta * 1000;
            if (s.comboTimer <= 0) {
                s.combo = 0;
                if (onComboUpdate) onComboUpdate(0);
            }
        }

        // Player hits shadow
        s.shadows.forEach(sh => {
            if (sh.hp > 0 && sh.isObstacle) {
                const dx = s.posX - sh.mesh.position.x;
                const dy = s.posY - sh.mesh.position.y;
                const dz = s.posZ - sh.mesh.position.z;
                if (Math.abs(dx) < 0.6 && Math.abs(dy) < 1.1 && Math.abs(dz) < 0.6) {
                    sh.hp = 0;
                    sceneRef.current.remove(sh.mesh);
                    s.health -= 20;
                    if (onHealthUpdate) onHealthUpdate(s.health);
                    if (s.health <= 0) {
                        s.isPlaying = false;
                        cancelAnimationFrame(rafRef.current);
                        onGameOver({ score: s.score, coins: s.coins, distance: Math.floor(s.distance) });
                        return;
                    }
                }
            }
        });

        // Ammo refill slowly
        if (s.animFrame % 300 === 0 && s.ammo < s.maxAmmo) {
            s.ammo = Math.min(s.maxAmmo, s.ammo + 1);
            if (onAmmoUpdate) onAmmoUpdate(s.ammo);
        }

        // Cleanup dead shadows/projectiles
        s.shadows = s.shadows.filter(sh => sh.hp > 0 && sh.mesh.position.z > s.posZ - 60);
        s.projectiles = s.projectiles.filter(p => p.active);

        rendererRef.current.render(sceneRef.current, cameraRef.current);
        rafRef.current = requestAnimationFrame(loop);
    };

    return (
        <div ref={mountRef} className="absolute inset-0 w-full h-full" style={{ cursor: 'none' }} />
    );
});

export default BackroomsEngine;
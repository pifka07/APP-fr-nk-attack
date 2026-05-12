import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';
import * as THREE from 'three';

const ROOM_W = 8;
const ROOM_H = 3.5;
const SEGMENT_LEN = 12; // Length of one corridor segment
const VISIBLE_SEGMENTS = 14; // How many segments to keep ahead


const BackroomsEngine = forwardRef(({ onGameOver, onScoreUpdate, onHealthUpdate, onComboUpdate, onAmmoUpdate, config = {}, soundEnabled = true, musicEnabled = true, onAssetsLoaded }, ref) => {
    const mountRef = useRef(null);
    const stateRef = useRef({
        isPlaying: false,
        speed: 0,
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
        animFrame: 0,
        lastTime: 0,
    });
    const rendererRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rafRef = useRef(null);
    const clockRef = useRef(new THREE.Clock());
    const [loadingDone, setLoadingDone] = useState(false);
    const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });

    // Corridor segments pool for infinite scrolling
    const segmentsRef = useRef([]); // array of { group, zStart }
    const materialsRef = useRef(null);

    // Input
    const inputRef = useRef({ dx: 0, dy: 0 });

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
        movePlayer: (dy) => { inputRef.current.dy += dy; },
        moveLateral: (dx) => { inputRef.current.dx += dx; },
        startInput: () => {},
        endInput: () => {},
        poop: () => { spawnProjectile(); }
    }));

    const spawnProjectile = () => {
        const s = stateRef.current;
        if (!s.isPlaying || s.ammo <= 0) return;
        s.ammo--;
        if (onAmmoUpdate) onAmmoUpdate(s.ammo);
        const geo = new THREE.SphereGeometry(0.15, 8, 8);
        const mat = new THREE.MeshPhongMaterial({ color: 0x8B4513, emissive: 0x3d1f00 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(s.posX, s.posY, s.posZ - 1);
        sceneRef.current.add(mesh);
        s.projectiles.push({ mesh, vz: -0.5, vy: -0.02, active: true });
    };

    // Build materials once
    const buildMaterials = () => {
        const wallCanvas = document.createElement('canvas');
        wallCanvas.width = 256; wallCanvas.height = 256;
        const wCtx = wallCanvas.getContext('2d');
        wCtx.fillStyle = '#c8a000';
        wCtx.fillRect(0, 0, 256, 256);
        wCtx.strokeStyle = '#a07800';
        wCtx.lineWidth = 2;
        for (let i = 0; i < 256; i += 32) {
            wCtx.beginPath(); wCtx.moveTo(i, 0); wCtx.lineTo(i, 256); wCtx.stroke();
            wCtx.beginPath(); wCtx.moveTo(0, i); wCtx.lineTo(256, i); wCtx.stroke();
        }
        const wallTex = new THREE.CanvasTexture(wallCanvas);
        wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping;

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

        return {
            wall: new THREE.MeshLambertMaterial({ map: wallTex }),
            floor: new THREE.MeshLambertMaterial({ map: floorTex }),
            ceil: new THREE.MeshLambertMaterial({ map: ceilTex }),
            pillar: new THREE.MeshLambertMaterial({ color: 0xa08020 }),
            light: new THREE.MeshBasicMaterial({ color: 0xffffc0 }),
        };
    };

    // Build a single corridor segment group at zStart
    const buildSegment = (scene, zStart) => {
        const mats = materialsRef.current;
        const group = new THREE.Group();
        const L = SEGMENT_LEN;
        const W = ROOM_W;
        const H = ROOM_H;

        // Floor
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, L), mats.floor);
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(0, 0, zStart - L / 2);
        group.add(floor);

        // Ceiling
        const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, L), mats.ceil);
        ceil.rotation.x = Math.PI / 2;
        ceil.position.set(0, H, zStart - L / 2);
        group.add(ceil);

        // Left wall
        const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(L, H), mats.wall.clone());
        leftWall.rotation.y = Math.PI / 2;
        leftWall.position.set(-W / 2, H / 2, zStart - L / 2);
        group.add(leftWall);

        // Right wall
        const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(L, H), mats.wall.clone());
        rightWall.rotation.y = -Math.PI / 2;
        rightWall.position.set(W / 2, H / 2, zStart - L / 2);
        group.add(rightWall);

        // Ceiling light tube
        const lightZ = zStart - L / 2;
        const lightMesh = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 1.5), mats.light);
        lightMesh.position.set(0, H - 0.05, lightZ);
        group.add(lightMesh);

        const pointLight = new THREE.PointLight(0xffffc0, 1.5, SEGMENT_LEN * 1.5);
        pointLight.position.set(0, H - 0.2, lightZ);
        group.add(pointLight);

        // Pillars at segment start
        [-W / 2 + 0.3, W / 2 - 0.3].forEach(x => {
            const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.3, H, 0.3), mats.pillar);
            pillar.position.set(x, H / 2, zStart);
            group.add(pillar);
        });

        scene.add(group);
        return { group, zStart };
    };


    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0xd4a017, 30, 160);
        scene.background = new THREE.Color(0xd4a017);
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 180);
        camera.position.set(0, 1.5, 0);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: false });
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        renderer.shadowMap.enabled = false;
        mount.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const ambientLight = new THREE.AmbientLight(0xfff5c0, 0.4);
        scene.add(ambientLight);

        // Build materials
        materialsRef.current = buildMaterials();

        // Build initial corridor segments ahead
        const segments = [];
        for (let i = 0; i < VISIBLE_SEGMENTS; i++) {
            segments.push(buildSegment(scene, -i * SEGMENT_LEN));
        }
        segmentsRef.current = segments;

        // Spawn initial shadows
        const s = stateRef.current;
        for (let i = 0; i < 6; i++) {
            spawnOneShadow(scene, -10 - i * 18);
        }

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

    const spawnOneShadow = (scene, z) => {
        const s = stateRef.current;
        const spawnZ = z !== undefined ? z : (s.posZ - 20 - Math.random() * 30);
        const x = (Math.random() - 0.5) * (ROOM_W - 2);
        const y = 0.5 + Math.random() * (ROOM_H - 1.0);
        const type = Math.random() < 0.5 ? 'blob' : 'spider';
        const group = new THREE.Group();
        group.position.set(x, y, spawnZ);

        if (type === 'blob') {
            const bodyGeo = new THREE.SphereGeometry(0.55, 12, 12);
            const bodyMat = new THREE.MeshLambertMaterial({ color: 0x080808, transparent: true, opacity: 0.92 });
            group.add(new THREE.Mesh(bodyGeo, bodyMat));

            for (let i = 0; i < 6; i++) {
                const pGeo = new THREE.SphereGeometry(0.28 + Math.random() * 0.18, 6, 6);
                const pMat = new THREE.MeshLambertMaterial({ color: 0x111111, transparent: true, opacity: 0.5 });
                const puff = new THREE.Mesh(pGeo, pMat);
                const angle = (i / 6) * Math.PI * 2;
                puff.position.set(Math.cos(angle) * 0.45, Math.sin(angle) * 0.3, 0);
                group.add(puff);
            }

            const eyeGeo = new THREE.SphereGeometry(0.08, 8, 8);
            const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
            eyeL.position.set(-0.18, 0.1, 0.5);
            const eyeR = new THREE.Mesh(eyeGeo, eyeMat.clone());
            eyeR.position.set(0.18, 0.1, 0.5);
            group.add(eyeL); group.add(eyeR);

            for (let i = 0; i < 7; i++) {
                const t = (i / 6) - 0.5;
                const tGeo = new THREE.BoxGeometry(0.07, 0.09, 0.04);
                const tooth = new THREE.Mesh(tGeo, new THREE.MeshBasicMaterial({ color: 0xff2200 }));
                tooth.position.set(t * 0.5, -0.12 + Math.abs(t) * 0.08, 0.5);
                group.add(tooth);
            }
        } else {
            const bodyGeo = new THREE.SphereGeometry(0.22, 8, 8);
            const body = new THREE.Mesh(bodyGeo, new THREE.MeshLambertMaterial({ color: 0x060606 }));
            body.scale.set(1.4, 0.8, 1);
            group.add(body);

            const legMat = new THREE.MeshLambertMaterial({ color: 0x080808 });
            [-3, -1, 1, 3].forEach((offset, i) => {
                [-1, 1].forEach(side => {
                    const up = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.015, 0.7, 4), legMat);
                    up.position.set(side * 0.2, -0.1, offset * 0.12);
                    up.rotation.z = side * (Math.PI / 4 + i * 0.1);
                    up.rotation.x = offset * 0.3;
                    group.add(up);

                    const down = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.005, 1.1, 4), legMat.clone());
                    const ux = side * (0.2 + Math.cos(side * (Math.PI / 4 + i * 0.1)) * 0.35);
                    const uy = -0.1 + Math.sin(side * (Math.PI / 4 + i * 0.1)) * 0.35;
                    down.position.set(ux + side * 0.1, uy - 0.55, offset * 0.12 + offset * 0.1);
                    down.rotation.z = side * 0.3;
                    down.rotation.x = offset * 0.4;
                    group.add(down);
                });
            });

            const eyeGeo = new THREE.SphereGeometry(0.05, 6, 6);
            for (let i = -1; i <= 1; i += 2) {
                const eye = new THREE.Mesh(eyeGeo, new THREE.MeshBasicMaterial({ color: 0xff0000 }));
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

    // Recycle corridor segments - move old ones to front
    const recycleSegments = (posZ) => {
        const scene = sceneRef.current;
        const segments = segmentsRef.current;

        // Find furthest ahead segment
        let minZ = Infinity;
        segments.forEach(seg => { if (seg.zStart < minZ) minZ = seg.zStart; });

        // Find segments that are behind the player and recycle them
        segments.forEach(seg => {
            if (seg.zStart > posZ + SEGMENT_LEN * 2) {
                // This segment is behind us - move it ahead
                const newZ = minZ - SEGMENT_LEN;
                // Update all children positions
                const offsetZ = newZ - seg.zStart;
                seg.group.children.forEach(child => {
                    child.position.z += offsetZ;
                    if (child.isPointLight) child.position.z += offsetZ;
                });
                seg.group.position.z += offsetZ; // Actually move the whole group
                seg.zStart = newZ;
                minZ = newZ;
            }
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
            if (child.isPointLight || child instanceof THREE.PointLight) {
                child.intensity = 1.2 + Math.sin(t * 8 + child.position.z) * 0.3 + (Math.random() < 0.02 ? -0.8 : 0);
            }
        });

        // Move forward
        const moveSpeed = s.speed * 60 * delta;
        s.posZ -= moveSpeed;
        s.distance += moveSpeed * 0.5;

        // Recycle corridor segments for infinite scroll
        recycleSegments(s.posZ);

        // Apply lateral/vertical input
        const lateralForce = inputRef.current.dx * 0.04;
        const verticalForce = inputRef.current.dy * 0.025;
        inputRef.current.dx *= 0.7;
        inputRef.current.dy *= 0.7;

        // Camera stays fixed at center, always looking straight ahead
        const swayX = Math.sin(t * 0.8) * 0.04;
        const swayY = Math.cos(t * 1.1) * 0.02;
        cameraRef.current.position.set(swayX, 1.5 + swayY, s.posZ);
        cameraRef.current.lookAt(swayX, 1.5 + swayY, s.posZ - 10);

        // Update player position for bird image
        if (s.animFrame % 2 === 0) setPlayerPos({ x: s.posX, y: s.posY });

        // Increase speed
        s.speed = Math.min(0.22, s.speed + 0.00008);

        // Score
        s.score += 1;
        onScoreUpdate(s.score, s.coins, Math.floor(s.distance));

        // Spawn more shadows
        const lastShadow = s.shadows[s.shadows.length - 1];
        if (!lastShadow || lastShadow.mesh.position.z > s.posZ - 25) {
            spawnOneShadow(sceneRef.current, s.posZ - 30 - Math.random() * 20);
        }

        // Update shadows
        s.shadows.forEach(sh => {
            sh.mesh.position.z += sh.vz;
            sh.mesh.position.y += Math.sin(t * sh.floatSpeed + sh.floatOffset) * 0.008;
            sh.mesh.position.x += Math.cos(t * (sh.floatSpeed * 0.5) + sh.floatOffset) * 0.003;
            sh.mesh.position.x = Math.max(-ROOM_W / 2 + 0.6, Math.min(ROOM_W / 2 - 0.6, sh.mesh.position.x));
            sh.mesh.position.y = Math.max(0.3, Math.min(ROOM_H - 0.3, sh.mesh.position.y));
            sh.mesh.lookAt(s.posX, s.posY, s.posZ);
        });

        // Update projectiles
        s.projectiles.forEach(p => {
            if (!p.active) return;
            p.mesh.position.z += p.vz;
            p.mesh.position.y += p.vy;

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

        // Ammo refill
        if (s.animFrame % 300 === 0 && s.ammo < s.maxAmmo) {
            s.ammo = Math.min(s.maxAmmo, s.ammo + 1);
            if (onAmmoUpdate) onAmmoUpdate(s.ammo);
        }

        // Cleanup
        s.shadows = s.shadows.filter(sh => sh.hp > 0 && sh.mesh.position.z > s.posZ - 60);
        s.projectiles = s.projectiles.filter(p => p.active);

        rendererRef.current.render(sceneRef.current, cameraRef.current);
        rafRef.current = requestAnimationFrame(loop);
    };

    const screenOffsetX = (playerPos.x / (ROOM_W / 2)) * 100;
    const screenOffsetY = -((playerPos.y - 1.5) / (ROOM_H / 2)) * 80;

    return (
        <div className="absolute inset-0 w-full h-full" style={{ cursor: 'none' }}>
            <div ref={mountRef} className="absolute inset-0 w-full h-full" />
            <img
                src="https://media.base44.com/images/public/6961111599b5db08cf38f4b2/ca040e4c0_FrnkPOV.png"
                alt="Fränk POV"
                className="absolute bottom-0 left-1/2 pointer-events-none select-none"
                style={{
                    transform: `translateX(calc(-50% + ${screenOffsetX}px)) translateY(${screenOffsetY}px)`,
                    width: '280px',
                    imageRendering: 'auto',
                    zIndex: 5,
                }}
            />
        </div>
    );
});

export default BackroomsEngine;
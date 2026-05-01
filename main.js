import * as THREE from 'https://unpkg.com/three@0.161.0/build/three.module.js';
import { EffectComposer } from 'https://unpkg.com/three@0.161.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.161.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://unpkg.com/three@0.161.0/examples/jsm/postprocessing/UnrealBloomPass.js';

const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const speedEl = document.getElementById('speed');
const startOverlay = document.getElementById('startOverlay');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const finalScore = document.getElementById('finalScore');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0a173d, 100, 680);

const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 2000);
camera.position.set(0, 8, 24);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.95, 0.58, 0.22));

const hemi = new THREE.HemisphereLight(0x9fd3ff, 0x1d1747, 1.4);
const dir = new THREE.DirectionalLight(0xffffff, 1.1);
dir.position.set(35, 50, 12);
scene.add(hemi, dir);

const stars = new THREE.Group();
for (let i = 0; i < 1200; i++) {
  const s = new THREE.Mesh(
    new THREE.SphereGeometry(Math.random() * 0.18 + 0.03, 6, 6),
    new THREE.MeshBasicMaterial({ color: i % 9 ? 0xd9edff : 0x97c8ff })
  );
  s.position.set((Math.random() - 0.5) * 1400, Math.random() * 420 + 40, -Math.random() * 1600);
  stars.add(s);
}
scene.add(stars);

const cloudMat = new THREE.MeshStandardMaterial({ color: 0xeaf4ff, transparent: true, opacity: 0.75 });
const cloudGroup = new THREE.Group();
for (let i = 0; i < 90; i++) {
  const g = new THREE.Group();
  for (let j = 0; j < 4; j++) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(2.5 + Math.random() * 3.2, 12, 12), cloudMat);
    puff.position.set((Math.random() - 0.5) * 7, Math.random() * 2, (Math.random() - 0.5) * 6);
    g.add(puff);
  }
  g.position.set((Math.random() - 0.5) * 220, 8 + Math.random() * 70, -Math.random() * 1500);
  cloudGroup.add(g);
}
scene.add(cloudGroup);

const plane = new THREE.Group();
const body = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.9, 8.5, 22), new THREE.MeshStandardMaterial({ color: 0xff5151, metalness: 0.35, roughness: 0.4 }));
body.rotation.z = Math.PI / 2;
plane.add(body);
const cockpit = new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 16), new THREE.MeshStandardMaterial({ color: 0x9ae8ff, transparent: true, opacity: 0.75 }));
cockpit.position.set(1.1, 0.45, 0);
plane.add(cockpit);
const wingGeom = new THREE.BoxGeometry(1.4, 0.15, 8.8);
const wingMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, metalness: 0.2, roughness: 0.5 });
const wing = new THREE.Mesh(wingGeom, wingMat);
plane.add(wing);
const tailWing = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.12, 3.4), wingMat);
tailWing.position.set(-3.3, 0.7, 0);
plane.add(tailWing);
const fin = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 0.15), wingMat);
fin.position.set(-3.5, 1.2, 0);
plane.add(fin);

const propGroup = new THREE.Group();
const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.5, 14), new THREE.MeshStandardMaterial({ color: 0x313131 }));
hub.rotation.z = Math.PI / 2;
propGroup.add(hub);
for (let i = 0; i < 3; i++) {
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 2.9), new THREE.MeshStandardMaterial({ color: 0x1b1b1b }));
  blade.rotation.x = (Math.PI * 2 / 3) * i;
  propGroup.add(blade);
}
propGroup.position.set(4.3, 0, 0);
plane.add(propGroup);

const trailGeom = new THREE.BufferGeometry();
const trailLength = 120;
const trailPositions = new Float32Array(trailLength * 3);
trailGeom.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
const trailMat = new THREE.LineBasicMaterial({ color: 0x7ee8ff, transparent: true, opacity: 0.75 });
const trail = new THREE.Line(trailGeom, trailMat);
scene.add(trail);

plane.position.set(0, 18, 0);
scene.add(plane);

const obstacles = [];
const rings = [];
const obstacleGeo = new THREE.DodecahedronGeometry(2.1, 0);
const obstacleMat = new THREE.MeshStandardMaterial({ color: 0x79a6ff, emissive: 0x162566, emissiveIntensity: 0.35, metalness: 0.2, roughness: 0.4 });
const ringGeo = new THREE.TorusGeometry(2.3, 0.26, 14, 34);
const ringMat = new THREE.MeshStandardMaterial({ color: 0xffdd66, emissive: 0x735a0f, emissiveIntensity: 0.65 });

function spawnObstacle(zBase) {
  const o = new THREE.Mesh(obstacleGeo, obstacleMat.clone());
  o.position.set((Math.random() - 0.5) * 65, Math.random() * 65 + 4, zBase - Math.random() * 280);
  o.userData.rot = new THREE.Vector3(Math.random() * .016, Math.random() * .014, Math.random() * .014);
  scene.add(o);
  obstacles.push(o);
}

function spawnRing(zBase) {
  const r = new THREE.Mesh(ringGeo, ringMat.clone());
  r.position.set((Math.random() - 0.5) * 55, Math.random() * 52 + 8, zBase - Math.random() * 260);
  scene.add(r);
  rings.push(r);
}

for (let i = 0; i < 42; i++) spawnObstacle(-i * 45 - 100);
for (let i = 0; i < 18; i++) spawnRing(-i * 120 - 160);

const keys = {};
let touch = { leftX: 0, leftY: 0, rightX: 0, rightY: 0, boost: false };
let running = false;
let paused = false;
let gameOver = false;
let score = 0;
let speed = 0.88;
let best = Number(localStorage.getItem('skyace_best') || 0);
bestEl.textContent = best;

const velocity = new THREE.Vector3(0, 0, -speed);
const tmpV = new THREE.Vector3();

window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
  if (e.key.toLowerCase() === 'p' && running && !gameOver) paused = !paused;
});
window.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

function bindPad(el, side) {
  let active = false;
  let rect;
  const move = (e) => {
    if (!active) return;
    const t = e.touches[0];
    const x = ((t.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((t.clientY - rect.top) / rect.height - 0.5) * 2;
    if (side === 'left') { touch.leftX = THREE.MathUtils.clamp(x, -1, 1); touch.leftY = THREE.MathUtils.clamp(y, -1, 1); }
    else { touch.rightX = THREE.MathUtils.clamp(x, -1, 1); touch.rightY = THREE.MathUtils.clamp(y, -1, 1); }
  };
  el.addEventListener('touchstart', (e) => { active = true; rect = el.getBoundingClientRect(); move(e); e.preventDefault(); }, { passive: false });
  el.addEventListener('touchmove', (e) => { move(e); e.preventDefault(); }, { passive: false });
  el.addEventListener('touchend', () => {
    active = false;
    if (side === 'left') { touch.leftX = 0; touch.leftY = 0; }
    else { touch.rightX = 0; touch.rightY = 0; }
  });
}
bindPad(document.getElementById('padLeft'), 'left');
bindPad(document.getElementById('padRight'), 'right');
const boostBtn = document.getElementById('boostBtn');
boostBtn.addEventListener('touchstart', () => touch.boost = true, { passive: true });
boostBtn.addEventListener('touchend', () => touch.boost = false, { passive: true });
boostBtn.addEventListener('mousedown', () => touch.boost = true);
boostBtn.addEventListener('mouseup', () => touch.boost = false);
boostBtn.addEventListener('mouseleave', () => touch.boost = false);

let audioCtx;
let engineOsc;
let engineGain;
function startAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  engineOsc = audioCtx.createOscillator();
  engineOsc.type = 'sawtooth';
  engineGain = audioCtx.createGain();
  engineGain.gain.value = 0.03;
  const lfo = audioCtx.createOscillator();
  const lfoGain = audioCtx.createGain();
  lfo.type = 'sine';
  lfo.frequency.value = 8;
  lfoGain.gain.value = 22;
  lfo.connect(lfoGain).connect(engineOsc.frequency);
  engineOsc.connect(engineGain).connect(audioCtx.destination);
  engineOsc.frequency.value = 170;
  engineOsc.start(); lfo.start();
}
function sfx(freq = 640, dur = 0.12, type = 'triangle', volume = 0.08) {
  if (!audioCtx) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.value = volume;
  o.connect(g).connect(audioCtx.destination);
  o.start();
  g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
  o.frequency.exponentialRampToValueAtTime(Math.max(70, freq * 0.55), audioCtx.currentTime + dur);
  o.stop(audioCtx.currentTime + dur);
}

function resetGame() {
  gameOver = false;
  running = true;
  paused = false;
  score = 0;
  speed = 0.88;
  plane.position.set(0, 18, 0);
  plane.rotation.set(0, 0, 0);
  velocity.set(0, 0, -speed);
  obstacles.forEach((o, i) => o.position.z = -100 - i * 45 - Math.random() * 200);
  rings.forEach((r, i) => r.position.z = -160 - i * 120 - Math.random() * 260);
  gameOverOverlay.classList.add('hidden');
  updateHud();
}
function endGame() {
  gameOver = true;
  running = false;
  finalScore.textContent = Math.floor(score);
  if (score > best) {
    best = Math.floor(score);
    localStorage.setItem('skyace_best', String(best));
    bestEl.textContent = best;
  }
  gameOverOverlay.classList.remove('hidden');
  sfx(120, 0.4, 'sawtooth', 0.14);
}
function updateHud() {
  scoreEl.textContent = Math.floor(score);
  speedEl.textContent = speed.toFixed(2);
}

startBtn.onclick = () => {
  startOverlay.classList.add('hidden');
  startAudio();
  resetGame();
};
restartBtn.onclick = () => resetGame();

const trailQueue = [];
function updateTrail() {
  trailQueue.unshift(plane.position.clone());
  if (trailQueue.length > trailLength) trailQueue.pop();
  for (let i = 0; i < trailLength; i++) {
    const p = trailQueue[i] || trailQueue[trailQueue.length - 1] || plane.position;
    trailPositions[i * 3] = p.x;
    trailPositions[i * 3 + 1] = p.y;
    trailPositions[i * 3 + 2] = p.z;
  }
  trailGeom.attributes.position.needsUpdate = true;
}

function inputAxes() {
  let yaw = 0, pitch = 0, roll = 0;
  if (keys['arrowleft']) yaw += 1;
  if (keys['arrowright']) yaw -= 1;
  if (keys['w']) pitch += 1;
  if (keys['s']) pitch -= 1;
  if (keys['a']) roll += 1;
  if (keys['d']) roll -= 1;

  yaw += touch.leftX;
  pitch += -touch.rightY;
  roll += touch.rightX;

  const boost = keys[' '] || keys['shift'] || touch.boost;
  return { yaw, pitch, roll, boost };
}

const planeRadius = 2.1;
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.032);

  stars.position.z += speed * 0.45;
  if (stars.position.z > 120) stars.position.z = 0;
  cloudGroup.children.forEach((c) => {
    c.position.z += speed * 0.95;
    c.rotation.y += 0.0008;
    if (c.position.z > 30) {
      c.position.z = -1500;
      c.position.x = (Math.random() - 0.5) * 220;
      c.position.y = 10 + Math.random() * 70;
    }
  });

  propGroup.rotation.x += 1.1 + speed * 1.3;

  if (running && !paused && !gameOver) {
    const { yaw, pitch, roll, boost } = inputAxes();

    speed += ((boost ? 1.55 : 0.86) - speed) * 0.045;
    velocity.z = -speed;
    plane.position.x += yaw * dt * 19;
    plane.position.y += pitch * dt * 17;
    plane.rotation.z = THREE.MathUtils.lerp(plane.rotation.z, -roll * 0.8, 0.12);
    plane.rotation.y = THREE.MathUtils.lerp(plane.rotation.y, yaw * 0.35, 0.1);
    plane.rotation.x = THREE.MathUtils.lerp(plane.rotation.x, -pitch * 0.35, 0.1);

    plane.position.x = THREE.MathUtils.clamp(plane.position.x, -42, 42);
    plane.position.y = THREE.MathUtils.clamp(plane.position.y, 3, 84);

    camera.position.lerp(new THREE.Vector3(plane.position.x * 0.25, plane.position.y + 8, plane.position.z + 24), 0.09);
    camera.lookAt(plane.position.x * 0.15, plane.position.y + 1.5, plane.position.z - 22);

    if (engineOsc && engineGain) {
      engineOsc.frequency.value = 150 + speed * 72;
      engineGain.gain.value = 0.025 + (boost ? 0.02 : 0);
    }

    for (const o of obstacles) {
      o.position.z += speed * 1.6;
      o.rotation.x += o.userData.rot.x;
      o.rotation.y += o.userData.rot.y;
      o.rotation.z += o.userData.rot.z;
      if (o.position.z > camera.position.z + 20) {
        o.position.z = plane.position.z - 820 - Math.random() * 180;
        o.position.x = (Math.random() - 0.5) * 68;
        o.position.y = Math.random() * 66 + 4;
      }
      if (o.position.distanceTo(plane.position) < planeRadius + 2.2) endGame();
    }

    for (const r of rings) {
      r.position.z += speed * 1.7;
      r.rotation.y += 0.02;
      r.rotation.x += 0.013;
      if (r.position.z > camera.position.z + 20) {
        r.position.z = plane.position.z - 950 - Math.random() * 240;
        r.position.x = (Math.random() - 0.5) * 56;
        r.position.y = Math.random() * 54 + 7;
      }
      if (r.position.distanceTo(plane.position) < 3.2) {
        score += 120;
        sfx(960, 0.08, 'triangle', 0.09);
        r.position.z = plane.position.z - 980 - Math.random() * 260;
      }
    }

    score += speed * 2.6;
    updateHud();
  }

  updateTrail();
  composer.render();
}
animate();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  composer.setSize(innerWidth, innerHeight);
});

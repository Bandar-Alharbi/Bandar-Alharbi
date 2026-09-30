/* 3D version of the front image: the flow lines as real 3D lines fanning out in depth and
   converging to a glowing point. Small lights travel along each strand to the endpoint and back;
   the scene follows the mouse (the slow automatic sway only with motion on).
   If anything fails, the flat hero.svg stays. */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js';

const home = document.getElementById('home');
const bg = home && home.querySelector('.home-bg');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

// the line paths traced from the original image (image pixels; x = 0, 30, … 630), same data as hero.svg
const XS = Array.from({ length: 22 }, (_, i) => i * 30);
const WHITE = 0xffffff, BLUE = 0x3a6ff0, GREEN = 0x62d66c;
const LINES = [
  [WHITE, [448, 468, 483, 494, 500, 503, 503, 504, 508, 514, 523, 536, 554, 574, 594, 611, 625, 637, 646, 652, 657, 662], 1.6],
  [BLUE,  [518, 531, 543, 555, 567, 576, 585, 595, 603, 611, 618, 624, 630, 636, 641, 645, 649, 653, 656, 659, 661, 664], -1.2],
  [GREEN, [631, 644, 655, 665, 673, 679, 684, 687, 688, 687, 686, 683, 680, 677, 673, 671, 668, 666, 665, 665, 665, 664], 2.4],
  [WHITE, [712, 704, 696, 690, 684, 680, 676, 673, 670, 668, 666, 665, 664, 663, 663, 663, 663, 663, 663, 663, 664, 664], -2.6],
  [WHITE, [800, 785, 771, 758, 745, 734, 724, 714, 705, 698, 691, 686, 681, 677, 673, 670, 670, 669, 667, 666, 665, 664], .8],
  [WHITE, [827, 813, 801, 789, 778, 768, 758, 749, 740, 732, 724, 717, 710, 703, 697, 692, 687, 682, 678, 675, 671, 666], -.6],
  [BLUE,  [885, 856, 831, 809, 790, 773, 757, 744, 733, 722, 712, 704, 696, 689, 684, 679, 675, 671, 668, 666, 665, 664], 3.2],
  [WHITE, [947, 929, 908, 887, 868, 850, 832, 816, 800, 785, 771, 757, 744, 732, 721, 710, 700, 692, 684, 677, 671, 666], -1.9],
  [WHITE, [955, 954, 950, 942, 931, 915, 895, 872, 849, 828, 807, 788, 770, 753, 737, 724, 711, 699, 689, 680, 672, 666], 1.1],
  [GREEN, [996, 1044, 1074, 1090, 1092, 1084, 1068, 1044, 1014, 981, 946, 907, 867, 827, 789, 757, 731, 712, 697, 685, 674, 666], -3.4],
  [BLUE,  [1182, 1150, 1117, 1082, 1047, 1012, 976, 941, 905, 872, 838, 808, 781, 758, 738, 718, 703, 691, 680, 673, 668, 665], 2.0],
];
const MEET = [660, 664], DOT = [970, 664];
const toWorld = (x, y, z = 0) => new THREE.Vector3((x - MEET[0]) / 100, -(y - MEET[1]) / 100, z);

function start() {
  const canvas = document.createElement('canvas');
  canvas.className = 'home-3d';
  canvas.setAttribute('aria-hidden', 'true');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { return; } // no WebGL: keep the flat image
  renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0c0e13, 7.5, 17);          // far parts of the lines fade into the dark background
  const camera = new THREE.PerspectiveCamera(40, 1, .1, 60);
  camera.position.set(0, 0, 9);

  const world = new THREE.Group();   // moved/scaled to frame the scene on each screen
  const tilt = new THREE.Group();    // turned toward the mouse
  world.add(tilt);
  scene.add(world);

  /* ---------- light in the strands ----------
     Each light is a section of the strand itself that lights up and travels along it: a bright
     white-cyan core with a tail fading back into the strand's own color, plus a soft glow hugging
     the strand. (Drawn in the strand's shader, so it has the strand's exact shape — no round dots.) */
  const N = LINES.length;
  const GLSL_LIGHT = `
    const vec3 LIGHT_COL = vec3(.9, 1.0, 1.0);
    // brightness at distance fd along a line, for a light at hd moving in direction dir (+1 / -1)
    float lightAt(float fd, float hd, float dir) {
      float delta = (hd - fd) * dir;                          // > 0: behind the light (its tail)
      float core = exp(-delta * delta / (2.0 * .045 * .045));
      float tail = delta > 0.0 ? pow(clamp(1.0 - delta / 1.25, 0.0, 1.0), 2.2) : 0.0;
      return max(core, tail * .95);
    }`;
  // strand material: its own color, lit where its light is
  function strandMaterial(color, u, glow) {
    const m = glow
      ? new THREE.MeshBasicMaterial({ color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })
      : new THREE.MeshBasicMaterial({ color });
    m.defines = { USE_UV: '' };
    m.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, u);
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', `#include <common>\nuniform float uHead, uDir, uLen;${GLSL_LIGHT}`)
        .replace('vec4 diffuseColor = vec4( diffuse, opacity );', glow
          ? 'float I = lightAt(vUv.x * uLen, uHead * uLen, uDir); vec4 diffuseColor = vec4(LIGHT_COL, I * .55);'
          : 'float I = lightAt(vUv.x * uLen, uHead * uLen, uDir); vec4 diffuseColor = vec4(mix(diffuse, LIGHT_COL, I), opacity);');
    };
    return m;
  }

  // lines: each fans out in depth (z) at its far end and meets the others at one point
  const curves = [];
  for (const [color, ys, depth] of LINES) {
    const d = depth * .7; // how far this line sits in front of / behind the others at its far end
    const pts = [toWorld(-60, ys[0] + (ys[0] - ys[1]) * 2, d * 1.15)];
    XS.forEach((x, i) => {
      const t = i / (XS.length - 1);
      pts.push(toWorld(x, ys[i], d * Math.pow(1 - t, 1.6)));
    });
    pts.push(toWorld(MEET[0], MEET[1], 0));
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    const u = { uHead: { value: -10 }, uDir: { value: 1 }, uLen: { value: curve.getLength() } };
    curves.push({ curve, color, u });
    tilt.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 320, color === WHITE ? .0135 : .0125, 6, false), strandMaterial(color, u, false)));
    tilt.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 320, .034, 8, false), strandMaterial(color, u, true)));
  }

  // the single line to the point: shows whichever lights are on it
  const lead = new THREE.LineCurve3(toWorld(...MEET), toWorld(...DOT));
  const leadU = {
    uLH: { value: new Array(N).fill(-10) },   // each light's position on this line (in line lengths)
    uLD: { value: new Array(N).fill(1) },     // and its direction
    uLeadLen: { value: lead.getLength() },
  };
  function leadMaterial(glow) {
    const m = glow
      ? new THREE.MeshBasicMaterial({ color: WHITE, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })
      : new THREE.MeshBasicMaterial({ color: WHITE });
    m.defines = { USE_UV: '' };
    m.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, leadU);
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', `#include <common>\nuniform float uLH[${N}], uLD[${N}], uLeadLen;${GLSL_LIGHT}`)
        .replace('vec4 diffuseColor = vec4( diffuse, opacity );',
          `float I = 0.0; for (int i = 0; i < ${N}; i++) I = max(I, lightAt(vUv.x * uLeadLen, uLH[i] * uLeadLen, uLD[i]));
           ${glow ? 'vec4 diffuseColor = vec4(LIGHT_COL, I * .55);' : 'vec4 diffuseColor = vec4(mix(diffuse, LIGHT_COL, I), opacity);'}`);
    };
    return m;
  }
  tilt.add(new THREE.Mesh(new THREE.TubeGeometry(lead, 64, .0135, 6, false), leadMaterial(false)));
  tilt.add(new THREE.Mesh(new THREE.TubeGeometry(lead, 64, .034, 8, false), leadMaterial(true)));
  const dotPos = toWorld(...DOT);
  const orb = new THREE.Mesh(new THREE.SphereGeometry(.1, 32, 16), new THREE.MeshBasicMaterial({ color: 0xfdfffe }));
  orb.position.copy(dotPos);
  tilt.add(orb);

  const glowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d'), grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, 'rgba(255,255,255,.9)'); grd.addColorStop(.25, 'rgba(200,220,255,.35)'); grd.addColorStop(1, 'rgba(160,190,255,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  })();
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  glow.position.copy(dotPos); glow.scale.set(.9, .9, 1);
  tilt.add(glow);


  /* ---------- light travel ----------
     Each strand's light glides along it to the glowing endpoint, eases to a stop there, then travels
     back along the same path. Every light has its own pace and start, so they never move in sync. */
  const leadLen = lead.getLength();
  const lights = curves.map(({ u }, i) => ({
    u, len: u.uLen.value,
    period: 11 + (i % 4) * 1.1 + ((i * 37) % 10) / 4,         // seconds for one way (11–15 s)
    offset: ((i * 0.61803) % 1) * 2,                          // staggered start along the round trip
  }));
  function moveLights(now) {
    const t = now / 1000;
    lights.forEach((L, i) => {
      const phase = ((t / L.period + L.offset) % 2 + 2) % 2;  // 0→1 out to the endpoint, 1→2 back
      const half = phase < 1 ? phase : 2 - phase;
      const d = (.5 - .5 * Math.cos(Math.PI * half)) * (L.len + leadLen); // eased: slows gently at both ends
      const dir = phase < 1 ? 1 : -1;
      L.u.uHead.value = d / L.len;                            // > 1 once it has moved onto the line to the endpoint
      L.u.uDir.value = dir;
      leadU.uLH.value[i] = (d - L.len) / leadLen;             // < 0 while it's still on its strand
      leadU.uLD.value[i] = dir;
    });
  }

  // framing: put the meeting point where it sits in the original image, on every screen shape
  const target = new THREE.Vector3();
  function frame() {
    const w = home.clientWidth, h = home.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true); // needed before projecting points (the camera isn't part of the scene)
    const portrait = camera.aspect < 1;
    // a little taller than wide, so the fan spreads top-to-bottom like the original image
    if (portrait) world.scale.set(.55, .72, .55); else world.scale.set(.95, 1.32, .95);
    // keep the orb and its glow perfectly round despite the stretch
    const r = world.scale.x / world.scale.y;
    orb.scale.set(1, r, 1);
    glow.scale.set(.9, .9 * r, 1);
    world.position.set(0, 0, 0);
    tilt.rotation.set(0, portrait ? -.12 : -.2, 0);
    // where the meeting point should appear (-1…1 across/up the screen): the middle of the screen
    const want = portrait ? new THREE.Vector2(-.5, 0) : new THREE.Vector2(0, 0);
    for (let i = 0; i < 3; i++) {                     // nudge the scene until the meeting point lands there
      scene.updateMatrixWorld(true);
      target.set(0, 0, 0); tilt.localToWorld(target);
      const ndc = target.clone().project(camera);
      const dist = camera.position.z - target.z;
      const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * dist;
      world.position.x += (want.x - ndc.x) * halfH * camera.aspect;
      world.position.y += (want.y - ndc.y) * halfH;
    }
    baseRotY = tilt.rotation.y;
    basePos.copy(world.position);
  }
  const basePos = new THREE.Vector3();

  let baseRotY = 0, mx = 0, my = 0, cx = 0, cy = 0, visible = true;

  // the scene turns toward the mouse (also with "reduce motion", since it only moves when you do)
  if (finePointer) {
    home.addEventListener('pointermove', e => {
      const r = home.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width * 2 - 1;
      my = (e.clientY - r.top) / r.height * 2 - 1;
    });
    home.addEventListener('pointerleave', () => { mx = 0; my = 0; });
  }

  function render(now) {
    cx += (mx - cx) * .07; cy += (my - cy) * .07;
    const drift = reduce ? 0 : Math.sin(now / 6000) * .04;  // the slow automatic sway only with motion on
    // follow the mouse: turn toward it, and slide the opposite way, like looking from a new angle
    tilt.rotation.y = baseRotY + cx * .26 + drift;
    tilt.rotation.x = cy * .16;
    world.position.set(basePos.x - cx * .35, basePos.y + cy * .22, basePos.z);
    moveLights(now);
    renderer.render(scene, camera);
  }

  function loop(now) {
    if (visible) render(now);
    requestAnimationFrame(loop);
  }

  // place the canvas just above the flat background, then switch the flat lines off
  bg.insertAdjacentElement('afterend', canvas);
  frame();
  render(performance.now());
  document.documentElement.classList.add('hero-3d');

  addEventListener('resize', frame);
  // the light travel runs continuously (as requested, also with "reduce motion");
  // drawing pauses while the first screen is scrolled out of view
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(home);
  requestAnimationFrame(loop);
}

if (bg) {
  try { start(); } catch (e) { console.warn('3D hero unavailable, keeping the flat image', e); }
}

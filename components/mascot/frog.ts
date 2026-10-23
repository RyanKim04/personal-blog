/* eslint-disable no-var */
// Frog in a suit: the approved model and animation, ported from design/mascot.js.
// Geometry, materials and poses are unchanged; only the render loop differs (see mountMascot).
import type * as THREE from "three";

type Three = typeof THREE;
type Look = { x: number; y: number };
export type Agent = {
  root: THREE.Group; frog: THREE.Group; legL: THREE.Group; legR: THREE.Group;
  armL: THREE.Group; armR: THREE.Group; head: THREE.Group; shadow: THREE.Mesh;
  glasses: THREE.Group; gy: number;
};

export function setupScene(T: Three) {
  var scene = new T.Scene();
  var camera = new T.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 1.75, 6.5);
  camera.lookAt(0, 1.45, 0);
  scene.add(new T.AmbientLight(0xffffff, 0.55));
  var sun = new T.DirectionalLight(0xffffff, 0.85);
  sun.position.set(-2.5, 4, 3.5);
  scene.add(sun);
  return { scene: scene, camera: camera };
}

export function makeAgent(T: Three): Agent {
  var PI = Math.PI;
  var mat = function (hex: number) { return new T.MeshLambertMaterial({ color: hex, flatShading: true }); };
  var skin = mat(0x6fb85e), suit = mat(0x2e2d2b), suitDark = mat(0x1c1b1a), shirt = mat(0xf6f3ec);
  var ink = mat(0x1c1b22), tie = mat(0x2f6b4f), shoe = mat(0x141418), mouthM = mat(0x2c3a2a);
  var leather = mat(0x5a3a22), brass = mat(0xc9a24a), frameM = mat(0x0f0f13);
  var lensM = new T.MeshLambertMaterial({ color: 0x22201d, transparent: true, opacity: 0.3, flatShading: true, side: T.DoubleSide });
  var root = new T.Group(), frog = new T.Group();
  root.add(frog);
  root.rotation.y = -0.6;
  var add = function (geo: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number, parent?: THREE.Object3D) {
    var mesh = new T.Mesh(geo, m);
    mesh.position.set(x, y, z);
    (parent || frog).add(mesh);
    return mesh;
  };
  var shadow = new T.Mesh(new T.CircleGeometry(0.75, 12), new T.MeshBasicMaterial({ color: 0x2a2622, transparent: true, opacity: 0.14 }));
  shadow.rotation.x = -PI / 2;
  shadow.position.y = 0.01;
  root.add(shadow);

  var R = 0.56, bRx = R * 0.9, bRy = R * 1.05, bRz = R * 0.8;
  var legLen = 0.4, hipY = legLen + 0.05, bodyY = hipY + bRy - 0.12;
  var sRx = 0.66 * 1.2, sRy = 0.66 * 0.72, sRz = 0.66;
  var headY = bodyY + bRy + sRy * 0.35;

  var leg = function (side: number) {
    var hip = new T.Group();
    hip.position.set(bRx * 0.48 * side, hipY, 0);
    frog.add(hip);
    add(new T.CylinderGeometry(0.13, 0.12, legLen, 6), suit, 0, -legLen / 2, 0, hip);
    add(new T.BoxGeometry(0.26, 0.1, 0.46), shoe, 0, -legLen, 0.1, hip);
    return hip;
  };
  var legL = leg(-1), legR = leg(1);

  var body = add(new T.IcosahedronGeometry(R, 1), suit, 0, bodyY, 0);
  body.scale.set(0.9, 1.05, 0.8);
  var chestY = bodyY + bRy * 0.32, shirtZ = bRz * 0.93;
  var flatShirt = new T.MeshBasicMaterial({ color: 0xf3efe6, side: T.DoubleSide });
  add(new T.PlaneGeometry(0.2, 0.36), flatShirt, 0, chestY + 0.02, shirtZ + 0.01);
  [-1, 1].forEach(function (s) {
    var col = add(new T.PlaneGeometry(0.12, 0.07), flatShirt, 0.08 * s, chestY + 0.2, shirtZ + 0.015);
    col.rotation.z = -0.35 * s;
  });
  add(new T.BoxGeometry(0.08, 0.3, 0.03), tie, 0, chestY - 0.01, shirtZ + 0.04);
  add(new T.BoxGeometry(0.1, 0.07, 0.04), tie, 0, chestY + 0.16, shirtZ + 0.045);
  add(new T.SphereGeometry(0.025, 5, 4), suitDark, 0, chestY - 0.3, bRz * 0.99);
  add(new T.SphereGeometry(0.025, 5, 4), suitDark, 0, chestY - 0.42, bRz * 0.97);
  add(new T.BoxGeometry(0.1, 0.05, 0.03), tie, -0.24, chestY - 0.05, bRz * 0.88);

  var shY = bodyY + bRy * 0.42, shX = bRx * 0.95;
  var arm = function (side: number) {
    var sh = new T.Group();
    sh.position.set(shX * side, shY, 0.03);
    frog.add(sh);
    add(new T.CylinderGeometry(0.09, 0.11, 0.44, 6), suit, 0, -0.22, 0, sh);
    add(new T.CylinderGeometry(0.1, 0.1, 0.05, 6), shirt, 0, -0.46, 0, sh);
    add(new T.IcosahedronGeometry(0.11, 0), skin, 0, -0.53, 0, sh);
    sh.rotation.z = 0.12 * side;
    return sh;
  };
  var armL = arm(-1), armR = arm(1);
  var bag = new T.Group();
  bag.position.set(0, -0.6, 0.02);
  bag.rotation.y = PI / 2;
  armR.add(bag);
  add(new T.BoxGeometry(0.5, 0.36, 0.13), leather, 0, -0.2, 0, bag);
  add(new T.TorusGeometry(0.07, 0.02, 3, 8, PI), suitDark, 0, -0.01, 0, bag);
  [-1, 1].forEach(function (s) { add(new T.BoxGeometry(0.05, 0.04, 0.02), brass, 0.12 * s, -0.06, 0.075, bag); });

  var head = new T.Group();
  head.position.set(0, headY, 0);
  frog.add(head);
  var skull = add(new T.SphereGeometry(0.66, 10, 7), skin, 0, 0, 0, head);
  skull.scale.set(1.2, 0.72, 1);
  var ey = sRy * 0.7, ez = sRz * 0.3, r = 0.22, sp = 0.36;
  [-1, 1].forEach(function (s) {
    add(new T.SphereGeometry(r + 0.07, 8, 6), skin, sp * s, ey - 0.02, ez - 0.04, head);
    add(new T.SphereGeometry(r, 9, 7), shirt, sp * s, ey, ez + 0.06, head);
    add(new T.SphereGeometry(0.07, 6, 5), ink, sp * s, ey + 0.08, ez + 0.06 + Math.sqrt(r * r - 0.0064) - 0.03, head);
  });
  var mouth = add(new T.TorusGeometry(0.12, 0.03, 3, 8, PI), mouthM, 0, -0.14, sRz * 0.95, head);
  mouth.rotation.z = PI;
  mouth.rotation.x = 0.3;

  var gy = 0.23;
  var glasses = new T.Group();
  glasses.position.set(0, gy, 0.64);
  head.add(glasses);
  var gx = 0.3, W = 0.3, H = 0.22;
  [-1, 1].forEach(function (s) {
    var cx = gx * s;
    add(new T.BoxGeometry(W + 0.05, 0.07, 0.06), frameM, cx, H / 2, 0, glasses);
    add(new T.BoxGeometry(W, 0.045, 0.05), frameM, cx, -H / 2, 0, glasses);
    add(new T.BoxGeometry(0.05, H, 0.05), frameM, cx - W / 2, 0, 0, glasses);
    add(new T.BoxGeometry(0.05, H, 0.05), frameM, cx + W / 2, 0, 0, glasses);
    add(new T.PlaneGeometry(W - 0.04, H - 0.04), lensM, cx, 0, -0.01, glasses);
    var ox = gx + W / 2 + 0.02, tx = sRx * 0.92, tz = -0.62;
    var len = Math.sqrt((tx - ox) * (tx - ox) + tz * tz);
    var temple = add(new T.BoxGeometry(0.045, 0.045, len), frameM, s * (ox + tx) / 2, H / 2 - 0.02, tz / 2, glasses);
    temple.rotation.y = Math.atan2(s * (tx - ox), tz);
  });
  add(new T.BoxGeometry(2 * (gx - W / 2), 0.05, 0.05), frameM, 0, H / 2 - 0.03, 0, glasses);

  return { root: root, frog: frog, legL: legL, legR: legR, armL: armL, armR: armR, head: head, shadow: shadow, glasses: glasses, gy: gy };
}

export function poseAgent(f: Agent, t: number, actT: number, look: Look) {
  f.head.rotation.y = look.x * 0.5;
  f.head.rotation.x = look.y * 0.2;
  if (actT >= 0 && actT < 0.8) {
    var p = Math.sin((actT / 0.8) * Math.PI);
    f.frog.position.y = p * 0.45;
    f.frog.rotation.z = 0;
    f.frog.rotation.x = 0;
    f.head.rotation.z = 0;
    f.root.rotation.y = -0.6 * (1 - p);
    f.legL.rotation.x = -0.5 * p;
    f.legR.rotation.x = -0.5 * p;
    f.armL.rotation.x = 0;
    f.armL.rotation.z = -(0.12 + p * 2.3);
    f.armR.rotation.x = 0;
    f.glasses.position.y = f.gy;
  } else {
    var ph = t * Math.PI * 2 / 0.9;
    var sw = Math.sin(ph);
    f.frog.position.y = Math.abs(Math.cos(ph)) * 0.05;
    f.frog.rotation.z = sw * 0.05;
    f.frog.rotation.x = 0;
    f.head.rotation.z = -sw * 0.04;
    f.root.rotation.y = -0.6;
    f.legL.rotation.x = sw * 0.5;
    f.legR.rotation.x = -sw * 0.5;
    f.armL.rotation.x = -sw * 0.45;
    f.armL.rotation.z = -0.12;
    f.armR.rotation.x = sw * 0.2;
    f.glasses.position.y = f.gy;
  }
  f.shadow.scale.setScalar(1 - f.frog.position.y * 0.6);
}

// Render loop (SPEC §7): ~12 fps stepped updates; the head follows the cursor over
// `lookArea`; hover/click on `hoverTarget` faces the viewer, hops and waves. The rAF
// loop fully stops while the canvas is offscreen or the tab is hidden, and under
// prefers-reduced-motion a single static frame is drawn. Returns a cleanup function.
export function mountMascot(canvas: HTMLCanvasElement, T: Three, opts: { hoverTarget?: HTMLElement | null; lookArea?: HTMLElement | null } = {}) {
  // three r152+ manages color and r155+ uses physical light units; the model was tuned
  // on r149, so restore that pipeline (linear output, legacy-equivalent light intensity).
  T.ColorManagement.enabled = false;
  const renderer = new T.WebGLRenderer({ canvas, antialias: false, alpha: true });
  renderer.outputColorSpace = T.LinearSRGBColorSpace;
  renderer.setPixelRatio(1);
  renderer.setSize(112, 112, false);
  const sc = setupScene(T);
  sc.scene.traverse((o) => {
    if ((o as THREE.Light).isLight) (o as THREE.Light).intensity *= Math.PI;
  });
  const f = makeAgent(T);
  sc.scene.add(f.root);

  let look: Look = { x: 0, y: 0 };
  let hopAt = -10;
  const draw = (t: number) => {
    poseAgent(f, t, t - hopAt, look);
    renderer.render(sc.scene, sc.camera);
  };

  const cleanups: (() => void)[] = [];
  const on = <K extends keyof HTMLElementEventMap>(el: HTMLElement | null | undefined, ev: K, fn: (e: HTMLElementEventMap[K]) => void) => {
    if (!el) return;
    el.addEventListener(ev, fn as EventListener);
    cleanups.push(() => el.removeEventListener(ev, fn as EventListener));
  };
  const dispose = () => {
    cleanups.forEach((c) => c());
    renderer.dispose();
  };

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    const id = requestAnimationFrame(() => draw(0.225));
    return () => {
      cancelAnimationFrame(id);
      dispose();
    };
  }

  const hop = () => {
    const t = performance.now() / 1000;
    if (t - hopAt > 0.8) hopAt = t;
  };
  on(opts.hoverTarget, "pointerenter", hop);
  on(opts.hoverTarget, "click", hop);
  on(opts.lookArea, "pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height * 0.3);
    look = { x: Math.max(-1, Math.min(1, dx / 400)), y: Math.max(-1, Math.min(1, dy / 300)) };
  });
  on(opts.lookArea, "pointerleave", () => {
    look = { x: 0, y: 0 };
  });

  let visible = true;
  let raf = 0;
  let last = -1;
  const tick = (now: number) => {
    const t = now / 1000;
    if (t - last >= 1 / 12) {
      last = t;
      draw(t);
    }
    raf = requestAnimationFrame(tick);
  };
  const sync = () => {
    const run = visible && !document.hidden;
    if (run && !raf) raf = requestAnimationFrame(tick);
    if (!run && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  });
  io.observe(canvas);
  document.addEventListener("visibilitychange", sync);
  cleanups.push(() => document.removeEventListener("visibilitychange", sync));
  // First draw (and shader compile) happens on the next frame, not in this task.
  sync();

  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    dispose();
  };
}

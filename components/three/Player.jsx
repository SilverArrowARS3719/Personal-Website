"use client";

import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "@react-three/fiber";
import * as THREE from "three";
import Racket, { RACKET_HEAD_Y } from "./Racket";
import { loft } from "./loft";
import { BODY } from "./smashClip";
import { kit } from "@/lib/content";

/*
  VA as a 3D figure: brown skin, big black curly hair, a navy kit worn loose
  (shirt untucked over the shorts) with the site's blue on the collar, cuffs
  and soles.

  The limbs and clothes are skinned meshes on a real skeleton, the way a game
  character is built: each arm, leg, sleeve, sock and the shirt is ONE smooth
  surface whose vertices are weighted between neighbouring bones, so elbows,
  knees and shoulders bend as soft curves instead of showing seams where
  separate parts meet. Rigid things (head, hands, shoes, racket) ride on
  their bones directly.

  Model space: metres, standing on y = 0, facing +z, racket hand on -x.
*/

const smooth = (a, b, x) => {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/*
  A tube lofted straight down the y axis. Sections go top to bottom:
  { y, x, z (centre), rx (half width), rz (half depth), n (squareness) }.
*/
function tubeY(sections, opts) {
  const g = loft(
    sections.map((s) => ({
      x: s.y,
      y: -(s.x ?? 0),
      z: s.z ?? 0,
      h: s.rx,
      w: s.rz ?? s.rx,
      n: s.n ?? 2.2,
    })),
    opts
  );
  g.rotateZ(Math.PI / 2);
  return g;
}

// weight a vertex between the bones of a chain; d runs along the chain
function chain(d, ids, joints, blend) {
  for (let i = 0; i < joints.length; i++) {
    if (d < joints[i] - blend[i]) return [ids[i], 1, ids[i], 0];
    if (d < joints[i] + blend[i]) {
      const t = smooth(joints[i] - blend[i], joints[i] + blend[i], d);
      return [ids[i], 1 - t, ids[i + 1], t];
    }
  }
  const last = ids[ids.length - 1];
  return [last, 1, last, 0];
}

function weigh(geo, fn) {
  const pos = geo.getAttribute("position");
  const idx = new Uint16Array(pos.count * 4);
  const wt = new Float32Array(pos.count * 4);
  for (let i = 0; i < pos.count; i++) {
    const [a, wa, b, wb] = fn(pos.getX(i), pos.getY(i), pos.getZ(i));
    idx[i * 4] = a;
    idx[i * 4 + 1] = b;
    wt[i * 4] = wa;
    wt[i * 4 + 1] = wb;
  }
  geo.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(idx, 4));
  geo.setAttribute("skinWeight", new THREE.Float32BufferAttribute(wt, 4));
  return geo;
}

// ---------- the shapes (rest pose) -------------------------------------------

// starts just below the shoulder joint, inside the sleeve, so no skin shows
// through the top of the shoulder
const ARM = [
  { y: -0.02, rx: 0.05 },
  { y: -0.05, rx: 0.055 },
  { y: -0.1, rx: 0.053 },
  { y: -0.17, rx: 0.048 },
  { y: -0.25, rx: 0.04 },
  { y: -0.28, rx: 0.039 },
  { y: -0.34, rx: 0.043 },
  { y: -0.44, rx: 0.034 },
  { y: -0.52, rx: 0.029 },
  { y: -0.545, rx: 0.028 },
].map((s) => ({ ...s, rz: s.rx * 0.92 }));

// domed at the top so it rounds into the shirt's shoulder like a sewn seam,
// with no flat edge showing
const SLEEVE = [
  { y: 0.035, rx: 0.02, rz: 0.02 },
  { y: 0.015, rx: 0.05, rz: 0.048 },
  { y: -0.02, rx: 0.064, rz: 0.061 },
  { y: -0.08, rx: 0.068, rz: 0.065 },
  { y: -0.13, rx: 0.072, rz: 0.068 },
];

const LEG = [
  { y: 0.04, rx: 0.078 },
  { y: -0.05, rx: 0.076 },
  { y: -0.2, rx: 0.067 },
  { y: -0.34, rx: 0.055 },
  { y: -0.41, rx: 0.05 },
  { y: -0.46, rx: 0.051 },
  { y: -0.56, rx: 0.055 },
  { y: -0.68, rx: 0.044 },
  { y: -0.78, rx: 0.035 },
  { y: -0.82, rx: 0.033 },
].map((s) => ({ ...s, rz: s.rx * 1.03 }));

const SOCK = [
  { y: -0.6, rx: 0.05 },
  { y: -0.7, rx: 0.046 },
  { y: -0.8, rx: 0.039 },
  { y: -0.835, rx: 0.038 },
];

// the leg tubes start below the hip joint and stay narrower than the shirt,
// so the shirt hangs over them instead of the shorts poking through it
const SHORTS_LEG = [
  { y: -0.01, rx: 0.098, rz: 0.094 },
  { y: -0.1, rx: 0.1, rz: 0.096 },
  { y: -0.24, rx: 0.105, rz: 0.101 },
];

// worn loose: shoulders to a flared hem that hangs well over the shorts
const JERSEY = [
  { y: 1.445, rx: 0.07, rz: 0.066 },
  { y: 1.41, rx: 0.135, rz: 0.088 },
  { y: 1.35, rx: 0.212, rz: 0.114, n: 3 },
  { y: 1.27, rx: 0.212, rz: 0.121, n: 3 },
  { y: 1.14, rx: 0.19, rz: 0.117, n: 2.8 },
  { y: 1.02, rx: 0.182, rz: 0.114, n: 2.6 },
  { y: 0.92, rx: 0.194, rz: 0.121, n: 2.6 },
  { y: 0.84, rx: 0.208, rz: 0.13, n: 2.6 },
  { y: 0.79, rx: 0.212, rz: 0.133, n: 2.6 },
];

const SHORTS_WAIST = [
  { y: 0.99, rx: 0.172, rz: 0.108 },
  { y: 0.9, rx: 0.178, rz: 0.112 },
  { y: 0.82, rx: 0.165, rz: 0.104 },
  { y: 0.76, rx: 0.09, rz: 0.07 },
];

const NECK = [
  { y: 1.5, rx: 0.046 },
  { y: 1.44, rx: 0.05 },
  { y: 1.38, rx: 0.056 },
];

function buildBody(m) {
  const B = {};
  const list = [];
  const bone = (name, parent, p) => {
    const b = new THREE.Bone();
    b.name = name;
    b.position.set(...p);
    if (parent) parent.add(b);
    B[name] = b;
    list.push(b);
    return b;
  };

  bone("hips", null, [0, BODY.hipH, 0]);
  bone("spine", B.hips, [0, 0.1, 0]);
  bone("chest", B.spine, [0, 0.13, 0]);
  bone("neck", B.chest, [0, 0.25, 0]);
  bone("head", B.neck, [0, 0.07, 0]);
  // the shirt's hem hangs from its own bone, so it can swing on landing
  bone("hem", B.hips, [0, -0.02, 0]);
  for (const [side, s] of [["r", -1], ["l", 1]]) {
    bone(`${side}Shoulder`, B.chest, [s * 0.17, 0.2, 0]);
    bone(`${side}Elbow`, B[`${side}Shoulder`], [0, -0.27, 0]);
    bone(`${side}Wrist`, B[`${side}Elbow`], [0, -0.25, 0]);
    bone(`${side}Hip`, B.hips, [s * 0.09, -BODY.hipDrop, 0]);
    bone(`${side}Knee`, B[`${side}Hip`], [0, -BODY.thigh, 0]);
    bone(`${side}Ankle`, B[`${side}Knee`], [0, -BODY.shin, 0]);
  }

  const root = new THREE.Group();
  root.add(B.hips);
  root.updateMatrixWorld(true);
  const skeleton = new THREE.Skeleton(list);
  const id = (name) => list.indexOf(B[name]);
  const meshes = [];
  const skinned = (geo, mat) => {
    const mesh = new THREE.SkinnedMesh(geo, mat);
    // the pose moves it far from its rest-pose bounds
    mesh.frustumCulled = false;
    root.add(mesh);
    mesh.updateMatrixWorld(true);
    mesh.bind(skeleton);
    meshes.push(mesh);
    return mesh;
  };

  // at world height y, which spine joint a shirt or neck vertex follows
  const torso = (y) => chain(y, [id("hips"), id("spine"), id("chest"), id("neck")], [1.046, 1.176, 1.43], [0.06, 0.08, 0.02]);

  // shirt: above the waist it follows the spine, below it hangs off the hem bone
  skinned(
    weigh(tubeY(JERSEY, { steps: 64, radial: 56 }), (x, y) => {
      if (y >= 0.955) return torso(y);
      const t = 1 - smooth(0.82, 0.95, y);
      return [id("hips"), 1 - t, id("hem"), t];
    }),
    m.jersey
  );
  skinned(weigh(tubeY(SHORTS_WAIST, { steps: 16, radial: 40 }), () => [id("hips"), 1, 0, 0]), m.shorts);
  skinned(weigh(tubeY(NECK, { steps: 10, radial: 28 }), (x, y) => torso(y)), m.skin);

  for (const side of ["r", "l"]) {
    const S = B[`${side}Shoulder`];
    const H = B[`${side}Hip`];
    const sp = new THREE.Vector3();
    const hp = new THREE.Vector3();
    S.getWorldPosition(sp);
    H.getWorldPosition(hp);
    const arm = [id(`${side}Shoulder`), id(`${side}Elbow`), id(`${side}Wrist`)];
    const leg = [id(`${side}Hip`), id(`${side}Knee`), id(`${side}Ankle`)];

    // weights come from the shape's own coordinates, before it is moved into place
    const armGeo = weigh(tubeY(ARM, { steps: 48, radial: 24 }), (x, y) =>
      chain(-y, arm, [0.27, 0.52], [0.045, 0.02])
    );
    skinned(armGeo.translate(sp.x, sp.y, sp.z), m.skin);

    const sleeveGeo = weigh(tubeY(SLEEVE, { steps: 12, radial: 28 }), (x, y) => {
      const t = smooth(0.02, 0.07, y);
      return [arm[0], 1 - t, id("chest"), t];
    });
    skinned(sleeveGeo.translate(sp.x, sp.y, sp.z), m.jersey);

    const legGeo = weigh(tubeY(LEG, { steps: 56, radial: 24 }), (x, y) =>
      chain(-y, leg, [BODY.thigh, BODY.thigh + BODY.shin], [0.05, 0.02])
    );
    skinned(legGeo.translate(hp.x, hp.y, hp.z), m.skin);

    const sockGeo = weigh(tubeY(SOCK, { steps: 10, radial: 24 }), (x, y) =>
      chain(-y, leg, [BODY.thigh, BODY.thigh + BODY.shin], [0.05, 0.02])
    );
    skinned(sockGeo.translate(hp.x, hp.y, hp.z), m.sock);

    const shortsGeo = weigh(tubeY(SHORTS_LEG, { steps: 14, radial: 32 }), (x, y) => {
      const t = 1 - smooth(-0.1, 0.0, y);
      return [id("hips"), 1 - t, leg[0], t];
    });
    skinned(shortsGeo.translate(hp.x, hp.y, hp.z), m.shorts);
  }

  return { root, bones: B, skeleton, meshes };
}

// ---------- look -------------------------------------------------------------

function useMaterials() {
  return useMemo(
    () => ({
      skin: new THREE.MeshPhysicalMaterial({
        color: "#8a5638",
        roughness: 0.5,
        sheen: 0.35,
        sheenColor: "#d3946c",
        sheenRoughness: 0.6,
      }),
      hairFill: new THREE.MeshStandardMaterial({ color: "#120c0a", roughness: 0.75 }),
      // white so each curl's own instance colour shows through
      curl: new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.62 }),
      jersey: new THREE.MeshPhysicalMaterial({
        color: "#1c3478",
        roughness: 0.85,
        sheen: 0.7,
        sheenColor: "#5b86ff",
        sheenRoughness: 0.8,
      }),
      accent: new THREE.MeshStandardMaterial({ color: "#2f6fed", roughness: 0.5 }),
      shorts: new THREE.MeshPhysicalMaterial({
        color: "#11141b",
        roughness: 0.8,
        sheen: 0.5,
        sheenColor: "#4a5570",
      }),
      sock: new THREE.MeshStandardMaterial({ color: "#f2f4f7", roughness: 0.9 }),
      shoe: new THREE.MeshPhysicalMaterial({ color: "#f7f8fa", roughness: 0.38, clearcoat: 0.5 }),
      eye: new THREE.MeshStandardMaterial({ color: "#0c0908", roughness: 0.2 }),
      glint: new THREE.MeshBasicMaterial({ color: "#ffffff" }),
      lips: new THREE.MeshStandardMaterial({ color: "#4a2418", roughness: 0.6 }),
    }),
    []
  );
}

function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// head bone space: the skull centre is 0.11 above the joint
const SKULL = new THREE.Vector3(0, 0.11, 0);

/*
  Big curly hair that stands out from the head: a dark fill for coverage,
  then about 450 curls scattered over a volume well outside the skull
  (6 cm out at the sides, 8 cm on top), kept off the face and the ears.
  Each curl gets its own shade between black and dark brown for depth.
*/
function Curls({ material }) {
  const mesh = useMemo(() => {
    const rand = seeded(23);
    const centre = new THREE.Vector3(0, 0.165, -0.02);
    const radii = new THREE.Vector3(0.17, 0.14, 0.175);
    const count = 450;
    const geo = new THREE.IcosahedronGeometry(1, 1);
    const inst = new THREE.InstancedMesh(geo, material, count);
    const dark = new THREE.Color("#0c0807");
    const warm = new THREE.Color("#2e1f17");
    const colour = new THREE.Color();
    const m4 = new THREE.Matrix4();
    const dir = new THREE.Vector3();
    const p = new THREE.Vector3();
    let n = 0;
    while (n < count) {
      dir.set(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1);
      const l = dir.lengthSq();
      if (l > 1 || l < 0.02) continue;
      dir.normalize();
      p.copy(dir).multiply(radii).multiplyScalar(0.9 + rand() * 0.14).add(centre);
      if (p.z > 0.02 && p.y < 0.2) continue; // the face: hairline above the brows
      if (p.y < 0.13 && p.z > -0.05 && Math.abs(p.x) > 0.08) continue; // the ears
      if (p.y < 0.04) continue; // below the nape
      const r = 0.03 + rand() * 0.022;
      m4.compose(
        p,
        new THREE.Quaternion().setFromEuler(new THREE.Euler(rand() * 6, rand() * 6, rand() * 6)),
        new THREE.Vector3(r, r * (0.8 + rand() * 0.4), r)
      );
      inst.setMatrixAt(n, m4);
      inst.setColorAt(n, colour.copy(dark).lerp(warm, rand() ** 2));
      n++;
    }
    inst.instanceMatrix.needsUpdate = true;
    inst.instanceColor.needsUpdate = true;
    return inst;
  }, [material]);
  useEffect(() => () => mesh.geometry.dispose(), [mesh]);
  return <primitive object={mesh} />;
}

function Head({ m, hair }) {
  return (
    <>
      <mesh position={SKULL} scale={[0.93, 1, 0.98]} material={m.skin}>
        <sphereGeometry args={[0.12, 48, 32]} />
      </mesh>
      {/* jaw and chin */}
      <mesh position={[0, 0.058, 0.025]} scale={[0.95, 0.78, 0.9]} material={m.skin}>
        <sphereGeometry args={[0.09, 32, 24]} />
      </mesh>
      {[1, -1].map((s) => (
        <group key={s}>
          <mesh position={[s * 0.112, 0.1, 0]} scale={[0.45, 1, 0.75]} material={m.skin}>
            <sphereGeometry args={[0.03, 16, 12]} />
          </mesh>
          <mesh position={[s * 0.043, 0.115, 0.109]} scale={[0.85, 1.15, 0.55]} material={m.eye}>
            <sphereGeometry args={[0.017, 16, 12]} />
          </mesh>
          <mesh position={[s * 0.038, 0.123, 0.117]} material={m.glint}>
            <sphereGeometry args={[0.0045, 8, 6]} />
          </mesh>
          <mesh position={[s * 0.045, 0.152, 0.112]} rotation-z={s * 0.14} material={m.hairFill}>
            <boxGeometry args={[0.046, 0.012, 0.014]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.09, 0.12]} scale={[0.8, 1.1, 1]} material={m.skin}>
        <sphereGeometry args={[0.02, 16, 12]} />
      </mesh>
      <mesh position={[0, 0.052, 0.105]} material={m.lips}>
        <boxGeometry args={[0.034, 0.007, 0.008]} />
      </mesh>

      <group ref={hair}>
        <mesh position={[0, 0.17, -0.03]} rotation-x={-0.55} scale={[0.14, 0.12, 0.15]} material={m.hairFill}>
          <sphereGeometry args={[1, 32, 20, 0, Math.PI * 2, 0, 1.6]} />
        </mesh>
        <Curls material={m.curl} />
      </group>
    </>
  );
}

/*
  The chest logo: the kit's wordmark drawn onto a canvas, laid on a patch
  curved to match the front of the shirt and carried by the chest bone (the
  shirt there is weighted almost entirely to the chest, so the two move
  together). With kit.logoImage set, that image replaces the lettering.
*/
function useLogoTexture() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 320;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = '900 italic 230px "Helvetica Neue", "Arial Black", Arial, sans-serif';
    if ("letterSpacing" in ctx) ctx.letterSpacing = "6px";
    // an outline in the same white thickens it, whatever weight the font has
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 14;
    ctx.lineJoin = "round";
    ctx.strokeText(kit.logoText, canvas.width / 2, canvas.height / 2 + 8);
    ctx.fillText(kit.logoText, canvas.width / 2, canvas.height / 2 + 8);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }, []);

  useEffect(() => {
    if (!kit.logoImage) return;
    let live = true;
    new THREE.TextureLoader().load(kit.logoImage, (img) => {
      if (!live) return img.dispose();
      texture.image = img.image;
      texture.needsUpdate = true;
    });
    return () => {
      live = false;
    };
  }, [texture]);

  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

function useLogoGeometry() {
  return useMemo(() => {
    // 26 cm across, bent back at the edges to sit on the curve of the chest
    const g = new THREE.PlaneGeometry(0.26, 0.081, 20, 1);
    const pos = g.getAttribute("position");
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      pos.setZ(i, -0.9 * x * x);
    }
    g.computeVertexNormals();
    return g;
  }, []);
}

function Logo() {
  const map = useLogoTexture();
  const geometry = useLogoGeometry();
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map,
        transparent: true,
        alphaTest: 0.08,
        roughness: 0.55,
        polygonOffset: true,
        polygonOffsetFactor: -2,
      }),
    [map]
  );
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material]
  );
  // chest-bone space: about 6 cm above the joint, on the front of the shirt
  return <mesh geometry={geometry} material={material} position={[0, 0.066, 0.1255]} />;
}

// the blue band round the end of a sleeve
function Cuff({ m }) {
  return (
    <mesh position-y={-0.128} rotation-x={Math.PI / 2} scale={[1, 0.94, 1]} material={m.accent}>
      <torusGeometry args={[0.071, 0.007, 8, 40]} />
    </mesh>
  );
}

function useShoeGeometry() {
  return useMemo(() => {
    // lofted heel to toe, then turned so the toe points +z
    const g = loft(
      [
        { x: 0.17, y: -0.042, w: 0.03, h: 0.018, n: 2.2 },
        { x: 0.14, y: -0.036, w: 0.042, h: 0.028, n: 2.4 },
        { x: 0.08, y: -0.03, w: 0.048, h: 0.034, n: 2.6 },
        { x: 0.02, y: -0.022, w: 0.047, h: 0.042, n: 2.8 },
        { x: -0.04, y: -0.02, w: 0.044, h: 0.046, n: 2.8 },
        { x: -0.075, y: -0.024, w: 0.038, h: 0.04, n: 2.6 },
        { x: -0.09, y: -0.03, w: 0.028, h: 0.028, n: 2.4 },
      ],
      { steps: 28, radial: 28 }
    );
    g.rotateY(-Math.PI / 2);
    return g;
  }, []);
}

function Shoe({ m, geometry }) {
  return (
    <>
      <mesh geometry={geometry} material={m.shoe} />
      <mesh position={[0, -0.059, 0.04]} material={m.accent}>
        <boxGeometry args={[0.1, 0.014, 0.27]} />
      </mesh>
    </>
  );
}

/*
  `rig` gets the bones (for applyPose), the hair and hem for the scene's
  spring motion, and two markers on the racket: the centre of the strings
  and the throat, which together draw the swoosh trail.
*/
export default function Player({ rig }) {
  const m = useMaterials();
  const body = useMemo(() => buildBody(m), [m]);
  const shoe = useShoeGeometry();
  const strings = useRef(null);
  const throat = useRef(null);
  const hair = useRef(null);
  const B = body.bones;

  useEffect(() => {
    rig.current = {
      bones: B,
      hem: B.hem,
      hair: hair.current,
      strings: strings.current,
      throat: throat.current,
    };
    return () => {
      rig.current = null;
    };
  }, [B, rig]);

  useEffect(
    () => () => {
      body.meshes.forEach((mesh) => mesh.geometry.dispose());
      body.skeleton.dispose();
      shoe.dispose();
      Object.values(m).forEach((mat) => mat.dispose());
    },
    [body, shoe, m]
  );

  return (
    <>
      <primitive object={body.root} />

      {createPortal(<Head m={m} hair={hair} />, B.head)}

      {/* collar in the accent blue, and the logo across the chest */}
      {createPortal(
        <>
          <mesh position-y={0.262} rotation-x={Math.PI / 2} scale={[1, 0.94, 1]} material={m.accent}>
            <torusGeometry args={[0.068, 0.011, 8, 40]} />
          </mesh>
          <Logo />
        </>,
        B.chest
      )}
      {createPortal(<Cuff m={m} />, B.rShoulder)}
      {createPortal(<Cuff m={m} />, B.lShoulder)}

      {/* racket hand: a fist round the grip, racket continuing the forearm */}
      {createPortal(
        <>
          <mesh position-y={-0.05} scale={[0.045, 0.052, 0.043]} material={m.skin}>
            <sphereGeometry args={[1, 20, 16]} />
          </mesh>
          <group position-y={-0.06} rotation-x={Math.PI}>
            <group scale={0.1}>
              <Racket />
              <object3D ref={strings} position-y={RACKET_HEAD_Y} />
              <object3D ref={throat} position-y={2.9} />
            </group>
          </group>
        </>,
        B.rWrist
      )}
      {createPortal(
        <>
          <mesh position-y={-0.055} scale={[0.04, 0.056, 0.03]} material={m.skin}>
            <sphereGeometry args={[1, 20, 16]} />
          </mesh>
          <mesh position={[0.028, -0.035, 0.02]} material={m.skin}>
            <sphereGeometry args={[0.016, 12, 10]} />
          </mesh>
        </>,
        B.lWrist
      )}

      {createPortal(<Shoe m={m} geometry={shoe} />, B.rAnkle)}
      {createPortal(<Shoe m={m} geometry={shoe} />, B.lAnkle)}
    </>
  );
}

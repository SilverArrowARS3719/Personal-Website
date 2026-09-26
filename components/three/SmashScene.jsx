"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Scene from "./Scene";
import Studio from "./Studio";
import Player from "./Player";
import Shuttle from "./Shuttle";
import {
  CONTACT_T,
  DURATION,
  LAND_T,
  applyPose,
  playbackRate,
  sampleClip,
} from "./smashClip";

const { clamp, lerp } = THREE.MathUtils;
const UP = new THREE.Vector3(0, 1, 0);

// the player stands left of centre so the smash has room to travel
const PLAYER_X = -0.9;
// when the smashed shuttle reaches the floor, and when it stops bouncing
const SHUTTLE_DOWN = CONTACT_T + 0.08;
const SHUTTLE_REST = SHUTTLE_DOWN + 0.2;
const TRAIL = 26;

/*
  Scroll drives the smash, so it always happens while you are looking at it:
  the whole clip plays between START and END of the slide's pinned scroll.
  Scroll distance is shared out by 1 / playbackRate, so the moment of impact
  takes up far more scroll than the run-up: slow motion, under your thumb.
  The pose then chases that target smoothly rather than jumping with every
  wheel tick.
*/
const START = 0.06;
const END = 0.84;
const toClip = (() => {
  const steps = 400;
  const cum = [0];
  for (let i = 1; i <= steps; i++) {
    const t = ((i - 0.5) / steps) * DURATION;
    cum.push(cum[i - 1] + 1 / playbackRate(t));
  }
  const total = cum[steps];
  return (p) => {
    const want = clamp((p - START) / (END - START), 0, 1) * total;
    let lo = 0;
    let hi = steps;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (cum[mid] < want) lo = mid;
      else hi = mid;
    }
    const span = cum[hi] - cum[lo] || 1;
    return ((lo + (want - cum[lo]) / span) / steps) * DURATION;
  };
})();

// ---------- small effect materials -------------------------------------------

function fadeMaterial(color, opacity = 1) {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

function radialMaterial(rgb) {
  return new THREE.ShaderMaterial({
    uniforms: { uStrength: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uStrength;
      varying vec2 vUv;
      void main() {
        float r = length(vUv - 0.5) * 2.0;
        gl_FragColor = vec4(${rgb}, (1.0 - smoothstep(0.0, 1.0, r)) * uStrength);
      }`,
    transparent: true,
    depthWrite: false,
  });
}

// the swoosh: a ribbon between the racket head and throat over recent frames
function useTrail() {
  return useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(TRAIL * 2 * 3);
    const age = new Float32Array(TRAIL * 2);
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute("aAge", new THREE.BufferAttribute(age, 1).setUsage(THREE.DynamicDrawUsage));
    const index = [];
    for (let i = 0; i < TRAIL - 1; i++) {
      const a = i * 2;
      index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    geo.setIndex(index);
    const material = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color("#2f6fed") }, uFade: { value: 0 } },
      vertexShader: /* glsl */ `
        attribute float aAge;
        varying float vAge;
        void main() { vAge = aAge; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        uniform float uFade;
        varying float vAge;
        void main() { gl_FragColor = vec4(uColor, pow(vAge, 1.6) * 0.45 * uFade); }`,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    return { geo, material, heads: [], throats: [] };
  }, []);
}

// a fixed scatter of directions for the burst at contact, thrown mostly along the smash
function useBurst() {
  return useMemo(() => {
    const dirs = [];
    let s = 7;
    const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 18; i++) {
      dirs.push(
        new THREE.Vector3(r() * 2 - 0.4, r() * 1.6 - 0.9, r() * 1.2 - 0.6)
          .normalize()
          .multiplyScalar(0.6 + r() * 1.1)
      );
    }
    return dirs;
  }, []);
}

// a damped spring, used for the hair and the shirt hem
function spring(state, force, dt) {
  const k = 170;
  const c = 9;
  state.v += (-k * state.x - c * state.v + force) * dt;
  state.x += state.v * dt;
}

function Rally({ progress, still }) {
  const stage = useRef(null);
  const rig = useRef(null);
  const shuttle = useRef(null);
  const trailMesh = useRef(null);
  const flash = useRef(null);
  const burst = useRef(null);
  const dust = useRef(null);
  const blob = useRef(null);
  const camera = useThree((s) => s.camera);
  const viewport = useThree((s) => s.viewport);

  const trail = useTrail();
  const dirs = useBurst();
  const fx = useMemo(
    () => ({
      flash: fadeMaterial("#2f6fed", 0),
      burst: fadeMaterial("#2f6fed", 0.9),
      dust: fadeMaterial("#7f8ba3", 0),
      blob: radialMaterial("0.07, 0.11, 0.2"),
    }),
    []
  );
  useEffect(
    () => () => {
      Object.values(fx).forEach((m) => m.dispose());
      trail.geo.dispose();
      trail.material.dispose();
    },
    [fx, trail]
  );

  const st = useRef({
    t: 0,
    lastT: 0,
    time: 0,
    pose: {},
    contact: null,
    hair: { x: 0, v: 0, lastY: null, lastV: 0 },
    hem: { x: 0, v: 0, lastY: null, lastV: 0 },
  });

  const v = useMemo(
    () => ({ a: new THREE.Vector3(), b: new THREE.Vector3(), dir: new THREE.Vector3() }),
    []
  );

  useFrame((_, rawDt) => {
    const s = st.current;
    const r = rig.current;
    if (!r || !stage.current) return;
    const dt = Math.min(rawDt, 1 / 30);
    s.time += dt;

    // find the contact point once, in stage space, by posing the moment of impact
    if (!s.contact) {
      applyPose(r.bones, sampleClip(CONTACT_T, s.pose));
      stage.current.updateMatrixWorld(true);
      s.contact = stage.current.worldToLocal(r.strings.getWorldPosition(new THREE.Vector3()));
    }
    const C = s.contact;

    // ---- clock: chase the scroll -------------------------------------------
    s.lastT = s.t;
    if (still) s.t = CONTACT_T + 0.02;
    else s.t = THREE.MathUtils.damp(s.t, toClip(progress.get()), 6, dt);
    const t = s.t;
    // "moving" while the clip is actually advancing; idle life otherwise
    const moving = Math.abs(t - s.lastT) > dt * 0.05;
    const started = t > 0.01;

    // ---- pose, plus a little life while standing still ----------------------
    const P = sampleClip(t, s.pose);
    if (!moving && !still && (t < 0.3 || t > LAND_T + 0.3)) {
      const breathe = Math.sin(s.time * 2.1);
      const bob = Math.sin(s.time * 3.2);
      P.cRx += breathe * 0.02;
      P.rKn += bob * 0.04;
      P.lKn += bob * 0.04;
      P.hRy += Math.sin(s.time * 0.7) * 0.06;
    }
    applyPose(r.bones, P);

    // ---- framing: fit from the hit, then push in around it in slow motion ---
    const { width, height } = viewport;
    // contact sits 38% down the screen, so the flash clears the line of words
    // under the headline
    const floorY = -height * 0.47;
    // on a wide screen the player stands left of centre with room for the
    // shuttle to fly right; on a phone there is no room, so the player is
    // centred and framed tighter (the smash itself, not the whole rally)
    const narrow = width / height < 0.9;
    const span = narrow ? 2.3 : 3.6;
    const fit = Math.min((height * 0.59) / C.y, (width * 0.95) / span);
    const shift = narrow ? -(PLAYER_X + 0.2) : -0.55;
    const zoom = 1 + 0.14 * Math.exp(-(((t - CONTACT_T) / 0.25) ** 2)) * (still ? 0 : 1);
    stage.current.scale.setScalar(fit * zoom);
    stage.current.position.set(
      shift * fit + fit * C.x * (1 - zoom),
      floorY + fit * C.y * (1 - zoom),
      0
    );

    // ---- springs: hair and shirt hem lag behind the body's motion -----------
    stage.current.updateMatrixWorld(true);
    const headY = r.bones.head.getWorldPosition(v.a).y / (fit * zoom);
    const hipY = r.bones.hips.getWorldPosition(v.b).y / (fit * zoom);
    for (const [sp, y, gain] of [
      [s.hair, headY, 0.018],
      [s.hem, hipY, 0.03],
    ]) {
      if (sp.lastY === null) sp.lastY = y;
      const vel = (y - sp.lastY) / dt;
      const acc = clamp((vel - sp.lastV) / dt, -60, 60);
      sp.lastY = y;
      sp.lastV = vel;
      spring(sp, -acc * gain, dt);
      sp.x = clamp(sp.x, -0.04, 0.04);
    }
    r.hair.position.y = s.hair.x;
    r.hair.scale.set(1 - s.hair.x * 1.5, 1 + s.hair.x * 3, 1 - s.hair.x * 1.5);
    r.hem.rotation.x = s.hem.x * 4;
    r.hem.position.y = s.hem.x * 0.6;

    // ---- the shuttle --------------------------------------------------------
    const sh = shuttle.current;
    sh.visible = started;
    const start = v.a.set(C.x + 2.3, C.y + 2.6, C.z);
    const land = v.b.set(C.x + 2.4, 0.03, C.z + 0.15);
    const dir = v.dir;
    if (t < CONTACT_T) {
      // the lob: drifting in and dropping steeply onto the strings
      const u = t / CONTACT_T;
      const ux = 1 - (1 - u) ** 1.7;
      const uy = u ** 1.6;
      sh.position.set(lerp(start.x, C.x, ux), lerp(start.y, C.y, uy), C.z);
      dir.set((C.x - start.x) * 1.7 * (1 - u) ** 0.7, (C.y - start.y) * 1.6 * u ** 0.6 - 0.001, 0);
    } else if (t < SHUTTLE_DOWN) {
      const u = (t - CONTACT_T) / (SHUTTLE_DOWN - CONTACT_T);
      sh.position.lerpVectors(C, land, u ** 0.85);
      dir.subVectors(land, C);
    } else if (t < SHUTTLE_REST) {
      // one little bounce, then it lies down
      const u = (t - SHUTTLE_DOWN) / (SHUTTLE_REST - SHUTTLE_DOWN);
      sh.position.set(land.x + 0.2 * u, land.y + 0.14 * Math.sin(Math.PI * u), land.z);
      dir.set(1, lerp(-1.2, -0.3, u), 0.3);
    } else {
      sh.position.set(land.x + 0.2, land.y, land.z);
      dir.set(1, -0.3, 0.3);
    }
    sh.quaternion.setFromUnitVectors(UP, dir.normalize());

    // ---- swoosh: the racket's path over the last few frames -----------------
    // only drawn going forwards; scrolling back up wipes it
    if (t < s.lastT - 0.002 || t < 1.28) {
      trail.heads.length = 0;
      trail.throats.length = 0;
    }
    const swinging = t > 1.28 && t < 1.66 && t > s.lastT;
    if (swinging) {
      trail.heads.push(stage.current.worldToLocal(r.strings.getWorldPosition(new THREE.Vector3())));
      trail.throats.push(stage.current.worldToLocal(r.throat.getWorldPosition(new THREE.Vector3())));
      if (trail.heads.length > TRAIL) {
        trail.heads.shift();
        trail.throats.shift();
      }
    }
    const count = trail.heads.length;
    trailMesh.current.visible = count > 2 && !still && t < 1.85;
    if (trailMesh.current.visible) {
      const pos = trail.geo.getAttribute("position");
      const age = trail.geo.getAttribute("aAge");
      for (let i = 0; i < TRAIL; i++) {
        const k = Math.max(0, count - TRAIL + i);
        const h = trail.heads[Math.min(k, count - 1)];
        const th = trail.throats[Math.min(k, count - 1)];
        pos.setXYZ(i * 2, h.x, h.y, h.z);
        pos.setXYZ(i * 2 + 1, th.x, th.y, th.z);
        const a = i / (TRAIL - 1);
        age.setX(i * 2, a);
        age.setX(i * 2 + 1, a * 0.4);
      }
      pos.needsUpdate = true;
      age.needsUpdate = true;
      trail.material.uniforms.uFade.value = t < 1.66 ? 1 : 1 - (t - 1.66) / 0.19;
    }

    // ---- impact: flash ring and a burst of specks --------------------------
    const since = t - CONTACT_T;
    const f = clamp(since / 0.12, 0, 1);
    flash.current.visible = since > -0.005 && f < 1;
    flash.current.position.copy(C);
    flash.current.quaternion.copy(camera.quaternion);
    flash.current.scale.setScalar(0.05 + f * 0.55);
    fx.flash.opacity = (1 - f) * 0.9;

    const b = clamp(since / 0.5, 0, 1);
    burst.current.visible = since > 0 && b < 1;
    if (burst.current.visible) {
      burst.current.children.forEach((speck, i) => {
        speck.position.copy(C).addScaledVector(dirs[i], b * (1 - b * 0.45) * 0.55);
        speck.scale.setScalar(0.012 * (1 - b));
      });
    }

    // ---- landing dust and the shadow under the feet -------------------------
    const d = clamp((t - LAND_T) / 0.45, 0, 1);
    dust.current.visible = t > LAND_T && d < 1;
    dust.current.position.set(PLAYER_X + P.x + 0.15, 0.004, 0);
    dust.current.scale.setScalar(0.12 + d * 0.6);
    fx.dust.opacity = 0.32 * (1 - d);

    blob.current.position.x = PLAYER_X + P.x + 0.1;
    blob.current.scale.setScalar(1 - P.air * 0.9);
    fx.blob.uniforms.uStrength.value = 0.32 * (1 - P.air * 1.2);
  });

  return (
    <group ref={stage}>
      <group position-x={PLAYER_X}>
        <Player rig={rig} />
      </group>
      <Shuttle ref={shuttle} scale={1.8} visible={false} />
      <mesh ref={trailMesh} geometry={trail.geo} material={trail.material} visible={false} frustumCulled={false} />
      <mesh ref={flash} material={fx.flash} visible={false}>
        <ringGeometry args={[0.82, 1, 48]} />
      </mesh>
      <group ref={burst} visible={false}>
        {dirs.map((_, i) => (
          <mesh key={i} material={fx.burst}>
            <sphereGeometry args={[1, 8, 6]} />
          </mesh>
        ))}
      </group>
      <mesh ref={dust} rotation-x={-Math.PI / 2} material={fx.dust} visible={false}>
        <ringGeometry args={[0.6, 1, 48]} />
      </mesh>
      <mesh ref={blob} rotation-x={-Math.PI / 2} position-y={0.003} material={fx.blob}>
        <planeGeometry args={[1.1, 0.7]} />
      </mesh>
    </group>
  );
}

export default function SmashScene({ progress, still, active }) {
  return (
    <Scene active={active} camera={{ position: [0, 0, 7], fov: 35 }}>
      <Studio tone="light" />
      <Rally progress={progress} still={still} />
    </Scene>
  );
}

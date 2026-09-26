"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Scene from "./Scene";
import Studio from "./Studio";
import Football from "./Football";
import ModelSlot from "./ModelSlot";
import { models } from "@/lib/content";

const { damp, clamp, lerp, smootherstep } = THREE.MathUtils;

/*
  A blue halo hugging the ball, brightest along the top edge: MOTO's
  atmosphere, recoloured. It is the back faces of a slightly larger sphere, so
  the part inside the ball's outline is hidden behind the ball itself and only
  the ring around it shows.
*/
function Halo() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color("#5b93ff") },
          uStrength: { value: 1.25 },
        },
        vertexShader: /* glsl */ `
          varying vec3 vN;
          varying vec3 vV;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vN = normalize(normalMatrix * normal);
            vV = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor;
          uniform float uStrength;
          varying vec3 vN;
          varying vec3 vV;
          void main() {
            // 0 at the halo's outer edge, 1 where it meets the ball
            float d = -dot(normalize(vN), normalize(vV));
            float g = pow(clamp(d / 0.466, 0.0, 1.0), 2.4);
            g *= mix(0.35, 1.0, smoothstep(-0.4, 0.85, vN.y));
            gl_FragColor = vec4(uColor * uStrength, g);
          }`,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );
  useEffect(() => () => material.dispose(), [material]);
  return (
    <mesh material={material} scale={1.13}>
      <sphereGeometry args={[1, 96, 64]} />
    </mesh>
  );
}

function Rig({ progress, still }) {
  const lift = useRef(null);
  const spin = useRef(null);
  const viewport = useThree((s) => s.viewport);
  const st = useRef({ p: 0, start: null });

  useFrame((state, dt) => {
    const s = st.current;
    const now = state.clock.elapsedTime;
    if (s.start === null) s.start = now;
    s.p = damp(s.p, still ? 0.2 : progress.get(), 5, Math.min(dt, 0.1));
    const p = s.p;

    // on first paint the ball rises into place like a planet over a horizon
    const intro = still ? 1 : 1 - (1 - clamp((now - s.start) / 1.9, 0, 1)) ** 4;

    const { width, height } = viewport;
    const e = smootherstep(p, 0, 1);

    // starts as a horizon: a big ball whose top peeks up from 66% down the
    // screen, like the Earth on MOTO
    const startRadius = clamp(width * 0.34, 1.3, 2.35);
    const startY = height / 2 - 0.66 * height - startRadius;
    // ends whole and in frame: halo and all fit inside the screen, so nothing
    // gets sliced when the slide lets go and scrolls away
    const endRadius = Math.min(height * 0.33, width * 0.38);
    const endY = -height * 0.04;

    const radius = lerp(startRadius, endRadius, e);
    lift.current.scale.setScalar(radius);
    lift.current.position.y = lerp(startY, endY, e) - (1 - intro) * height * 0.45;

    spin.current.rotation.y = (still ? 0 : now * 0.1) + p * 2.4;
  });

  return (
    <group ref={lift}>
      <Halo />
      {/* tilt the spin axis so the panels travel diagonally, not in rows */}
      <group rotation={[0.42, 0, 0.22]}>
        <group ref={spin}>
          <ModelSlot src={models.football} size={2}>
            <Football />
          </ModelSlot>
        </group>
      </group>
    </group>
  );
}

export default function FootballScene({ progress, still, active }) {
  return (
    <Scene active={active} camera={{ position: [0, 0, 6], fov: 35 }}>
      <Studio />
      <Rig progress={progress} still={still} />
    </Scene>
  );
}

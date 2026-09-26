"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import Scene from "./Scene";
import Studio from "./Studio";
import F1Car, { TYRE_RADIUS } from "./F1Car";
import ModelSlot from "./ModelSlot";
import { models } from "@/lib/content";

const { damp, clamp, smootherstep } = THREE.MathUtils;
const CAR_LENGTH = 5.4;

// a soft pool of blue light on the floor, the stage the car turns on
function Pool() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color("#2f5fc4") } },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor;
          varying vec2 vUv;
          void main() {
            float r = length(vUv - 0.5) * 2.0;
            gl_FragColor = vec4(uColor, (1.0 - smoothstep(0.0, 1.0, r)) * 0.22);
          }`,
        transparent: true,
        depthWrite: false,
      }),
    []
  );
  useEffect(() => () => material.dispose(), [material]);
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={0.002} material={material}>
      <planeGeometry args={[7, 7]} />
    </mesh>
  );
}

function Rig({ progress, still }) {
  const rig = useRef(null);
  const wheels = useRef([]);
  const viewport = useThree((s) => s.viewport);
  const st = useRef({ p: 0 });

  useFrame((_, dt) => {
    const s = st.current;
    s.p = damp(s.p, still ? 0.66 : progress.get(), 4.5, Math.min(dt, 0.1));
    const p = s.p;

    const fit = clamp((viewport.width * 0.6) / CAR_LENGTH, 0.32, 1.0);
    // first third: drive in from off the right edge, nose first
    const drive = 1 - (1 - clamp(p / 0.32, 0, 1)) ** 3;
    // the rest: turntable from side-on, through head-on, to three-quarter
    const turn = smootherstep(clamp((p - 0.32) / 0.68, 0, 1), 0, 1);
    const scale = fit * (1 + 0.14 * turn);

    const startX = viewport.width / 2 + (CAR_LENGTH / 2 + 0.4) * fit;
    const x = (1 - drive) * startX;

    rig.current.scale.setScalar(scale);
    rig.current.position.set(x, -0.12, 0);
    rig.current.rotation.y = Math.PI + turn * Math.PI * 0.75;

    // roll the tyres by the distance covered, so they grip rather than skate
    const roll = -(startX - x) / (scale * TYRE_RADIUS);
    for (const w of wheels.current) w.rotation.z = roll;
  });

  return (
    <group ref={rig}>
      <ModelSlot src={models.f1} size={CAR_LENGTH} ground>
        <F1Car wheels={wheels} />
      </ModelSlot>
      <Pool />
      <ContactShadows
        position-y={0.004}
        scale={7}
        far={1.4}
        blur={2.4}
        opacity={0.75}
        resolution={512}
        color="#01040b"
      />
    </group>
  );
}

export default function F1Scene({ progress, still, active }) {
  return (
    <Scene
      active={active}
      camera={{ position: [0, 1.3, 9], fov: 30 }}
      aim={[0, 0.1, 0]}
    >
      <Studio />
      <Rig progress={progress} still={still} />
    </Scene>
  );
}

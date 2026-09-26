"use client";

import { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { airfoil, loft, planPlate, sidePlate, turned } from "./loft";

/*
  A current-era F1 car in Mercedes-AMG colours: gloss black bodywork with the
  Petronas-teal stripe sweeping down the nose and along the sidepods. No
  sponsor marks or logos; those belong to other companies.

  The bodywork is lofted (see loft.js), so the nose, tub, airbox and engine
  cover are one continuous surface, and the sidepods are undercut and pinch in
  toward the rear the way a real "coke bottle" does. The wings are true
  cambered airfoil sections, and the wheels are 18-inch low-profile tyres with
  covered rims, as on the 2022-and-later cars.

  Model space: the nose points +x, y is up, the tyres sit on y = 0. About 5.4
  long and 1.95 wide, so one unit is roughly a metre.

  `wheels` is an optional ref to an array; each wheel's spin group is pushed
  into it so the scene can roll them as the car drives in.
*/

const TYRE_R = 0.36;
const RIM_R = 0.255;
const FRONT_X = 1.75;
const REAR_X = -1.85;
const TRACK = 0.8;

// ---------- livery ----------------------------------------------------------

/*
  Gloss black with a teal band and a fine pinstripe below it, painted in the
  shader from the loft attribute so the stripe follows the curve of the body
  with a crisp edge at any zoom. `around` is folded so both flanks get the
  same stripe: 0 underneath, 0.25 on the side, 0.5 on top.
*/
function liveryMaterial({ centre, rise, width, start, end }) {
  const m = new THREE.MeshPhysicalMaterial({
    color: "#0b0c0f",
    metalness: 0.35,
    roughness: 0.28,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
  });
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, {
      uTeal: { value: new THREE.Color("#00bfae") },
      uCentre: { value: centre },
      uRise: { value: rise },
      uWidth: { value: width },
      uStart: { value: start },
      uEnd: { value: end },
    });
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nattribute vec2 loft;\nvarying vec2 vLoft;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvLoft = loft;");
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        /* glsl */ `#include <common>
varying vec2 vLoft;
uniform vec3 uTeal;
uniform float uCentre, uRise, uWidth, uStart, uEnd;`
      )
      .replace(
        "#include <color_fragment>",
        /* glsl */ `#include <color_fragment>
float side = vLoft.y < 0.5 ? vLoft.y : 1.0 - vLoft.y;
float stripeAt = uCentre + uRise * vLoft.x;
float aa = fwidth(side) * 1.5 + 1e-4;
float band = 1.0 - smoothstep(uWidth - aa, uWidth + aa, abs(side - stripeAt));
float pin = 1.0 - smoothstep(0.0028 - aa, 0.0028 + aa, abs(side - stripeAt + uWidth + 0.022));
float along = smoothstep(uStart, uStart + 0.05, vLoft.x) * (1.0 - smoothstep(uEnd - 0.12, uEnd, vLoft.x));
float livery = max(band, pin) * along;
diffuseColor.rgb = mix(diffuseColor.rgb, uTeal, livery);`
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
totalEmissiveRadiance += uTeal * livery * 0.3;`
      );
  };
  return m;
}

function useParts() {
  return useMemo(() => {
    const mat = {
      body: liveryMaterial({ centre: 0.3, rise: 0.08, width: 0.014, start: 0.0, end: 0.62 }),
      pod: liveryMaterial({ centre: 0.36, rise: -0.02, width: 0.011, start: 0.04, end: 0.8 }),
      gloss: new THREE.MeshPhysicalMaterial({
        color: "#0b0c0f",
        metalness: 0.35,
        roughness: 0.28,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
      }),
      // satin, not gloss: wide flat carbon panels (floor, wing planes) would
      // otherwise mirror the blue backlight as big bright slabs
      carbon: new THREE.MeshStandardMaterial({
        color: "#0e0f12",
        metalness: 0.15,
        roughness: 0.68,
        envMapIntensity: 0.35,
      }),
      // the floor is seen almost edge-on, where even satin catches the blue
      // backlight at a grazing angle, so it is fully matte
      floor: new THREE.MeshStandardMaterial({
        color: "#060607",
        metalness: 0,
        roughness: 1,
        envMapIntensity: 0.1,
      }),
      teal: new THREE.MeshStandardMaterial({
        color: "#00bfae",
        roughness: 0.3,
        emissive: "#00bfae",
        emissiveIntensity: 0.3,
      }),
      silver: new THREE.MeshStandardMaterial({ color: "#c7ccd2", metalness: 0.9, roughness: 0.22 }),
      tyre: new THREE.MeshStandardMaterial({ color: "#121212", roughness: 0.82 }),
      cover: new THREE.MeshPhysicalMaterial({
        color: "#1a1c20",
        metalness: 0.7,
        roughness: 0.3,
        clearcoat: 0.6,
      }),
      compound: new THREE.MeshStandardMaterial({ color: "#e3b41f", roughness: 0.5 }),
      void: new THREE.MeshBasicMaterial({ color: "#020203" }),
      helmet: new THREE.MeshPhysicalMaterial({ color: "#f1f3f5", roughness: 0.2, clearcoat: 1 }),
      visor: new THREE.MeshStandardMaterial({ color: "#07090c", metalness: 0.95, roughness: 0.08 }),
      light: new THREE.MeshStandardMaterial({
        color: "#ff3030",
        emissive: "#ff2020",
        emissiveIntensity: 2.4,
      }),
    };

    const geo = {
      // nose tip to crash structure: one surface
      body: loft(
        [
          { x: 2.74, y: 0.215, w: 0.04, h: 0.03, n: 2.4 },
          { x: 2.4, y: 0.25, w: 0.085, h: 0.058, n: 2.6 },
          { x: 1.9, y: 0.31, w: 0.145, h: 0.098, n: 3 },
          { x: 1.35, y: 0.395, w: 0.215, h: 0.148, n: 3.2 },
          { x: 0.95, y: 0.45, w: 0.265, h: 0.19, n: 3.5 },
          { x: 0.55, y: 0.465, w: 0.295, h: 0.195, n: 3.6 },
          { x: 0.1, y: 0.49, w: 0.305, h: 0.225, n: 3.6 },
          { x: -0.25, y: 0.56, w: 0.29, h: 0.3, n: 3.2 },
          { x: -0.7, y: 0.53, w: 0.25, h: 0.25, n: 3 },
          { x: -1.3, y: 0.44, w: 0.185, h: 0.19, n: 2.8 },
          { x: -1.9, y: 0.355, w: 0.115, h: 0.13, n: 2.6 },
          { x: -2.28, y: 0.3, w: 0.065, h: 0.085, n: 2.4 },
        ],
        { steps: 120, radial: 64 }
      ),
      // right sidepod; the left one is the same mesh mirrored
      pod: loft(
        [
          { x: 0.62, y: 0.37, z: 0.5, w: 0.12, h: 0.14, n: 3.4 },
          { x: 0.35, y: 0.38, z: 0.51, w: 0.19, h: 0.175, n: 3.6 },
          { x: -0.2, y: 0.36, z: 0.49, w: 0.2, h: 0.17, n: 3.4 },
          { x: -0.85, y: 0.29, z: 0.4, w: 0.15, h: 0.125, n: 3 },
          { x: -1.45, y: 0.21, z: 0.27, w: 0.075, h: 0.075, n: 2.6 },
        ],
        { steps: 60, radial: 48 }
      ),
      // roll-hoop airbox above the driver's head
      airbox: loft(
        [
          { x: 0.03, y: 0.855, w: 0.075, h: 0.058, n: 2.3 },
          { x: -0.12, y: 0.875, w: 0.085, h: 0.07, n: 2.4 },
          { x: -0.4, y: 0.83, w: 0.07, h: 0.055, n: 2.4 },
        ],
        { steps: 16, radial: 32 }
      ),
      halo: new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(
          [
            [-0.02, 0.66, 0.27],
            [0.18, 0.86, 0.28],
            [0.48, 0.9, 0.17],
            [0.6, 0.9, 0],
            [0.48, 0.9, -0.17],
            [0.18, 0.86, -0.28],
            [-0.02, 0.66, -0.27],
          ].map((p) => new THREE.Vector3(...p))
        ),
        64,
        0.026,
        10,
        false
      ),
      // shark fin along the spine of the engine cover
      fin: sidePlate(
        [
          [-0.38, 0.8],
          [-0.38, 0.92],
          [-2.18, 0.64],
          [-2.18, 0.4],
        ],
        0.012
      ),
      floor: planPlate(
        [
          [1.25, 0.34],
          [0.75, 0.74],
          [-1.2, 0.8],
          [-1.5, 0.62],
          [-2.28, 0.52],
          [-2.28, -0.52],
          [-1.5, -0.62],
          [-1.2, -0.8],
          [0.75, -0.74],
          [1.25, -0.34],
        ],
        0.025
      ),
      frontMain: airfoil(0.52, 1.92, 0.08, 0.05),
      frontFlap1: airfoil(0.32, 1.86, 0.1, 0.05),
      frontFlap2: airfoil(0.24, 1.8, 0.1, 0.05),
      frontFlap3: airfoil(0.17, 1.72, 0.11, 0.05),
      frontPlate: sidePlate([
        [2.82, 0.04],
        [2.1, 0.04],
        [2.02, 0.36],
        [2.2, 0.43],
        [2.82, 0.15],
      ]),
      rearMain: airfoil(0.38, 1.0, 0.09, 0.07),
      rearFlap: airfoil(0.25, 0.98, 0.1, 0.06),
      beam: airfoil(0.25, 0.86, 0.09, 0.05),
      rearPlate: sidePlate([
        [-2.04, 0.44],
        [-2.66, 0.42],
        [-2.7, 1.03],
        [-2.22, 1.07],
        [-2.04, 0.9],
      ]),
      // cross-section of a low-profile tyre, turned round the axle
      tyreFront: turned([
        [RIM_R, -0.15],
        [0.33, -0.15],
        [0.352, -0.13],
        [TYRE_R, -0.095],
        [TYRE_R, 0.095],
        [0.352, 0.13],
        [0.33, 0.15],
        [RIM_R, 0.15],
      ]),
      tyreRear: turned([
        [RIM_R, -0.2],
        [0.33, -0.2],
        [0.352, -0.18],
        [TYRE_R, -0.14],
        [TYRE_R, 0.14],
        [0.352, 0.18],
        [0.33, 0.2],
        [RIM_R, 0.2],
      ]),
      // the dished aero cover over the outer face of the rim
      coverFront: turned([
        [RIM_R, 0.145],
        [0.18, 0.13],
        [0.06, 0.118],
        [0, 0.116],
      ]),
      coverRear: turned([
        [RIM_R, 0.195],
        [0.18, 0.18],
        [0.06, 0.168],
        [0, 0.166],
      ]),
    };

    return { mat, geo };
  }, []);
}

// a thin cylinder from one point to another: arms, rods, stalks, pylons
function Rod({ from, to, radius = 0.012, material }) {
  const { position, quaternion, length } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const dir = b.clone().sub(a);
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize()
    );
    return { position: a.add(b).multiplyScalar(0.5), quaternion: q, length: dir.length() };
  }, [from, to]);
  return (
    <mesh position={position} quaternion={quaternion} material={material}>
      <cylinderGeometry args={[radius, radius, length, 8]} />
    </mesh>
  );
}

function Wheel({ x, side, rear, parts, wheels }) {
  const { mat, geo } = parts;
  const half = rear ? 0.2 : 0.15;
  return (
    // built for the right side; the left is mirrored in z
    <group position={[x, TYRE_R, side * TRACK]} scale={[1, 1, side]}>
      <group
        ref={(el) => {
          if (el && wheels && !wheels.current.includes(el)) wheels.current.push(el);
        }}
      >
        <mesh geometry={rear ? geo.tyreRear : geo.tyreFront} material={mat.tyre} />
        {/* inner barrel so you cannot see through the tyre */}
        <mesh rotation-x={Math.PI / 2} material={mat.cover}>
          <cylinderGeometry args={[RIM_R, RIM_R, half * 2 - 0.01, 40, 1, true]} />
        </mesh>
        <mesh geometry={rear ? geo.coverRear : geo.coverFront} material={mat.cover} />
        {/* plain compound ring on the sidewall, no branding */}
        <mesh position-z={half + 0.001} material={mat.compound}>
          <torusGeometry args={[0.305, 0.007, 6, 72]} />
        </mesh>
        {/* shallow ribs on the cover so the roll reads */}
        {[0, 1, 2, 3, 4].map((k) => (
          <mesh
            key={k}
            position-z={half - 0.012}
            rotation-z={(k * Math.PI * 2) / 5}
            material={mat.carbon}
          >
            <boxGeometry args={[0.44, 0.018, 0.01]} />
          </mesh>
        ))}
        <mesh position-z={half - 0.005} material={mat.teal}>
          <torusGeometry args={[0.235, 0.005, 6, 64]} />
        </mesh>
        <mesh position-z={half - 0.006} rotation-x={Math.PI / 2} material={mat.silver}>
          <cylinderGeometry args={[0.045, 0.045, 0.03, 6]} />
        </mesh>
      </group>
    </group>
  );
}

// double wishbones and a push-rod at one corner of the car
function Corner({ x, side, material }) {
  const z = (v) => side * v;
  const hub = [x, 0.36, z(0.66)];
  return (
    <>
      <Rod from={[x + 0.22, 0.45, z(0.22)]} to={[x, 0.46, z(0.64)]} material={material} />
      <Rod from={[x - 0.2, 0.45, z(0.22)]} to={[x, 0.46, z(0.64)]} material={material} />
      <Rod from={[x + 0.26, 0.24, z(0.2)]} to={[x, 0.26, z(0.66)]} material={material} />
      <Rod from={[x - 0.22, 0.24, z(0.2)]} to={[x, 0.26, z(0.66)]} material={material} />
      <Rod from={[x + 0.02, 0.27, z(0.6)]} to={[x + 0.1, 0.52, z(0.22)]} radius={0.01} material={material} />
      {/* upright */}
      <Rod from={[x, 0.24, z(0.64)]} to={[x, 0.48, z(0.64)]} radius={0.02} material={material} />
      <mesh position={hub} rotation-x={Math.PI / 2} material={material}>
        <cylinderGeometry args={[0.06, 0.06, 0.08, 16]} />
      </mesh>
    </>
  );
}

export default function F1Car({ wheels, ...props }) {
  const parts = useParts();
  const { mat, geo } = parts;

  useLayoutEffect(
    () => () => {
      Object.values(mat).forEach((m) => m.dispose());
      Object.values(geo).forEach((g) => g.dispose());
    },
    [mat, geo]
  );

  return (
    <group {...props}>
      {/* floor, diffuser and its strakes */}
      <mesh geometry={geo.floor} position-y={0.095} material={mat.floor} />
      <mesh position={[-2.02, 0.19, 0]} rotation-z={-0.36} material={mat.floor}>
        <boxGeometry args={[0.64, 0.015, 1.02]} />
      </mesh>
      {[-0.36, -0.12, 0.12, 0.36].map((zz) => (
        <mesh key={zz} position={[-2.05, 0.17, zz]} rotation-z={-0.36} material={mat.carbon}>
          <boxGeometry args={[0.62, 0.13, 0.01]} />
        </mesh>
      ))}

      {/* bodywork */}
      <mesh geometry={geo.body} material={mat.body} />
      <mesh geometry={geo.pod} material={mat.pod} />
      <mesh geometry={geo.pod} material={mat.pod} scale={[1, 1, -1]} />
      <mesh geometry={geo.airbox} material={mat.gloss} />
      <mesh geometry={geo.fin} material={mat.gloss} />
      <mesh position={[-2.18, 0.52, 0]} material={mat.teal}>
        <boxGeometry args={[0.02, 0.24, 0.014]} />
      </mesh>

      {/* the dark mouths of the airbox and sidepod inlets */}
      <mesh position={[0.035, 0.855, 0]} rotation-y={Math.PI / 2} scale={[0.066, 0.05, 1]} material={mat.void}>
        <circleGeometry args={[1, 32]} />
      </mesh>
      {[1, -1].map((s) => (
        <mesh
          key={s}
          position={[0.625, 0.375, s * 0.5]}
          rotation-y={Math.PI / 2}
          scale={[0.1, 0.11, 1]}
          material={mat.void}
        >
          <circleGeometry args={[1, 32]} />
        </mesh>
      ))}

      {/* cockpit opening and driver */}
      <mesh position={[0.42, 0.655, 0]} scale={[0.36, 0.035, 0.2]} material={mat.void}>
        <sphereGeometry args={[1, 32, 16]} />
      </mesh>
      <mesh position={[0.28, 0.73, 0]} material={mat.helmet}>
        <sphereGeometry args={[0.118, 32, 24]} />
      </mesh>
      <mesh position={[0.28, 0.745, 0]} rotation-z={Math.PI / 2} material={mat.teal}>
        <torusGeometry args={[0.118, 0.012, 8, 40]} />
      </mesh>
      <mesh position={[0.36, 0.75, 0]} scale={[0.05, 0.035, 0.09]} material={mat.visor}>
        <sphereGeometry args={[1, 24, 12]} />
      </mesh>

      {/* halo: a loop round the driver's head on a centre pillar */}
      <mesh geometry={geo.halo} material={mat.gloss} />
      <Rod from={[0.6, 0.9, 0]} to={[0.8, 0.62, 0]} radius={0.024} material={mat.gloss} />

      {/* mirrors on stalks off the sidepods */}
      {[1, -1].map((s) => (
        <group key={s}>
          <Rod from={[0.46, 0.55, s * 0.36]} to={[0.5, 0.66, s * 0.47]} radius={0.009} material={mat.gloss} />
          <mesh position={[0.5, 0.68, s * 0.5]} material={mat.gloss}>
            <boxGeometry args={[0.07, 0.065, 0.17]} />
          </mesh>
          <mesh position={[0.465, 0.68, s * 0.5]} material={mat.silver}>
            <boxGeometry args={[0.004, 0.05, 0.15]} />
          </mesh>
        </group>
      ))}

      {/* front wing: main plane, three flaps, endplates edged in teal */}
      {/* negative angles lift each trailing edge: the flaps climb toward the rear */}
      <mesh geometry={geo.frontMain} position={[2.82, 0.1, 0]} rotation-z={-0.04} material={mat.carbon} />
      <mesh geometry={geo.frontFlap1} position={[2.42, 0.15, 0]} rotation-z={-0.3} material={mat.gloss} />
      <mesh geometry={geo.frontFlap2} position={[2.25, 0.215, 0]} rotation-z={-0.5} material={mat.gloss} />
      <mesh geometry={geo.frontFlap3} position={[2.14, 0.285, 0]} rotation-z={-0.7} material={mat.gloss} />
      {[1, -1].map((s) => (
        <group key={s}>
          <mesh geometry={geo.frontPlate} position-z={s * 0.965} material={mat.gloss} />
          <Rod from={[2.2, 0.43, s * 0.965]} to={[2.82, 0.15, s * 0.965]} radius={0.007} material={mat.teal} />
        </group>
      ))}

      {/* rear wing: main plane, DRS flap, beam wing, endplates, swan necks */}
      <mesh geometry={geo.rearMain} position={[-2.1, 0.86, 0]} rotation-z={-0.1} material={mat.gloss} />
      <mesh geometry={geo.rearFlap} position={[-2.38, 0.95, 0]} rotation-z={-0.5} material={mat.gloss} />
      <mesh geometry={geo.beam} position={[-2.2, 0.44, 0]} rotation-z={-0.2} material={mat.carbon} />
      {[1, -1].map((s) => (
        <group key={s}>
          <mesh geometry={geo.rearPlate} position-z={s * 0.51} material={mat.gloss} />
          <Rod from={[-2.22, 1.07, s * 0.51]} to={[-2.7, 1.03, s * 0.51]} radius={0.007} material={mat.teal} />
          <Rod from={[-2.25, 0.86, s * 0.06]} to={[-2.18, 0.4, s * 0.05]} radius={0.016} material={mat.gloss} />
        </group>
      ))}
      <mesh position={[-2.34, 0.37, 0]} material={mat.light}>
        <boxGeometry args={[0.02, 0.07, 0.12]} />
      </mesh>

      {/* suspension */}
      <Corner x={FRONT_X} side={1} material={mat.carbon} />
      <Corner x={FRONT_X} side={-1} material={mat.carbon} />
      <Corner x={REAR_X} side={1} material={mat.carbon} />
      <Corner x={REAR_X} side={-1} material={mat.carbon} />

      <Wheel x={FRONT_X} side={1} parts={parts} wheels={wheels} />
      <Wheel x={FRONT_X} side={-1} parts={parts} wheels={wheels} />
      <Wheel x={REAR_X} side={1} rear parts={parts} wheels={wheels} />
      <Wheel x={REAR_X} side={-1} rear parts={parts} wheels={wheels} />
    </group>
  );
}

export const TYRE_RADIUS = TYRE_R;

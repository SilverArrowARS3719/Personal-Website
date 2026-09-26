"use client";

import { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/*
  A Victor-style badminton racket in navy and electric blue, no logo.
  One unit is 10 cm, so it is about 67 cm tall like the real thing. The origin
  sits at the middle of the grip, which is where a swing pivots from.

  The head is "isometric" (squared-off oval), which is what Victor and most
  modern frames use: a superellipse |x/a|^n + |y/b|^n = 1 with n = 2.5.
*/

const A = 1.0; // head half-width
const B = 1.15; // head half-height
const N = 2.5;
const HEAD_Y = 5.0; // head centre, measured from the grip middle
const THROAT_Y = HEAD_Y - B;

const sgnPow = (v, p) => Math.sign(v) * Math.abs(v) ** p;

function headCurve(inset = 0) {
  const pts = [];
  const steps = 180;
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    pts.push(
      new THREE.Vector3(
        sgnPow(Math.cos(t), 2 / N) * (A - inset),
        sgnPow(Math.sin(t), 2 / N) * (B - inset) + HEAD_Y,
        0
      )
    );
  }
  return new THREE.CatmullRomCurve3(pts, true, "centripetal");
}

// mains run vertically, crosses horizontally, each clipped to the head shape
function stringsGeometry() {
  const parts = [];
  const r = 0.011;
  const count = 21;
  for (let i = 0; i < count; i++) {
    const x = (i / (count - 1) - 0.5) * 2 * (A - 0.1);
    const half = B * (1 - Math.abs(x / A) ** N) ** (1 / N) - 0.05;
    const g = new THREE.CylinderGeometry(r, r, half * 2, 5, 1, true);
    g.translate(x, HEAD_Y, 0);
    parts.push(g);
  }
  for (let j = 0; j < count + 2; j++) {
    const y = (j / (count + 1) - 0.5) * 2 * (B - 0.1);
    const half = A * (1 - Math.abs(y / B) ** N) ** (1 / N) - 0.05;
    const g = new THREE.CylinderGeometry(r, r, half * 2, 5, 1, true);
    g.rotateZ(Math.PI / 2);
    g.translate(0, HEAD_Y + y, 0);
    parts.push(g);
  }
  const merged = mergeGeometries(parts);
  parts.forEach((p) => p.dispose());
  return merged;
}

// the raised ridge of an overgrip wound round the handle
function gripRidgeGeometry() {
  const turns = 11;
  const pts = [];
  const len = 2.0;
  for (let i = 0; i <= turns * 24; i++) {
    const t = i / (turns * 24);
    const a = t * turns * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * 0.142, -len / 2 + t * len, Math.sin(a) * 0.142));
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), turns * 48, 0.011, 6, false);
}

export default function Racket(props) {
  const parts = useMemo(() => {
    const frameMat = new THREE.MeshPhysicalMaterial({
      color: "#16295a",
      metalness: 0.45,
      roughness: 0.28,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
    });
    const accentMat = new THREE.MeshPhysicalMaterial({
      color: "#2f6fed",
      metalness: 0.4,
      roughness: 0.3,
      clearcoat: 1,
      emissive: "#2f6fed",
      emissiveIntensity: 0.12,
    });
    return {
      frame: new THREE.TubeGeometry(headCurve(), 320, 0.058, 14, true),
      // a thinner blue band just inside the frame: the grommet strip
      band: new THREE.TubeGeometry(headCurve(0.07), 320, 0.018, 8, true),
      strings: stringsGeometry(),
      ridge: gripRidgeGeometry(),
      frameMat,
      accentMat,
      stringMat: new THREE.MeshStandardMaterial({ color: "#eef1f6", roughness: 0.45, metalness: 0.1 }),
      shaftMat: new THREE.MeshPhysicalMaterial({
        color: "#0e1830",
        metalness: 0.6,
        roughness: 0.22,
        clearcoat: 1,
      }),
      gripMat: new THREE.MeshStandardMaterial({ color: "#1b1f27", roughness: 0.95 }),
      ridgeMat: new THREE.MeshStandardMaterial({ color: "#2a303b", roughness: 0.9 }),
    };
  }, []);

  useLayoutEffect(
    () => () => {
      Object.values(parts).forEach((p) => p.dispose?.());
    },
    [parts]
  );

  return (
    <group {...props}>
      {/* the frame is deeper than it is wide, like the real box section */}
      <mesh geometry={parts.frame} material={parts.frameMat} scale-z={1.4} />
      <mesh geometry={parts.band} material={parts.accentMat} />
      <mesh geometry={parts.strings} material={parts.stringMat} />

      {/* T-joint and throat */}
      <mesh position-y={THROAT_Y - 0.2} material={parts.frameMat}>
        <cylinderGeometry args={[0.07, 0.042, 0.42, 20]} />
      </mesh>

      {/* shaft down to the handle collar */}
      <mesh position-y={(THROAT_Y - 0.4 + 1.05) / 2} material={parts.shaftMat}>
        <cylinderGeometry args={[0.034, 0.036, THROAT_Y - 0.4 - 1.05, 20]} />
      </mesh>
      <mesh position-y={2.2} material={parts.accentMat}>
        <cylinderGeometry args={[0.038, 0.038, 0.16, 20]} />
      </mesh>

      {/* collar, octagonal handle, grip ridge, butt cap */}
      <mesh position-y={1.08} material={parts.accentMat}>
        <cylinderGeometry args={[0.1, 0.14, 0.12, 8]} />
      </mesh>
      <mesh material={parts.gripMat}>
        <cylinderGeometry args={[0.135, 0.135, 2.05, 8]} />
      </mesh>
      <mesh geometry={parts.ridge} material={parts.ridgeMat} />
      <mesh position-y={-1.1} material={parts.accentMat}>
        <cylinderGeometry args={[0.15, 0.14, 0.1, 8]} />
      </mesh>
    </group>
  );
}

// total height below and above the pivot, for fitting it on screen
export const RACKET_EXTENT = { bottom: -1.15, top: HEAD_Y + B + 0.06 };
// centre of the string bed, where a shuttle is struck
export const RACKET_HEAD_Y = HEAD_Y;

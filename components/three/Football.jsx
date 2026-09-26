"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";

/*
  A classic 32-panel ball, drawn with no texture. The pattern is a truncated
  icosahedron: 12 black pentagons centred on an icosahedron's vertices and 20
  white hexagons centred on its faces. Each pixel asks which of those 32
  centres it is nearest to, and that answer IS the panel it sits on (the
  borders of "nearest centre" regions on a sphere are exactly the panel
  seams). Where the two nearest centres are almost tied, it is on a seam, so
  the seam is darkened, roughened and pressed in with a small bump.
*/

function panelCentres() {
  // detail 0 gives 20 faces as 60 unshared vertices
  const ico = new THREE.IcosahedronGeometry(1, 0);
  const pos = ico.getAttribute("position");
  const corners = new Map();
  const faces = [];
  for (let i = 0; i < pos.count; i += 3) {
    const tri = [0, 1, 2].map((k) => new THREE.Vector3().fromBufferAttribute(pos, i + k));
    for (const v of tri) {
      const key = v.toArray().map((n) => n.toFixed(3)).join();
      if (!corners.has(key)) corners.set(key, v.clone().normalize());
    }
    faces.push(tri[0].clone().add(tri[1]).add(tri[2]).normalize());
  }
  ico.dispose();
  // pentagons first, so the shader can tell them apart by index (< 12)
  return [...corners.values(), ...faces];
}

export function makeBallMaterial() {
  const material = new THREE.MeshPhysicalMaterial({
    color: "#ffffff",
    roughness: 0.38,
    clearcoat: 0.6,
    clearcoatRoughness: 0.2,
  });
  const centres = panelCentres();

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uCentres = { value: centres };

    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vBallPos;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvBallPos = position;");

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        /* glsl */ `#include <common>
varying vec3 vBallPos;
uniform vec3 uCentres[32];
// three's own screen-space bump (perturbNormalArb), reused for the seams
vec3 ballBump(vec3 surfPos, vec3 surfNorm, float h) {
  vec3 sx = dFdx(surfPos);
  vec3 sy = dFdy(surfPos);
  vec3 r1 = cross(sy, surfNorm);
  vec3 r2 = cross(surfNorm, sx);
  float det = dot(sx, r1);
  vec2 dh = vec2(dFdx(h), dFdy(h));
  vec3 grad = sign(det) * (dh.x * r1 + dh.y * r2);
  return normalize(abs(det) * surfNorm - grad);
}`
      )
      .replace(
        "#include <color_fragment>",
        /* glsl */ `#include <color_fragment>
vec3 bp = normalize(vBallPos);
float best = -2.0;
float second = -2.0;
int idx = 0;
for (int i = 0; i < 32; i++) {
  float d = dot(bp, uCentres[i]);
  if (d > best) { second = best; best = d; idx = i; }
  else if (d > second) { second = d; }
}
float ballSeam = 1.0 - smoothstep(0.0, 0.016, best - second);
vec3 panel = idx < 12 ? vec3(0.012, 0.013, 0.016) : vec3(0.82, 0.83, 0.84);
diffuseColor.rgb = mix(panel, vec3(0.03), ballSeam * 0.9);`
      )
      .replace(
        "#include <roughnessmap_fragment>",
        `#include <roughnessmap_fragment>
roughnessFactor = mix(roughnessFactor, 0.9, ballSeam);`
      )
      .replace(
        "#include <normal_fragment_maps>",
        `#include <normal_fragment_maps>
normal = ballBump(-vViewPosition, normal, -ballSeam * 0.006);`
      );
  };

  return material;
}

export default function Football(props) {
  const material = useMemo(makeBallMaterial, []);
  useEffect(() => () => material.dispose(), [material]);

  return (
    <mesh material={material} {...props}>
      <sphereGeometry args={[1, 128, 96]} />
    </mesh>
  );
}

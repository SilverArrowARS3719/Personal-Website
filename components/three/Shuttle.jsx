"use client";

import { forwardRef, useEffect, useMemo } from "react";
import * as THREE from "three";

/*
  A feather shuttlecock: cork dome, a skirt of 16 feathers with their quills,
  and the thread band that holds them. The cork points along +y, the way it
  leads in flight. Real ones are 7 cm; the scene scales it up a little so it
  reads on screen.
*/
const Shuttle = forwardRef(function Shuttle(props, ref) {
  const parts = useMemo(() => {
    const cork = new THREE.MeshStandardMaterial({ color: "#f5f3ee", roughness: 0.6 });
    const feather = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      roughness: 0.7,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    });
    const quill = new THREE.MeshStandardMaterial({ color: "#c9ccd2", roughness: 0.5 });
    const band = new THREE.MeshStandardMaterial({ color: "#2f6fed", roughness: 0.5 });

    // quills run from the cork rim out to the skirt edge
    const quills = [];
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const from = new THREE.Vector3(Math.cos(a) * 0.013, -0.01, Math.sin(a) * 0.013);
      const to = new THREE.Vector3(Math.cos(a) * 0.034, -0.076, Math.sin(a) * 0.034);
      const dir = to.clone().sub(from);
      quills.push({
        position: from.clone().add(to).multiplyScalar(0.5),
        quaternion: new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          dir.clone().normalize()
        ),
        length: dir.length(),
      });
    }
    return { cork, feather, quill, band, quills };
  }, []);

  useEffect(
    () => () => ["cork", "feather", "quill", "band"].forEach((k) => parts[k].dispose()),
    [parts]
  );

  return (
    <group ref={ref} {...props}>
      <mesh material={parts.cork}>
        <sphereGeometry args={[0.014, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh position-y={-0.005} material={parts.cork}>
        <cylinderGeometry args={[0.014, 0.014, 0.01, 20]} />
      </mesh>
      <mesh position-y={-0.043} material={parts.feather}>
        <cylinderGeometry args={[0.034, 0.013, 0.066, 32, 1, true]} />
      </mesh>
      {parts.quills.map((q, i) => (
        <mesh key={i} position={q.position} quaternion={q.quaternion} material={parts.quill}>
          <cylinderGeometry args={[0.0008, 0.0008, q.length, 4]} />
        </mesh>
      ))}
      <mesh position-y={-0.03} rotation-x={Math.PI / 2} material={parts.band}>
        <torusGeometry args={[0.0205, 0.0014, 6, 32]} />
      </mesh>
    </group>
  );
});

export default Shuttle;

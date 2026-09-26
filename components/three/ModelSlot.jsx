"use client";

import { Suspense, useLayoutEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

/*
  The 3D version of ImageFrame's "drop your photo here": until a real model
  path is set in lib/content.js, the procedural model passed as children is
  drawn. With a path, the .glb loads (meshopt, no decoder CDN) and the
  procedural one stands in while it does. A downloaded model arrives at
  whatever size and origin its author used, so it is centred and scaled so
  its longest side matches `size`.
*/
function Loaded({ src, size, ground }) {
  const { scene } = useGLTF(src, false, true);
  const object = useMemo(() => scene.clone(true), [scene]);

  useLayoutEffect(() => {
    object.position.set(0, 0, 0);
    object.scale.setScalar(1);
    const box = new THREE.Box3().setFromObject(object);
    const dims = box.getSize(new THREE.Vector3());
    const scale = size / Math.max(dims.x, dims.y, dims.z);
    const centre = box.getCenter(new THREE.Vector3());
    object.scale.setScalar(scale);
    object.position.copy(centre.multiplyScalar(-scale));
    // a car sits on the floor rather than floating round its middle
    if (ground) object.position.y = -box.min.y * scale;
  }, [object, size, ground]);

  return <primitive object={object} />;
}

export default function ModelSlot({ src, size, ground = false, children }) {
  if (!src) return children;
  return (
    <Suspense fallback={children}>
      <Loaded src={src} size={size} ground={ground} />
    </Suspense>
  );
}

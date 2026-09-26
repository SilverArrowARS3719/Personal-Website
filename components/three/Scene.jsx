"use client";

import { useLayoutEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";

// point the camera at a spot other than the origin, once
function Aim({ at }) {
  const camera = useThree((s) => s.camera);
  useLayoutEffect(() => {
    camera.lookAt(...at);
  }, [camera, at]);
  return null;
}

/*
  One transparent canvas per slide. The slide mounts it only when it gets
  near the viewport and pauses the render loop (frameloop "never") while it
  is off screen, so at most one scene is ever drawing. It takes no pointer
  events: the page under and over it stays clickable.
*/
export default function Scene({ active = true, camera, aim = [0, 0, 0], children }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={active ? "always" : "never"}
      camera={camera}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ pointerEvents: "none" }}
    >
      <Aim at={aim} />
      {children}
    </Canvas>
  );
}

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
  One transparent canvas per slide. Off screen it runs on demand: it draws
  its first frame straight away, which compiles the shaders and bakes the
  lighting before the reader gets there, then sits idle, so only the scene on
  screen is ever drawing every frame. It takes no pointer
  events: the page under and over it stays clickable.
*/
export default function Scene({ active = true, camera, aim = [0, 0, 0], children }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={active ? "always" : "demand"}
      camera={camera}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ pointerEvents: "none" }}
    >
      <Aim at={aim} />
      {children}
    </Canvas>
  );
}

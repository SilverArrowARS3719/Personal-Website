"use client";

import { Environment, Lightformer } from "@react-three/drei";

/*
  Shared studio lighting for all three scenes. The reflections come from an
  environment built in code out of Lightformers (softboxes), so there is no
  HDR file fetched from a CDN at runtime. On navy, a blue light from behind
  and above paints a crescent along the top edge of each object, the way the
  sun lights the rim of the Earth on MOTO.
*/
export default function Studio({ tone = "dark" }) {
  const light = tone === "light";
  return (
    <>
      <ambientLight intensity={light ? 0.5 : 0.12} />
      {/* key, high and in front */}
      <directionalLight position={[3, 5, 6]} intensity={light ? 1.6 : 0.9} />
      {/* the rim: behind and above, in the site's accent blue */}
      <directionalLight
        position={[-1, 6, -6]}
        intensity={light ? 1.2 : 3.2}
        color={light ? "#9dbcff" : "#6b9dff"}
      />
      <directionalLight position={[5, -1, -4]} intensity={light ? 0.4 : 1.1} color="#3f6fd8" />

      <Environment resolution={256} frames={1}>
        {/* overhead softbox */}
        <Lightformer form="rect" intensity={light ? 2.4 : 1.6} position={[0, 6, 1]} scale={[10, 4, 1]} />
        {/* side strips give long highlights on the car body and racket frame */}
        <Lightformer form="rect" intensity={1.1} position={[-7, 1.5, 2]} scale={[2, 8, 1]} />
        <Lightformer form="rect" intensity={1.1} position={[7, 1.5, 2]} scale={[2, 8, 1]} />
        {/* cool bounce from behind */}
        <Lightformer
          form="ring"
          color="#5b93ff"
          intensity={light ? 1.2 : 3}
          position={[0, 2, -9]}
          scale={9}
        />
        {/* dim floor so undersides do not go dead black */}
        <Lightformer form="rect" intensity={light ? 0.9 : 0.25} position={[0, -6, 0]} scale={[12, 12, 1]} />
      </Environment>
    </>
  );
}

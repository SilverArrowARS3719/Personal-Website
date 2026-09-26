"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useScroll } from "framer-motion";

/*
  Framer's useReducedMotion answers on the very first render, which the server
  cannot do, so readers with reduced motion got a hydration mismatch. This one
  renders like the server first and settles after mount.
*/
function useStill() {
  const [still, setStill] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setStill(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return still;
}

/*
  Everything one scroll slide needs:
  - progress: 0 when the slide pins at the top of the screen, 1 as it lets go
  - mounted:  true once the slide has come within a screen of view, so its 3D
              scene (and three.js itself) only loads when it is about to be seen
  - active:   true only while the slide is actually on screen, so its render
              loop can pause the rest of the time
  - still:    the reader asked for reduced motion
*/
export function useStage() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const still = useStill();
  const near = useInView(ref, { margin: "100% 0px 100% 0px" });
  const active = useInView(ref);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (near) setMounted(true);
  }, [near]);

  return { ref, progress: scrollYProgress, still, mounted, active };
}

/*
  What a scroll-driven element should settle to under reduced motion. It has
  to be spelled out: `still` only turns true after mount, and by then Framer
  has already written the scroll-start values (often opacity 0) inline.
  Passing style={undefined} leaves those behind, hiding the element.
*/
export const REST = { opacity: 1, transform: "none" };

/*
  A tall section with a full-screen stage pinned inside it. The extra height
  is the scroll distance the slide's animation plays over. Under reduced
  motion it collapses to one ordinary screen-height section.
*/
export function Slide({
  stage,
  length = "h-[210vh] md:h-[260vh]",
  className = "",
  children,
  ...rest
}) {
  return (
    <section
      ref={stage.ref}
      className={`relative ${stage.still ? "" : length} ${className}`}
      {...rest}
    >
      <div
        className={`${
          stage.still ? "relative min-h-[100dvh]" : "sticky top-0 h-[100dvh]"
        } overflow-hidden`}
      >
        {children}
      </div>
    </section>
  );
}

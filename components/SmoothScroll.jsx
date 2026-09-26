"use client";

import { useEffect, useState } from "react";
import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";

/*
  Lenis gives the scroll its weight, which is most of what makes the pinned
  slides feel cinematic rather than steppy. In root mode it adds no wrapper
  element, so turning smoothing off for reduced motion only changes an option
  (Lenis rebuilds itself) instead of remounting the page.
*/
export default function SmoothScroll({ children }) {
  const [smooth, setSmooth] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setSmooth(!mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <ReactLenis root options={{ smoothWheel: smooth, lerp: 0.1, anchors: true }}>
      {children}
    </ReactLenis>
  );
}

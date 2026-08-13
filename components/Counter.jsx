"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";

export default function Counter({ value, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const target = Number(value);
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView || Number.isNaN(target)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(target);
      return;
    }
    const controls = animate(0, target, {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setN(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, target]);

  return (
    <span ref={ref} className={className}>
      {Number.isNaN(target) ? value : n}
    </span>
  );
}

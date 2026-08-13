"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

// Pulls its child toward the pointer while the pointer is near it, then springs
// back on leave. Framer's MotionConfig reducedMotion="user" (see Motion.jsx)
// drops transform animations, so this quietly does nothing for those readers.
export default function Magnetic({ children, strength = 0.3, className = "" }) {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const spring = { stiffness: 260, damping: 20, mass: 0.3 };
  const x = useSpring(mx, spring);
  const y = useSpring(my, spring);

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - (r.left + r.width / 2)) * strength);
    my.set((e.clientY - (r.top + r.height / 2)) * strength);
  };

  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.span
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ x, y }}
      className={`inline-flex ${className}`}
    >
      {children}
    </motion.span>
  );
}

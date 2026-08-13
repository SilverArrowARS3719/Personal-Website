"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [lag, setLag] = useState(true);
  const [hot, setHot] = useState(false);
  const hotRef = useRef(false);

  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const sx = useSpring(x, { stiffness: 420, damping: 34, mass: 0.35 });
  const sy = useSpring(y, { stiffness: 420, damping: 34, mass: 0.35 });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    // reduced motion keeps the ring, drops the trailing lag behind the pointer
    setLag(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const next =
        e.target instanceof Element &&
        !!e.target.closest("a, button, [data-cursor]");
      if (next !== hotRef.current) {
        hotRef.current = next;
        setHot(next);
      }
    };

    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{ x: lag ? sx : x, y: lag ? sy : y }}
      className="pointer-events-none fixed left-0 top-0 z-[60] hidden md:block"
    >
      <motion.span
        style={{ translateX: "-50%", translateY: "-50%" }}
        animate={{ scale: hot ? 2.1 : 1, opacity: hot ? 1 : 0.7 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="absolute block h-8 w-8 rounded-full border border-accent-light"
      />
      <motion.span
        style={{ translateX: "-50%", translateY: "-50%" }}
        animate={{ opacity: hot ? 0 : 0.85 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="absolute block h-1.5 w-1.5 rounded-full bg-accent-light"
      />
    </motion.div>
  );
}

"use client";

import { useEffect, useRef } from "react";

export default function BlueprintGrid() {
  const root = useRef(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    const paint = () => {
      frame = 0;
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
    };

    const onMove = (e) => {
      x = e.clientX;
      y = e.clientY;
      if (!frame) frame = requestAnimationFrame(paint);
    };

    el.style.setProperty("--active", "1");
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ "--mx": "50vw", "--my": "50vh", "--active": "0" }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, #121b24 1px, transparent 1px), linear-gradient(to bottom, #121b24 1px, transparent 1px)",
          backgroundSize: "88px 88px",
        }}
      />

      {/* the same grid, lit only where the cursor is */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, #00b3a4 1px, transparent 1px), linear-gradient(to bottom, #00b3a4 1px, transparent 1px)",
          backgroundSize: "88px 88px",
          opacity: "calc(0.32 * var(--active))",
          WebkitMaskImage:
            "radial-gradient(circle 240px at var(--mx) var(--my), #000 0%, rgba(0,0,0,0.3) 45%, transparent 72%)",
          maskImage:
            "radial-gradient(circle 240px at var(--mx) var(--my), #000 0%, rgba(0,0,0,0.3) 45%, transparent 72%)",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle 320px at var(--mx) var(--my), rgba(0,179,164,0.055), transparent 70%)",
          opacity: "var(--active)",
        }}
      />

      {/* vignette so text stays readable */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_15%,#05070a_92%)]" />
    </div>
  );
}

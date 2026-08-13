"use client";

import { useEffect, useRef } from "react";

export default function Backdrop() {
  const root = useRef(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

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
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-base"
      style={{ "--mx": "50vw", "--my": "40vh", "--active": "0" }}
    >
      {/* fixed blooms give the page depth before the cursor is anywhere */}
      <div
        className="absolute -left-[15%] -top-[25%] h-[70vh] w-[70vw] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, var(--bd-bloom-1), transparent 65%)",
        }}
      />
      <div
        className="absolute -right-[20%] top-[35%] h-[70vh] w-[65vw] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, var(--bd-bloom-2), transparent 65%)",
        }}
      />

      {/* faint drafting grid, a nod to the blueprint idea without the crosshairs */}
      <div
        className="absolute inset-0"
        style={{
          opacity: "var(--bd-grid-opacity)",
          backgroundImage:
            "linear-gradient(to right, var(--bd-grid) 1px, transparent 1px), linear-gradient(to bottom, var(--bd-grid) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* the light that follows the cursor */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(circle 460px at var(--mx) var(--my), var(--bd-light), transparent 70%)",
          opacity: "var(--active)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--bd-grid-bright) 1px, transparent 1px), linear-gradient(to bottom, var(--bd-grid-bright) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          opacity: "calc(0.75 * var(--active))",
          WebkitMaskImage:
            "radial-gradient(circle 300px at var(--mx) var(--my), #000 0%, rgba(0,0,0,0.3) 55%, transparent 78%)",
          maskImage:
            "radial-gradient(circle 300px at var(--mx) var(--my), #000 0%, rgba(0,0,0,0.3) 55%, transparent 78%)",
        }}
      />

      {/* drafting crosshairs tracking the cursor across the whole page */}
      <div
        className="absolute top-0 h-full w-px"
        style={{
          left: "var(--mx)",
          opacity: "calc(0.6 * var(--active))",
          background:
            "linear-gradient(to bottom, transparent, var(--bd-cross) 30%, var(--bd-cross) 70%, transparent)",
        }}
      />
      <div
        className="absolute left-0 h-px w-full"
        style={{
          top: "var(--my)",
          opacity: "calc(0.6 * var(--active))",
          background:
            "linear-gradient(to right, transparent, var(--bd-cross) 30%, var(--bd-cross) 70%, transparent)",
        }}
      />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/*
  A hand-built axonometric drawing: the way an architect draws a building in 3D
  with a ruler instead of a camera. Upright edges stay upright, and the two
  ground directions run off at matching angles, so there is no perspective
  vanishing point. It reads as drafted rather than photographed.

  iso() is the projection. cos(30deg) = 0.866, sin(30deg) = 0.5.
*/
const iso = (x, y, z) => [(x - y) * 0.866, (x + y) * 0.5 - z];
const pt = ([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`;

const W = 104; // footprint width
const D = 84; // footprint depth
const LEVELS = [0, 42, 84, 126]; // slab heights

// one slab outline per level
const slabs = LEVELS.map((z) =>
  [
    iso(0, 0, z),
    iso(W, 0, z),
    iso(W, D, z),
    iso(0, D, z),
  ]
    .map(pt)
    .join(" ")
);

// the four corner columns, ground to roof
const top = LEVELS[LEVELS.length - 1];
const columns = [
  [0, 0],
  [W, 0],
  [W, D],
  [0, D],
].map(([x, y]) => ({
  from: iso(x, y, 0),
  to: iso(x, y, top),
}));

// a core running up the middle, and a roof fin, so it is not just a box frame
const coreX = W * 0.58;
const coreY = D * 0.3;
const core = [
  { from: iso(coreX, coreY, 0), to: iso(coreX, coreY, top) },
  { from: iso(coreX, coreY, top), to: iso(coreX, coreY, top + 34) },
];
const roofFin = [
  iso(coreX, coreY, top + 34),
  iso(W, 0, top),
  iso(coreX, coreY, top),
]
  .map(pt)
  .join(" ");

// ground plane ticks, the way a site plan shows the datum
const ground = [-1, 0, 1, 2].map((i) => ({
  from: iso(-26 + i * 46, D + 30, 0),
  to: iso(-26 + i * 46, D + 46, 0),
}));

export default function Axonometric({ className = "" }) {
  const [still, setStill] = useState(false);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const spring = { stiffness: 90, damping: 22, mass: 0.5 };
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [14, -14]), spring);
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [-10, 10]), spring);

  useEffect(() => {
    setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const move = (e) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [mx, my]);

  // every stroke uses pathLength="1", so one dash rule covers every shape
  // regardless of how long the real path is
  const draw = (i, delay = 0) =>
    still
      ? {}
      : {
          initial: { strokeDashoffset: 1 },
          animate: { strokeDashoffset: 0 },
          transition: {
            duration: 1.1,
            delay: delay + i * 0.09,
            ease: [0.16, 1, 0.3, 1],
          },
        };

  return (
    <div className={`[perspective:1100px] ${className}`}>
      <motion.svg
        viewBox="-110 -190 250 300"
        role="img"
        aria-label="Axonometric line drawing of a four storey building"
        style={{ rotateX: rotX, rotateY: rotY }}
        className="h-auto w-full overflow-visible"
      >
        <g
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-accent-light"
        >
          {/* ground datum ticks */}
          {ground.map((g, i) => (
            <motion.line
              key={`g${i}`}
              x1={g.from[0]}
              y1={g.from[1]}
              x2={g.to[0]}
              y2={g.to[1]}
              pathLength="1"
              strokeDasharray="1"
              strokeWidth="0.8"
              opacity="0.35"
              {...draw(i)}
            />
          ))}

          {/* corner columns */}
          {columns.map((c, i) => (
            <motion.line
              key={`c${i}`}
              x1={c.from[0]}
              y1={c.from[1]}
              x2={c.to[0]}
              y2={c.to[1]}
              pathLength="1"
              strokeDasharray="1"
              strokeWidth="1"
              opacity="0.55"
              {...draw(i, 0.25)}
            />
          ))}

          {/* floor slabs, brightest at the top so the eye climbs */}
          {slabs.map((points, i) => (
            <motion.polygon
              key={`s${i}`}
              points={points}
              pathLength="1"
              strokeDasharray="1"
              strokeWidth="1.4"
              opacity={0.4 + i * 0.16}
              {...draw(i, 0.5)}
            />
          ))}

          {/* service core and roof fin */}
          {core.map((c, i) => (
            <motion.line
              key={`k${i}`}
              x1={c.from[0]}
              y1={c.from[1]}
              x2={c.to[0]}
              y2={c.to[1]}
              pathLength="1"
              strokeDasharray="1"
              strokeWidth="1"
              opacity="0.5"
              {...draw(i, 1)}
            />
          ))}
          <motion.polyline
            points={roofFin}
            pathLength="1"
            strokeDasharray="1"
            strokeWidth="1.2"
            opacity="0.75"
            {...draw(0, 1.2)}
          />

          {/* corner node, the one filled mark in the whole drawing */}
          <motion.circle
            cx={iso(coreX, coreY, top + 34)[0]}
            cy={iso(coreX, coreY, top + 34)[1]}
            r="2.6"
            fill="currentColor"
            stroke="none"
            initial={still ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 2.1 }}
          />
        </g>
      </motion.svg>
    </div>
  );
}

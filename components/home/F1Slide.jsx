"use client";

import dynamic from "next/dynamic";
import { motion, useMotionTemplate, useTransform } from "framer-motion";
import { projects, software, competitions } from "@/lib/content";
import Pill from "@/components/Pill";
import { REST, Slide, useStage } from "./Stage";

const F1Scene = dynamic(() => import("@/components/three/F1Scene"), { ssr: false });

// the ring of work orbiting behind the car
const tiles = [
  ...projects.map((p) => ({
    title: p.title,
    result: p.meta.find((m) => m.label === "Award")?.value ?? p.subtitle,
    tag: p.year,
  })),
  ...software.map((s) => ({ title: s.name, result: "Software I built", tag: s.status })),
  ...competitions.slice(0, 4).map((c) => ({ title: c.name, result: c.detail, tag: c.year })),
];

/*
  Each tile rides an ellipse round the car. It is only drawn on the far side
  and the flanks (it fades out before it would cross in front of the car),
  and it shrinks, dims and lifts as it goes back, the way a ring seen from
  slightly above would.
*/
function place(theta) {
  const x = Math.sin(theta);
  const z = Math.cos(theta); // 1 nearest the viewer, -1 furthest
  const depth = (z + 1) / 2;
  // depth only dims and shrinks a little: even the farthest tile has to stay
  // readable, it is real content, not texture
  return {
    transform: `translate3d(calc(-50% + ${(x * 40).toFixed(2)}vw), calc(-50% + ${(-z * 7).toFixed(2)}vh), 0) scale(${(0.78 + 0.22 * depth).toFixed(3)})`,
    opacity: Math.min(1, Math.max(0, (0.2 - z) / 0.5)) * (0.72 + 0.28 * depth),
    zIndex: Math.round(depth * 10),
  };
}

function Tile({ tile, index, progress, still }) {
  const base = (index / tiles.length) * Math.PI * 2 + Math.PI * 0.5;
  const at = (p) => place(base + p * Math.PI * 1.5);
  const transform = useTransform(progress, (p) => at(p).transform);
  const opacity = useTransform(progress, (p) => at(p).opacity);
  const zIndex = useTransform(progress, (p) => at(p).zIndex);

  return (
    <motion.li
      style={still ? at(0.5) : { transform, opacity, zIndex }}
      className="glass absolute left-1/2 top-[44%] flex aspect-[4/5] w-[140px] flex-col justify-between rounded-[20px] p-4 sm:w-[184px] sm:p-5"
    >
      <span className="font-mono text-xs text-paper-soft">{tile.tag}</span>
      <span>
        {/* sizes in px on purpose: "text-base" would also match the
            --color-base token and paint the title navy on navy */}
        <span className="block font-display text-[15px] font-medium leading-tight text-paper sm:text-[17px]">
          {tile.title}
        </span>
        <span className="mt-2 block text-[13px] leading-snug text-paper-soft">
          {tile.result}
        </span>
      </span>
    </motion.li>
  );
}

export default function F1Slide() {
  const stage = useStage();
  const p = stage.progress;

  // full 0 to 1 range, see the note on Chip in HeroSlide
  const headOpacity = useTransform(p, [0, 0.3, 0.44, 1], [0, 0, 1, 1]);
  const headY = useTransform(p, [0.3, 0.48], [24, 0]);
  const headTransform = useMotionTemplate`translate3d(0, ${headY}px, 0)`;

  return (
    <Slide stage={stage}>
      {/* a ring this size has no room on a phone, the tiles only pile up, so
          the phone slide is just the car and the headline */}
      <ul aria-label="Selected work" className="absolute inset-0 hidden sm:block">
        {tiles.map((t, i) => (
          <Tile key={t.title} tile={t} index={i} progress={p} still={stage.still} />
        ))}
      </ul>

      <div aria-hidden="true" className="absolute inset-0 z-10">
        {stage.mounted && <F1Scene progress={p} still={stage.still} active={stage.active} />}
      </div>

      <motion.div
        style={stage.still ? REST : { opacity: headOpacity, transform: headTransform }}
        className="absolute inset-x-0 bottom-[7vh] z-20 flex flex-col items-center px-4 text-center"
      >
        <h2 className="max-w-[22ch] font-display text-[clamp(2.1rem,4.8vw,4.4rem)] font-medium uppercase leading-[0.96] tracking-[-0.035em] text-paper">
          The prototype is only the beginning.
        </h2>
        <Pill href="/projects" arrow className="mt-8">
          See my projects
        </Pill>
      </motion.div>
    </Slide>
  );
}

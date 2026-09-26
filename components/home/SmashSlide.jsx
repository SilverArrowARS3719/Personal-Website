"use client";

import dynamic from "next/dynamic";
import { motion, useMotionTemplate, useTransform } from "framer-motion";
import { stats, homeResults } from "@/lib/content";
import { REST, Slide, useStage } from "./Stage";

const SmashScene = dynamic(() => import("@/components/three/SmashScene"), { ssr: false });

const words = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
const spell = (n) => words[Number(n)] ?? n;

/*
  MOTO's drifting currency columns, as results on the left and the year each
  was won on the right. Both columns drift together so every row stays lined
  up: a reader takes each row as one fact, so they have to stay true pairs.
*/
function Column({ items, progress, still, className }) {
  const y = useTransform(progress, [0, 1], [0, -33.33]);
  const transform = useMotionTemplate`translate3d(0, ${y}%, 0)`;
  // three copies so the column never runs out while it drifts
  const list = [...items, ...items, ...items];
  return (
    <div
      aria-hidden="true"
      // the mask keeps the columns out from under the headline and fades
      // them at the bottom edge
      className={`absolute inset-y-0 [mask-image:linear-gradient(to_bottom,transparent_30%,#000_42%,#000_80%,transparent)] ${className}`}
    >
      <motion.ul style={still ? REST : { transform }} className="space-y-3 pt-[10vh]">
        {list.map((t, i) => (
          <li
            key={i}
            className={`whitespace-nowrap font-display text-[clamp(1.3rem,3.8vw,3.3rem)] font-medium leading-tight tracking-[-0.03em] ${
              // readable, but a step behind the headline: 45% ink clears 3:1
              // on the pale slide at these large sizes, 75% is the accent
              i % 3 === 1 ? "text-ink/75" : "text-ink/45"
            }`}
          >
            {t}
          </li>
        ))}
      </motion.ul>
    </div>
  );
}

export default function SmashSlide() {
  const stage = useStage();
  const p = stage.progress;

  // full 0 to 1 range, see the note on Chip in HeroSlide
  const wordsOpacity = useTransform(p, [0, 0.12, 0.28, 1], [0, 0, 1, 1]);

  return (
    <Slide
      stage={stage}
      // the smash is scrubbed by scroll, and the hit is stretched into slow
      // motion, so this slide gets more scroll than the others
      length="h-[280vh] md:h-[360vh]"
      data-nav-tone="light"
      className="bg-panel-2"
    >
      <Column
        items={homeResults.map((r) => r.result)}
        progress={p}
        still={stage.still}
        className="left-[4%] md:left-[9%]"
      />
      <Column
        items={homeResults.map((r) => r.year)}
        progress={p}
        still={stage.still}
        className="right-[4%] text-right md:right-[9%]"
      />

      <div aria-hidden="true" className="absolute inset-0 z-10">
        {stage.mounted && (
          <SmashScene progress={p} still={stage.still} active={stage.active} />
        )}
      </div>

      <div className="relative z-20 px-4 pt-24 text-center sm:px-6 md:pt-28">
        <h2 className="mx-auto font-display text-[clamp(2.1rem,4.8vw,4.4rem)] font-medium uppercase leading-[0.96] tracking-[-0.035em] text-ink">
          <span className="block">{spell(stats[0].value)} national awards.</span>
          <span className="block">{spell(stats[1].value)} competitions.</span>
        </h2>
        <motion.ul
          style={stage.still ? REST : { opacity: wordsOpacity }}
          className="mt-5 flex flex-wrap justify-center gap-x-7 gap-y-1 text-[16px] text-ink-soft md:text-lg"
        >
          <li>Engineering</li>
          <li>Design</li>
          <li>Tamil literature</li>
        </motion.ul>
      </div>
    </Slide>
  );
}

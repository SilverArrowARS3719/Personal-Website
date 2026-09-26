"use client";

import dynamic from "next/dynamic";
import { motion, useMotionTemplate, useTransform } from "framer-motion";
import { profile, highlights } from "@/lib/content";
import Pill from "@/components/Pill";
import { REST, Slide, useStage } from "./Stage";

// three.js only ever loads in the browser, and only when the slide is near
const FootballScene = dynamic(() => import("@/components/three/FootballScene"), {
  ssr: false,
});

const ease = [0.23, 1, 0.32, 1];

// the status chips that pop up round the ball, MOTO's "Jet Booked"
const chips = [
  { text: highlights[0].award, at: "left-[5%] top-[63%] md:left-[15%] md:top-[66%]", show: 0.1 },
  { text: highlights[2].award, at: "right-[5%] top-[72%] md:right-[17%] md:top-[57%]", show: 0.22 },
  { text: highlights[1].award, at: "left-[12%] top-[82%] md:left-[50%] md:top-[80%]", show: 0.34 },
];

function Check() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="7.75" stroke="currentColor" strokeWidth="1.1" />
      <path
        d="M5.8 9.2l2.1 2.1 4.3-4.6"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/*
  Every scroll-linked opacity here maps the full 0 to 1 range. Framer hands
  opacity to the browser as a native ScrollTimeline animation, and a keyframe
  list that stops short of 1 lets the browser ease back to the element's base
  value after the last keyframe, so text faded out would fade back in.
*/
function Chip({ chip, progress, still }) {
  const opacity = useTransform(
    progress,
    [0, chip.show, chip.show + 0.07, 0.8, 0.9, 1],
    [0, 0, 1, 1, 0, 0]
  );
  const y = useTransform(progress, [chip.show, chip.show + 0.1], [14, 0]);
  const scale = useTransform(progress, [chip.show, chip.show + 0.1], [0.96, 1]);
  const transform = useMotionTemplate`translate3d(0, ${y}px, 0) scale(${scale})`;
  return (
    <motion.li
      style={still ? REST : { opacity, transform }}
      className={`glass absolute flex items-center gap-2.5 whitespace-nowrap rounded-full py-2.5 pl-3 pr-4 text-sm text-paper ${chip.at}`}
    >
      <Check />
      {chip.text}
    </motion.li>
  );
}

export default function HeroSlide() {
  const stage = useStage();
  const p = stage.progress;

  const textOpacity = useTransform(p, [0, 0.06, 0.36, 1], [1, 1, 0, 0]);
  const textY = useTransform(p, [0, 0.45], [0, -130]);
  const textTransform = useMotionTemplate`translate3d(0, ${textY}px, 0)`;

  return (
    <Slide stage={stage} id="top">
      <div aria-hidden="true" className="absolute inset-0">
        {stage.mounted && (
          <FootballScene progress={p} still={stage.still} active={stage.active} />
        )}
      </div>

      <motion.div
        style={stage.still ? REST : { opacity: textOpacity, transform: textTransform }}
        className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-4 pt-28 text-center sm:px-6 md:pt-32"
      >
        <h1 className="font-display text-[clamp(2.3rem,5.4vw,4.9rem)] font-medium uppercase leading-[0.96] tracking-[-0.035em] text-paper">
          {["I build things.", "Robots, systems, stories."].map((l, i) => (
            <span key={l} className="block overflow-hidden pb-[0.06em]">
              <motion.span
                className="block"
                initial={{ opacity: 0, transform: "translateY(60%)" }}
                animate={{ opacity: 1, transform: "translateY(0%)" }}
                transition={{ duration: 0.9, delay: 0.15 + 0.1 * i, ease }}
              >
                {l}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, transform: "translateY(10px)" }}
          animate={{ opacity: 1, transform: "translateY(0px)" }}
          transition={{ duration: 0.7, delay: 0.45, ease }}
          className="mt-6 max-w-lg text-[17px] leading-relaxed text-paper-soft md:text-lg"
        >
          {profile.name}, {profile.age}, {profile.school}. Competing in design and
          robotics since primary school.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, transform: "translateY(10px)" }}
          animate={{ opacity: 1, transform: "translateY(0px)" }}
          transition={{ duration: 0.7, delay: 0.55, ease }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <Pill href="/achievements" arrow>
            See my awards
          </Pill>
          <Pill href={profile.archive} external variant="glass">
            Full archive
          </Pill>
        </motion.div>
      </motion.div>

      <ul aria-label="Highlights" className="pointer-events-none absolute inset-0 z-10">
        {chips.map((c) => (
          <Chip key={c.text} chip={c} progress={p} still={stage.still} />
        ))}
      </ul>
    </Slide>
  );
}

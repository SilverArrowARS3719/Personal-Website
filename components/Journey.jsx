"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import Section from "./Section";
import Reveal from "./Reveal";
import GlowTile from "./GlowTile";
import { timeline } from "@/lib/content";

export default function Journey() {
  const track = useRef(null);
  const { scrollYProgress } = useScroll({
    target: track,
    offset: ["start 70%", "end 60%"],
  });
  const fill = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });

  return (
    <Section id="timeline" title="2019 to now." split>
      <div ref={track} className="relative pl-8 sm:pl-12">
        <div className="absolute bottom-0 left-0 top-2 w-px bg-line-dark" />
        <motion.div
          style={{ scaleY: fill }}
          className="absolute bottom-0 left-0 top-2 w-px origin-top bg-accent-light"
        />

        <ol className="space-y-6">
          {timeline.map((t) => (
            <li key={t.year} className="relative">
              <span className="absolute -left-8 top-8 h-2 w-2 -translate-x-[3.5px] rounded-full bg-accent-light ring-4 ring-base sm:-left-12" />
              <Reveal>
                <GlowTile corners>
                  <div className="p-6 sm:p-7">
                    <div className="font-mono text-[11px] tracking-[0.18em] text-accent-hover">
                      {t.year}
                    </div>
                    <h3 className="mt-2 text-xl text-paper sm:text-2xl">{t.title}</h3>
                    <p className="mt-2.5 max-w-2xl leading-relaxed text-paper-soft">
                      {t.detail}
                    </p>
                  </div>
                </GlowTile>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}

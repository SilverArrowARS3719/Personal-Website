"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { profile, stats } from "@/lib/content";
import Counter from "./Counter";
import Magnetic from "./Magnetic";
import Axonometric from "./Axonometric";
import ImageFrame from "./ImageFrame";

const rise = {
  hidden: { opacity: 0, transform: "translateY(18px)" },
  show: (i) => ({
    opacity: 1,
    transform: "translateY(0px)",
    transition: { duration: 0.5, delay: 0.07 * i, ease: [0.16, 1, 0.3, 1] },
  }),
};

// the name lands one line at a time, under the grid draw-in
const line = {
  hidden: { opacity: 0, transform: "translateY(28px)" },
  show: (i) => ({
    opacity: 1,
    transform: "translateY(0px)",
    transition: { duration: 0.7, delay: 0.45 + 0.12 * i, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function Hero() {
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spring = { stiffness: 110, damping: 20, mass: 0.4 };
  const x = useSpring(px, spring);
  const y = useSpring(py, spring);
  const cardX = useTransform(x, (v) => v * -1.7);
  const cardY = useTransform(y, (v) => v * -1.7);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || still) return;

    const move = (e) => {
      px.set((e.clientX / window.innerWidth - 0.5) * 16);
      py.set((e.clientY / window.innerHeight - 0.5) * 16);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [px, py]);

  return (
    <section
      id="top"
      className="relative flex min-h-[100dvh] items-center overflow-hidden px-4 pb-20 pt-24 sm:px-6"
    >
      {/* blueprint grid draws itself across the opening shot */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }}
        animate={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(122,170,255,0.13) 1px, transparent 1px), linear-gradient(to bottom, rgba(122,170,255,0.13) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          WebkitMaskImage:
            "radial-gradient(120% 90% at 30% 40%, #000 30%, transparent 75%)",
          maskImage:
            "radial-gradient(120% 90% at 30% 40%, #000 30%, transparent 75%)",
        }}
      />

      <div className="mx-auto w-full max-w-6xl">
        <div className="grid items-center gap-14 md:grid-cols-[1.15fr_1fr] md:gap-16">
          <div>
            <motion.p
              custom={0}
              variants={rise}
              initial="hidden"
              animate="show"
              className="mb-6 inline-flex items-center rounded-full border border-line-dark bg-base-2/70 px-4 py-1.5 text-sm text-accent-light"
            >
              {profile.school}
            </motion.p>

            <h1 className="text-[3.25rem] font-bold leading-[0.92] tracking-[-0.04em] text-paper sm:text-6xl md:text-7xl">
              {["VA", "Ramaswami"].map((l, i) => (
                <span key={l} className="block overflow-hidden">
                  <motion.span
                    custom={i}
                    variants={line}
                    initial="hidden"
                    animate="show"
                    className="block"
                  >
                    {l}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              custom={2}
              variants={rise}
              initial="hidden"
              animate="show"
              className="mt-7 max-w-md text-lg leading-relaxed text-paper-soft"
            >
              {profile.headline} I am 14, and I have been competing in design and
              robotics since primary school.
            </motion.p>

            <motion.div
              custom={3}
              variants={rise}
              initial="hidden"
              animate="show"
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <Magnetic>
                <Link
                  href="/achievements"
                  className="press rounded-full bg-accent px-7 py-3.5 font-medium text-panel transition-colors duration-200 hover:bg-accent-hover"
                >
                  See what I have won
                </Link>
              </Magnetic>
              <Magnetic>
                <a
                  href={profile.archive}
                  target="_blank"
                  rel="noreferrer"
                  className="press rounded-full border border-line-dark px-7 py-3.5 font-medium text-paper transition-colors duration-200 hover:border-accent-light hover:text-accent-light"
                >
                  Full archive
                </a>
              </Magnetic>
            </motion.div>
          </div>

          <motion.div
            custom={2}
            variants={rise}
            initial="hidden"
            animate="show"
            className="relative"
          >
            {/* soft bloom sitting behind the portrait so it reads as depth
                rather than a flat cut-out beside the text */}
            <motion.div
              aria-hidden="true"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-none absolute -inset-8 -z-10 rounded-full bg-[radial-gradient(circle_at_60%_40%,rgba(47,111,237,0.35),transparent_65%)] blur-2xl"
            />

            <motion.div style={{ x, y }} className="relative">
              <Axonometric />
            </motion.div>

            {/* light card floating over the drawing, the one solid object on the
                first screen */}
            <motion.div
              style={{ x: cardX, y: cardY }}
              className="absolute -bottom-2 -left-2 sm:-left-4"
            >
              {/* a portrait pinned above the stats, its own placeholder for now.
                  6 tiles by 7 on the site's 80px blueprint grid, so it reads as
                  drafted rather than an arbitrary rectangle. Drop the real file
                  at public/images/hero-photo.jpg when you have one. */}
              <div className="absolute -top-[264px] left-4 w-60 overflow-hidden rounded-card shadow-[0_10px_30px_-8px_rgba(4,12,28,0.6)] ring-4 ring-base sm:-top-[542px] sm:left-6 sm:w-[480px]">
                <ImageFrame
                  src="/images/hero-photo.jpg"
                  alt={profile.name}
                  className="aspect-[6/7]"
                />
              </div>

              {/* relative + z-10 so the white card paints over the placeholder:
                  an absolutely positioned sibling would otherwise sit on top of
                  a static one no matter the DOM order */}
              <div className="relative z-10 grid grid-cols-2 gap-x-6 gap-y-4 rounded-card bg-panel p-5 shadow-[0_18px_50px_-12px_rgba(4,12,28,0.65)] sm:p-6">
                {stats.slice(0, 2).map((s) => (
                  <div key={s.label}>
                    <Counter
                      value={s.value}
                      className="block font-display text-3xl font-bold leading-none text-ink"
                    />
                    <div className="mt-1.5 text-xs leading-snug text-ink-soft">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Section from "./Section";
import Reveal from "./Reveal";
import ImageFrame from "./ImageFrame";
import { photos } from "@/lib/content";

// Deliberately uneven so eight photos do not read as a spreadsheet. Index into
// this by position; it repeats if the photo list grows.
const shapes = [
  "sm:col-span-2 aspect-[16/10]",
  "aspect-[4/5]",
  "aspect-[4/5]",
  "aspect-[4/3]",
  "sm:col-span-2 aspect-[16/10]",
  "aspect-[4/3]",
  "aspect-[4/5]",
  "aspect-[4/5]",
];

export default function Gallery() {
  const [open, setOpen] = useState(null);

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (dir) =>
      setOpen((i) => (i === null ? i : (i + dir + photos.length) % photos.length)),
    []
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    // stop the page scrolling behind the lightbox
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close, step]);

  return (
    <Section
      id="photos"
      title="Frames from the last few years."
      lead="Competitions, builds and the people I did them with. More going up as I get them back."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((p, i) => (
          <Reveal
            key={p.src}
            delay={(i % 3) * 0.05}
            className={shapes[i % shapes.length].split(" ")[0] === "sm:col-span-2" ? "sm:col-span-2" : ""}
          >
            <button
              type="button"
              onClick={() => setOpen(i)}
              data-cursor
              className="press group block w-full text-left"
              aria-label={`Open photo: ${p.alt}`}
            >
              <ImageFrame
                src={p.src}
                alt={p.alt}
                className={shapes[i % shapes.length]
                  .split(" ")
                  .filter((c) => c.startsWith("aspect-"))
                  .join(" ")}
              />
              <span className="mt-3 block text-sm text-paper-soft transition-colors duration-200 group-hover:text-paper">
                {p.caption}
              </span>
            </button>
          </Reveal>
        ))}
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={photos[open].alt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={close}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-base/92 p-4 backdrop-blur-xl sm:p-10"
          >
            <button
              type="button"
              onClick={close}
              className="press absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-line-dark text-paper"
            >
              <span className="sr-only">Close</span>
              <span aria-hidden="true">×</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                step(-1);
              }}
              className="press absolute left-4 flex h-11 w-11 items-center justify-center rounded-full border border-line-dark text-paper sm:left-8"
            >
              <span className="sr-only">Previous photo</span>
              <span aria-hidden="true">‹</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                step(1);
              }}
              className="press absolute right-4 flex h-11 w-11 items-center justify-center rounded-full border border-line-dark text-paper sm:right-8"
            >
              <span className="sr-only">Next photo</span>
              <span aria-hidden="true">›</span>
            </button>

            <figure
              onClick={(e) => e.stopPropagation()}
              className="max-h-full w-full max-w-4xl"
            >
              <div className="overflow-hidden rounded-card ring-1 ring-line-dark">
                <ImageFrame
                  src={photos[open].src}
                  alt={photos[open].alt}
                  className="aspect-[3/2]"
                  priority
                />
              </div>
              <figcaption className="mt-4 flex items-center justify-between gap-6 text-sm text-paper-soft">
                <span>{photos[open].caption}</span>
                <span className="font-mono text-[11px] tracking-[0.16em]">
                  {String(open + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
                </span>
              </figcaption>
            </figure>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}

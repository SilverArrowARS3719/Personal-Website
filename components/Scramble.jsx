"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

// glyphs borrowed from the drafting/HUD vocabulary the rest of the site uses
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&$@*!?/<>+=";

const noise = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

const scrambleAll = (text) =>
  [...text].map((c) => (c === " " ? " " : noise())).join("");

export default function Scramble({ text, className = "", as: Tag = "span" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-12%" });
  const [out, setOut] = useState(text);
  const done = useRef(false);

  // Swap to noise on mount so a heading that is still below the fold is already
  // scrambled by the time it is scrolled to. Without this the reader would see
  // the real words flip to noise and back, which looks like a glitch.
  useEffect(() => {
    if (done.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setOut(scrambleAll(text));
  }, [text]);

  useEffect(() => {
    if (!inView || done.current) return;
    done.current = true;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOut(text);
      return;
    }

    const chars = [...text];
    const hold = 9; // frames a character keeps churning before it locks
    const step = 1.9; // frames between one character locking and the next
    const total = chars.length * step + hold;
    let frame = 0;
    let raf = 0;

    const tick = () => {
      frame += 1;
      setOut(
        chars
          .map((c, i) => {
            if (c === " ") return " ";
            return frame >= i * step + hold ? c : noise();
          })
          .join("")
      );
      if (frame < total) raf = requestAnimationFrame(tick);
      else setOut(text);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, text]);

  // aria-label keeps the real words for screen readers and for anything that
  // reads the accessible name; the churning glyphs stay decorative.
  return (
    <Tag ref={ref} className={className} aria-label={text}>
      <span aria-hidden="true">{out}</span>
    </Tag>
  );
}

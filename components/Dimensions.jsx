"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/*
  Wraps a card and, on hover, draws the measuring lines a technical drawing uses
  to call out a dimension: two extension lines, a run between them with arrow
  ticks, and the real measured size. The numbers come from getBoundingClientRect
  so they are the element's actual size, not decoration.

  Use sparingly. On every card it stops reading as craft and starts reading as
  noise.
*/
export default function Dimensions({ children, className = "", label }) {
  const ref = useRef(null);
  const [box, setBox] = useState(null);

  const measure = () => {
    // pointer-based, so this never fires on touch where hover is emulated
    if (!window.matchMedia("(hover: hover)").matches) return;
    const r = ref.current?.getBoundingClientRect();
    if (r) setBox({ w: Math.round(r.width), h: Math.round(r.height) });
  };

  const tick = "stroke-accent-light";

  return (
    <div
      ref={ref}
      onPointerEnter={measure}
      onPointerLeave={() => setBox(null)}
      className={`relative ${className}`}
    >
      {children}

      <AnimatePresence>
        {box && (
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none absolute inset-0 hidden md:block"
          >
            {/* width run, sitting above the card */}
            <svg
              className="absolute -top-6 left-0 h-6 w-full overflow-visible"
              fill="none"
            >
              <line x1="0" y1="4" x2="0" y2="20" strokeWidth="1" className={tick} opacity="0.5" />
              <line x1="100%" y1="4" x2="100%" y2="20" strokeWidth="1" className={tick} opacity="0.5" />
              <line x1="0" y1="12" x2="100%" y2="12" strokeWidth="1" className={tick} opacity="0.5" />
            </svg>
            <span className="absolute -top-[26px] left-1/2 -translate-x-1/2 bg-base px-2 font-mono text-[10px] tracking-[0.14em] text-accent-light">
              {box.w}
            </span>

            {/* height run, down the right edge */}
            <svg
              className="absolute -right-6 top-0 h-full w-6 overflow-visible"
              fill="none"
            >
              <line x1="4" y1="0" x2="20" y2="0" strokeWidth="1" className={tick} opacity="0.5" />
              <line x1="4" y1="100%" x2="20" y2="100%" strokeWidth="1" className={tick} opacity="0.5" />
              <line x1="12" y1="0" x2="12" y2="100%" strokeWidth="1" className={tick} opacity="0.5" />
            </svg>
            <span className="absolute -right-[26px] top-1/2 origin-center -translate-y-1/2 rotate-90 bg-base px-2 font-mono text-[10px] tracking-[0.14em] text-accent-light">
              {box.h}
            </span>

            {label && (
              <span className="absolute -bottom-6 left-0 font-mono text-[10px] uppercase tracking-[0.16em] text-accent-light opacity-70">
                {label}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

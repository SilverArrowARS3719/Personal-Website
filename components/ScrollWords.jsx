"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

function Word({ children, progress, range }) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  return (
    <motion.span style={{ opacity }} className="text-paper">
      {children}
    </motion.span>
  );
}

export default function ScrollWords({ text, className = "" }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "start 30%"],
  });
  const words = text.split(" ");

  return (
    <p
      ref={ref}
      className={`max-w-4xl text-xl leading-relaxed sm:text-2xl md:text-[2rem] md:leading-[1.45] ${className}`}
    >
      {words.map((w, i) => {
        const start = i / words.length;
        const end = Math.min(1, start + 1.5 / words.length);
        return (
          <span key={i}>
            <Word progress={scrollYProgress} range={[start, end]}>
              {w}
            </Word>{" "}
          </span>
        );
      })}
    </p>
  );
}

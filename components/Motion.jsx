"use client";

import { MotionConfig } from "framer-motion";

// reducedMotion="user" lets Framer skip transform animations for people who ask
// the OS for less motion, without branching at render time (which desyncs SSR).
export default function Motion({ children }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

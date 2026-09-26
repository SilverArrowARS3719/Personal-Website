"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ThemeToggle({ className = "" }) {
  const [theme, setTheme] = useState("blueprint");

  // read whatever the pre-paint script already decided, so the button label is
  // right on first render without re-running the decision
  useEffect(() => {
    setTheme(
      document.documentElement.getAttribute("data-theme") === "paper"
        ? "paper"
        : "blueprint"
    );
  }, []);

  const flip = () => {
    const next = theme === "paper" ? "blueprint" : "paper";
    setTheme(next);
    if (next === "paper") {
      document.documentElement.setAttribute("data-theme", "paper");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* private mode, not worth failing over */
    }
  };

  const paper = theme === "paper";

  return (
    <button
      type="button"
      onClick={flip}
      aria-pressed={paper}
      title={paper ? "Switch to navy" : "Switch to paper"}
      className={`press glass relative flex h-10 w-10 items-center justify-center rounded-full text-paper transition-colors duration-200 hover:text-accent-light ${className}`}
    >
      <span className="sr-only">
        {paper ? "Switch to navy mode" : "Switch to paper mode"}
      </span>
      {/* a filled square on paper, an outlined one on blueprint: the same mark
          printed versus drawn */}
      <motion.span
        aria-hidden="true"
        animate={{ rotate: paper ? 45 : 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className={`block h-3.5 w-3.5 rounded-[2px] border border-current ${
          paper ? "bg-current" : "bg-transparent"
        }`}
      />
    </button>
  );
}

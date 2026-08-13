"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useScroll,
  useMotionValueEvent,
  useSpring,
} from "framer-motion";
import ThemeToggle from "./ThemeToggle";

const links = [
  { href: "/about", label: "About" },
  { href: "/achievements", label: "Achievements" },
  { href: "/projects", label: "Projects" },
  { href: "/photos", label: "Photos" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.3,
  });

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 40));

  // close the drawer whenever the route changes
  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
      <nav
        className={`relative mx-auto flex h-14 max-w-6xl items-center justify-between overflow-hidden rounded-full pl-6 pr-2 transition-colors duration-300 ${
          scrolled
            ? "border border-line-dark bg-base-2/85 backdrop-blur-xl"
            : "border border-transparent"
        }`}
      >
        <motion.span
          aria-hidden="true"
          style={{ scaleX: progress, opacity: scrolled ? 1 : 0 }}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left bg-accent-light transition-opacity duration-300"
        />

        <Link
          href="/"
          className="press font-mono text-xs tracking-[0.18em] text-paper"
        >
          VA RAMASWAMI
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={`relative rounded-full px-3.5 py-2 text-sm transition-colors duration-200 ${
                isActive(l.href)
                  ? "text-paper"
                  : "text-paper-soft hover:text-paper"
              }`}
            >
              {isActive(l.href) && (
                <motion.span
                  layoutId="nav-active"
                  aria-hidden="true"
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 -z-10 rounded-full bg-base-3"
                />
              )}
              {l.label}
            </Link>
          ))}
          <ThemeToggle className="ml-2" />
          <a
            href="/about#contact"
            className="press ml-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-panel transition-colors duration-200 hover:bg-accent-hover"
          >
            Get in touch
          </a>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="press flex h-10 w-10 items-center justify-center rounded-full border border-line-dark text-paper"
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <span aria-hidden="true" className="relative block h-3 w-4">
            <motion.span
              animate={{ transform: open ? "translateY(5px) rotate(45deg)" : "none" }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-x-0 top-0 block h-px bg-current"
            />
            <motion.span
              animate={{ transform: open ? "translateY(-5px) rotate(-45deg)" : "none" }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-x-0 bottom-0 block h-px bg-current"
            />
          </span>
        </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, transform: "translateY(-8px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            exit={{ opacity: 0, transform: "translateY(-8px)" }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-2 max-w-6xl overflow-hidden rounded-card border border-line-dark bg-base-2/95 p-3 backdrop-blur-xl md:hidden"
          >
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive(l.href) ? "page" : undefined}
                className={`block rounded-tile px-4 py-3 text-sm transition-colors duration-200 ${
                  isActive(l.href) ? "bg-base-3 text-paper" : "text-paper-soft"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <a
              href="/about#contact"
              onClick={() => setOpen(false)}
              className="press mt-2 block rounded-tile bg-accent px-4 py-3 text-center text-sm font-medium text-panel"
            >
              Get in touch
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

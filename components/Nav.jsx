"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

const links = [
  { href: "/about", label: "About" },
  { href: "/achievements", label: "Achievements" },
  { href: "/projects", label: "Projects" },
  { href: "/photos", label: "Photos" },
];

const ease = [0.23, 1, 0.32, 1];

export default function Nav() {
  const [open, setOpen] = useState(false);
  // true while a light slide (data-nav-tone="light") sits under the bar, so
  // the logo and the pill can flip dark instead of vanishing into it
  const [light, setLight] = useState(false);
  const pathname = usePathname();

  // close the drawer whenever the route changes
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    setLight(false);
    const zones = document.querySelectorAll('[data-nav-tone="light"]');
    if (!zones.length) return;
    // watch a thin line through the middle of the bar (about 5% down), not
    // the whole top of the screen, or a light slide that has all but scrolled
    // away would still flip the bar dark over the navy footer
    const seen = new Set();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) seen.add(e.target);
          else seen.delete(e.target);
        }
        setLight(seen.size > 0);
      },
      { rootMargin: "-5% 0px -94% 0px" }
    );
    zones.forEach((z) => io.observe(z));
    return () => io.disconnect();
  }, [pathname]);

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      data-tone={light ? "light" : "dark"}
      className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6"
    >
      <nav
        aria-label="Main"
        className="mx-auto grid h-14 max-w-7xl grid-cols-[1fr_auto] items-center gap-4 md:grid-cols-[1fr_auto_1fr]"
      >
        <Link
          href="/"
          className={`press justify-self-start font-mono text-xs tracking-[0.18em] transition-colors duration-300 ${
            light ? "text-ink" : "text-paper"
          }`}
        >
          VA RAMASWAMI
        </Link>

        {/* the centred link island, solid enough to stay readable over any slide */}
        <div className="hidden items-center gap-0.5 rounded-full border border-paper/10 bg-base-2/85 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={`relative rounded-full px-4 py-2 text-sm transition-colors duration-200 ${
                isActive(l.href) ? "text-paper" : "text-paper-soft hover:text-paper"
              }`}
            >
              {isActive(l.href) && (
                <motion.span
                  layoutId="nav-active"
                  aria-hidden="true"
                  transition={{ duration: 0.35, ease }}
                  className="absolute inset-0 -z-10 rounded-full bg-base-3"
                />
              )}
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center justify-self-end gap-2 md:flex">
          <ThemeToggle />
          <a
            href="#contact"
            className={`press rounded-full px-5 py-2.5 text-sm font-medium transition-colors duration-300 ${
              light
                ? "bg-ink text-panel hover:bg-base-3"
                : "bg-pill text-pill-ink hover:bg-pill-hover"
            }`}
          >
            Get in touch
          </a>
        </div>

        <div className="flex items-center justify-self-end gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="press glass flex h-10 w-10 items-center justify-center rounded-full text-paper"
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span aria-hidden="true" className="relative block h-3 w-4">
              <motion.span
                animate={{ transform: open ? "translateY(5px) rotate(45deg)" : "none" }}
                transition={{ duration: 0.28, ease }}
                className="absolute inset-x-0 top-0 block h-px bg-current"
              />
              <motion.span
                animate={{ transform: open ? "translateY(-5px) rotate(-45deg)" : "none" }}
                transition={{ duration: 0.28, ease }}
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
            transition={{ duration: 0.28, ease }}
            className="mx-auto mt-2 max-w-7xl overflow-hidden rounded-card border border-paper/10 bg-base-2/95 p-3 backdrop-blur-xl md:hidden"
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
              href="#contact"
              onClick={() => setOpen(false)}
              className="press mt-2 block rounded-tile bg-pill px-4 py-3 text-center text-sm font-medium text-pill-ink"
            >
              Get in touch
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

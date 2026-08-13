"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  software,
  projects,
  highlights,
  competitions,
  language,
  leadership,
  photos,
} from "@/lib/content";

// One flat index built straight from lib/content.js, so anything Ram adds there
// becomes searchable without touching this file.
const index = [
  { group: "Pages", label: "Home", href: "/" },
  { group: "Pages", label: "Projects", href: "/projects" },
  { group: "Pages", label: "Achievements", href: "/achievements" },
  { group: "Pages", label: "Photos", href: "/photos" },
  { group: "Pages", label: "About", href: "/about" },

  ...software.map((s) => ({ group: "Projects", label: s.name, hint: s.status, href: "/projects" })),
  ...projects.map((p) => ({ group: "Competition work", label: p.title, hint: p.year, href: "/achievements" })),
  ...highlights.map((h) => ({ group: "Awards", label: h.award, hint: h.event, href: "/achievements" })),
  ...competitions.map((c) => ({ group: "Competitions", label: c.name, hint: c.year, href: "/achievements" })),
  ...language.items.map((l) => ({ group: "Tamil and the arts", label: l.name, hint: l.year, href: "/achievements" })),
  ...leadership.map((l) => ({ group: "Leadership", label: l.role, hint: l.year, href: "/achievements" })),
  ...photos.map((p) => ({ group: "Photos", label: p.caption, href: "/photos" })),
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const restoreTo = useRef(null);
  const router = useRouter();

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return index.slice(0, 8);
    return index
      .filter((i) =>
        `${i.label} ${i.hint ?? ""} ${i.group}`.toLowerCase().includes(needle)
      )
      .slice(0, 10);
  }, [q]);

  const close = useCallback(() => {
    setOpen(false);
    setQ("");
    setCursor(0);
    // hand focus back to whatever the reader was on before
    restoreTo.current?.focus?.();
  }, []);

  const choose = useCallback(
    (item) => {
      if (!item) return;
      close();
      router.push(item.href);
    },
    [close, router]
  );

  // global open shortcut
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => {
          if (!v) restoreTo.current = document.activeElement;
          return !v;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // keys that only matter while it is open
  useEffect(() => {
    if (!open) return;
    setCursor(0);
    inputRef.current?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setCursor((c) => (c + 1) % Math.max(results.length, 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setCursor((c) => (c - 1 + results.length) % Math.max(results.length, 1));
      } else if (e.key === "Tab") {
        // keep focus inside the dialog
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, results.length, close]);

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-i="${cursor}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          onClick={close}
          className="fixed inset-0 z-[80] flex items-start justify-center bg-base/80 px-4 pt-[12vh] backdrop-blur-md"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search this site"
            initial={{ opacity: 0, scale: 0.97, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl overflow-hidden rounded-card border border-line-dark bg-base-2 shadow-[0_30px_80px_-20px_rgba(4,12,28,0.7)]"
          >
            <div className="flex items-center gap-3 border-b border-line-dark px-5">
              <span
                aria-hidden="true"
                className="font-mono text-sm text-accent-light"
              >
                &gt;
              </span>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setCursor(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    choose(results[cursor]);
                  }
                }}
                placeholder="Search projects, awards, photos"
                aria-label="Search projects, awards, photos"
                className="h-14 flex-1 bg-transparent text-paper outline-none placeholder:text-paper-soft"
              />
              <kbd className="hidden rounded border border-line-dark px-1.5 py-0.5 font-mono text-[10px] text-paper-soft sm:block">
                ESC
              </kbd>
            </div>

            <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
              {results.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-paper-soft">
                  Nothing matches “{q}”.
                </p>
              ) : (
                results.map((r, i) => (
                  <button
                    key={`${r.group}-${r.label}-${i}`}
                    type="button"
                    data-i={i}
                    onMouseEnter={() => setCursor(i)}
                    onClick={() => choose(r)}
                    aria-selected={i === cursor}
                    className={`flex w-full items-baseline gap-3 rounded-tile px-3 py-2.5 text-left transition-colors duration-150 ${
                      i === cursor ? "bg-base-3" : ""
                    }`}
                  >
                    <span className="flex-1 text-sm text-paper">{r.label}</span>
                    {r.hint && (
                      <span className="font-mono text-[10px] tracking-[0.14em] text-paper-soft">
                        {r.hint}
                      </span>
                    )}
                    <span className="w-28 shrink-0 text-right text-[11px] uppercase tracking-[0.14em] text-accent-light">
                      {r.group}
                    </span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

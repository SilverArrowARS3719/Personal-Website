import Link from "next/link";
import { profile } from "@/lib/content";

const links = [
  { label: "Email", href: `mailto:${profile.email}` },
  { label: "LinkedIn", href: profile.linkedin, external: true },
  { label: "Archive", href: profile.archive, external: true },
];

export default function Footer() {
  return (
    <footer className="relative px-4 pb-14 pt-6 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 border-t border-line-dark pt-8 text-sm text-paper-soft sm:flex-row sm:items-center">
        <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span>© {new Date().getFullYear()} VA Ramaswami, Singapore</span>
          <span className="hidden items-center gap-1.5 sm:flex">
            <kbd className="rounded border border-line-dark px-1.5 py-0.5 font-mono text-[10px]">
              ⌘K
            </kbd>
            <span className="text-xs">to search</span>
          </span>
        </span>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              {...(l.external ? { target: "_blank", rel: "noreferrer" } : {})}
              className="transition-colors duration-200 hover:text-paper"
            >
              {l.label}
            </a>
          ))}
          <Link
            href="/"
            className="transition-colors duration-200 hover:text-paper"
          >
            Home
          </Link>
        </div>
      </div>
    </footer>
  );
}

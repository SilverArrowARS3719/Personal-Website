import Link from "next/link";
import { profile } from "@/lib/content";
import Pill from "./Pill";

/*
  The MOTO-style closing slide, on every page. It is also the contact section
  (id="contact"), so the nav's "Get in touch" always has somewhere to land.
*/
const columns = [
  {
    title: "Pages",
    links: [
      { label: "About", href: "/about" },
      { label: "Achievements", href: "/achievements" },
      { label: "Projects", href: "/projects" },
      { label: "Photos", href: "/photos" },
    ],
  },
  {
    title: "Contact",
    links: [{ label: profile.email, href: `mailto:${profile.email}` }],
    note: `Based in ${profile.location}`,
  },
  {
    title: "Elsewhere",
    links: [
      { label: "LinkedIn", href: profile.linkedin, external: true },
      { label: "Full archive", href: profile.archive, external: true },
    ],
  },
];

export default function Footer() {
  return (
    <footer
      id="contact"
      className="relative flex min-h-[100dvh] flex-col px-4 pb-8 pt-32 sm:px-6"
    >
      <div className="mx-auto grid w-full max-w-7xl flex-1 content-start gap-16 lg:grid-cols-[1.25fr_1fr] lg:gap-10">
        <div>
          <h2 className="max-w-[14ch] font-display text-[clamp(2.5rem,6vw,5.25rem)] font-medium uppercase leading-[0.95] tracking-[-0.035em] text-paper">
            Let&rsquo;s build something that holds itself up.
          </h2>
          <p className="mt-6 max-w-md leading-relaxed text-paper-soft">
            Open to internships, attachments, mentorship and any project where I
            can be useful. Email is the fastest way to reach me.
          </p>
          <Pill href={`mailto:${profile.email}`} arrow className="mt-10">
            Get in touch
          </Pill>
        </div>

        <nav
          aria-label="Footer"
          className="grid grid-cols-2 gap-x-10 gap-y-12 self-start sm:grid-cols-3 lg:pt-3"
        >
          {columns.map((c) => (
            <div key={c.title} className={c.title === "Contact" ? "col-span-2 sm:col-span-1" : ""}>
              <h3 className="font-sans text-sm font-normal uppercase tracking-[0.08em] text-paper-soft">
                {c.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {c.links.map((l) => (
                  <li key={l.label}>
                    {l.href.startsWith("/") ? (
                      <Link
                        href={l.href}
                        className="text-paper transition-colors duration-200 hover:text-accent-light"
                      >
                        {l.label}
                      </Link>
                    ) : (
                      <a
                        href={l.href}
                        {...(l.external ? { target: "_blank", rel: "noreferrer" } : {})}
                        className="break-all text-paper transition-colors duration-200 hover:text-accent-light"
                      >
                        {l.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
              {c.note && <p className="mt-3 text-sm text-paper-soft">{c.note}</p>}
            </div>
          ))}
        </nav>
      </div>

      <div className="mx-auto mt-24 flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 border-t border-paper/10 pt-6 text-sm text-paper-soft">
        <span>&copy; {new Date().getFullYear()} {profile.name}</span>
        <span className="hidden items-center gap-2 sm:flex">
          <kbd className="rounded border border-paper/15 px-1.5 py-0.5 font-mono text-[10px]">
            ⌘K
          </kbd>
          to search the site
        </span>
      </div>
    </footer>
  );
}

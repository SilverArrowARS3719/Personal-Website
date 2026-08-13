import Link from "next/link";
import Reveal from "./Reveal";
import GlowTile from "./GlowTile";
import ImageFrame from "./ImageFrame";
import Counter from "./Counter";
import Dimensions from "./Dimensions";
import {
  profile,
  stats,
  highlights,
  software,
  photos,
  competitions,
} from "@/lib/content";

/*
  Tones deliberately vary the way the Achievements bento does: one accent card,
  one dark tile, one light card. Three identical dark tiles read as a list;
  mixing the surfaces is what makes that page feel designed.
*/
const cards = [
  {
    href: "/achievements",
    label: "Achievements",
    line: "Two national awards, six competitions, and the two projects I took all the way to a judging panel.",
    count: `${highlights.length + competitions.length} entries`,
    tone: "accent",
  },
  {
    href: "/projects",
    label: "Projects",
    line: "Software I write for myself, mostly to fix something that was annoying me. This list grows.",
    count: `${software.length} shipped`,
    tone: "dark",
  },
  {
    href: "/photos",
    label: "Photos",
    line: "Competitions, builds and the people I did them with.",
    count: `${photos.length} frames`,
    tone: "light",
  },
];

function CardBody({ c }) {
  const accent = c.tone === "accent";
  const light = c.tone === "light";

  const title = accent ? "text-panel" : light ? "text-ink" : "text-paper";
  const body = accent ? "text-panel/90" : light ? "text-ink-soft" : "text-paper-soft";
  const meta = accent ? "text-panel" : light ? "text-accent" : "text-accent-light";

  return (
    <div className="flex h-full flex-col p-7 sm:p-8">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className={`text-xl sm:text-2xl ${title}`}>{c.label}</h2>
        <span
          className={`whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.16em] ${meta}`}
        >
          {c.count}
        </span>
      </div>
      <p className={`mt-3 flex-1 leading-relaxed ${body}`}>{c.line}</p>
      <span className={`mt-6 text-sm ${meta}`}>Open &rarr;</span>
    </div>
  );
}

export default function HomeIndex() {
  return (
    <section className="relative px-4 pb-28 sm:px-6 md:pb-40">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((c, i) => (
            <Reveal key={c.href} delay={i * 0.06} className="h-full">
              <Dimensions className="h-full" label={c.label}>
                {c.tone === "dark" ? (
                  <GlowTile
                    as={Link}
                    href={c.href}
                    radius="card"
                    corners
                    data-cursor
                    className="press block h-full"
                  >
                    <CardBody c={c} />
                  </GlowTile>
                ) : (
                  <Link
                    href={c.href}
                    data-cursor
                    className={`press block h-full rounded-card transition-colors duration-300 ${
                      c.tone === "accent"
                        ? "bg-accent hover:bg-accent-hover"
                        : "bg-panel shadow-[0_2px_14px_-4px_rgba(16,32,60,0.18)] ring-1 ring-line-light hover:ring-accent-light"
                    }`}
                  >
                    <CardBody c={c} />
                  </Link>
                )}
              </Dimensions>
            </Reveal>
          ))}
        </div>

        {/* about teaser, the one place a face appears on the home page */}
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.6fr]">
          <Reveal delay={0.1} className="h-full">
            <GlowTile radius="card" data-cursor className="h-full">
              <div className="grid h-full grid-cols-[104px_1fr] items-center gap-5 p-6 sm:grid-cols-[128px_1fr] sm:p-7">
                <ImageFrame
                  src="/images/portrait.jpg"
                  alt={profile.name}
                  className="aspect-square"
                />
                <div>
                  <h2 className="text-xl text-paper">About me</h2>
                  <p className="mt-2 text-sm leading-relaxed text-paper-soft">
                    Where I started, where I am going, and what I do when I am
                    not building.
                  </p>
                  <Link
                    href="/about"
                    className="mt-4 inline-block text-sm text-accent-light"
                  >
                    Read it &rarr;
                  </Link>
                </div>
              </div>
            </GlowTile>
          </Reveal>

          <Reveal delay={0.16} className="h-full">
            <div className="grid h-full grid-cols-2 gap-px overflow-hidden rounded-card bg-line-dark sm:grid-cols-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  data-cursor
                  className="flex flex-col justify-center bg-base-2/70 p-6"
                >
                  <Counter
                    value={s.value}
                    className="block font-display text-4xl font-bold leading-none text-paper"
                  />
                  <div className="mt-2 text-sm leading-snug text-paper-soft">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

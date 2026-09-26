import Section from "./Section";
import Reveal from "./Reveal";
import GlowTile from "./GlowTile";
import { highlights } from "@/lib/content";

const span = ["lg:col-span-2", "", "", "lg:col-span-2"];

function Body({ h, tone }) {
  const muted =
    tone === "accent"
      ? "text-panel/95"
      : tone === "light"
        ? "text-ink-soft"
        : "text-paper-soft";
  const strong =
    tone === "accent" ? "text-panel" : tone === "light" ? "text-ink" : "text-paper";
  const label = tone === "accent" ? "text-panel" : "text-accent-light";

  return (
    <div className="flex h-full flex-col p-7 sm:p-8">
      <div className="flex items-baseline justify-between gap-4">
        <span className={`text-sm ${tone === "light" ? "text-accent" : label}`}>
          {h.event}
        </span>
        <span
          className={`whitespace-nowrap font-mono text-[11px] tracking-[0.16em] ${muted}`}
        >
          {h.year}
        </span>
      </div>
      <h3 className={`mt-5 text-2xl leading-tight sm:text-3xl ${strong}`}>
        {h.award}
      </h3>
      <p className={`mt-3 leading-relaxed ${muted}`}>{h.detail}</p>
    </div>
  );
}

export default function Highlights() {
  return (
    <Section
      id="achievements"
      title="What I have won."
      lead="Four results I am proud of, from national engineering competitions to Tamil literature."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {highlights.map((h, i) => {
          const tone = i === 0 ? "accent" : i === 3 ? "light" : "dark";

          return (
            <Reveal key={h.award} delay={i * 0.06} className={`h-full ${span[i]}`}>
              {tone === "dark" ? (
                <GlowTile corners radius="card" className="h-full">
                  <Body h={h} tone={tone} />
                </GlowTile>
              ) : (
                <div
                  className={`h-full rounded-card ${
                    tone === "accent" ? "bg-accent" : "bg-panel"
                  }`}
                >
                  <Body h={h} tone={tone} />
                </div>
              )}
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

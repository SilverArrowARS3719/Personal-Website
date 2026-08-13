import Section from "./Section";
import Reveal from "./Reveal";
import ImageFrame from "./ImageFrame";
import SpotlightCard from "./SpotlightCard";
import GlowTile from "./GlowTile";
import { projects, competitions } from "@/lib/content";

function Passage({ label, children }) {
  return (
    <div className="grid gap-2 sm:grid-cols-[88px_1fr] sm:gap-6">
      <span className="pt-0.5 text-sm font-medium text-accent">{label}</span>
      <p className="leading-relaxed text-ink-soft">{children}</p>
    </div>
  );
}

function CaseStudy({ project, flip }) {
  return (
    <SpotlightCard>
      <div className="p-6 sm:p-9 lg:p-12">
        <header className="border-b border-line-light pb-8">
          <span className="font-mono text-[11px] tracking-[0.18em] text-accent">
            {project.year}
          </span>
          <h3 className="mt-3 max-w-3xl text-3xl leading-[1.05] text-ink sm:text-4xl lg:text-5xl">
            {project.title}
          </h3>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">
            {project.subtitle}
          </p>
        </header>

        <dl className="grid grid-cols-2 gap-x-8 gap-y-6 border-b border-line-light py-7 lg:grid-cols-4">
          {project.meta.map((m) => (
            <div key={m.label}>
              <dt className="text-sm text-ink-soft">{m.label}</dt>
              <dd className="mt-2 leading-snug text-ink">{m.value}</dd>
            </div>
          ))}
        </dl>

        <div
          className={`mt-10 grid gap-10 lg:gap-14 ${
            flip
              ? "lg:grid-cols-[1fr_1.05fr] lg:[&>figure]:order-2"
              : "lg:grid-cols-[1.05fr_1fr]"
          }`}
        >
          <ImageFrame
            src={project.image}
            alt={project.title}
            caption={project.imageNote}
            className="aspect-[4/3]"
            captionClassName="text-ink-soft"
          />

          <div className="space-y-7">
            <Passage label="Problem">{project.problem}</Passage>
            <Passage label="Approach">{project.approach}</Passage>
          </div>
        </div>

        <div className="mt-10 rounded-tile bg-accent p-7 sm:p-8">
          <span className="text-sm font-medium text-panel">Result</span>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-panel">
            {project.outcome}
          </p>
        </div>

        <ul className="mt-7 flex flex-wrap gap-2">
          {project.tags.map((t) => (
            <li
              key={t}
              className="rounded-full border border-line-light px-3.5 py-1.5 text-sm text-ink-soft"
            >
              {t}
            </li>
          ))}
        </ul>
      </div>
    </SpotlightCard>
  );
}

export default function CaseStudies() {
  return (
    <Section
      id="competition-work"
      title="Two I took all the way."
      lead="The problem I found, what we built for it, and what the judges said."
    >
      {/* the case studies stack: each sticks a little lower than the last, so the
          second slides up and settles over the first */}
      <div className="space-y-10 md:space-y-14">
        {projects.map((p, i) => (
          <div
            key={p.title}
            className="lg:sticky"
            style={{ top: `${104 + i * 26}px` }}
          >
            <Reveal>
              <CaseStudy project={p} flip={i % 2 === 1} />
            </Reveal>
          </div>
        ))}
      </div>

      <div className="mt-24 md:mt-32">
        <Reveal>
          <h3 className="mb-10 text-2xl text-paper sm:text-3xl">
            Other competitions
          </h3>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2">
          {competitions.map((c, i) => (
            <Reveal key={c.name} delay={i * 0.04} className="h-full">
              <GlowTile corners className="h-full" data-cursor>
                <div className="flex h-full gap-5 p-6">
                  <span className="mt-1 w-12 shrink-0 font-mono text-[11px] tracking-[0.16em] text-accent-light">
                    {c.year}
                  </span>
                  <div>
                    <h4 className="text-lg text-paper">{c.name}</h4>
                    <p className="mt-1.5 leading-relaxed text-paper-soft">
                      {c.detail}
                    </p>
                  </div>
                </div>
              </GlowTile>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

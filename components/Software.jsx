import Section from "./Section";
import Reveal from "./Reveal";
import GlowTile from "./GlowTile";
import { software } from "@/lib/content";

function Entry({ item, index }) {
  const inner = (
    <div className="flex h-full flex-col gap-5 p-7 sm:flex-row sm:items-start sm:gap-8 sm:p-8">
      <span className="shrink-0 font-mono text-[11px] tracking-[0.16em] text-accent-light sm:w-10">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="flex-1">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h3 className="text-xl text-paper sm:text-2xl">{item.name}</h3>
          {item.status && (
            <span className="rounded-full border border-line-dark px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-paper-soft">
              {item.status}
            </span>
          )}

          {/* only cards with a link get this, so the "click a card" hint in the
              section lead is never a lie for an entry that goes nowhere */}
          {item.href && (
            <span className="ml-auto flex items-center gap-1.5 text-sm text-accent-light">
              Open
              <span aria-hidden="true">&#8599;</span>
            </span>
          )}
        </div>

        <p className="mt-3 max-w-2xl leading-relaxed text-paper-soft">
          {item.blurb}
        </p>

        {item.tech?.length > 0 && (
          <ul className="mt-5 flex flex-wrap gap-2">
            {item.tech.map((t) => (
              <li
                key={t}
                className="rounded-full border border-line-dark px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-paper-soft"
              >
                {t}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  return (
    <Reveal delay={index * 0.05} className="h-full">
      {item.href ? (
        <GlowTile
          as="a"
          radius="card"
          corners
          href={item.href}
          target="_blank"
          rel="noreferrer"
          className="block h-full"
        >
          {inner}
        </GlowTile>
      ) : (
        <GlowTile radius="card" corners className="h-full">
          {inner}
        </GlowTile>
      )}
    </Reveal>
  );
}

export default function Software() {
  return (
    <Section
      id="projects"
      title="Things I build."
      lead="Software I write for myself, mostly to fix something that was annoying me. Click any card marked Open to try the live app."
    >
      {software.length === 0 ? (
        <Reveal>
          <div className="rounded-card border border-dashed border-line-dark p-10 text-center sm:p-14">
            <p className="text-lg text-paper">Nothing shipped here yet.</p>
            <p className="mx-auto mt-3 max-w-md leading-relaxed text-paper-soft">
              First one is being built. Check back, or look at what I have won in
              the meantime.
            </p>
          </div>
        </Reveal>
      ) : (
        <div className="space-y-4">
          {software.map((item, i) => (
            <Entry key={item.name} item={item} index={i} />
          ))}
        </div>
      )}
    </Section>
  );
}

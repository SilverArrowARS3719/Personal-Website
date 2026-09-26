import Section from "./Section";
import Reveal from "./Reveal";
import GlowTile from "./GlowTile";
import ImageFrame from "./ImageFrame";
import { beyond } from "@/lib/content";

export default function Beyond() {
  const [lead, ...rest] = beyond;

  return (
    <Section id="interests" title="What I do when I am not building.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Reveal className="h-full sm:col-span-2 lg:col-span-1 lg:row-span-2">
          <div className="flex h-full flex-col justify-end rounded-card bg-accent p-7 sm:p-9">
            <h3 className="text-3xl leading-tight text-panel sm:text-4xl">
              {lead.title}
            </h3>
            <p className="mt-4 text-lg leading-relaxed text-panel/85">{lead.detail}</p>
          </div>
        </Reveal>

        {rest.map((b, i) => (
          <Reveal key={b.title} delay={(i + 1) * 0.04} className="h-full">
            <GlowTile corners radius="card" className="h-full">
              <div className="h-full p-7">
                <h3 className="text-xl text-paper">{b.title}</h3>
                <p className="mt-3 leading-relaxed text-paper-soft">{b.detail}</p>
              </div>
            </GlowTile>
          </Reveal>
        ))}

        {/* a photo of him doing these things, not another square of text.
            Drop the real file at public/images/interests.jpg when ready. */}
        <Reveal delay={(rest.length + 1) * 0.04} className="sm:col-span-2 lg:col-span-3">
          <div>
            <ImageFrame
              src="/images/interests.jpg"
              alt="VA Ramaswami outside of building things"
              className="aspect-[21/9]"
            />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

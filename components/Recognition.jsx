import Section from "./Section";
import Reveal from "./Reveal";
import ImageFrame from "./ImageFrame";
import { language, leadership } from "@/lib/content";

function Group({ title, items }) {
  return (
    <div>
      <Reveal>
        <h3 className="text-2xl text-paper">{title}</h3>
      </Reveal>
      <ul className="mt-6 divide-y divide-line-dark border-t border-line-dark">
        {items.map((item, i) => (
          <Reveal key={item.name} delay={i * 0.04}>
            <li className="flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:gap-8">
              <div className="flex-1">
                <div className="text-paper">{item.name}</div>
                <div className="mt-1 text-sm leading-relaxed text-paper-soft">
                  {item.detail}
                </div>
              </div>
              <span className="whitespace-nowrap font-mono text-[11px] tracking-[0.16em] text-accent-light sm:w-24 sm:text-right">
                {item.year}
              </span>
            </li>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}

export default function Recognition() {
  return (
    <Section id="awards" title="Language, leadership, awards.">
      <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <ImageFrame
              src="/images/tamil-award.jpg"
              alt="Tamil competition certificate"
              className="aspect-[4/5]"
            />
          </Reveal>
          <Reveal delay={0.06}>
            <p className="mt-7 leading-relaxed text-paper-soft">{language.intro}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <ImageFrame
              src="/images/leadership.jpg"
              alt="CCA leadership at Westwood Primary School"
              className="mt-7 aspect-[16/10]"
            />
          </Reveal>
        </div>

        <div className="space-y-16">
          <Group title="Tamil and the arts" items={language.items} />
          <Group
            title="Leadership and service"
            items={leadership.map((l) => ({
              name: l.role,
              detail: l.org,
              year: l.year,
            }))}
          />
        </div>
      </div>
    </Section>
  );
}

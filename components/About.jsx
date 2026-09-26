import Section from "./Section";
import Reveal from "./Reveal";
import Counter from "./Counter";
import ScrollWords from "./ScrollWords";
import { about, profile, stats } from "@/lib/content";

export default function About() {
  return (
    <Section id="about" title="Engineering, storytelling, culture.">
      <ScrollWords text={profile.intro} />

      <div className="mt-16 grid grid-cols-2 border-y border-line-dark sm:mt-20 sm:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal
            key={s.label}
            delay={i * 0.06}
            className={`border-line-dark py-8 pr-6 sm:border-l sm:pl-6 sm:first:border-l-0 sm:first:pl-0 ${
              i >= 2 ? "border-t sm:border-t-0" : ""
            } ${i % 2 === 1 ? "border-l pl-6" : ""}`}
          >
            <Counter
              value={s.value}
              className="block font-display text-5xl font-bold leading-none text-paper"
            />
            <div className="mt-3 text-sm leading-snug text-paper-soft">
              {s.label}
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-16 max-w-2xl space-y-5 sm:mt-20">
        {about.paragraphs.map((p, i) => (
          <Reveal key={i} delay={i * 0.06}>
            <p className="leading-relaxed text-paper-soft">{p}</p>
          </Reveal>
        ))}
      </div>

      <div className="mt-16 border-t border-line-dark pt-8 sm:mt-20">
        <Reveal>
          <p className="text-sm text-paper-soft">Fields I am interested in</p>
        </Reveal>
        <ul className="group/fields mt-5 flex flex-wrap items-baseline gap-y-2 text-xl leading-relaxed text-paper sm:text-2xl sm:leading-relaxed md:text-3xl">
          {about.disciplines.map((d, i) => (
            <li key={d}>
              <Reveal delay={0.06 + i * 0.04} className="flex items-baseline">
                <span
                  className="whitespace-nowrap transition-opacity duration-300 group-hover/fields:opacity-45 hover:opacity-100!"
                >
                  {d}
                </span>
                {i < about.disciplines.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="px-2.5 text-accent-light sm:px-3"
                  >
                    /
                  </span>
                )}
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

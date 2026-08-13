import Reveal from "./Reveal";
import SpotlightCard from "./SpotlightCard";
import Scramble from "./Scramble";
import Magnetic from "./Magnetic";
import { profile } from "@/lib/content";

const rows = [
  { label: "Email", value: profile.email, href: `mailto:${profile.email}` },
  { label: "LinkedIn", value: "/in/va-ramaswami", href: profile.linkedin, external: true },
  { label: "Full archive", value: "Google Sites portfolio", href: profile.archive, external: true },
];

export default function Contact() {
  return (
    <section id="contact" className="relative px-4 py-24 sm:px-6 md:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SpotlightCard>
            <div className="p-7 sm:p-10 lg:p-14">
              <Scramble
                as="h2"
                text="Got something worth building?"
                className="block max-w-3xl text-3xl leading-[1.04] text-ink sm:text-5xl md:text-6xl"
              />
              <p className="mt-6 max-w-xl leading-relaxed text-ink-soft">
                I am open to internships, attachments, mentorship and any project where I
                can be useful. Email is the fastest way to reach me.
              </p>

              <Magnetic className="mt-9">
                <a
                  href={`mailto:${profile.email}`}
                  className="press inline-flex rounded-full bg-accent px-7 py-3.5 font-medium text-panel transition-colors duration-200 hover:bg-accent-hover"
                >
                  Email me
                </a>
              </Magnetic>

              <ul className="mt-12 grid gap-3 sm:grid-cols-3">
                {rows.map((r) => (
                  <li key={r.label}>
                    <a
                      href={r.href}
                      {...(r.external ? { target: "_blank", rel: "noreferrer" } : {})}
                      className="press group flex h-full flex-col rounded-tile bg-panel-2 p-5 transition-colors duration-200 hover:bg-accent"
                    >
                      <span className="text-sm text-ink-soft transition-colors duration-200 group-hover:text-panel/80">
                        {r.label}
                      </span>
                      <span className="mt-2 break-all text-ink transition-colors duration-200 group-hover:text-panel">
                        {r.value}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </SpotlightCard>
        </Reveal>
      </div>
    </section>
  );
}

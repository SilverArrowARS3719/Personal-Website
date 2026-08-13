import Reveal from "./Reveal";
import Scramble from "./Scramble";

export default function Section({
  id,
  title,
  lead,
  children,
  className = "",
  // `split` pins the heading beside the content on large screens. Only worth it
  // for sections whose content is a narrow column; wide bento grids should not
  // give up the horizontal room.
  split = false,
}) {
  const head = (
    <Reveal>
      <Scramble
        as="h2"
        text={title}
        className="block max-w-2xl text-3xl leading-[1.08] text-paper sm:text-4xl md:text-5xl"
      />
      {lead && (
        <p className="mt-5 max-w-xl leading-relaxed text-paper-soft">{lead}</p>
      )}
    </Reveal>
  );

  return (
    <section id={id} className={`relative px-4 py-28 sm:px-6 md:py-40 ${className}`}>
      {split ? (
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,17rem)_1fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">{head}</div>
          <div>{children}</div>
        </div>
      ) : (
        <div className="mx-auto max-w-6xl">
          {head}
          <div className="mt-12 md:mt-16">{children}</div>
        </div>
      )}
    </section>
  );
}

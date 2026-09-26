/*
  The page behind everything. Deliberately quiet: a navy gradient that deepens
  toward the bottom, two blooms drifting too slowly to notice, a grain so the
  navy reads as a surface rather than a flat fill, and a vignette to hold the
  eye in the middle. Nothing follows the cursor; the 3D scenes carry the motion.
  All the colours come from the --bd-* tokens in globals.css, so paper mode
  retunes it with no changes here.
*/
export default function Backdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-base"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, var(--bd-top) 0%, var(--color-base) 55%, var(--bd-bottom) 100%)",
        }}
      />
      <div className="bd-bloom bd-bloom-a" />
      <div className="bd-bloom bd-bloom-b" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, transparent 50%, var(--bd-vignette) 100%)",
        }}
      />
      <div className="bd-grain" />
    </div>
  );
}

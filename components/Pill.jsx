import Link from "next/link";

/*
  The one button on the site. "solid" is the pale MOTO pill (dark in paper
  mode, via the --color-pill tokens); "glass" is the frosted secondary. With
  `arrow`, the arrow sits in its own circle flush with the right edge and
  nudges toward where the link goes on hover.
*/
export default function Pill({
  href,
  children,
  variant = "solid",
  arrow = false,
  external = false,
  className = "",
  ...rest
}) {
  const tone =
    variant === "solid"
      ? "bg-pill text-pill-ink hover:bg-pill-hover"
      : "glass text-paper hover:border-paper/30";
  const pad = arrow ? "py-1.5 pl-6 pr-1.5" : "px-7 py-3.5";

  const body = (
    <>
      <span>{children}</span>
      {arrow && (
        <span
          aria-hidden="true"
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-300 ease-[var(--ease-out)] group-hover:-translate-y-px group-hover:translate-x-0.5 ${
            variant === "solid" ? "bg-pill-ink/10" : "bg-paper/10"
          }`}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M3 9L9 3M9 3H4M9 3V8"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
    </>
  );

  const cls = `press group inline-flex items-center gap-3 whitespace-nowrap rounded-full text-[15px] font-medium transition-colors duration-200 ${pad} ${tone} ${className}`;

  // mailto, hash and off-site links are plain anchors; site pages get Link
  if (external || /^(mailto:|https?:|#)/.test(href)) {
    return (
      <a
        href={href}
        className={cls}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        {...rest}
      >
        {body}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {body}
    </Link>
  );
}

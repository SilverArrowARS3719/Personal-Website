"use client";

import { useRef } from "react";

const bracket =
  "pointer-events-none absolute h-3 w-3 border-accent-light opacity-25 transition-opacity duration-300 group-hover:opacity-90";

export default function GlowTile({
  children,
  className = "",
  corners = false,
  radius = "tile",
  as: Tag = "div",
  ...rest
}) {
  const ref = useRef(null);
  const frame = useRef(0);

  const onPointerMove = (e) => {
    const el = ref.current;
    if (!el || frame.current) return;
    const { clientX, clientY } = e;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--cx", `${clientX - r.left}px`);
      el.style.setProperty("--cy", `${clientY - r.top}px`);
    });
  };

  return (
    <Tag
      ref={ref}
      onPointerMove={onPointerMove}
      className={`group relative rounded-[var(--r)] bg-line-dark p-px ${className}`}
      style={{
        "--cx": "50%",
        "--cy": "50%",
        "--r": `var(--radius-${radius})`,
      }}
      {...rest}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[var(--r)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(200px circle at var(--cx) var(--cy), var(--color-accent-light), transparent 70%)",
        }}
      />
      <div className="relative h-full overflow-hidden rounded-[calc(var(--r)-1px)] bg-base-2/70">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(320px circle at var(--cx) var(--cy), rgba(91,147,255,0.14), transparent 65%)",
          }}
        />
        {corners && (
          <>
            <span aria-hidden="true" className={`${bracket} left-2.5 top-2.5 border-l border-t`} />
            <span aria-hidden="true" className={`${bracket} right-2.5 top-2.5 border-r border-t`} />
            <span aria-hidden="true" className={`${bracket} bottom-2.5 left-2.5 border-b border-l`} />
            <span aria-hidden="true" className={`${bracket} bottom-2.5 right-2.5 border-b border-r`} />
          </>
        )}
        <div className="relative h-full">{children}</div>
      </div>
    </Tag>
  );
}

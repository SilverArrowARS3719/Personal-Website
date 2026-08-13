export default function SpotlightCard({
  children,
  className = "",
  as: Tag = "div",
  ...rest
}) {
  return (
    <Tag
      className={`relative rounded-card bg-line-light p-px transition-colors duration-300 hover:bg-accent-light ${className}`}
      {...rest}
    >
      <div className="relative h-full overflow-hidden rounded-[calc(var(--radius-card)-1px)] bg-panel">
        {children}
      </div>
    </Tag>
  );
}

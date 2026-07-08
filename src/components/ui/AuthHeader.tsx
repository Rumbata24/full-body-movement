export function AuthHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-10 flex flex-col items-center text-center">
      <div className="relative mb-5 h-16 w-16">
        <div
          className="absolute inset-[-14px] rounded-full opacity-25"
          style={{
            background: "var(--color-accent)",
            filter: "blur(20px)",
          }}
        />
        <svg viewBox="0 0 100 100" className="relative h-16 w-16 -rotate-90">
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke="var(--color-surface-raised)"
            strokeWidth="9"
          />
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray="180 240"
            style={{ filter: "drop-shadow(0 0 8px var(--color-accent))" }}
          />
        </svg>
      </div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-text">
        {title}
      </h1>
      <p className="mt-2 text-sm text-text-muted">{subtitle}</p>
    </div>
  );
}

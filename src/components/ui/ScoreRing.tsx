export function ScoreRing({
  progress,
  size = 220,
  strokeWidth = 14,
  color = "var(--color-accent)",
  trackColor = "var(--color-surface-raised)",
  children,
}: {
  progress: number; // 0..1
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  children?: React.ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(1, Math.max(0, progress));
  const offset = circumference * (1 - clamped);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <div
        className="absolute animate-glow-pulse"
        style={{
          inset: -size * 0.35,
          background: `radial-gradient(circle, color-mix(in srgb, ${color} 40%, transparent) 0%, color-mix(in srgb, ${color} 14%, transparent) 40%, transparent 70%)`,
        }}
      />
      <svg width={size} height={size} className="relative -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

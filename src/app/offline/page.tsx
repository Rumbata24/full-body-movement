export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold">
        You&apos;re offline
      </h1>
      <p className="text-sm text-text-muted">
        Reconnect to check in, log a session, or view your progress.
      </p>
    </div>
  );
}

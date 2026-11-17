export function Wordmark() {
  return (
    <span className="flex items-center gap-2.5 text-sidebar-foreground">
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6">
        <path d="M6 3h12l4 6-10 12L2 9z" fill="var(--sidebar-primary)" />
        <path
          d="M2 9h20M8 3l4 6 4-6M12 9v12"
          stroke="var(--sidebar)"
          strokeOpacity="0.45"
          strokeWidth="1.2"
          fill="none"
        />
      </svg>
      <span className="text-lg font-semibold tracking-tight">Ruby</span>
    </span>
  );
}

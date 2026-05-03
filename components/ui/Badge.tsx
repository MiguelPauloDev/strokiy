interface BadgeProps {
  label: string;
  className?: string;
}

export default function Badge({ label, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 h-6 rounded-[var(--radius-sm)] bg-[var(--color-surface)] text-[var(--color-text-muted)] font-["Geist_Mono",monospace] text-[11px] font-semibold ${className}`}
    >
      {label}
    </span>
  );
}

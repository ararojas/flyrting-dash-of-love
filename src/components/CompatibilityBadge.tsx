interface CompatibilityBadgeProps {
  percentage: number;
  className?: string;
}

export function CompatibilityBadge({ percentage, className = "" }: CompatibilityBadgeProps) {
  const color =
    percentage >= 90
      ? "text-green-400"
      : percentage >= 75
        ? "text-gold"
        : "text-muted-foreground";

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className={`text-xs font-bold ${color}`}>{percentage}%</span>
      <span className="text-[10px] text-muted-foreground">match</span>
    </div>
  );
}

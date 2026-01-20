export default function TokenomicsItemComponent({
  percentage,
  label,
  color,
}: {
  percentage: number
  label: string
  color: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground/80">{label}</span>
        <span className="text-sm font-heading font-bold text-accent">{percentage}%</span>
      </div>
      <div className="w-full h-2 bg-border/50 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500 glow-cyan`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}

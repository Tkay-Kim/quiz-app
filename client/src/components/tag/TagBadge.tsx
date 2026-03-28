interface TagBadgeProps {
  name: string
  color: string
  onRemove?: () => void
}

export default function TagBadge({ name, color, onRemove }: TagBadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: color }}
    >
      {name}
      {onRemove && (
        <button onClick={onRemove} className="hover:opacity-70 text-white ml-0.5">x</button>
      )}
    </span>
  )
}

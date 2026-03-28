import { Tag } from '../../api/tags.api'
import TagBadge from './TagBadge'

interface TagSelectorProps {
  tags: Tag[]
  selectedIds: number[]
  onChange: (ids: number[]) => void
}

export default function TagSelector({ tags, selectedIds, onChange }: TagSelectorProps) {
  const toggle = (id: number) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id])
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map(tag => (
        <button
          key={tag.id}
          type="button"
          onClick={() => toggle(tag.id)}
          className={`transition-opacity ${selectedIds.includes(tag.id) ? 'opacity-100' : 'opacity-40'}`}
        >
          <TagBadge name={tag.name} color={tag.color} />
        </button>
      ))}
      {tags.length === 0 && (
        <p className="text-sm text-gray-400">태그가 없습니다. 태그 관리에서 추가하세요.</p>
      )}
    </div>
  )
}

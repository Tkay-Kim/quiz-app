import { useState } from 'react'
import { useTags } from '../hooks/useTags'
import { tagsApi } from '../api/tags.api'
import Button from '../components/common/Button'
import TagBadge from '../components/tag/TagBadge'

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6']

export default function TagsPage() {
  const { tags, loading, refetch } = useTags()
  const [name, setName] = useState('')
  const [color, setColor] = useState('#6366f1')
  const [editId, setEditId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')
  const [saving, setSaving] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      await tagsApi.create(name.trim(), color)
      setName('')
      refetch()
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (tag: any) => {
    setEditId(tag.id)
    setEditName(tag.name)
    setEditColor(tag.color)
  }

  const handleUpdate = async () => {
    if (!editId || !editName.trim()) return
    await tagsApi.update(editId, editName.trim(), editColor)
    setEditId(null)
    refetch()
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`"${name}" 태그를 삭제하시겠습니까?`)) return
    await tagsApi.delete(id)
    refetch()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">태그 관리</h1>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">새 태그 추가</h2>
        <form onSubmit={handleCreate} className="flex gap-3 items-end flex-wrap">
          <div>
            <label className="block text-sm text-gray-600 mb-1">태그 이름</label>
            <input
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="태그 이름"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">색상</label>
            <div className="flex gap-1.5">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <Button type="submit" disabled={saving}>추가</Button>
        </form>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">태그 목록</h2>
        {loading ? <p className="text-gray-400 text-sm">불러오는 중...</p> : (
          <div className="space-y-3">
            {tags.length === 0 ? (
              <p className="text-gray-400 text-sm">아직 태그가 없습니다.</p>
            ) : tags.map(tag => (
              <div key={tag.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                {editId === tag.id ? (
                  <>
                    <input
                      className="border border-gray-200 rounded px-2 py-1 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                    />
                    <div className="flex gap-1">
                      {COLORS.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setEditColor(c)}
                          className={`w-5 h-5 rounded-full border-2 ${editColor === c ? 'border-gray-800' : 'border-transparent'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <Button size="sm" onClick={handleUpdate}>저장</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditId(null)}>취소</Button>
                  </>
                ) : (
                  <>
                    <TagBadge name={tag.name} color={tag.color} />
                    <span className="text-xs text-gray-400 flex-1">{tag._count?.questions ?? 0}개 문제</span>
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(tag)}>수정</Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(tag.id, tag.name)}>삭제</Button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

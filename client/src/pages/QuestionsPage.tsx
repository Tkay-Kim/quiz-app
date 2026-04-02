import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuestions } from '../hooks/useQuestions'
import { useTags } from '../hooks/useTags'
import { questionsApi, Question } from '../api/questions.api'
import { useToast } from '../context/ToastContext'
import Button from '../components/common/Button'
import TagBadge from '../components/tag/TagBadge'
import LoadingSpinner from '../components/common/LoadingSpinner'

const CHOICE_LABELS = ['①', '②', '③', '④']

function QuestionItem({ q, onDelete }: { q: Question; onDelete: (q: Question) => void }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:border-indigo-200 transition-colors">
      {/* 헤더 - 항상 보임 */}
      <div
        className="flex items-start gap-3 p-4 cursor-pointer select-none"
        onClick={() => setOpen(o => !o)}
      >
        <span className="mt-0.5 text-gray-300 text-sm shrink-0">{open ? '▲' : '▼'}</span>
        <div className="flex-1 min-w-0">
          <p className={`text-gray-900 font-medium leading-relaxed ${open ? '' : 'line-clamp-2'}`}>
            {q.content}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {q.tags.map(qt => <TagBadge key={qt.tag.id} name={qt.tag.name} color={qt.tag.color} />)}
          </div>
        </div>
        <div className="flex gap-2 shrink-0" onClick={e => e.stopPropagation()}>
          <Link to={`/questions/${q.id}/edit`}><Button variant="secondary" size="sm">수정</Button></Link>
          <Button variant="danger" size="sm" onClick={() => onDelete(q)}>삭제</Button>
        </div>
      </div>

      {/* 펼쳐진 내용 - 보기 + 해설 */}
      {open && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-2">
          {q.choices.map((c, i) => (
            <div
              key={c.id}
              className={`flex items-start gap-2 px-3 py-2 rounded-lg text-sm ${
                c.isCorrect
                  ? 'bg-green-50 text-green-700 font-medium border border-green-200'
                  : 'text-gray-600'
              }`}
            >
              <span className="shrink-0">{CHOICE_LABELS[i]}</span>
              <span>{c.content}</span>
            </div>
          ))}
          {q.explanation && (
            <div className="mt-3 px-3 py-2 bg-indigo-50 rounded-lg text-sm text-indigo-700 border border-indigo-100">
              <span className="font-medium">해설</span> {q.explanation}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function QuestionsPage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [tagId, setTagId] = useState<number | undefined>()
  const { questions, total, loading, page, setPage, refetch } = useQuestions({ search, tagId })
  const { tags } = useTags()
  const { showToast } = useToast()

  // debounce 검색
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  const handleDelete = async (q: Question) => {
    if (!confirm(`"${q.content.slice(0, 20)}..." 문제를 삭제하시겠습니까?`)) return
    await questionsApi.delete(q.id)
    showToast('문제가 삭제되었습니다.', 'info')
    refetch()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">문제 관리 <span className="text-gray-400 text-lg font-normal">({total})</span></h1>
        <Link to="/questions/new"><Button>+ 새 문제 등록</Button></Link>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-3 flex-wrap">
        <input
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-40 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          placeholder="문제 검색..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
        />
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          value={tagId ?? ''}
          onChange={e => setTagId(e.target.value ? Number(e.target.value) : undefined)}
        >
          <option value="">전체 태그</option>
          {tags.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-3">
          {questions.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg">문제가 없습니다.</p>
              <Link to="/questions/new" className="text-indigo-600 hover:underline text-sm mt-2 inline-block">첫 문제를 등록해보세요</Link>
            </div>
          ) : questions.map(q => (
            <QuestionItem key={q.id} q={q} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {Math.ceil(total / 20) > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>이전</Button>
          <span className="text-sm text-gray-500 px-2">{page} / {Math.ceil(total / 20)}</span>
          <Button variant="secondary" size="sm" disabled={page === Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)}>다음</Button>
        </div>
      )}
    </div>
  )
}

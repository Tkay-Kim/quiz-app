import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuestions } from '../hooks/useQuestions'
import { useTags } from '../hooks/useTags'
import { questionsApi, Question } from '../api/questions.api'
import Button from '../components/common/Button'
import TagBadge from '../components/tag/TagBadge'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function QuestionsPage() {
  const [search, setSearch] = useState('')
  const [tagId, setTagId] = useState<number | undefined>()
  const { questions, total, loading, refetch } = useQuestions({ search, tagId })
  const { tags } = useTags()

  const handleDelete = async (q: Question) => {
    if (!confirm(`"${q.content.slice(0, 20)}..." 문제를 삭제하시겠습니까?`)) return
    await questionsApi.delete(q.id)
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
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          value={tagId ?? ''} onChange={e => setTagId(e.target.value ? Number(e.target.value) : undefined)}>
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
            <div key={q.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:border-indigo-200 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-gray-900 font-medium leading-relaxed">{q.content}</p>
                  <div className="flex flex-wrap gap-2 mt-2 items-center">
                    {q.tags.map(qt => <TagBadge key={qt.tag.id} name={qt.tag.name} color={qt.tag.color} />)}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link to={`/questions/${q.id}/edit`}><Button variant="secondary" size="sm">수정</Button></Link>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(q)}>삭제</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

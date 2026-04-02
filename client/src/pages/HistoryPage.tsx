import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { quizApi } from '../api/quiz.api'
import { useToast } from '../context/ToastContext'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Button from '../components/common/Button'

interface Session {
  id: number
  title: string | null
  mode: string
  totalCount: number
  score: number | null
  completedAt: string | null
  createdAt: string
  answers: { isCorrect: boolean | null }[]
}

const modeLabel: Record<string, string> = {
  RANDOM: '랜덤',
  BY_TAG: '태그 선택',
  ALL: '전체',
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function ScoreBadge({ score, total }: { score: number; total: number }) {
  const pct = Math.round((score / total) * 100)
  const color = pct >= 80 ? 'text-green-600 bg-green-50 border-green-200'
    : pct >= 60 ? 'text-yellow-600 bg-yellow-50 border-yellow-200'
    : 'text-red-500 bg-red-50 border-red-200'
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-sm font-bold ${color}`}>
      {score}/{total} <span className="font-normal text-xs">({pct}점)</span>
    </span>
  )
}

export default function HistoryPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [sessions, setSessions] = useState<Session[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const LIMIT = 10

  useEffect(() => {
    setLoading(true)
    quizApi.getHistory(page).then(res => {
      setSessions(res.data.sessions)
      setTotal(res.data.total)
      setLoading(false)
    })
  }, [page])

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    if (!confirm('이 풀이 기록을 삭제하시겠습니까?')) return
    await quizApi.deleteSession(id)
    setSessions(prev => prev.filter(s => s.id !== id))
    setTotal(prev => prev - 1)
    showToast('풀이 기록이 삭제되었습니다.', 'info')
  }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          풀이 기록 <span className="text-gray-400 text-lg font-normal">({total})</span>
        </h1>
        <Button onClick={() => navigate('/quiz/setup')}>퀴즈 시작</Button>
      </div>

      {loading ? <LoadingSpinner /> : sessions.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">아직 풀이 기록이 없습니다.</p>
          <button
            onClick={() => navigate('/quiz/setup')}
            className="text-indigo-600 hover:underline text-sm mt-2 inline-block"
          >
            첫 퀴즈를 시작해보세요
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map(s => {
            const completed = !!s.completedAt
            const score = s.score ?? s.answers.filter(a => a.isCorrect).length
            return (
              <div
                key={s.id}
                className={`bg-white rounded-xl p-4 shadow-sm border transition-colors cursor-pointer ${
                  completed ? 'border-gray-100 hover:border-indigo-200' : 'border-orange-100 hover:border-orange-300'
                }`}
                onClick={() => completed ? navigate(`/quiz/${s.id}/result`) : navigate(`/quiz/${s.id}`)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {s.title || '제목 없음'}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">{formatDate(s.createdAt)}</span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{modeLabel[s.mode]}</span>
                      {!completed && (
                        <span className="text-xs text-orange-400 font-medium">미완료</span>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    {completed
                      ? <ScoreBadge score={score} total={s.totalCount} />
                      : <span className="text-xs text-gray-400">{s.totalCount}문제</span>
                    }
                    <button
                      onClick={(e) => handleDelete(e, s.id)}
                      className="text-xs text-gray-300 hover:text-red-400 transition-colors px-1"
                      title="삭제"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            이전
          </Button>
          <span className="flex items-center text-sm text-gray-500 px-2">
            {page} / {totalPages}
          </span>
          <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
            다음
          </Button>
        </div>
      )}
    </div>
  )
}

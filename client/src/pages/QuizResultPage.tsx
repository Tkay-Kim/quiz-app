import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { quizApi } from '../api/quiz.api'
import Button from '../components/common/Button'
import TagBadge from '../components/tag/TagBadge'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function QuizResultPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    quizApi.getResult(Number(sessionId)).then(res => {
      setData(res.data.data)
      setLoading(false)
    })
  }, [sessionId])

  if (loading) return <div className="flex justify-center py-16"><LoadingSpinner /></div>
  if (!data) return null

  const { session, results } = data
  const score = session.score ?? 0
  const total = session.totalCount
  const pct = Math.round((score / total) * 100)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <p className="text-gray-500 mb-2">퀴즈 완료!</p>
        <p className="text-5xl font-bold text-indigo-600 mb-1">{score} <span className="text-2xl text-gray-400">/ {total}</span></p>
        <p className="text-2xl font-semibold text-gray-700">{pct}점</p>
        <p className="mt-2 text-sm text-gray-400">
          {pct >= 80 ? '훌륭해요!' : pct >= 60 ? '잘했어요!' : '조금 더 공부해봐요!'}
        </p>
      </div>

      <div className="space-y-3">
        {results.map((r: any, i: number) => (
          <div key={r.question.id} className={`bg-white rounded-xl shadow-sm border-2 ${r.isCorrect ? 'border-green-200' : 'border-red-200'}`}>
            <div
              className="p-5 flex items-start gap-3 cursor-pointer"
              onClick={() => setExpanded(expanded === i ? null : i)}
            >
              <span className={`mt-0.5 text-lg flex-shrink-0 ${r.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                {r.isCorrect ? 'O' : 'X'}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{r.question.content}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {r.question.tags.map((qt: any) => (
                    <TagBadge key={qt.tag.id} name={qt.tag.name} color={qt.tag.color} />
                  ))}
                </div>
              </div>
              <span className="text-gray-400 text-sm">{expanded === i ? '▲' : '▼'}</span>
            </div>

            {expanded === i && (
              <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-2">
                {r.question.choices.map((c: any) => (
                  <div
                    key={c.id}
                    className={`px-4 py-2.5 rounded-lg text-sm flex items-center gap-2 ${
                      c.isCorrect ? 'bg-green-50 text-green-700 border border-green-200'
                        : c.id === r.selectedChoiceId ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'text-gray-600'
                    }`}
                  >
                    <span>{c.order}.</span>
                    <span>{c.content}</span>
                    {c.isCorrect && <span className="ml-auto text-xs font-medium text-green-600">정답</span>}
                    {c.id === r.selectedChoiceId && !c.isCorrect && <span className="ml-auto text-xs font-medium text-red-500">내 답</span>}
                  </div>
                ))}
                {r.question.explanation && (
                  <div className="mt-3 p-3 bg-indigo-50 rounded-lg text-sm text-indigo-700">
                    <span className="font-medium">해설:</span> {r.question.explanation}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3 justify-center">
        <Button variant="secondary" onClick={() => navigate('/quiz/setup')}>다른 퀴즈</Button>
        <Button onClick={() => navigate('/')}>홈으로</Button>
      </div>
    </div>
  )
}

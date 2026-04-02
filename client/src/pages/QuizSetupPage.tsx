import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTags } from '../hooks/useTags'
import { quizApi } from '../api/quiz.api'
import Button from '../components/common/Button'
import TagSelector from '../components/tag/TagSelector'

type QuizMode = 'RANDOM' | 'BY_TAG' | 'ALL'

export default function QuizSetupPage() {
  const navigate = useNavigate()
  const { tags } = useTags()
  const [mode, setMode] = useState<QuizMode>('RANDOM')
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [count, setCount] = useState(10)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)

  const handleStart = async () => {
    setLoading(true)
    try {
      const res = await quizApi.start(mode, selectedTagIds, count, title || undefined)
      navigate(`/quiz/${res.data.data.id}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">퀴즈 설정</h1>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">출제 방식</label>
          <div className="flex gap-3">
            {([['RANDOM', '랜덤 출제'], ['BY_TAG', '태그 선택'], ['ALL', '전체 순서대로']] as const).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setMode(val)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  mode === val
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {mode === 'BY_TAG' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">태그 선택</label>
            <TagSelector tags={tags} selectedIds={selectedTagIds} onChange={setSelectedTagIds} />
          </div>
        )}

        {mode !== 'ALL' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              문제 수: <span className="text-indigo-600 font-bold">{count}문제</span>
            </label>
            <input
              type="range" min={1} max={80} value={count}
              onChange={e => setCount(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1</span><span>80</span>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">세션 이름 (선택)</label>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="예: 오늘의 자바스크립트 복습"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <Button className="w-full" size="lg" onClick={handleStart} disabled={loading}>
          {loading ? '준비 중...' : '퀴즈 시작하기'}
        </Button>
      </div>
    </div>
  )
}

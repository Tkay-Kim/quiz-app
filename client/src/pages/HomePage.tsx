import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { questionsApi } from '../api/questions.api'
import { tagsApi, Tag } from '../api/tags.api'
import { quizApi } from '../api/quiz.api'
import Button from '../components/common/Button'
import TagBadge from '../components/tag/TagBadge'

export default function HomePage() {
  const [stats, setStats] = useState({ totalQuestions: 0, totalSessions: 0, avgScore: 0 })
  const [tags, setTags] = useState<Tag[]>([])

  useEffect(() => {
    Promise.all([
      questionsApi.getAll({ limit: 1 }),
      quizApi.getHistory(),
      tagsApi.getAll()
    ]).then(([qRes, hRes, tRes]) => {
      setStats({
        totalQuestions: qRes.data.total,
        totalSessions: hRes.data.data?.sessions?.length ?? 0,
        avgScore: 0
      })
      setTags(tRes.data.data)
    })
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <div className="flex gap-3">
          <Link to="/questions/new"><Button>문제 등록</Button></Link>
          <Link to="/quiz/setup"><Button variant="secondary">퀴즈 시작</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: '총 문제 수', value: stats.totalQuestions, unit: '문제' },
          { label: '총 풀이 수', value: stats.totalSessions, unit: '회' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-3xl font-bold text-indigo-600 mt-1">{s.value}</p>
            <p className="text-sm text-gray-400">{s.unit}</p>
          </div>
        ))}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
          <p className="text-sm text-gray-500">등록된 태그</p>
          <p className="text-3xl font-bold text-indigo-600 mt-1">{tags.length}</p>
          <p className="text-sm text-gray-400">개</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">태그 목록</h2>
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <TagBadge key={tag.id} name={tag.name} color={tag.color} />
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">아직 태그가 없습니다. <Link to="/tags" className="text-indigo-600 hover:underline">태그를 추가해보세요.</Link></p>
        )}
      </div>
    </div>
  )
}

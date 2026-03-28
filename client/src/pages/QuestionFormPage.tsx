import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { questionsApi, QuestionInput } from '../api/questions.api'
import { useTags } from '../hooks/useTags'
import Button from '../components/common/Button'
import TagSelector from '../components/tag/TagSelector'

const DIFFICULTY_OPTIONS = [
  { value: 'EASY', label: '쉬움' },
  { value: 'MEDIUM', label: '보통' },
  { value: 'HARD', label: '어려움' }
]

export default function QuestionFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { tags } = useTags()

  const [content, setContent] = useState('')
  const [explanation, setExplanation] = useState('')
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM')
  const [choices, setChoices] = useState([
    { content: '', isCorrect: false, order: 1 },
    { content: '', isCorrect: false, order: 2 },
    { content: '', isCorrect: false, order: 3 },
    { content: '', isCorrect: false, order: 4 }
  ])
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    questionsApi.getOne(Number(id)).then(res => {
      const q = res.data.data
      setContent(q.content)
      setExplanation(q.explanation || '')
      setDifficulty(q.difficulty)
      setChoices(q.choices.map(c => ({ content: c.content, isCorrect: c.isCorrect, order: c.order })))
      setSelectedTagIds(q.tags.map(qt => qt.tag.id))
    })
  }, [id])

  const setChoiceContent = (index: number, value: string) => {
    setChoices(prev => prev.map((c, i) => i === index ? { ...c, content: value } : c))
  }

  const setCorrectChoice = (index: number) => {
    setChoices(prev => prev.map((c, i) => ({ ...c, isCorrect: i === index })))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return alert('문제 내용을 입력하세요.')
    if (choices.some(c => !c.content.trim())) return alert('모든 보기를 입력하세요.')
    if (!choices.some(c => c.isCorrect)) return alert('정답을 선택하세요.')

    setSaving(true)
    try {
      const data: QuestionInput = { content, explanation, difficulty, choices, tagIds: selectedTagIds }
      if (isEdit) {
        await questionsApi.update(Number(id), data)
      } else {
        await questionsApi.create(data)
      }
      navigate('/questions')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{isEdit ? '문제 수정' : '새 문제 등록'}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">문제 내용 *</label>
            <textarea
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              rows={3}
              placeholder="문제를 입력하세요..."
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">보기 (정답 선택) *</label>
            <div className="space-y-2">
              {choices.map((choice, i) => (
                <div key={i} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCorrectChoice(i)}
                    className={`w-6 h-6 rounded-full border-2 flex-shrink-0 transition-colors ${
                      choice.isCorrect
                        ? 'bg-indigo-600 border-indigo-600'
                        : 'border-gray-300 hover:border-indigo-400'
                    }`}
                  />
                  <span className="text-sm text-gray-500 w-4">{i + 1}.</span>
                  <input
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    placeholder={`보기 ${i + 1}`}
                    value={choice.content}
                    onChange={e => setChoiceContent(i, e.target.value)}
                  />
                  {choice.isCorrect && <span className="text-xs text-indigo-600 font-medium">정답</span>}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">해설 (선택)</label>
            <textarea
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              rows={2}
              placeholder="해설을 입력하세요..."
              value={explanation}
              onChange={e => setExplanation(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">난이도</label>
            <div className="flex gap-3">
              {DIFFICULTY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDifficulty(opt.value as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    difficulty === opt.value
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">태그</label>
            <TagSelector tags={tags} selectedIds={selectedTagIds} onChange={setSelectedTagIds} />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate('/questions')}>취소</Button>
          <Button type="submit" disabled={saving}>{saving ? '저장 중...' : '저장하기'}</Button>
        </div>
      </form>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { quizApi } from '../api/quiz.api'
import { useQuizStore } from '../store/quizStore'
import ProgressBar from '../components/quiz/ProgressBar'
import Button from '../components/common/Button'
import TagBadge from '../components/tag/TagBadge'
import LoadingSpinner from '../components/common/LoadingSpinner'

interface Question {
  id: number
  content: string
  explanation?: string
  choices: { id: number; content: string; order: number; isCorrect: boolean }[]
  tags: { tag: { id: number; name: string; color: string } }[]
}

export default function QuizPlayPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const { currentQuestionIndex, answers, setAnswer, setCurrentIndex, reset } = useQuizStore()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)

  useEffect(() => {
    reset()
    quizApi.getSession(Number(sessionId)).then(res => {
      setQuestions(res.data.data.questions)
      setLoading(false)
    })
  }, [sessionId])

  // Hide answer when moving to a different question
  useEffect(() => {
    setShowAnswer(false)
  }, [currentQuestionIndex])

  const [quizDone, setQuizDone] = useState(false)

  // 뒤로가기 / 새로고침 / 탭닫기 차단
  useEffect(() => {
    if (quizDone) return

    // 뒤로가기 차단용 더미 히스토리 추가
    window.history.pushState(null, '', window.location.href)

    const onPopState = () => {
      if (window.confirm('퀴즈를 중단하고 나가시겠습니까? 현재까지 답변은 저장됩니다.')) {
        navigate('/')
      } else {
        window.history.pushState(null, '', window.location.href)
      }
    }

    const onBeforeUnload = (e: BeforeUnloadEvent) => { e.preventDefault() }

    window.addEventListener('popstate', onPopState)
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => {
      window.removeEventListener('popstate', onPopState)
      window.removeEventListener('beforeunload', onBeforeUnload)
    }
  }, [quizDone])

  const currentQ = questions[currentQuestionIndex]
  const selectedChoiceId = currentQ ? answers[currentQ.id] : undefined

  const handleSelect = async (choiceId: number) => {
    if (!currentQ) return
    setAnswer(currentQ.id, choiceId)
    await quizApi.submitAnswer(Number(sessionId), currentQ.id, choiceId)
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentIndex(currentQuestionIndex - 1)
    }
  }

  const handleComplete = async () => {
    setSubmitting(true)
    await quizApi.complete(Number(sessionId))
    setQuizDone(true)
    navigate(`/quiz/${sessionId}/result`)
  }

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><LoadingSpinner /></div>

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">출제할 문제가 없습니다.</p>
          <Button onClick={() => navigate('/questions/new')}>문제 등록하기</Button>
        </div>
      </div>
    )
  }

  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const answeredCount = Object.keys(answers).length
  const correctChoice = currentQ?.choices.find(c => c.isCorrect)

  const getChoiceStyle = (choice: { id: number; isCorrect: boolean }) => {
    if (showAnswer) {
      if (choice.isCorrect) return 'border-green-500 bg-green-50 text-green-800'
      if (selectedChoiceId === choice.id && !choice.isCorrect) return 'border-red-400 bg-red-50 text-red-700'
      return 'border-gray-200 text-gray-500'
    }
    if (selectedChoiceId === choice.id) return 'border-indigo-600 bg-indigo-50 text-indigo-700'
    return 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50 text-gray-700'
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-36">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-500 hover:text-gray-700"
          >← 나가기</button>
          <span className="text-sm text-gray-500">{answeredCount}/{questions.length} 답변 완료</span>
        </div>

        <ProgressBar current={currentQuestionIndex + 1} total={questions.length} />

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          <div className="flex flex-wrap gap-1.5">
            {currentQ.tags.map(qt => (
              <TagBadge key={qt.tag.id} name={qt.tag.name} color={qt.tag.color} />
            ))}
          </div>

          <p className="text-lg font-medium text-gray-900 leading-relaxed">{currentQ.content}</p>

          <div className="space-y-3">
            {currentQ.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => !showAnswer && handleSelect(choice.id)}
                className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all text-sm font-medium ${getChoiceStyle(choice)} ${showAnswer ? 'cursor-default' : ''}`}
              >
                <span className="text-gray-400 mr-2">{choice.order}.</span>
                {choice.content}
                {showAnswer && choice.isCorrect && <span className="ml-2 text-green-600 font-bold">✓ 정답</span>}
              </button>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4">
            <button
              onClick={() => setShowAnswer(prev => !prev)}
              className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors border ${
                showAnswer
                  ? 'border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200'
                  : 'border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              {showAnswer ? '정답 숨기기' : '정답 확인'}
            </button>

            {showAnswer && currentQ.explanation && (
              <div className="mt-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs font-semibold text-blue-600 mb-1">해설</p>
                <p className="text-sm text-blue-900 leading-relaxed">{currentQ.explanation}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 하단 고정 내비게이션 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        {/* 문제 번호 스크롤 */}
        <div className="flex gap-1.5 px-4 pt-3 pb-1 overflow-x-auto scrollbar-none">
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(i)}
              className={`w-7 h-7 rounded-full text-xs font-medium transition-colors shrink-0 ${
                i === currentQuestionIndex
                  ? 'bg-indigo-600 text-white'
                  : answers[q.id] !== undefined
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-500'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        {/* 이전 / 다음 버튼 */}
        <div className="flex gap-3 px-4 py-3">
          <Button variant="secondary" className="flex-1" onClick={handlePrev} disabled={currentQuestionIndex === 0}>← 이전</Button>
          {isLastQuestion ? (
            <Button className="flex-1" onClick={handleComplete} disabled={submitting}>
              {submitting ? '제출 중...' : '제출하기'}
            </Button>
          ) : (
            <Button className="flex-1" onClick={handleNext}>다음 →</Button>
          )}
        </div>
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { Question } from '../../api/questions.api'
import Button from '../common/Button'
import TagBadge from '../tag/TagBadge'

interface QuestionCardProps {
  question: Question
  onDelete: (question: Question) => void
}

const difficultyLabel: Record<string, string> = { EASY: '쉬움', MEDIUM: '보통', HARD: '어려움' }
const difficultyColor: Record<string, string> = { EASY: 'text-green-600', MEDIUM: 'text-yellow-600', HARD: 'text-red-600' }

export default function QuestionCard({ question, onDelete }: QuestionCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:border-indigo-200 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-gray-900 font-medium leading-relaxed">{question.content}</p>
          <div className="flex flex-wrap gap-2 mt-2 items-center">
            {question.tags.map(qt => <TagBadge key={qt.tag.id} name={qt.tag.name} color={qt.tag.color} />)}
            <span className={`text-xs font-medium ${difficultyColor[question.difficulty]}`}>
              {difficultyLabel[question.difficulty]}
            </span>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link to={`/questions/${question.id}/edit`}><Button variant="secondary" size="sm">수정</Button></Link>
          <Button variant="danger" size="sm" onClick={() => onDelete(question)}>삭제</Button>
        </div>
      </div>
    </div>
  )
}

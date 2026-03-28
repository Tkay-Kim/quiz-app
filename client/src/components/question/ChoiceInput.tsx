interface ChoiceInputProps {
  index: number
  content: string
  isCorrect: boolean
  onContentChange: (value: string) => void
  onSelectCorrect: () => void
}

export default function ChoiceInput({ index, content, isCorrect, onContentChange, onSelectCorrect }: ChoiceInputProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onSelectCorrect}
        className={`w-6 h-6 rounded-full border-2 flex-shrink-0 transition-colors ${
          isCorrect
            ? 'bg-indigo-600 border-indigo-600'
            : 'border-gray-300 hover:border-indigo-400'
        }`}
      />
      <span className="text-sm text-gray-500 w-4">{index + 1}.</span>
      <input
        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        placeholder={`보기 ${index + 1}`}
        value={content}
        onChange={e => onContentChange(e.target.value)}
      />
      {isCorrect && <span className="text-xs text-indigo-600 font-medium">정답</span>}
    </div>
  )
}

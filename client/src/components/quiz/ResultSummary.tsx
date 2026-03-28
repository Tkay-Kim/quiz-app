interface ResultSummaryProps {
  score: number
  total: number
}

export default function ResultSummary({ score, total }: ResultSummaryProps) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
      <p className="text-gray-500 mb-2">퀴즈 완료!</p>
      <p className="text-5xl font-bold text-indigo-600 mb-1">
        {score} <span className="text-2xl text-gray-400">/ {total}</span>
      </p>
      <p className="text-2xl font-semibold text-gray-700">{pct}점</p>
      <p className="mt-2 text-sm text-gray-400">
        {pct >= 80 ? '훌륭해요!' : pct >= 60 ? '잘했어요!' : '조금 더 공부해봐요!'}
      </p>
    </div>
  )
}

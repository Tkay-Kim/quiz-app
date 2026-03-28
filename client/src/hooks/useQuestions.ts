import { useState, useEffect, useCallback } from 'react'
import { questionsApi, Question } from '../api/questions.api'

export function useQuestions(filters?: { tagId?: number; difficulty?: string; search?: string }) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const res = await questionsApi.getAll({ ...filters, page, limit: 20 })
      setQuestions(res.data.questions)
      setTotal(res.data.total)
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters), page])

  useEffect(() => { fetch() }, [fetch])

  return { questions, total, loading, page, setPage, refetch: fetch }
}

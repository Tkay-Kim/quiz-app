import { useState, useEffect } from 'react'
import { quizApi } from '../api/quiz.api'

export function useQuizSession(sessionId: number) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await quizApi.getSession(sessionId)
      setData(res.data.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [sessionId])

  return { data, loading, refetch: fetch }
}

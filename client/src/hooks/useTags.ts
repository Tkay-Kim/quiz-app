import { useState, useEffect } from 'react'
import { tagsApi, Tag } from '../api/tags.api'

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await tagsApi.getAll()
      setTags(res.data.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [])

  return { tags, loading, refetch: fetch }
}

import client from './client'

export interface Tag {
  id: number
  name: string
  color: string
  _count?: { questions: number }
}

export const tagsApi = {
  getAll: () => client.get<{ success: boolean; data: Tag[] }>('/tags'),
  create: (name: string, color: string) => client.post<{ success: boolean; data: Tag }>('/tags', { name, color }),
  update: (id: number, name: string, color: string) => client.put<{ success: boolean; data: Tag }>(`/tags/${id}`, { name, color }),
  delete: (id: number) => client.delete(`/tags/${id}`)
}

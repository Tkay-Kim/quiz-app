import client from './client'

export interface Choice {
  id: number
  content: string
  isCorrect: boolean
  order: number
}

export interface Tag {
  id: number
  name: string
  color: string
}

export interface Question {
  id: number
  content: string
  explanation?: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  createdAt: string
  choices: Choice[]
  tags: { tag: Tag }[]
}

export interface QuestionInput {
  content: string
  explanation?: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  choices: Omit<Choice, 'id'>[]
  tagIds: number[]
}

export const questionsApi = {
  getAll: (params?: { tagId?: number; difficulty?: string; search?: string; page?: number; limit?: number }) =>
    client.get<{ success: boolean; questions: Question[]; total: number; page: number; limit: number }>('/questions', { params }),
  getOne: (id: number) =>
    client.get<{ success: boolean; data: Question }>(`/questions/${id}`),
  create: (data: QuestionInput) =>
    client.post<{ success: boolean; data: Question }>('/questions', data),
  update: (id: number, data: QuestionInput) =>
    client.put<{ success: boolean; data: Question }>(`/questions/${id}`, data),
  delete: (id: number) =>
    client.delete(`/questions/${id}`)
}

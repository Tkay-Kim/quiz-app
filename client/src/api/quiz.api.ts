import client from './client'

export const quizApi = {
  start: (mode: string, tagIds: number[], count: number, title?: string) =>
    client.post('/quiz/start', { mode, tagIds, count, title }),
  getSession: (sessionId: number) =>
    client.get(`/quiz/${sessionId}`),
  submitAnswer: (sessionId: number, questionId: number, choiceId: number | null) =>
    client.post(`/quiz/${sessionId}/answer`, { questionId, choiceId }),
  complete: (sessionId: number) =>
    client.post(`/quiz/${sessionId}/complete`),
  getResult: (sessionId: number) =>
    client.get(`/quiz/${sessionId}/result`),
  getHistory: (page?: number) =>
    client.get('/quiz/history', { params: { page } })
}

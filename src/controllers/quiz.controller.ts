import { Request, Response, NextFunction } from 'express'
import * as service from '../services/quiz.service'

type QuizMode = 'RANDOM' | 'BY_TAG' | 'ALL'

export async function startQuiz(req: Request, res: Response, next: NextFunction) {
  try {
    const { mode, tagIds, count, title } = req.body
    const session = await service.startQuizSession(mode as QuizMode, tagIds || [], count || 10, title)
    res.status(201).json({ success: true, data: session })
  } catch (e) { next(e) }
}

export async function getQuizSession(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.getSession(Number(req.params.sessionId))
    if (!result) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '세션을 찾을 수 없습니다.' } })
    res.json({ success: true, data: result })
  } catch (e) { next(e) }
}

export async function submitAnswer(req: Request, res: Response, next: NextFunction) {
  try {
    const { questionId, choiceId } = req.body
    const answer = await service.submitAnswer(Number(req.params.sessionId), questionId, choiceId)
    res.json({ success: true, data: answer })
  } catch (e) { next(e) }
}

export async function completeQuiz(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await service.completeSession(Number(req.params.sessionId))
    res.json({ success: true, data: session })
  } catch (e) { next(e) }
}

export async function getQuizResult(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.getSessionResult(Number(req.params.sessionId))
    if (!result) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '결과를 찾을 수 없습니다.' } })
    res.json({ success: true, data: result })
  } catch (e) { next(e) }
}

export async function getHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = req.query
    const result = await service.getHistory(page ? Number(page) : 1, limit ? Number(limit) : 10)
    res.json({ success: true, ...result })
  } catch (e) { next(e) }
}

import { Request, Response, NextFunction } from 'express'
import * as service from '../services/questions.service'

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'

export async function getQuestions(req: Request, res: Response, next: NextFunction) {
  try {
    const { tagId, difficulty, search, page, limit } = req.query
    const result = await service.findQuestions({
      tagId: tagId ? Number(tagId) : undefined,
      difficulty: difficulty as Difficulty | undefined,
      search: search as string | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined
    })
    res.json({ success: true, ...result })
  } catch (e) { next(e) }
}

export async function getQuestion(req: Request, res: Response, next: NextFunction) {
  try {
    const q = await service.findQuestion(Number(req.params.id))
    if (!q) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '문제를 찾을 수 없습니다.' } })
    res.json({ success: true, data: q })
  } catch (e) { next(e) }
}

export async function createQuestion(req: Request, res: Response, next: NextFunction) {
  try {
    const q = await service.createQuestion(req.body)
    res.status(201).json({ success: true, data: q })
  } catch (e) { next(e) }
}

export async function updateQuestion(req: Request, res: Response, next: NextFunction) {
  try {
    const q = await service.updateQuestion(Number(req.params.id), req.body)
    res.json({ success: true, data: q })
  } catch (e) { next(e) }
}

export async function deleteQuestion(req: Request, res: Response, next: NextFunction) {
  try {
    await service.deleteQuestion(Number(req.params.id))
    res.json({ success: true })
  } catch (e) { next(e) }
}

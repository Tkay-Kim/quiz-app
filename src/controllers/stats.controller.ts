import { Request, Response, NextFunction } from 'express'
import { prisma } from '../prisma'

export async function getOverview(req: Request, res: Response, next: NextFunction) {
  try {
    const [totalQuestions, totalSessions, sessions] = await Promise.all([
      prisma.question.count(),
      prisma.quizSession.count({ where: { completedAt: { not: null } } }),
      prisma.quizSession.findMany({ where: { completedAt: { not: null }, score: { not: null } }, select: { score: true, totalCount: true } })
    ])

    const avgScore = sessions.length > 0
      ? sessions.reduce((acc, s) => acc + (s.score! / s.totalCount) * 100, 0) / sessions.length
      : 0

    res.json({ success: true, data: { totalQuestions, totalSessions, avgScore: Math.round(avgScore * 10) / 10 } })
  } catch (e) { next(e) }
}

export async function getTagStats(req: Request, res: Response, next: NextFunction) {
  try {
    const tags = await prisma.tag.findMany({
      include: { _count: { select: { questions: true } } }
    })
    res.json({ success: true, data: tags })
  } catch (e) { next(e) }
}

import { Request, Response, NextFunction } from 'express'
import * as service from '../services/tags.service'

export async function getTags(req: Request, res: Response, next: NextFunction) {
  try {
    const tags = await service.findTags()
    res.json({ success: true, data: tags })
  } catch (e) { next(e) }
}

export async function createTag(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, color } = req.body
    const tag = await service.createTag(name, color || '#6366f1')
    res.status(201).json({ success: true, data: tag })
  } catch (e) { next(e) }
}

export async function updateTag(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, color } = req.body
    const tag = await service.updateTag(Number(req.params.id), name, color)
    res.json({ success: true, data: tag })
  } catch (e) { next(e) }
}

export async function deleteTag(req: Request, res: Response, next: NextFunction) {
  try {
    await service.deleteTag(Number(req.params.id))
    res.json({ success: true })
  } catch (e) { next(e) }
}

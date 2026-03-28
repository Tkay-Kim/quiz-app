import { Request, Response, NextFunction } from 'express'

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error(err)
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || '서버 오류가 발생했습니다.'
    }
  })
}

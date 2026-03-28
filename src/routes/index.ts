import { Router } from 'express'
import questionsRouter from './questions.routes'
import tagsRouter from './tags.routes'
import quizRouter from './quiz.routes'
import statsRouter from './stats.routes'

export const router = Router()

router.use('/questions', questionsRouter)
router.use('/tags', tagsRouter)
router.use('/quiz', quizRouter)
router.use('/stats', statsRouter)

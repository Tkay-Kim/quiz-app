import { Router } from 'express'
import { startQuiz, getQuizSession, submitAnswer, completeQuiz, getQuizResult, getHistory } from '../controllers/quiz.controller'

const router = Router()

router.get('/history', getHistory)
router.post('/start', startQuiz)
router.get('/:sessionId', getQuizSession)
router.post('/:sessionId/answer', submitAnswer)
router.post('/:sessionId/complete', completeQuiz)
router.get('/:sessionId/result', getQuizResult)

export default router

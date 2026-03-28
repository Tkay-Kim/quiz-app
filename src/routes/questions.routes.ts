import { Router } from 'express'
import { getQuestions, getQuestion, createQuestion, updateQuestion, deleteQuestion } from '../controllers/questions.controller'

const router = Router()

router.get('/', getQuestions)
router.get('/:id', getQuestion)
router.post('/', createQuestion)
router.put('/:id', updateQuestion)
router.delete('/:id', deleteQuestion)

export default router

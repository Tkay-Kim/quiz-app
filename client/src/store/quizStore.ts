import { create } from 'zustand'

interface QuizState {
  currentQuestionIndex: number
  answers: Record<number, number | null>  // questionId -> choiceId
  setAnswer: (questionId: number, choiceId: number | null) => void
  setCurrentIndex: (index: number) => void
  reset: () => void
}

export const useQuizStore = create<QuizState>((set) => ({
  currentQuestionIndex: 0,
  answers: {},
  setAnswer: (questionId, choiceId) =>
    set(state => ({ answers: { ...state.answers, [questionId]: choiceId } })),
  setCurrentIndex: (index) => set({ currentQuestionIndex: index }),
  reset: () => set({ currentQuestionIndex: 0, answers: {} })
}))

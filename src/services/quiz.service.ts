import { prisma } from '../prisma'

type QuizMode = 'RANDOM' | 'BY_TAG' | 'ALL'

export async function startQuizSession(mode: QuizMode, tagIds: number[], count: number, title?: string) {
  let questionIds: number[] = []

  if (mode === 'BY_TAG' && tagIds.length > 0) {
    const questions = await prisma.question.findMany({
      where: { tags: { some: { tagId: { in: tagIds } } } },
      select: { id: true }
    })
    questionIds = questions.map(q => q.id)
  } else {
    const questions = await prisma.question.findMany({ select: { id: true } })
    questionIds = questions.map(q => q.id)
  }

  // Shuffle
  for (let i = questionIds.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[questionIds[i], questionIds[j]] = [questionIds[j], questionIds[i]]
  }

  const selectedIds = mode === 'ALL' ? questionIds : questionIds.slice(0, count)

  const session = await prisma.quizSession.create({
    data: {
      title,
      mode,
      totalCount: selectedIds.length,
      questions: {
        create: selectedIds.map((questionId, index) => ({ questionId, order: index + 1 }))
      }
    }
  })

  return session
}

export async function getSession(sessionId: number) {
  const session = await prisma.quizSession.findUnique({
    where: { id: sessionId },
    include: {
      questions: {
        orderBy: { order: 'asc' },
        include: {
          // We'll manually fetch questions
        }
      },
      answers: true
    }
  })

  if (!session) return null

  const questionIds = session.questions.map(sq => sq.questionId)
  const questions = await prisma.question.findMany({
    where: { id: { in: questionIds } },
    include: {
      choices: { orderBy: { order: 'asc' }, select: { id: true, content: true, order: true, isCorrect: true } },
      tags: { include: { tag: true } }
    }
  })

  // Sort by session order
  const orderedQuestions = session.questions.map(sq => questions.find(q => q.id === sq.questionId)!)

  return { session, questions: orderedQuestions }
}

export async function submitAnswer(sessionId: number, questionId: number, choiceId: number | null) {
  const choice = choiceId ? await prisma.choice.findUnique({ where: { id: choiceId } }) : null
  const isCorrect = choice?.isCorrect ?? false

  const existing = await prisma.sessionAnswer.findFirst({
    where: { sessionId, questionId }
  })

  if (existing) {
    return prisma.sessionAnswer.update({
      where: { id: existing.id },
      data: { choiceId, isCorrect }
    })
  }

  return prisma.sessionAnswer.create({
    data: { sessionId, questionId, choiceId, isCorrect }
  })
}

export async function completeSession(sessionId: number) {
  const answers = await prisma.sessionAnswer.findMany({ where: { sessionId } })
  const score = answers.filter((a: { isCorrect: boolean | null }) => a.isCorrect).length

  return prisma.quizSession.update({
    where: { id: sessionId },
    data: { score, completedAt: new Date() }
  })
}

export async function getSessionResult(sessionId: number) {
  const session = await prisma.quizSession.findUnique({
    where: { id: sessionId },
    include: { answers: true, questions: { orderBy: { order: 'asc' } } }
  })

  if (!session) return null

  const questionIds = session.questions.map(sq => sq.questionId)
  const questions = await prisma.question.findMany({
    where: { id: { in: questionIds } },
    include: { choices: { orderBy: { order: 'asc' } }, tags: { include: { tag: true } } }
  })

  const orderedQuestions = session.questions.map(sq => questions.find(q => q.id === sq.questionId)!)

  const results = orderedQuestions.map(q => {
    const answer = session.answers.find(a => a.questionId === q.id)
    const correctChoice = q.choices.find(c => c.isCorrect)
    return {
      question: q,
      selectedChoiceId: answer?.choiceId ?? null,
      isCorrect: answer?.isCorrect ?? false,
      correctChoiceId: correctChoice?.id ?? null
    }
  })

  return { session, results }
}

export async function getHistory(page: number, limit: number) {
  const skip = (page - 1) * limit
  const [sessions, total] = await Promise.all([
    prisma.quizSession.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.quizSession.count()
  ])
  return { sessions, total, page, limit }
}

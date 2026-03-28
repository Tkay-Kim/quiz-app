import { prisma } from '../prisma'

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'

interface ChoiceInput {
  content: string
  isCorrect: boolean
  order: number
}

interface QuestionInput {
  content: string
  explanation?: string
  difficulty?: Difficulty
  choices: ChoiceInput[]
  tagIds?: number[]
}

export async function findQuestions(filters: { tagId?: number; difficulty?: Difficulty; search?: string; page?: number; limit?: number }) {
  const { tagId, difficulty, search, page = 1, limit = 20 } = filters
  const skip = (page - 1) * limit

  const where: any = {}
  if (difficulty) where.difficulty = difficulty
  if (search) where.content = { contains: search, mode: 'insensitive' }
  if (tagId) where.tags = { some: { tagId } }

  const [questions, total] = await Promise.all([
    prisma.question.findMany({
      where,
      include: { choices: { orderBy: { order: 'asc' } }, tags: { include: { tag: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.question.count({ where })
  ])

  return { questions, total, page, limit }
}

export async function findQuestion(id: number) {
  return prisma.question.findUnique({
    where: { id },
    include: { choices: { orderBy: { order: 'asc' } }, tags: { include: { tag: true } } }
  })
}

export async function createQuestion(data: QuestionInput) {
  return prisma.question.create({
    data: {
      content: data.content,
      explanation: data.explanation,
      difficulty: data.difficulty || 'MEDIUM',
      choices: { create: data.choices },
      tags: data.tagIds ? { create: data.tagIds.map(tagId => ({ tagId })) } : undefined
    },
    include: { choices: { orderBy: { order: 'asc' } }, tags: { include: { tag: true } } }
  })
}

export async function updateQuestion(id: number, data: QuestionInput) {
  await prisma.choice.deleteMany({ where: { questionId: id } })
  await prisma.questionTag.deleteMany({ where: { questionId: id } })

  return prisma.question.update({
    where: { id },
    data: {
      content: data.content,
      explanation: data.explanation,
      difficulty: data.difficulty,
      choices: { create: data.choices },
      tags: data.tagIds ? { create: data.tagIds.map(tagId => ({ tagId })) } : undefined
    },
    include: { choices: { orderBy: { order: 'asc' } }, tags: { include: { tag: true } } }
  })
}

export async function deleteQuestion(id: number) {
  return prisma.question.delete({ where: { id } })
}

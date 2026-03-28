import { prisma } from '../prisma'

export async function findTags() {
  return prisma.tag.findMany({
    include: { _count: { select: { questions: true } } },
    orderBy: { name: 'asc' }
  })
}

export async function createTag(name: string, color: string) {
  return prisma.tag.create({ data: { name, color } })
}

export async function updateTag(id: number, name: string, color: string) {
  return prisma.tag.update({ where: { id }, data: { name, color } })
}

export async function deleteTag(id: number) {
  return prisma.tag.delete({ where: { id } })
}

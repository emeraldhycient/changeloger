import { prisma } from "../prisma"

export function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id } })
}

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

export function findUserWithOAuthAccounts(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: { oauthAccounts: true },
  })
}

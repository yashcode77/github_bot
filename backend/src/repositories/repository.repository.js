import prisma from "../config/prisma.js";

export const repositoryRepository = {
  findById(id) {
    return prisma.repository.findUnique({ where: { id } });
  },

  findByIdForUser(id, userId) {
    return prisma.repository.findFirst({
      where: { id, userId },
    });
  },

  findByGithubRepoId(githubRepoId) {
    return prisma.repository.findUnique({ where: { githubRepoId } });
  },

  findActiveByGithubRepoId(githubRepoId) {
    return prisma.repository.findFirst({
      where: { githubRepoId, isActive: true },
    });
  },

  findByUserAndName(userId, owner, name) {
    return prisma.repository.findUnique({
      where: {
        userId_owner_name: { userId, owner, name },
      },
    });
  },

  findManyByUserId(userId, { isActive } = {}) {
    return prisma.repository.findMany({
      where: {
        userId,
        ...(isActive !== undefined && { isActive }),
      },
      orderBy: { connectedAt: "desc" },
    });
  },

  create(data) {
    return prisma.repository.create({ data });
  },

  update(id, data) {
    return prisma.repository.update({ where: { id }, data });
  },
};

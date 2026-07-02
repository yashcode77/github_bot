import prisma from "../config/prisma.js";

export const ruleRepository = {
  findById(id) {
    return prisma.rule.findFirst({
      where: { id, deletedAt: null },
    });
  },

  findByIdIncludingDeleted(id) {
    return prisma.rule.findUnique({ where: { id } });
  },

  findManyByRepositoryId(repositoryId, { isEnabled } = {}) {
    return prisma.rule.findMany({
      where: {
        repositoryId,
        deletedAt: null,
        ...(isEnabled !== undefined && { isEnabled }),
      },
      orderBy: { createdAt: "desc" },
    });
  },

  findManyForEvaluation(repositoryId, eventType) {
    return prisma.rule.findMany({
      where: {
        repositoryId,
        eventType,
        isEnabled: true,
        deletedAt: null,
      },
    });
  },

  findManyByUserId(userId) {
    return prisma.rule.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  create(data) {
    return prisma.rule.create({ data });
  },

  update(id, data) {
    return prisma.rule.update({ where: { id }, data });
  },

  softDelete(id) {
    return prisma.rule.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};

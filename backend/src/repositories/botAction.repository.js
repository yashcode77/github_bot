import prisma from "../config/prisma.js";

export const botActionRepository = {
  findById(id) {
    return prisma.botAction.findUnique({ where: { id } });
  },

  findManyByEventId(eventId) {
    return prisma.botAction.findMany({
      where: { eventId },
      orderBy: { createdAt: "asc" },
    });
  },

  findManyByRepositoryId(repositoryId, { status, skip, take } = {}) {
    return prisma.botAction.findMany({
      where: {
        repositoryId,
        ...(status && { status }),
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    });
  },

  countByRepositoryId(repositoryId, { status } = {}) {
    return prisma.botAction.count({
      where: {
        repositoryId,
        ...(status && { status }),
      },
    });
  },

  create(data) {
    return prisma.botAction.create({ data });
  },

  update(id, data) {
    return prisma.botAction.update({ where: { id }, data });
  },

  updateStatus(id, status, extra = {}) {
    return prisma.botAction.update({
      where: { id },
      data: { status, ...extra },
    });
  },
};

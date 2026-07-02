import prisma from "../config/prisma.js";

export const githubEventRepository = {
  findById(id) {
    return prisma.gitHubEvent.findUnique({ where: { id } });
  },

  findByIdWithRelations(id) {
    return prisma.gitHubEvent.findUnique({
      where: { id },
      include: {
        matches: { include: { rule: true } },
        botActions: true,
      },
    });
  },

  findByDeliveryId(deliveryId) {
    return prisma.gitHubEvent.findUnique({ where: { deliveryId } });
  },

  findManyByRepositoryId(repositoryId, { eventType, status, skip, take } = {}) {
    return prisma.gitHubEvent.findMany({
      where: {
        repositoryId,
        ...(eventType && { eventType }),
        ...(status && { status }),
      },
      orderBy: { receivedAt: "desc" },
      skip,
      take,
    });
  },

  countByRepositoryId(repositoryId, { eventType, status } = {}) {
    return prisma.gitHubEvent.count({
      where: {
        repositoryId,
        ...(eventType && { eventType }),
        ...(status && { status }),
      },
    });
  },

  create(data) {
    return prisma.gitHubEvent.create({ data });
  },

  update(id, data) {
    return prisma.gitHubEvent.update({ where: { id }, data });
  },

  updateStatus(id, status, extra = {}) {
    return prisma.gitHubEvent.update({
      where: { id },
      data: { status, ...extra },
    });
  },
};

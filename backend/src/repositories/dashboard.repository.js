import prisma from "../config/prisma.js";

function buildRepositoryScope(userId, repositoryId) {
  return {
    userId,
    ...(repositoryId && { id: repositoryId }),
  };
}

function buildEventWhere(userId, filters) {
  const { repositoryId, eventType, status, from, to } = filters;

  return {
    repository: buildRepositoryScope(userId, repositoryId),
    ...(eventType && { eventType }),
    ...(status && { status }),
    ...((from || to) && {
      receivedAt: {
        ...(from && { gte: from }),
        ...(to && { lte: to }),
      },
    }),
  };
}

function buildActionWhere(userId, filters) {
  const { repositoryId, status, actionType, from, to } = filters;

  return {
    repository: buildRepositoryScope(userId, repositoryId),
    ...(status && { status }),
    ...(actionType && { actionType }),
    ...((from || to) && {
      createdAt: {
        ...(from && { gte: from }),
        ...(to && { lte: to }),
      },
    }),
  };
}

const eventListSelect = {
  id: true,
  repositoryId: true,
  deliveryId: true,
  eventType: true,
  action: true,
  githubSender: true,
  status: true,
  errorMessage: true,
  aiSummary: true,
  aiPriority: true,
  aiSuggestedLabel: true,
  receivedAt: true,
  processedAt: true,
  repository: {
    select: { fullName: true, owner: true, name: true },
  },
  _count: {
    select: { matches: true, botActions: true },
  },
};

const actionListSelect = {
  id: true,
  eventId: true,
  ruleMatchId: true,
  repositoryId: true,
  actionType: true,
  status: true,
  errorMessage: true,
  createdAt: true,
  completedAt: true,
  repository: {
    select: { fullName: true, owner: true, name: true },
  },
  ruleMatch: {
    select: {
      rule: {
        select: { id: true, name: true },
      },
    },
  },
};

const repositoryListSelect = {
  id: true,
  githubRepoId: true,
  owner: true,
  name: true,
  fullName: true,
  isPrivate: true,
  isActive: true,
  connectedAt: true,
  disconnectedAt: true,
  _count: {
    select: {
      events: true,
      botActions: true,
      rules: { where: { deletedAt: null } },
    },
  },
};

export const dashboardRepository = {
  findEvents(userId, filters, { skip, take }) {
    return prisma.gitHubEvent.findMany({
      where: buildEventWhere(userId, filters),
      select: eventListSelect,
      orderBy: { receivedAt: "desc" },
      skip,
      take,
    });
  },

  countEvents(userId, filters) {
    return prisma.gitHubEvent.count({
      where: buildEventWhere(userId, filters),
    });
  },

  findActions(userId, filters, { skip, take }) {
    return prisma.botAction.findMany({
      where: buildActionWhere(userId, filters),
      select: actionListSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    });
  },

  countActions(userId, filters) {
    return prisma.botAction.count({
      where: buildActionWhere(userId, filters),
    });
  },

  findRepositories(userId, filters, { skip, take }) {
    const { isActive } = filters;

    return prisma.repository.findMany({
      where: {
        userId,
        ...(isActive !== undefined && { isActive }),
      },
      select: repositoryListSelect,
      orderBy: { connectedAt: "desc" },
      skip,
      take,
    });
  },

  countRepositories(userId, filters) {
    const { isActive } = filters;

    return prisma.repository.count({
      where: {
        userId,
        ...(isActive !== undefined && { isActive }),
      },
    });
  },

  async getOverview(userId, { repositoryId } = {}) {
    const eventWhere = buildEventWhere(userId, { repositoryId });
    const actionWhere = buildActionWhere(userId, { repositoryId });

    const [
      repositoryCounts,
      ruleCounts,
      eventStatusCounts,
      actionStatusCounts,
      recentEvents,
      recentActions,
    ] = await Promise.all([
      prisma.repository.groupBy({
        by: ["isActive"],
        where: { userId, ...(repositoryId && { id: repositoryId }) },
        _count: { _all: true },
      }),
      prisma.rule.groupBy({
        by: ["isEnabled"],
        where: {
          userId,
          deletedAt: null,
          ...(repositoryId && { repositoryId }),
        },
        _count: { _all: true },
      }),
      prisma.gitHubEvent.groupBy({
        by: ["status"],
        where: eventWhere,
        _count: { _all: true },
      }),
      prisma.botAction.groupBy({
        by: ["status"],
        where: actionWhere,
        _count: { _all: true },
      }),
      prisma.gitHubEvent.findMany({
        where: eventWhere,
        select: eventListSelect,
        orderBy: { receivedAt: "desc" },
        take: 5,
      }),
      prisma.botAction.findMany({
        where: actionWhere,
        select: actionListSelect,
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    return {
      repositoryCounts,
      ruleCounts,
      eventStatusCounts,
      actionStatusCounts,
      recentEvents,
      recentActions,
    };
  },

  async getStats(userId, filters) {
    const eventWhere = buildEventWhere(userId, filters);
    const actionWhere = buildActionWhere(userId, filters);

    const [
      eventsByStatus,
      eventsByType,
      actionsByStatus,
      actionsByType,
      totalEvents,
      totalActions,
      totalRuleMatches,
    ] = await Promise.all([
      prisma.gitHubEvent.groupBy({
        by: ["status"],
        where: eventWhere,
        _count: { _all: true },
      }),
      prisma.gitHubEvent.groupBy({
        by: ["eventType"],
        where: eventWhere,
        _count: { _all: true },
      }),
      prisma.botAction.groupBy({
        by: ["status"],
        where: actionWhere,
        _count: { _all: true },
      }),
      prisma.botAction.groupBy({
        by: ["actionType"],
        where: actionWhere,
        _count: { _all: true },
      }),
      prisma.gitHubEvent.count({ where: eventWhere }),
      prisma.botAction.count({ where: actionWhere }),
      prisma.ruleMatch.count({
        where: {
          event: eventWhere,
        },
      }),
    ]);

    return {
      eventsByStatus,
      eventsByType,
      actionsByStatus,
      actionsByType,
      totalEvents,
      totalActions,
      totalRuleMatches,
    };
  },
};

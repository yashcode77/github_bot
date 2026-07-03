import prisma from "../config/prisma.js";

export const ruleMatchRepository = {
  findByEventAndRule(eventId, ruleId) {
    return prisma.ruleMatch.findUnique({
      where: { eventId_ruleId: { eventId, ruleId } },
    });
  },

  create(data) {
    return prisma.ruleMatch.create({ data });
  },

  async createIfNotExists(data) {
    const existing = await this.findByEventAndRule(data.eventId, data.ruleId);

    if (existing) {
      return { match: existing, created: false };
    }

    try {
      const match = await this.create(data);
      return { match, created: true };
    } catch (error) {
      if (error.code === "P2002") {
        const match = await this.findByEventAndRule(data.eventId, data.ruleId);
        return { match, created: false };
      }

      throw error;
    }
  },
};

import prisma from "../config/prisma.js";

export const userRepository = {
  findById(id) {
    return prisma.user.findUnique({ where: { id } });
  },

  findByGithubId(githubId) {
    return prisma.user.findUnique({ where: { githubId } });
  },

  findByGithubLogin(githubLogin) {
    return prisma.user.findFirst({ where: { githubLogin } });
  },

  create(data) {
    return prisma.user.create({ data });
  },

  update(id, data) {
    return prisma.user.update({ where: { id }, data });
  },

  delete(id) {
    return prisma.user.delete({ where: { id } });
  },
};

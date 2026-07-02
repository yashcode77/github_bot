import prisma from "./prisma.js";
import { logger } from "./logger.js";

export async function connectToDB() {
  await prisma.$connect();
  logger.info("PostgreSQL connection established");
}

export async function disconnectFromDB() {
  await prisma.$disconnect();
  logger.info("PostgreSQL connection closed");
}

export { prisma };

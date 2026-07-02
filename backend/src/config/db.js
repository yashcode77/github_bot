import prisma from "./prisma.js";

export async function connectToDB() {
  try {
    await prisma.$connect();

    console.log("PostgreSQL connection successfully established");
  } catch (err) {
    console.error("PostgreSQL connection error!", err);
    process.exit(1);
  }
}
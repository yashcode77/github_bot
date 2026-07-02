import "dotenv/config";
import app from "./app.js";
import { env } from "./config/env.js";
import { connectToDB } from "./config/db.js";
import { logger } from "./config/logger.js";

const startServer = async () => {
  try {
    await connectToDB();

    app.listen(env.PORT, () => {
      logger.info(`Server running on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    logger.fatal({ err: error }, "Failed to start server");
    process.exit(1);
  }
};

startServer();

import "dotenv/config";
import app from "./app.js";
import { env } from "./config/env.js";
import { connectToDB } from "./config/db.js";
import { logger } from "./config/logger.js";

const startServer = async () => {
  try {
    await connectToDB();

    const PORT = env.PORT;
    
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server running on http://localhost:${PORT}`);
      logger.info(`Server listening on all interfaces (0.0.0.0:${PORT}) - Ready for ngrok`);
    });
  } catch (error) {
    logger.fatal({ err: error }, "Failed to start server");
    process.exit(1);
  }
};

startServer();

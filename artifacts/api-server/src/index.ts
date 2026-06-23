import app from "./app";
import { logger } from "./lib/logger";
import { pushSchema } from "@workspace/db/migrate";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function start() {
  const dbUrl = process.env["DATABASE_URL"];
  if (dbUrl) {
    try {
      await pushSchema(dbUrl);
      logger.info({}, "Database schema pushed");
    } catch (err) {
      logger.error({ err }, "Failed to push database schema");
    }
  }

  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
  });
}

start();

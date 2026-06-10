import { Log } from "../../logging_middleware/logger.js";

export const requestLogger = async (req, res, next) => {
  try {
    await Log(
      "backend",
      "info",
      "controller",
      `${req.method} ${req.originalUrl}`
    );
  } catch (error) {
    // Never block request flow because of logging
  }

  next();
};
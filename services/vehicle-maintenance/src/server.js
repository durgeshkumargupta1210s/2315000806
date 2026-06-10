import app from './app';
import { initializeLogger } from '../../../logging_middleware/auth.js';
import { Log } from '../../../logging_middleware/logger.js';

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {

    await initializeLogger();

    await Log(
      "backend",
      "info",
      "controller",
      "Vehicle Maintenance Service initialized"
    );

    app.listen(PORT, async () => {

      await Log(
        "backend",
        "info",
        "controller",
        `Vehicle Maintenance Service running on port ${PORT}`
      );

    });

  } catch (error) {

    await Log(
      "backend",
      "fatal",
      "controller",
      error.message
    );

    process.exit(1);
  }
};

startServer();
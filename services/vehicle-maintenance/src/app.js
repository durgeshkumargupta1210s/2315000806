import express from 'express';
import { scheduleMaintenance } from './controllers/maintenance.controller';
import { requestLogger } from '../../../shared/src/requestLogger.js';

const app = express();

app.use(express.json());

// Logging Middleware
app.use(requestLogger);

app.get('/schedule', scheduleMaintenance);

export default app;
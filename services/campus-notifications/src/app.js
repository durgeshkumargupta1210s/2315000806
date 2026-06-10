import express from 'express';
import { getPriorityInbox } from './controllers/notification.controller';
import { requestLogger } from '../../../shared/src/requestLogger.js';

const app = express();

app.use(express.json());

// Logging Middleware
app.use(requestLogger);

app.get('/notifications/priority', getPriorityInbox);

export default app;
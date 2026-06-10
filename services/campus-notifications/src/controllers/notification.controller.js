import apiClient from '../../../shared/src/http-client';
import { NotificationService } from '../services/notification.service';
import { Log } from '../../../logging_middleware/logger.js';

export const getPriorityInbox = async (req, res) => {
  try {
    await Log(
      "backend",
      "info",
      "controller",
      "Priority inbox request received"
    );

    const limit = parseInt(req.query.limit) || 10;

    const response = await apiClient.get('/notifications');

    await Log(
      "backend",
      "info",
      "domain",
      "Notifications fetched successfully"
    );

    const { notifications } = response.data;

    if (!notifications || !Array.isArray(notifications)) {

      await Log(
        "backend",
        "warn",
        "controller",
        "Notifications data not found"
      );

      return res.status(404).json({
        error: 'No notifications found'
      });
    }

    const priorityInbox =
      NotificationService.getPriorityInbox(
        notifications,
        limit
      );

    await Log(
      "backend",
      "info",
      "controller",
      `Priority inbox generated with ${priorityInbox.length} notifications`
    );

    return res.json({
      count: priorityInbox.length,
      notifications: priorityInbox,
    });

  } catch (error) {

    await Log(
      "backend",
      "error",
      "controller",
      error.message
    );

    return res.status(500).json({
      error: 'Internal Server Error',
      details: error.message
    });
  }

  //notification service me priority inbox generate karne ka logic hoga, jisme placement, result, event ko priority denge aur unread notifications ko filter karenge, fir unko date ke hisab se sort karenge aur limit ke hisab se return karenge
};
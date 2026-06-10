import { Log } from "../../../logging_middleware/logger.js";

export class NotificationService {

  static async getPriorityInbox(notifications, limit) {

    await Log(
      "backend",
      "info",
      "domain",
      "Priority inbox generation started"
    );

    const priorityMap = {
      Placement: 1,
      Result: 2,
      Event: 3
    };

    const result = notifications
      .filter(n => !n.isRead)
      .sort((a, b) => {
        const priorityA = priorityMap[a.type] || 99;
        const priorityB = priorityMap[b.type] || 99;

        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        return (
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
        );
      })
      .slice(0, limit);

    await Log(
      "backend",
      "info",
      "domain",
      `Priority inbox generated with ${result.length} notifications`
    );

    return result;
  }
}
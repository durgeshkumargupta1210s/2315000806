# Campus Notification System Design

## Stage 1: API Design and Real-Time Updates

### REST API Endpoints

The notification service will expose the following APIs:

* `GET /notifications` – Retrieve all notifications for a particular user.
* `GET /notifications/:id` – Get details of a specific notification.
* `PATCH /notifications/:id/read` – Update the notification status as read.
* `POST /notifications/send` – Create and send a new notification to selected users.

### Real-Time Notification Delivery

To provide instant updates, WebSockets can be used through Socket.io. Whenever a new notification is generated, the server immediately pushes it to the intended recipient instead of waiting for the user to refresh the page.

**Flow:**

1. User establishes a socket connection after login.
2. The server associates the connection with that user.
3. When a notification is created, the server emits a `new_notification` event.
4. The user receives the notification instantly on the dashboard or mobile application.

This approach reduces unnecessary API calls and improves the user experience.

---

## Stage 2: Database Design and Storage

### Database Selection

PostgreSQL is a suitable choice because notification data has a clear relational structure and requires reliable storage of read/unread states.

### Database Schema

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(255) NOT NULL
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    notification_type VARCHAR(50),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Schema Explanation

* The `users` table stores student information.
* The `notifications` table stores notification records linked to users.
* `notification_type` helps categorize notifications such as placements, results, and events.
* `is_read` tracks whether a notification has been viewed.

---

## Stage 3: Query Performance Improvement

### Reason for Slow Query Execution

Consider the following query:

```sql
SELECT *
FROM notifications
WHERE user_id = '1042'
AND is_read = FALSE
ORDER BY created_at DESC;
```

If the notifications table contains a large amount of data and no indexes are present, the database must scan every row to locate matching records. This increases execution time significantly.

### Optimization Using Indexes

A composite index can improve performance:

```sql
CREATE INDEX idx_notifications_user_read_date
ON notifications(user_id, is_read, created_at DESC);
```

With this index, PostgreSQL can quickly locate unread notifications for a specific user and return them in sorted order.

### Placement Notifications in the Last Seven Days

```sql
SELECT DISTINCT u.username
FROM users u
INNER JOIN notifications n
ON u.id = n.user_id
WHERE n.notification_type = 'Placement'
AND n.created_at >= NOW() - INTERVAL '7 days';
```

This query retrieves the list of students who received placement-related notifications during the previous week.

---

## Stage 4: Scalability and Performance

### Challenge

If every page load triggers a database query for notifications, the database may become overloaded as the number of users grows.

### Recommended Improvements

#### 1. Redis Caching

Store frequently accessed data, such as unread notification counts, in Redis. This reduces repetitive database queries and improves response time.

#### 2. Pagination

Instead of loading all notifications at once, fetch them in smaller chunks.

Example:

```http
GET /notifications?limit=20&cursor=timestamp
```

This minimizes memory usage and network traffic.

#### 3. Read Replicas

Use read replicas to handle notification retrieval requests while the primary database manages inserts and updates. This distributes workload efficiently.

---

## Stage 5: Reliable Notification Processing

### Issues with a Direct Loop-Based Approach

A simple loop that sends notifications one by one has several drawbacks:

* The request takes a long time to complete.
* A single failure may interrupt the entire process.
* There is no retry mechanism for temporary failures.
* Scalability becomes difficult when sending notifications to thousands of users.

### Improved Design Using a Message Queue

A better approach is to use a queue-based architecture.

#### Working Process

1. The application places notification tasks into a queue.
2. Worker services process tasks independently.
3. Notifications are sent through email, push notifications, or in-app alerts.
4. Failed tasks are retried automatically.
5. Permanently failed jobs are moved to a Dead Letter Queue for investigation.

### Sample Implementation

```javascript
async function notifyAll(studentIds, message) {
  const batchSize = 1000;

  for (let i = 0; i < studentIds.length; i += batchSize) {
    const batch = studentIds.slice(i, i + batchSize);

    await notificationQueue.addBulk(
      batch.map(id => ({
        data: {
          student_id: id,
          message
        },
        opts: {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 1000
          }
        }
      }))
    );
  }
}
```

### Worker Process

```javascript
worker.process(async (job) => {
  const { student_id, message } = job.data;

  await send_email(student_id, message);
  await save_to_db(student_id, message);
  await push_to_app(student_id, message);
});
```

### Benefits

* Faster API response time.
* Better fault tolerance.
* Automatic retries for temporary failures.
* Easier horizontal scaling.
* More reliable notification delivery for large numbers of users.

## Conclusion

The proposed notification system combines REST APIs, WebSockets, PostgreSQL, Redis caching, and a queue-based processing mechanism. This architecture supports real-time communication, efficient data retrieval, and reliable notification delivery even when the system scales to thousands of users.

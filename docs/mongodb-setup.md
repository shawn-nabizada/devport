# MongoDB Database Setup

This document describes the required MongoDB setup for DevPort.

## Required Indexes

The following indexes should be created for optimal performance and data integrity:

### Users Collection

```javascript
// Unique index on email (required for login)
db.users.createIndex({ email: 1 }, { unique: true })

// Unique index on username (required for portfolio URLs)
db.users.createIndex({ username: 1 }, { unique: true })
```

### Create Indexes Script

You can run this script in MongoDB Shell or Compass:

```javascript
// Connect to your database first, then run:
use('devport'); // or your database name

// Users collection indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });

// Optional: Performance indexes for common queries
db.projects.createIndex({ userId: 1 });
db.skills.createIndex({ userId: 1 });
db.experience.createIndex({ userId: 1 });
db.education.createIndex({ userId: 1 });
db.messages.createIndex({ userId: 1 });
db.testimonials.createIndex({ userId: 1, status: 1 });

print('Indexes created successfully');
```

## Connection String

Ensure your `MONGODB_URI` environment variable is set correctly:

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

## Notes

- The unique indexes on `email` and `username` prevent duplicate registrations at the database level
- If you see "duplicate key error", it means these indexes are working correctly
- For MongoDB Atlas, indexes are created automatically when you first insert a document, but explicit unique indexes must be created manually

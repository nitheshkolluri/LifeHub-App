# LifeHub API Documentation

Base URL: `https://your-backend-url.com/api`

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Authentication

#### POST /auth/register

Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "uid": "abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false
  }
}
```

#### POST /auth/login

Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "uid": "abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": true,
    "isPremium": false,
    "plan": "free"
  }
}
```

---

### Tasks

#### GET /tasks

Get all tasks for authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "tasks": [
    {
      "id": "task123",
      "title": "Complete project proposal",
      "status": "pending",
      "priority": "high",
      "dueDate": "2024-01-15",
      "dueTime": "14:00",
      "tags": ["work", "urgent"],
      "createdAt": 1704067200000
    }
  ]
}
```

#### POST /tasks

Create a new task.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Complete project proposal",
  "priority": "high",
  "dueDate": "2024-01-15",
  "dueTime": "14:00",
  "tags": ["work", "urgent"]
}
```

**Response (201):**
```json
{
  "message": "Task created successfully",
  "task": {
    "id": "task123",
    "title": "Complete project proposal",
    "status": "pending",
    "priority": "high",
    "dueDate": "2024-01-15",
    "dueTime": "14:00",
    "tags": ["work", "urgent"],
    "createdAt": 1704067200000
  }
}
```

#### PATCH /tasks/:id

Update a task.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "completed",
  "priority": "medium"
}
```

**Response (200):**
```json
{
  "message": "Task updated successfully"
}
```

#### DELETE /tasks/:id

Delete a task.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Task deleted successfully"
}
```

---

### Habits

#### GET /habits

Get all habits for authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "habits": [
    {
      "id": "habit123",
      "title": "Morning meditation",
      "streak": 7,
      "completedDates": ["2024-01-08", "2024-01-09", "2024-01-10"],
      "frequency": "daily",
      "targetPerPeriod": 1,
      "startDate": "2024-01-01",
      "color": "#6366f1"
    }
  ]
}
```

#### POST /habits

Create a new habit.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Morning meditation",
  "frequency": "daily",
  "targetPerPeriod": 1,
  "color": "#6366f1"
}
```

**Response (201):**
```json
{
  "message": "Habit created successfully",
  "habit": {
    "id": "habit123",
    "title": "Morning meditation",
    "streak": 0,
    "completedDates": [],
    "frequency": "daily",
    "targetPerPeriod": 1,
    "startDate": "2024-01-10",
    "color": "#6366f1"
  }
}
```

#### POST /habits/:id/complete

Mark habit as completed for a date.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "date": "2024-01-10"
}
```

**Response (200):**
```json
{
  "message": "Habit completed"
}
```

---

### Finance

#### GET /finance

Get all finance items for authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "financeItems": [
    {
      "id": "finance123",
      "title": "Netflix Subscription",
      "amount": 15.99,
      "type": "subscription",
      "recurrence": "monthly",
      "dueDay": 15,
      "isPaidThisMonth": false,
      "merchant": "Netflix"
    }
  ]
}
```

#### POST /finance

Create a new finance item.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Netflix Subscription",
  "amount": 15.99,
  "type": "subscription",
  "recurrence": "monthly",
  "dueDay": 15,
  "merchant": "Netflix"
}
```

**Response (201):**
```json
{
  "message": "Finance item created successfully",
  "financeItem": {
    "id": "finance123",
    "title": "Netflix Subscription",
    "amount": 15.99,
    "type": "subscription",
    "recurrence": "monthly",
    "dueDay": 15,
    "isPaidThisMonth": false,
    "merchant": "Netflix",
    "installments": [],
    "linkedTaskIds": []
  }
}
```

---

### Subscription

#### POST /subscription/create-checkout-session

Create a Stripe Checkout session for subscription.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "priceId": "price_xxxxxxxxxxxxx",
  "successUrl": "https://app.lifehub.com/success",
  "cancelUrl": "https://app.lifehub.com/cancel"
}
```

**Response (200):**
```json
{
  "sessionId": "cs_test_xxxxxxxxxxxxx",
  "url": "https://checkout.stripe.com/c/pay/cs_test_xxxxxxxxxxxxx"
}
```

#### GET /subscription/status

Get current subscription status.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "isPremium": true,
  "plan": "pro",
  "status": "active",
  "currentPeriodEnd": "2024-02-10T00:00:00.000Z",
  "cancelAtPeriodEnd": false
}
```

#### POST /subscription/cancel

Cancel subscription at period end.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Subscription will be cancelled at period end",
  "currentPeriodEnd": "2024-02-10T00:00:00.000Z"
}
```

---

### AI Assistant

#### POST /assistant/chat

Send a message to the AI assistant.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "message": "What should I focus on today?",
  "history": []
}
```

**Response (200):**
```json
{
  "response": "Based on your tasks, I recommend focusing on the high-priority project proposal due today. You also have 2 habits to complete.",
  "timestamp": 1704067200000
}
```

#### POST /assistant/brain-dump

Parse brain dump text into structured entities.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "text": "Need to finish the report by Friday, also start going to gym daily, and pay Netflix $15 on the 15th"
}
```

**Response (200):**
```json
{
  "entities": [
    {
      "type": "task",
      "confidence": 0.95,
      "data": {
        "title": "Finish the report",
        "priority": "high",
        "dueDate": "2024-01-12"
      }
    },
    {
      "type": "habit",
      "confidence": 0.90,
      "data": {
        "title": "Go to gym",
        "frequency": "daily"
      }
    },
    {
      "type": "finance",
      "confidence": 0.92,
      "data": {
        "title": "Netflix",
        "amount": 15,
        "recurrence": "monthly",
        "dueDay": 15
      }
    }
  ],
  "summary": "Created 1 task, 1 habit, and 1 finance item from your input."
}
```

#### POST /assistant/generate-report

Generate weekly report (Premium only).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "report": {
    "id": "report123",
    "text": "Executive Summary: Strong week with 85% task completion...",
    "generatedAt": 1704067200000
  }
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Email and password are required"
}
```

### 401 Unauthorized
```json
{
  "error": "Access token required"
}
```

### 403 Forbidden
```json
{
  "error": "Premium subscription required"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Route GET /api/invalid not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too many requests",
  "message": "Please try again later"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 5 requests per 15 minutes per IP
- **Webhooks**: 100 requests per minute

---

## Webhooks

### POST /webhook/stripe

Stripe webhook endpoint for subscription events.

**Headers:**
- `stripe-signature`: Webhook signature for verification

**Events Handled:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `checkout.session.completed`

**Response (200):**
```json
{
  "received": true
}
```

---

## Testing

Use the following test credentials for development:

**Test User:**
- Email: `test@lifehub.app`
- Password: `TestPassword123!`

**Stripe Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const API_URL = 'https://your-backend-url.com/api';
const token = 'your_jwt_token';

// Create a task
const createTask = async () => {
  const response = await axios.post(
    `${API_URL}/tasks`,
    {
      title: 'Complete project',
      priority: 'high',
      dueDate: '2024-01-15'
    },
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data;
};

// Get subscription status
const getSubscription = async () => {
  const response = await axios.get(
    `${API_URL}/subscription/status`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data;
};
```

---

## Support

For API support, contact: api-support@lifehub.app

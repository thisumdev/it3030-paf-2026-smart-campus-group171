# Smart Campus Operations Hub

**IT3030 – Programming Applications & Frameworks**

> A full-stack web platform for managing university facility bookings,
> maintenance tickets, and campus operations.

---

## Team Members & Modules

| Member   | Module                        | Responsibility                          |
| -------- | ----------------------------- | --------------------------------------- |
| Member 1 | Facilities & Assets Catalogue | Resource management endpoints           |
| Member 2 | Booking & Workflow            | Booking lifecycle & conflict checking   |
| Member 3 | Ticketing & Maintenance       | Incident tickets & attachments          |
| Member 4 | Security & Communications     | OAuth2, Role management & Notifications |

---

## Tech Stack

| Layer           | Technology                       |
| --------------- | -------------------------------- |
| Backend         | Java 22, Spring Boot 4.0.3       |
| Frontend        | React 19, Vite, Tailwind CSS     |
| Database        | SQLite                           |
| Auth            | OAuth 2.0 (Google Sign-in) + JWT |
| Version Control | Git + GitHub Actions             |

---

### Prerequisites

- Java 22+
- Node.js 18+
- Git

Backend runs on → http://localhost:8080

Frontend runs on → http://localhost:5173

---

## Git Branching Strategy

```
main          ← stable, protected, integration branch (requires PR review)

feature/module1-#respectivefeature
```

### Branch Rules

- No direct push to `main`
- All merges to `main` require **at least 1 reviewer approval**
- All merges go through `develop` first then to `main`

---

## API Endpoints

### Member 1 — Facilities & Assets Catalogue

> _To be updated by Member 1_

### Member 2 — Booking & Workflow

#### Bookings — User

| Method   | Endpoint             | Auth    | Status | Description                                            |
| -------- | -------------------- | ------- | ------ | ------------------------------------------------------ |
| `POST`   | `/api/bookings`      | Any JWT | 201    | Create booking                                         |
| `GET`    | `/api/bookings/me`   | Any JWT | 200    | Get own bookings                                       |
| `GET`    | `/api/bookings/{id}` | Any JWT | 200    | Get booking by ID (own booking or ADMIN)               |
| `PUT`    | `/api/bookings/{id}` | Any JWT | 200    | Update own pending booking                             |
| `DELETE` | `/api/bookings/{id}` | Any JWT | 204    | Cancel own booking                                     |

#### Bookings — Admin

| Method   | Endpoint                           | Auth  | Status | Description                                                         |
| -------- | ---------------------------------- | ----- | ------ | ------------------------------------------------------------------- |
| `GET`    | `/api/admin/bookings`              | ADMIN | 200    | List all bookings (`?status=` `?userId=` `?facilityId=` `?date=`)   |
| `GET`    | `/api/admin/bookings/{id}`         | ADMIN | 200    | Get booking by ID                                                   |
| `PATCH`  | `/api/admin/bookings/{id}/approve` | ADMIN | 200    | Approve booking                                                     |
| `PATCH`  | `/api/admin/bookings/{id}/reject`  | ADMIN | 200    | Reject booking (reason in body)                                     |

### Member 3 — Ticketing & Maintenance

> _To be updated by Member 3_

### Member 4 — Security & Communications

#### User & Auth

| Method   | Endpoint               | Auth    | Status | Description                      |
| -------- | ---------------------- | ------- | ------ | -------------------------------- |
| `POST`   | `/api/users/register`  | Public  | 201    | Register new user                |
| `POST`   | `/api/users/login`     | Public  | 200    | Login, returns JWT               |
| `GET`    | `/api/users/me`        | Any JWT | 200    | Get own profile                  |
| `GET`    | `/api/users`           | ADMIN   | 200    | List all users (`?role=` filter) |
| `GET`    | `/api/users/{id}`      | ADMIN   | 200    | Get user by ID                   |
| `PUT`    | `/api/users/{id}/role` | ADMIN   | 200    | Update user role                 |
| `DELETE` | `/api/users/{id}`      | ADMIN   | 204    | Delete user                      |
| `PUT`    | `/api/users/me`        | Any JWT | 200    | Update own profile               |
| `DELETE` | `/api/users/me`        | Any JWT | 204    | Delete own account               |

#### Notifications — User-Facing

| Method   | Endpoint                          | Auth    | Status | Description                           |
| -------- | --------------------------------- | ------- | ------ | ------------------------------------- |
| `GET`    | `/api/notifications`              | Any JWT | 200    | Get own notifications (newest first)  |
| `GET`    | `/api/notifications/unread-count` | Any JWT | 200    | Get unread notification count         |
| `GET`    | `/api/notifications/recent`       | Any JWT | 200    | Get latest 5 notifications (for bell) |
| `PATCH`  | `/api/notifications/{id}/read`    | Any JWT | 200    | Mark a single notification as read    |
| `PATCH`  | `/api/notifications/read-all`     | Any JWT | 200    | Mark all notifications as read        |
| `DELETE` | `/api/notifications/{id}`         | Any JWT | 204    | Delete own notification               |

#### Notifications — Admin

| Method   | Endpoint                        | Auth  | Status | Description                                                       |
| -------- | ------------------------------- | ----- | ------ | ----------------------------------------------------------------- |
| `POST`   | `/api/admin/notifications/send` | ADMIN | 201    | Send notification — targets: `USER` / `SELECTED` / `ROLE` / `ALL` |
| `GET`    | `/api/admin/notifications`      | ADMIN | 200    | List all notifications (`?userId=` `?type=` `?isRead=`)           |
| `PUT`    | `/api/admin/notifications/{id}` | ADMIN | 200    | Edit a notification's title or message                            |
| `DELETE` | `/api/admin/notifications/{id}` | ADMIN | 204    | Delete any notification                                           |

---

## ✅ Implementation Progress

### Member 1 — Facilities & Assets Catalogue

> _To be updated by Member 1_

### Member 2 — Booking & Workflow

**Backend**

- [x] Booking entity with status lifecycle (PENDING → APPROVED / REJECTED / CANCELLED)
- [x] Full booking CRUD endpoints
- [x] Conflict detection (prevent double-booking of same facility/time slot)
- [x] Role-based access control on booking actions
- [x] Admin approval and rejection workflow with reason field
- [x] Integration with notification system via notify() for status changes
- [x] Global exception handling with proper HTTP status codes
- [x] HATEOAS links on all responses

**Frontend**

- [x] Booking creation form with facility and time slot selection
- [x] My Bookings page (view, cancel own bookings)
- [x] Booking detail view with status badge
- [x] Admin Bookings management page (filter by status, user, facility, date)
- [x] Admin approve/reject actions with confirmation dialog
- [x] Real-time status updates reflected in UI after actions

### Member 3 — Ticketing & Maintenance

> _To be updated by Member 3_

### Member 4 — Security & Communications

**Backend**

- [x] User registration with BCrypt password encoding
- [x] JWT login with role-based claims
- [x] Google OAuth 2.0 sign-in
- [x] Role-based access control (`USER`, `ADMIN`, `TECHNICIAN`)
- [x] Full user CRUD (list, get by ID, update role, delete)
- [x] Global exception handling with proper HTTP status codes
- [x] HATEOAS links on all responses
- [x] Notification entity with type, title, message, referenceId, referenceType, read flag
- [x] User-facing notification endpoints (fetch, unread count, bell preview, mark read, delete)
- [x] Admin notification send — targets: `USER`, `SELECTED`, `ROLE`, `ALL`
- [x] Admin notification management (list with filters, update, delete)
- [x] Internal `notify()` integration method for Bookings & Tickets modules to call
- [x] Auto-derived titles from `NotificationType` (covers all booking & ticket states + GENERAL)

**Frontend**

- [x] Login & Signup pages
- [x] Google OAuth callback handling
- [x] Auth context with session restore on refresh
- [x] Protected routes with role-based redirection
- [x] Axios client with auto JWT header & 401 redirect
- [x] Admin layout (sidebar + topbar) with nested routing
- [x] User layout (sidebar + topbar) with nested routing
- [x] User Management page (filter, search, delete, role update)
- [x] Admin Dashboard with stat cards
- [x] User profile panel (view, edit, delete own account)
- [x] Email validation on Login & Signup pages
- [x] Password strength meter on Signup page
- [x] Notifications module
  - [x] Notification bell with unread badge (top 5 preview)
  - [x] Mark as read (single & all)
  - [x] Full notifications page (user-facing)
  - [x] Admin send notification panel (USER / SELECTED / ROLE / ALL targets)
  - [x] Admin notification management (filter by user, type, read status; edit; delete)

---

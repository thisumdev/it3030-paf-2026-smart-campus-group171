# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Smart Campus Operations Hub — a campus management platform with 4 modules developed by a 4-person team:
- **Member 1**: Facilities & Assets Catalogue (`facility/` module)
- **Member 2**: Booking & Workflow (`booking/` module)
- **Member 3**: Ticketing & Maintenance (`ticket/` module)
- **Member 4**: Security & Communications (`user/`, `notifications/`, `security/` modules) — mostly complete

**Stack**: Java 22 + Spring Boot 4.0.3 (backend) | React 19 + Vite (frontend) | SQLite | JWT + Google OAuth2

## Commands

### Backend (`/backend`)
```bash
./mvnw spring-boot:run          # Run dev server at localhost:8080
./mvnw clean install            # Build (produces JAR in target/)
./mvnw test                     # Run all tests
./mvnw test -Dtest=ClassName    # Run a single test class
```

### Frontend (`/frontend`)
```bash
npm run dev      # Dev server at localhost:5173 (hot reload)
npm run build    # Production build to dist/
npm run lint     # ESLint check
```

## Architecture

### Backend Module Structure
Each business domain lives under `src/main/java/com/smart_campus/smart_campus/<module>/` with consistent sub-packages: `entity/`, `dto/`, `repository/`, `service/`, `controller/`.

The `core/` package contains cross-cutting concerns: exception handling, config, and shared utilities.

### API Response Format (HATEOAS)
All endpoints return a uniform envelope:
```json
{
  "success": true,
  "status": 200,
  "message": "...",
  "data": { ...payload..., "_links": { "self": {"href": "..."} } },
  "timestamp": "..."
}
```
New endpoints should follow this pattern using Spring HATEOAS.

### Security Flow
1. **JWT**: `JwtAuthFilter` extracts `Authorization: Bearer <token>` on every request. Stateless session.
2. **OAuth2**: Google login → `CustomOAuth2UserService` → `OAuth2SuccessHandler` creates/updates `User` → issues JWT → redirects frontend to `/auth/callback?token=<jwt>`.
3. **Roles**: `USER`, `ADMIN`, `TECHNICIAN`. Enforce with `@PreAuthorize` on controller methods.
4. **CORS**: Configured for `http://localhost:5173` only.

### Database
SQLite at `backend/smart-campus.db`. Hibernate DDL is `update` (auto-migrates schema from entity changes). No migration files — entity changes are applied automatically on startup.

### Environment Variables
Backend reads `backend/.env` at startup. Required vars: `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.

### Frontend Architecture
- **`src/api/axiosClient.js`**: Central Axios instance. Auto-attaches JWT from localStorage; on 401, clears storage and redirects to `/login`.
- **`src/features/auth/context/AuthContext.jsx`**: Global auth state (`user`, `isAdmin`). Restores session on load via `GET /api/users/me`. Use `useAuth()` hook to access.
- **`src/features/auth/components/ProtectedRoute.jsx`**: Wraps routes. Props: `requiredRole` (optional). Redirects unauthenticated → `/login`, unauthorized → `/user/dashboard`.
- Features are self-contained under `src/features/<module>/` with `pages/`, `components/`, and `services/` sub-folders.

### Notification System (cross-module)
Other modules (booking, ticket) should call `NotificationService.notify()` internally to send notifications. `NotificationType` enum defines all supported types — add new types there before using them.

## Git Workflow
- `main` is protected — requires PR review
- Feature branches: `feature/<module>-<feature>` (e.g., `feature/ticketing-maintenance`)
- Merge into `develop` before `main`

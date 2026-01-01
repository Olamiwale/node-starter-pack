This is a production ready Node-Generic-Starter

# BACKEND DESIGN — PHASE 1 (FOUNDATION)

A production-ready, domain-neutral SaaS API that supports:

* Authentication
* Teams (organizations)
* Role-based access
* Projects/resources
* Easy reuse in any product

---



### Runtime & Framework

* Node.js
* Express

### Database

* PostgreSQL
* Prisma ORM

---

## Architecture

We use **Layered Architecture** (industry standard):

```
Request
  ↓
Routes
  ↓
Controllers   (HTTP logic)
  ↓
Services      (business rules)
  ↓
Repositories  (DB access)
  ↓
Database
```

## 3️⃣ Folder Structure (Final)

```
src/
├─ app.ts
├─ server.ts
├─ config/
│   ├─ env.ts
│   ├─ database.ts
│   └─ constants.ts
│
├─ modules/
│   ├─ auth/
│   │   ├─ auth.controller.ts
│   │   ├─ auth.service.ts
│   │   ├─ auth.routes.ts
│   │   └─ auth.schema.ts
│   │
│   ├─ user/
│   │   ├─ user.controller.ts
│   │   ├─ user.service.ts
│   │   └─ user.repository.ts
│   │
│   ├─ team/
│   │   ├─ team.controller.ts
│   │   ├─ team.service.ts
│   │   └─ team.repository.ts
│   │
│   ├─ project/
│   │   ├─ project.controller.ts
│   │   ├─ project.service.ts
│   │   └─ project.repository.ts
│
├─ middlewares/
│   ├─ auth.middleware.ts
│   ├─ role.middleware.ts
│   ├─ error.middleware.ts
│
├─ utils/
│   ├─ jwt.ts
│   ├─ password.ts
│   └─ logger.ts
│
└─ prisma/
    └─ schema.prisma

---

## Core Domain Model (VERY IMPORTANT)

### Entities

1. User
2. Team (Organization)
3. TeamMember
4. Project
5. RefreshToken

---

## Database Schema (Conceptual)

### User - id, email, passwordHash, name, createdAt

---

### Team

* id, name, ownerId, createdAt

---

### TeamMember

* id, userId, teamId, role (`ADMIN`, `MEMBER`), createdAt

---

### Project

* id, name, description, teamId, createdAt

---
### RefreshToken

* id, token (hashed), userId, expiresAt
---

## Authentication Strategy (Decided Now)

### Tokens

* **Access Token** (JWT) → short-lived (15 min)
* **Refresh Token** → stored in DB (7–30 days)

### Flow

1. Login
2. Issue access + refresh token
3. Refresh endpoint rotates refresh token
4. Logout deletes refresh token

This is **real production auth**, not tutorial-level.

---

## 7️⃣ Authorization Model (RBAC)

### Roles

* `ADMIN`
* `MEMBER`

### Rules

* Admins can:

  * Manage team
  * Invite/remove members
* Members can:

  * View projects
  * Create projects (optional)

---

## 8️⃣ API Module Breakdown (No Code Yet)

### Auth

```
POST /auth/register
POST /auth/login
POST /auth/refresh
POST /auth/logout
```

---

### User

```
GET /users/me
```

---

### Team

```
POST   /teams
GET    /teams
GET    /teams/:id
POST   /teams/:id/invite
DELETE /teams/:id/members/:userId
```

---

### Project

```
POST   /teams/:id/projects
GET    /teams/:id/projects
PUT    /projects/:id
DELETE /projects/:id
```

---

## 9️⃣ Global API Standards (Important for README)

### Response Format

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

### Error Handling

* Central error middleware
* No try/catch in controllers
* Custom AppError class

---

## 10️⃣ What We Implement FIRST (Day 1–3 Plan)

### Day 1

* Project setup
* Prisma schema
* Database connection
* Env config

### Day 2

* Auth module (register + login)
* JWT utilities
* Password hashing

### Day 3

* Refresh token flow
* Auth middleware
* `/users/me`

---

sql connection



1. Connect to your database as superuser (or the `postgres` user) - sudo -u postgres psql
2. Switch to your database -\c saas_db
3. Grant ownership of the `public` schema to your user - ALTER SCHEMA public OWNER TO saas_user;
4. Optional: Ensure privileges are correct - GRANT ALL PRIVILEGES ON SCHEMA public TO saas_user;


```bash
npx prisma migrate dev --name init
```


PHASE 2


👉 NEXT STEP (DO NOT SKIP):

Build Auth Utilities

Password hashing

JWT utilities

Auth service

This is where your starter kit starts becoming valuable.



prisma schema example 'generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Account {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())
  users     User[]
}


model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String?
  role      Role     @default(USER)
  createdAt DateTime @default(now())

  accountId String?  
  account   Account?  @relation(fields: [accountId], references: [id])

  teams     TeamMember[]
  tokens    RefreshToken[]
}


model Team {
  id        String   @id @default(uuid())
  name      String
  ownerId   String
  createdAt DateTime @default(now())

  members   TeamMember[]
  projects  Project[]
}

model TeamMember {
  id        String   @id @default(uuid())
  userId    String
  teamId    String
  role      Role
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
  team Team @relation(fields: [teamId], references: [id])

  @@unique([userId, teamId])
}

model Project {
  id        String   @id @default(uuid())
  name      String
  teamId    String
  createdAt DateTime @default(now())

  team Team @relation(fields: [teamId], references: [id])
}

model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
}

enum Role {
  ADMIN
 USER
}
'
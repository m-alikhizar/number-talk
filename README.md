# Number Talk

A small full-stack demo app for the **“people communicate by numbers”** assignment.

Users start “discussions” by publishing a **starting number**. Registered users can then reply by applying arithmetic operations (ADD / SUB / MUL / DIV) to either the starting number or any previous result, forming a **calculation tree** similar to a comment thread.

- Unregistered users: can **browse all threads and trees** (read-only).
- Registered users: can **create starting numbers** and **add operations** anywhere in the tree.

---

## Tech Stack

**Backend**

- Node.js + TypeScript
- Express
- Prisma ORM + SQLite
- JWT authentication (jsonwebtoken + bcryptjs)

**Frontend**

- React + TypeScript
- Vite
- Simple component-based UI (no CSS framework)

---

## Project Structure

```text
number-talk/
  backend/
    src/
      index.ts          # Express app entry
      prismaClient.ts   # Prisma client singleton
      middleware/
        auth.ts         # JWT auth middleware
      routes/
        auth.ts         # /api/auth/register, /api/auth/login
        threads.ts      # /api/threads, /api/threads/:id/tree
        operations.ts   # /api/operations
    prisma/
      schema.prisma     # SQLite schema (User, Thread, OperationNode)
    .env
    package.json
  frontend/
    src/
      api/
        client.ts       # fetch wrapper with base URL + auth header
      components/
        AuthPanel.tsx   # login/register panel
        ThreadList.tsx  # starting numbers list
        ThreadTree.tsx  # tree visualisation
        OperationForm.tsx
      App.tsx           # main SPA shell
    .env
    package.json

```
---

# Features

### Unauthenticated Users
- View **all starting numbers**
- View **full calculation trees** for any thread
- Read usernames & timestamps
- Cannot modify anything  
  (UI shows “Log in to add operations”)

### Registered Users
- Register & login with username + password
- Create new starting numbers
- Add operations:
    - ADD (`+`)
    - SUB (`−`)
    - MUL (`×`)
    - DIV (`÷`)
- Reply to any node in the tree
- JWT stored in `localStorage`

---

# Data Model (Prisma)

### **User**
```prisma
model User {
  id           String   @id @default(uuid())
  username     String   @unique
  passwordHash String
  createdAt    DateTime @default(now())

  threads      Thread[]
  operations   OperationNode[]
}
```
# API Reference

http://localhost:4000/api
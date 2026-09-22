# ---
this repo is outdated and does not adhere to modern Elysia standards.
# ---


# bun-elysia-modular_auth

A modular authentication template built with **Bun** and **ElysiaJS**, designed as a clean starting point for building scalable APIs with authentication.

This project follows **best practices recommended by the ElysiaJS documentation**, including a modular feature-based architecture with separated services and models.

It is intended to serve as a **production-ready foundation** for building modern backend APIs using the Bun runtime.

# --------
## NOTE: This project is in a major transition from using Lucia Auth and a previous style of file structure - to using BetterAuth and an Elysia approved structure.
### Thus, some modules might not be functional during this transition as the current focus is the new structure and better authentication.
# --------

---

## Features

- ⚡ **Bun Runtime** – Extremely fast JavaScript runtime
- 🚀 **ElysiaJS Framework** – High performance, type-safe backend framework
- 🧩 **Modular Architecture** – Feature-based modules for scalability
- 🔐 **Authentication Module** – Ready-to-extend auth system
- 🧱 **Clean Separation of Concerns**
  - Services
  - Models
- 📦 **Type-Safe Validation** using Elysia's built-in schema validation
- 🛠 Designed for **extensibility and maintainability**

---

## Tech Stack

- **Runtime:** Bun
- **Framework:** ElysiaJS
- **Language:** TypeScript
- **PostgreSQL & PrismaORM:** Database 

Elysia is designed for **type safety and high performance**, leveraging Bun to deliver extremely fast backend APIs with built-in validation and type inference. :contentReference[oaicite:1]{index=1}

---

## Project Structure

This template uses a **feature-based modular structure** recommended for Elysia applications.



Each module contains:

| File | Responsibility |
|-----|-----|
| `index.ts` | Handles HTTP routing |
| `service.ts` | Business logic |
| `model.ts` | Request/response validation |

This keeps the codebase **clean, scalable, and easy to maintain**.

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/cholasimmons/bun-elysia-modular_auth.git
cd bun-elysia-modular_auth
```

### 2. Install dependencies
```
bun install
```

### 3. Start development server
```
bun run dev
```

The server will start on:
```
http://localhost:3000
```

Example Endpoint
```ts
import { Elysia } from "elysia"

new Elysia()
  .get("/", () => "Hello Elysia")
  .listen(3000)
```

## Extending the Template

To add a new module:

`src/modules/<module-name>/`

Example:
```bash
src/modules/users/
    index.ts
    service.ts
    model.ts
```

Then register the module in server.ts.

## Contributing

Contributions are welcome.

If you have ideas for improvements, feel free to:

- Open an issue
- Submit a pull request
- Suggest architectural improvements

## License

MIT License

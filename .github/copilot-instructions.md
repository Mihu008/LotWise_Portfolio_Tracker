**Repository Summary**
- **Structure**: mono-repo with three top-level folders: `Backend/`, `Frontend/`, `Worker/`.
- **Current state**: `Backend` contains `package.json` and `node_modules` but no source files checked into the repo yet. `Frontend` and `Worker` are empty folders.

**Big Picture / Architecture**
- **Backend**: Node.js (CommonJS) service; `Backend/package.json` lists `express`, `kafka`, `pg`, `dotenv`, and `cors`. The `main` field is `index.js` (entry expected). Treat Backend as a REST API service that likely talks to Kafka and Postgres.
- **Frontend / Worker**: placeholders for UI and background jobs — no source to inspect. Expect cross-component communication via Kafka (worker) and HTTP (frontend → backend).

**How to get the project running (discovered commands)**
- Install dependencies: `cd Backend; npm install`.
- There is no `start` script in `Backend/package.json`. To run (when `index.js` exists), use: `cd Backend; npx nodemon index.js` or `node index.js`.
- Tests: no test scripts found. Run `npm test` will print the default placeholder message.

**Project-specific conventions and patterns (discoverable)**
- Module type: `"type": "commonjs"` in `Backend/package.json` — write CommonJS modules (`require/module.exports`) for backend code unless you change package type.
- Environment: `dotenv` is a declared dependency — expect runtime configuration via `.env` and use of `process.env` in code. Search for `process.env` when adding features.
- Database: `pg` dependency indicates Postgres usage. Use connection strings and standard `pg` client patterns.
- Messaging: `kafka` dependency implies a Kafka broker integration. Keep producer/consumer concerns separated (Backend handles HTTP/API, Worker handles background Kafka consumers).

**Integration and cross-component notes**
- Look for and respect the following integration points when you add code:
  - Database connections should use pooled clients (`pg.Pool`) and read connection details from `process.env`.
  - Kafka producers/consumers must be isolated (do not start consumers inside request handlers).
  - CORS is present as a dependency — backend likely enables it for frontend origins.

**Guidance for AI coding agents (concise, actionable)**
- Before making changes, run a repository-wide search for `index.js`, `process.env`, `DATABASE_URL`, `KAFKA`, or `consumer` to find integration touchpoints.
- If `index.js` or backend source files are missing, create an explicit `Backend/index.js` Express entry point and add a `start` script to `Backend/package.json` — but only after confirming with maintainers.
- Preserve project style: use CommonJS modules in `Backend` and keep dependency usage minimal and explicit.
- When adding runtime config, prefer reading `process.env` and documenting required variables in a new `Backend/.env.example`.
- Do not invent infrastructure details (region, cloud provider, specific broker URLs). Instead, add TODO comments and prompt the maintainer for concrete values.

**Key files to inspect or update**
- `Backend/package.json` — scripts, dependencies, and `main` entry.
- `Backend/package-lock.json` — verified installed versions.
- `Backend/index.js` (expected) — create when implementing the service entry.
- Add `Backend/.env.example` if introducing environment variables.

**If you add or modify code**
- Add or update `Backend/package.json` `scripts` with `start` and `dev` (e.g., `"dev": "nodemon index.js"`, `"start": "node index.js"`).
- Keep changes minimal and focused; run `npm install` in `Backend` and confirm `node` can start without missing modules.

**Questions to ask the maintainers (include in PR description)**
- Which environment variables and secrets should be present (DB URL, Kafka brokers)?
- Do you want CommonJS or ESM for new services (package currently set to CommonJS)?
- Should Kafka consumers belong in `Worker/` or inside `Backend/` for this project?

If anything here is unclear or you want me to draft a starter `Backend/index.js` and a `dev` script, tell me which approach you prefer and I will create an implementation.

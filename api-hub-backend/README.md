# API Hub – Backend

Spring Boot REST API for the **API Hub** React frontend: API directory, user accounts (JWT), saved APIs, projects, dashboard numbers and a safe "API tester" proxy.

> **Status:** the code was written against your real frontend and syntax-checked, but it has **not been compiled or run** yet (see [What is verified](#what-is-verified)). Run `mvn test` first (step 6) and fix anything it reports.

## 1. Technology stack
Java 17+ (tested syntax with 21) · Spring Boot 3.3.5 · Spring Web · Spring Data JPA (Hibernate) · Spring Security + JWT (jjwt 0.12.6) · Bean Validation · MySQL 8 · Maven · Lombok (entities only) · JUnit 5 + MockMvc + H2 (tests only).

## 2. Architecture
```
React ──HTTP/JSON──► Controller ──► Service ──► Repository ──► MySQL
                        │              │
                      DTOs        business rules
              Security filter (JWT) runs before every controller
```
* **controller** – receives HTTP, validates input (`@Valid`), calls a service.
* **service** – business rules (ownership checks, SSRF checks, hashing).
* **repository** – Spring Data interfaces; no SQL needed.
* **entity** – database tables. **dto** – JSON shapes (Java `record`s) so entities/password hashes are never sent.
* **security** – JWT creation/validation, JSON 401/403. **exception** – one `@RestControllerAdvice` for all errors.

## 3. Folder structure
```
api-hub-backend/
├── pom.xml
├── .env.example                 ← copy to .env and fill in
├── README.md
└── src/
    ├── main/java/com/apihub/
    │   ├── ApiHubApplication.java
    │   ├── config/      SecurityConfig (rules + CORS), DataSeeder (50 APIs)
    │   ├── controller/  Auth, Api, SavedApi, Project, Dashboard, Tester
    │   ├── dto/         request/response records
    │   ├── entity/      User, Role, Api, SavedApi, Project, ApiRequestHistory
    │   ├── exception/   GlobalExceptionHandler + custom exceptions
    │   ├── repository/  one per entity
    │   ├── security/    JwtService, JwtAuthenticationFilter, 401/403 handlers
    │   ├── service/     Auth, Api, SavedApi, Project, Dashboard, ApiTester, OutboundUrlValidator
    │   └── util/        NetworkUtils (blocked-IP check)
    ├── main/resources/
    │   ├── application.properties
    │   └── seed/apis.json           ← exact export of the frontend's apiData.js (50 APIs)
    └── test/                        ← tests + application-test.properties (H2)
```

## 4. Database design
| Table | Purpose | Key columns / relations |
|---|---|---|
| `users` | Accounts | `email` **UNIQUE**, `password_hash` (BCrypt), `role` |
| `apis` | The 50 directory APIs | `slug` **UNIQUE** (= frontend id like `openai`), name, category, provider, description, icon, color, `authentication_type`, `base_url`, `documentation_url`, `website_url`, `free_tier`, `pricing` |
| `saved_apis` | "Save API" bookmarks | FK `user_id` → users, FK `api_id` → apis, **UNIQUE(user_id, api_id)** |
| `projects` | A user's projects | FK `owner_id` → users, name, description |
| `api_request_history` | Requests sent from the tester | FK `user_id`, FK `api_id`, method, endpoint (no query string), status, duration |

Relationships: one **user** has many **saved_apis**, **projects** and **history rows**; one **api** appears in many saved_apis/history rows. Tables are created automatically by Hibernate (`DDL_AUTO=update`). Only entities the frontend needs were created: the frontend does not attach APIs to projects, so there is no project↔API join table.

**Why `slug`?** The frontend's ids are strings (`"openai"`) and are used in routes (`/api/openai`). The database also has a numeric `id`, but JSON exposes the slug as `id`, so React code needs no change.

## 5. Prerequisites
JDK 17 or newer, Maven 3.9+, MySQL 8, (Node 18+ for the frontend).

## 6. Setup
```bash
# 1. create the database (MySQL shell)
mysql -u root -p -e "CREATE DATABASE api_hub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. configuration
cd api-hub-backend
cp .env.example .env          # Windows: copy .env.example .env
#   edit .env: DB_PASSWORD, JWT_SECRET (>= 32 chars; e.g. `openssl rand -base64 48`)

# 3. download dependencies, compile and run the tests (no MySQL needed for tests)
mvn clean test

# 4. run
mvn spring-boot:run           # http://localhost:8080
```
`.env` is read automatically (`spring.config.import`). You can instead set real environment variables (`DB_PASSWORD`, `JWT_SECRET`, …). Never commit `.env`.

| Variable | Meaning | Default |
|---|---|---|
| `DB_URL` | JDBC URL | `jdbc:mysql://localhost:3306/api_hub?...` |
| `DB_USERNAME` / `DB_PASSWORD` | MySQL login | `root` / **required** |
| `JWT_SECRET` | token signing key, ≥ 32 chars | **required** |
| `JWT_EXPIRATION_MINUTES` | token lifetime | `60` |
| `CORS_ALLOWED_ORIGINS` | comma-separated frontend origins (`*` is refused) | `http://localhost:5173` |
| `DDL_AUTO` | Hibernate schema mode | `update` (dev) |
| `PORT` | server port | `8080` |

## 7. Seeding the 50 APIs
Automatic: on every startup `DataSeeder` reads `seed/apis.json` and inserts only the APIs whose `slug` is not in the table yet. Restarting never duplicates rows and never overwrites changes. The log shows e.g.
`API seeding finished: 50 inserted, 0 already present, 50 total in database`.
Verify:
```sql
SELECT COUNT(*) FROM api_hub.apis;                       -- 50
SELECT category, COUNT(*) FROM api_hub.apis GROUP BY category;   -- 9 categories
```
or `curl http://localhost:8080/api/apis | jq length` → `50`.
(`seed/apis.json` was generated from `apiData.js`, including `freeTier` and `pricing`. If you edit `apiData.js`, regenerate the JSON; existing rows are not updated by design.)

## 8. REST endpoints
Public = no token. Private = header `Authorization: Bearer <token>`.

| Method | URL | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | public | `{name,email,password}` → 201 `{token,tokenType,expiresInSeconds,user}` |
| POST | `/api/auth/login` | public | `{email,password}` → same shape; 401 on bad credentials |
| POST | `/api/auth/forgot-password` | public | `{email}` → always 200 (never reveals if the email exists); emails a 6-digit OTP |
| POST | `/api/auth/reset-password` | public | `{email,otp,newPassword}` → 200, or 400 if the OTP is wrong/expired/used |
| GET | `/api/auth/me` | private | current user |
| GET | `/api/apis?query=&category=&provider=` | public | directory (all filters optional; returns the full list, 50 items) |
| GET | `/api/apis/{id}` | public | one API by slug |
| GET | `/api/apis/categories` · `/api/apis/providers` | public | distinct values |
| GET | `/api/saved-apis` | private | list of saved ids `["openai",…]` |
| PUT / DELETE | `/api/saved-apis/{id}` | private | save / un-save (idempotent) |
| GET | `/api/dashboard` | private | `{totalApis,savedApis,projects,requestsMade,recentRequests[]}` |
| GET / POST | `/api/projects` | private | list own / create |
| GET / PUT / DELETE | `/api/projects/{id}` | private | own project only (others → 404) |
| POST | `/api/tester/execute` | private | send a test request (below) |

Pagination and separate `/search` or `/category/{x}` endpoints were intentionally skipped: there are only 50 records and the frontend filters in memory, so query parameters on one endpoint are simpler.

Error format (all errors): `{timestamp,status,error,message,path,fieldErrors?}`.

### API tester
```json
POST /api/tester/execute
{ "apiId":"jsonplaceholder", "method":"GET",
  "url":"https://jsonplaceholder.typicode.com/posts/1",
  "queryParams":{"x":"1"}, "headers":{"Accept":"application/json"}, "body":"" }
→ { "status":200, "statusText":"OK", "durationMs":143, "headers":{…}, "body":"…", "truncated":false }
```
Safety rules (`OutboundUrlValidator`, `ApiTesterService`): login required; `https` only, port 443, no `user:pass@`; the host must **exactly equal a host of an API in the directory** (allow-list built from `apis.base_url`); DNS result must not be loopback/private/link-local/metadata/CGNAT/unique-local; redirects are **not** followed; 5 s connect / 15 s total timeout; 1 MB response cap; headers like `Host`, `Cookie`, `Content-Length` are refused; `Set-Cookie` is hidden from responses; history stores method + host + path only (no query, headers or body). Users type their *own* provider key in the Headers box; it is forwarded only to that provider's host and never stored or logged. Residual risk: DNS-rebinding between the check and the connection is mitigated, not eliminated (hosts are trusted providers); add per-user rate limiting before going public.

## 9. Authentication flow
1. `POST /api/auth/register` or `/login` → `token` (JWT, signed HS256 with `JWT_SECRET`, subject = email).
2. Frontend stores the token and sends `Authorization: Bearer <token>` on private calls.
3. `JwtAuthenticationFilter` validates the signature/expiry, loads the user, and marks the request authenticated. Otherwise → JSON 401.
Passwords are hashed with BCrypt, min 8 chars with a letter and a digit. Login errors are identical for "unknown email" and "wrong password".
**localStorage trade-off:** any XSS bug could read a token from localStorage. OK for this project; for production move the JWT to an `HttpOnly; Secure; SameSite` cookie (needs CSRF protection and `allowCredentials`).

### Forgot / reset password flow (email OTP)
1. Login page → **Forgot password?** → `/forgot-password` → user enters their email → `POST /api/auth/forgot-password`.
2. Backend generates a random 6-digit OTP (valid 10 min), stores only its BCrypt hash (table `password_reset_otps`) and emails it.
3. The same page shows the OTP + new-password form → `POST /api/auth/reset-password {email, otp, newPassword}`.
4. Backend checks the OTP, saves the new BCrypt password and deletes the OTP (single use).
Safety: same answer for unknown emails, max one email per minute per account, **5 wrong OTP guesses kill the code**, OTP is never stored in plain text. Already-issued login JWTs stay valid until they expire (stateless tokens).

**Email setup.** In `.env`: `MAIL_ENABLED=false` prints the OTP in the backend console (good for testing). For real emails set `MAIL_ENABLED=true` plus `MAIL_USERNAME`, `MAIL_PASSWORD` (for Gmail an *App password* from https://myaccount.google.com/apppasswords, needs 2-Step Verification) and `MAIL_FROM`. SMS OTP is not included: it needs a phone-number field at sign-up and a paid SMS provider (Twilio, Fast2SMS, ...).

## 10. Connect the React frontend
Step-by-step instructions and the changed files are in the chat answer / `frontend-changes` list below.
1. Start MySQL + backend (`mvn spring-boot:run`, port 8080).
2. In the frontend folder create `.env` with `VITE_API_BASE_URL=http://localhost:8080/api`.
3. Replace/add the frontend files listed below, then `npm install && npm run dev` (http://localhost:5173).
4. **Do not use a Vite proxy for `/api`**: your React routes `/api/:apiName` would be forwarded to the backend. Use the absolute URL + CORS as configured.

Changed/new frontend files: `src/services/api.js` (new), `src/services/auth.js` (new), `src/utils/savedApis.js`, `src/pages/Login.jsx` (Forgot password link), `src/pages/Signup.jsx`, `src/pages/ForgotPassword.jsx` (new, email → OTP → new password), `src/App.jsx` (1 new route), `src/pages/ApiTesting.jsx`, `src/pages/Dashboard.jsx`, `src/components/Navbar.jsx`, `.env.example` (new).
Unchanged on purpose: `apiData.js` and all pages that read it (Explore, Categories, Pricing, ApiDetails, Landing). The directory is static content, so it stays as the frontend's source and its identical copy is in the database; `GET /api/apis` is ready if you later want to load it dynamically (`fetchApis()` already exists in `api.js`).

## 11. Testing with Postman / curl
```bash
curl -X POST localhost:8080/api/auth/register -H "Content-Type: application/json" \
  -d '{"name":"Asha","email":"asha@example.com","password":"Passw0rd123"}'
TOKEN=<paste token>
curl localhost:8080/api/auth/me -H "Authorization: Bearer $TOKEN"
curl -X PUT localhost:8080/api/saved-apis/openai -H "Authorization: Bearer $TOKEN"
curl localhost:8080/api/dashboard -H "Authorization: Bearer $TOKEN"
curl -X POST localhost:8080/api/tester/execute -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"apiId":"jsonplaceholder","method":"GET","url":"https://jsonplaceholder.typicode.com/posts/1"}'
```
In Postman: create a request, choose *Authorization → Bearer Token* and paste the token.

## 12. Automated tests
`mvn test` (uses in-memory H2, no MySQL, no internet). Covers: context startup · 50 seeded APIs · list/search/category/by-id/404 · register, duplicate email, validation, login ok/fail · JWT-protected endpoints · saved APIs + dashboard · project ownership (other user gets 404 on read/update/delete) · SSRF validator (localhost, private/metadata IPs, http, unlisted hosts, ports, user-info, DNS pointing to internal IP) · tester endpoint rejections.

## What is verified
* ✅ Frontend `vite build` succeeds with all changes (run on Linux with a fresh install).
* ✅ Backend Java sources pass a `javac` syntax parse (only missing-library errors, because Maven Central was unreachable in the build environment).
* ❌ **Not yet executed:** `mvn test`, the application against MySQL, and the live call to a real third-party API. Treat everything above as *implemented but unverified* until you run step 6.

## 13. Common errors
| Symptom | Fix |
|---|---|
| `Could not resolve placeholder 'DB_PASSWORD'` / `'JWT_SECRET'` | create `.env` (or set env vars) |
| `JWT_SECRET must be at least 32 characters long` | use a longer secret |
| `Access denied for user` / `Communications link failure` | wrong `DB_USERNAME/DB_PASSWORD`, MySQL not running, or DB `api_hub` missing |
| `Unknown database 'api_hub'` | run the `CREATE DATABASE` command |
| Browser: `blocked by CORS policy` | `CORS_ALLOWED_ORIGINS` must equal the exact frontend origin (`http://localhost:5173`, no trailing slash); restart backend |
| Frontend: "Cannot reach the API Hub server" | backend not running, or wrong `VITE_API_BASE_URL` (restart `npm run dev` after editing `.env`) |
| Tester says "host is not an API listed in API Hub" | by design – only hosts of directory APIs and `https` are allowed |
| Tester 401 | log in first |
| Port 8080 busy | set `PORT=8081` and update `VITE_API_BASE_URL` |

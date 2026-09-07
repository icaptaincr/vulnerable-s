# ⚠️ Vulnerable MERN Notes App (Educational Use Only)

A deliberately insecure MongoDB + Express + React + Node app for learning web
security — similar in spirit to OWASP Juice Shop / DVWA, but tiny and easy to
read end-to-end.

**Do not deploy this publicly. Do not reuse this code in a real project.**
Run it only on `localhost` against a local/throwaway MongoDB instance.

## What it is

A simple notes app: register, log in, create notes, view everyone's notes.
Every layer has at least one intentional, commented vulnerability so you can
find it, exploit it against your own local instance, and then practice fixing it.

## Setup

**Prerequisites:** Node.js 18+, MongoDB running locally (or a connection string).

### Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev        # or: npm start
```
Runs on http://localhost:5000

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on http://localhost:5173

## Vulnerability list (13 total)

| # | Location | Vulnerability | OWASP Top 10 category |
|---|----------|---------------|------------------------|
| 1 | `models/User.js` | Passwords stored in **plaintext**, no hashing | A02 Cryptographic Failures |
| 2 | `routes/auth.js` (register) | **Mass assignment** — client can set `isAdmin: true` on signup | A04 Insecure Design / A01 Broken Access Control |
| 3 | `models/Note.js`, `components/Notes.jsx` | **Stored XSS** — note content rendered via `dangerouslySetInnerHTML` with no sanitization | A03 Injection |
| 4 | `routes/auth.js`, `middleware/auth.js` | Hardcoded/weak JWT secret, tokens **never expire** | A02 Cryptographic Failures |
| 5 | `routes/auth.js` | API responses **leak plaintext passwords** back to the client | A02 / Sensitive Data Exposure |
| 6 | `routes/auth.js`, `routes/notes.js` | Error handlers **leak stack traces** to the client | A05 Security Misconfiguration |
| 7 | `routes/auth.js` (login) | **NoSQL injection** — `username`/`password` passed directly into `findOne()`, exploitable with `{"$ne": null}` | A03 Injection |
| 8 | `routes/auth.js` (login) | No rate limiting — login is brute-forceable | A07 Identification & Auth Failures |
| 9 | `middleware/auth.js` | Auth middleware only checks token validity, not user state | A07 Identification & Auth Failures |
| 10 | `routes/notes.js` (`GET /`) | **Broken access control** — any logged-in user can list every user's notes (and their passwords, via `populate`) | A01 Broken Access Control |
| 11 | `routes/notes.js` (`GET/PUT/DELETE /:id`) | **IDOR** — no ownership check, so any user can read/edit/delete anyone's note by ID | A01 Broken Access Control |
| 12 | `server.js` | **CORS misconfigured** to allow any origin | A05 Security Misconfiguration |
| 13 | `components/Login.jsx` | JWT stored in `localStorage`, readable by any injected script (compounds the XSS bug) | A02 / A03 |

## Suggested exercises

1. **Exploit the NoSQL injection**: use curl/Postman to POST
   `{"username":{"$ne":null},"password":{"$ne":null}}` to `/api/auth/login`
   and observe you're logged in as the first user in the DB.
2. **Exploit stored XSS**: create a note with content like
   `<img src=x onerror="alert(document.cookie)">` and watch it fire whenever
   any user (including an "admin") views the notes list.
3. **Exploit IDOR**: log in as user A, create a note, note its `_id`. Log in
   as user B and `DELETE /api/notes/<A's note id>` — it succeeds even though
   B doesn't own it.
4. **Fix each one** and write a short before/after note — this is a strong
   thing to describe in interviews or on a resume/portfolio ("built and then
   remediated N common web vulnerabilities in a MERN app").

## Fixes (for reference, once you're ready)

- Hash passwords with `bcrypt`; never return the password field (`select: false` + strip in responses).
- Whitelist fields on register (`{ username, password }` only); never spread `req.body` into a model.
- Sanitize/escape note content before rendering, or render as plain text (`{n.content}` not `dangerouslySetInnerHTML`); consider `DOMPurify` if HTML is genuinely needed.
- Set a strong `JWT_SECRET` from env only (fail startup if missing) and set `expiresIn` (e.g. `"1h"`).
- Never leak `err.stack` to clients; log server-side, return generic messages.
- Use parameterized/typed queries — reject non-string `username`/`password` before querying, or use a schema validator (e.g. `express-validator`, `zod`).
- Add rate limiting (`express-rate-limit`) on auth routes.
- Scope note queries to `owner: req.user.id`; check ownership before update/delete.
- Restrict CORS to your actual frontend origin.
- Store tokens in an `httpOnly` cookie instead of `localStorage`.

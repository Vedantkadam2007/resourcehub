# ResourceHub — Share more. Waste less.

A hackathon-ready MVP for **Unlock Underused Equipment and Spaces**. ResourceHub helps communities discover and request underused resources while demonstrating owner oversight, fair-use rules, check-in/check-out, incident reporting and an audit trail.

## Requirements
- Node.js 18 or newer
- npm

## Run on Windows
1. Extract the complete `ResourceHub` folder.
2. Open the folder in VS Code (the folder containing this `package.json`).
3. In the VS Code terminal, run:

```powershell
npm install
npm run dev
```

4. Open **http://localhost:5173**. The API runs at **http://localhost:5000** and health check at **http://localhost:5000/health**.

No separate database setup is needed for this demo. The API creates `data/db.json` automatically and persists demo actions there. To reset the demo, stop the servers, delete `data/db.json`, then restart the API.

## Included demo flows
- Search and filter a seeded catalogue of resources.
- Inspect resource details, verification state and safety requirements.
- Request a time slot with purpose, contact and training confirmation when required.
- Detect overlapping bookings and apply a basic per-user active booking limit.
- Owner demo actions: approve/reject requests, record handover and confirm returns.
- Waitlist promotion when a resource is returned.
- List a resource (new listings enter pending review).
- Report and update incidents.
- Review chronological audit events.
- Switch among demo identities to preview booking lists.

## Demo identities
- Student: `student@demo.com`
- Resource owner: `owner@demo.com`
- Institution admin: `admin@demo.com`

The identity switcher is only a UI demo. There is **no real login, password verification, permission enforcement or identity verification** in this starter. Do not expose this demo publicly with real data.

## Hackathon demonstration path
1. Search for “camera” and open the Mirrorless Camera Kit.
2. Submit a booking request with a purpose and future time range.
3. Open **My bookings** and approve the request (the local demo action is intentionally available for demonstration).
4. Check out the item and record the handover condition; then confirm return and enter the return condition.
5. Open **Activity log** to show traceable events.
6. Submit an incident and update its status in **Incidents**.
7. List a new resource and show that it is marked pending review.

## Important MVP limitations before production
- JSON-file storage is suitable for a local demo only. Use PostgreSQL with Prisma or another transactional database before multi-user deployment.
- Authentication and role-based authorisation must be implemented server-side.
- Add institutional verification, real availability calendars, time-zone handling, transactional conflict prevention, secure file uploads, evidence retention policies, notification delivery and automated tests.
- The basic fairness rule is intentionally explainable but should be configurable by each institution and reviewed for accessibility and bias.
- This MVP does not process payments or security deposits. Fees are indicative display values only.
- Do not use demo data to make real access, training or safety decisions.

## Tech
React, Vite, Express, Node.js, lucide-react. API routes are defined in `apps/api/server.js`.


## Demo login accounts

The app now opens on a multicolour login screen with separate **User login** and **Admin panel** modes.

- **Admin email:** `vedantkadam875@gmail.com`
- **Admin password:** `Vedant@1234`
- **Student demo:** `student@demo.com` / `Student@123`
- **Resource owner demo:** `owner@demo.com` / `Owner@123`
- **Community member demo:** `member@demo.com` / `Member@123`

The admin credentials can be overridden with `RESOURCEHUB_ADMIN_EMAIL` and `RESOURCEHUB_ADMIN_PASSWORD` environment variables.

**Important:** these are local hackathon demo credentials, not production authentication. The current app returns a demo session and the API does not enforce role-based authorization for all data-changing endpoints. Before deployment, add password hashing, secure server sessions or signed tokens, rate limiting, HTTPS, and authorization checks on every protected API route. Change the supplied demo password before any public deployment.


## Demo login accounts

The app opens on a multicolour login screen with separate **User login** and **Admin panel** modes.

- **Admin email:** `vedantkadam875@gmail.com`
- **Admin password:** `Vedant@1234`
- **Student demo:** `student@demo.com` / `Student@123`
- **Resource owner demo:** `owner@demo.com` / `Owner@123`
- **Community member demo:** `member@demo.com` / `Member@123`

The admin credentials can be overridden with `RESOURCEHUB_ADMIN_EMAIL` and `RESOURCEHUB_ADMIN_PASSWORD` environment variables.

**Important:** these are local hackathon demo credentials, not production authentication. The current app returns a demo session and the API does not enforce role-based authorization for all data-changing endpoints. Before deployment, add password hashing, secure server sessions or signed tokens, rate limiting, HTTPS, and authorization checks on every protected API route. Change the supplied demo password before any public deployment.


## Booking approval fix

The admin dashboard now includes a **Booking approval requests** queue with pending student requests and Approve/Reject actions. Admins also see all bookings on the My bookings page. Booking forms use the currently signed-in account instead of always submitting as `student@demo.com`. The dashboard refreshes its data every 12 seconds and after actions.

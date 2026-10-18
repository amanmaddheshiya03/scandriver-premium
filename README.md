# ScanDriver Dynamic Platform (React + Express)

This is a local full-stack prototype, not merely a static landing page.

## Requirements
- Node.js 18+ (Node 20 recommended)
- npm

## Start both frontend and backend
From the project root:
```bash
npm install
npm run dev
```
Frontend: http://localhost:5173
API health: http://localhost:4000/api/health
Admin dashboard: click **Admin dashboard** in the footer.

## Admin credentials (local demo only)
The local development default password is `change-this-admin-password`.
Change it before using the app:
- Windows PowerShell: `$env:ADMIN_PASSWORD="your-strong-password"; npm run server`
- macOS/Linux: `ADMIN_PASSWORD="your-strong-password" npm run server`

The frontend dev server proxy routes `/api` to Express. Booking enquiries and driver applications are saved to `server/data/db.json`. Admin dashboard supports login, search, status filtering, status updates and deleting test bookings.

## Build frontend
```bash
npm run build
```
The compiled frontend is written to `client/dist`. For a production deployment, serve the built frontend from a static host and deploy the Express API separately (or configure Express to serve `client/dist`); set the frontend API base URL to your deployed backend and enable appropriate CORS. A static Netlify Drop upload alone will NOT deploy the API or persistence.

## Important limitations before production
- This is a working local prototype with JSON-file persistence, not a production booking/dispatch platform.
- It does not know live driver location or availability, assign drivers automatically, collect payments, send SMS/email alerts, or confirm bookings.
- Admin authentication is a simple shared-password prototype; use proper sessions, hashing, rate limiting and role-based access before public deployment.
- Contact numbers, email, service claims, actual coverage, rates and legal terms must be verified with ScanDriver before production.
- Do not put real customer data in the demo JSON file. Use a proper database and privacy controls for production.
- Stock photography URLs are temporary; replace with approved/licensed brand assets.

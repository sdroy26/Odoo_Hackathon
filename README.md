# TransitOps Fleet Management Prototype

A static HTML/CSS/JavaScript fleet operations and dispatch dashboard prototype for the Odoo Hackathon workspace.

## Overview

This project is a client-side prototype for a fleet management application. It includes:

- login/sign-up flow using a local CSV credential file (`users.csv`)
- dashboard, vehicle registry, drivers, trips, maintenance, fuel/expenses, reports, calendar, documents, and settings views
- shared navigation and UI interactions via `css/site.js`
- responsive admin-style interface built with plain HTML, CSS, and JavaScript

## Key Features

- Local login using `users.csv` as the credential store
- Page navigation across multiple fleet operations views
- Demo data tables with search, filter, and export interactions
- Local record creation and persistence using `localStorage` for vehicle/driver/maintenance items
- CSV export support for tables and sample reporting data

## Files & Structure

- `login.html` — entry point for the application and the place where users select `users.csv`
- `dashboard.html` — main dashboard view
- `registry.html` — fleet vehicle registry view
- `vehicle-registry.html` — vehicle detail and comparison view
- `drivers.html` — drivers overview
- `trips.html` — trip management view
- `maintenance.html` — maintenance work order view
- `fuel-expenses.html` — fuel and expense tracking view
- `reports.html` — reporting dashboard
- `fleet-calendar.html` — calendar view
- `fleet-documents.html` — document management view
- `settings.html` — user and role settings view
- `css/styles.css` — global styling for the prototype
- `css/site.js` — shared interactions, navigation, export helpers, and demo behavior
- `users.csv` — sample credentials store used by the login page
- `reports-analysis-sample.csv` — sample export/report data
- `read.md` — legacy notes file for the workspace

## How to Run

### Option 1: Open Locally

1. Open `login.html` in your browser (Chrome, Edge, or any modern browser).
2. When prompted, select `users.csv`.
3. Use any existing credentials from `users.csv` to log in.

### Option 2: Use a Local Server (Recommended)

Some browsers restrict local file access. To avoid issues, run a simple local server from the project folder:

```powershell
cd C:\Users\pandy\Odoo_Hackathon_https
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/login.html
```

## Credentials

Sample credentials are stored in `users.csv` in plain text. Existing login entries include:

- `operator@transitops.com` / `Transit@123`
- `dispatcher@transitops.com` / `Dispatch@123`
- `analyst@transitops.com` / `Report@123`

> Important: This is a prototype. The CSV credential approach is not secure for production use.

## Notes

- This workspace is a static prototype and does not use a backend database or server-side logic.
- Any new signup or login action in the app updates the selected `users.csv` file directly.
- Navigation and UI actions are handled by `css/site.js` and may be partial or demo-only in some screens.
- The project is designed for demonstration purposes and is not a production-quality fleet management system.

## Recommended Improvements

- Add a real backend service and database for authentication and data storage.
- Improve security by removing plaintext CSV credential storage.
- Replace local CSV login flow with OAuth or JWT-based auth.
- Add mobile responsive design and cross-browser compatibility testing.
- Add a build step or bundler if the app grows beyond a static prototype.

## Project Use Cases

- Demonstrate a fleet operations UI for stakeholder review
- Test page navigation and data table interactions
- Share a static prototype with users via browser preview
- Validate UI concepts for vehicles, trips, maintenance, and reporting

## Contact

If you need more help updating this prototype, open `login.html` first and confirm the browser allows file selection for `users.csv`.

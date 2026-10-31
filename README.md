# Brightloop

Brightloop is a React billing dashboard backed by a local SQLite database and an Express API.

## Run locally

Install dependencies and start both the API and Vite:

```sh
npm ci
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The SQLite database is created and seeded at `data/brightloop.sqlite` on the first API startup. App data and user accounts persist there across restarts. The database file is local and is excluded from Git.

For a standalone API process, run `npm run start:api`; the Vite development server proxies `/api` requests to it.

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@brightloop.io` | `Admin@123` |
| Staff | `staff@brightloop.io` | `Staff@123` |
| Customer | `customer@brightloop.io` | `Cust@123` |

Passwords are stored as salted scrypt hashes. Use a new email address to create an account. Deleting `data/brightloop.sqlite` resets the local database and restores the demo data.

The local API uses an in-memory session store and is intended for development, not production deployment.

Customer sign-up collects contact and billing details and creates a linked customer record. Staff can view the new customer under **Customers**, open their record, and select **New Subscription** to create a subscription for them. The **Subscriptions** page also has a **New Subscription** button for selecting any customer and plan.

# admin-ui

The admin site of motoXpress. React + TypeScript + Vite. Dev port **3001**.
Opened through Nginx at `http://admin.localhost` (the customer site is `http://localhost`).
Design: `infrastructure/docs/mvp/05-components/admin-ui.md`.

Admins are normal users with `ROLE_ADMIN` in user-service. Every page needs that role.
Hiding a page is not security: every service checks `ROLE_ADMIN` on every admin URL again.

## Pages

| Page | Path | Does | Service |
|---|---|---|---|
| Orders | `/orders`, `/orders/:orderNo` | Numbers on top, filters, cancel before shipping, print the packing slip | order-service |
| Shipments | `/shipments` | New shipment (optional pickup receipt), mark delivered or returned for many parcels at once | order-service |
| Payments | `/payments` | Read only list with filters | payment-service |
| Courier receipts | `/courier-receipts`, `/new`, `/:id` | Tick the collected parcels, type what arrived, attach the receipt file | payment-service |
| Parts | `/parts`, `/parts/new`, `/parts/:id` | Add, edit, hide, fitment, photos, stock changes and history | product-service |
| Catalog | `/catalog` | Brands, models, categories (add, hide) | product-service |

Not built yet: the Users page (lock, make admin, audit log). user-service has no admin endpoints yet.

## Settings (`.env`)

| Name | Meaning |
|---|---|
| `VITE_API_BASE_URL` | Address of the site that serves the API (Nginx admin site) |
| `VITE_COURIERS` | Courier names in the forms, separated by commas. The services check them again. |

## Run and check

```bash
cp .env.example .env    # first time only. The values are not secret.
npm install
npm run dev      # http://localhost:3001 (through Nginx: http://admin.localhost)
npm run build    # checks the TypeScript types and builds
npm run lint
```

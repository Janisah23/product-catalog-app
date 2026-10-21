# Forme: Product Catalog and Personal Shopping Cart

A full-stack e-commerce app built for a Web Developer internship assessment. Shoppers browse a seeded catalog with server-side search, category filtering, sorting and pagination, read product details, and keep a personal cart that is stored in the database and tied to their account.

- **Frontend:** React, Vite, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Node.js, Express, TypeScript
- **Database:** Firebase Cloud Firestore
- **Authentication:** Firebase Authentication (email and password)

## Why these choices

- **Firestore** was already set up in the project, needs no server to run, and is free at this scale. Its limits (no full-text search, strict index rules) shaped the query design described below.
- **Express in front of Firestore** keeps every rule on the server: input validation, token verification, stock limits, price calculation and cart ownership. The browser never talks to the database, and `firestore.rules` denies all direct client access.
- **Firebase Authentication** stores passwords for us. It hashes them with a salted, memory-hard scrypt variant on Google's servers, so no password or hash ever touches our code or database. The API trusts only ID tokens that the Admin SDK verifies on every request.

## Project layout

```
src/                     React app (pages, components, hooks, stores)
server/src/              Express API
server/src/seed/         Seed data and the `npm run seed` script
scripts/                 Generator for the placeholder product images
public/products/         72 generated placeholder images (3 per product)
firestore.rules          Denies all direct client access
firestore.indexes.json   Composite indexes the catalog queries need
```

## Prerequisites

- Node.js 20.19 or newer (22 LTS recommended) and npm 10 or newer
- A Firebase project (the free Spark plan is enough)
- Optional: the [Firebase CLI](https://firebase.google.com/docs/cli) (`npm i -g firebase-tools`) to deploy the indexes

## Setup

### 1. Install

```bash
git clone https://github.com/Janisah23/product-catalog-app.git
cd product-catalog-app
npm install        # installs the web app and the server workspace together
```

### 2. Firebase

1. In the [Firebase console](https://console.firebase.google.com/) create a project (or open the one you already use).
2. **Authentication > Sign-in method:** enable **Email/Password**.
3. **Firestore Database > Create database.** Choose a region and start in **production mode**. The rules in this repo deny client access, which is what we want.
4. **Project settings > General > Your apps:** add a **Web app** and copy its config values for the frontend.
5. **Project settings > Service accounts > Generate new private key:** download the JSON. Its values go in `server/.env`. Never commit this file.
6. Create the indexes (see "Firestore indexes" below).

### 3. Environment variables

```bash
cp .env.example .env              # frontend
cp server/.env.example server/.env
```

**Frontend `.env`** (Vite exposes only variables that start with `VITE_`; these are public web config values, not secrets):

| Variable | Purpose |
| --- | --- |
| `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID` | From the Firebase web app config |
| `VITE_API_URL` | Optional. Empty in development (Vite proxies `/api` to port 4000). Set it for production builds. |

**Server `server/.env`:**

| Variable | Purpose |
| --- | --- |
| `PORT` | API port, default `4000` |
| `CLIENT_ORIGIN` | Browser origin(s) allowed by CORS, comma separated. Default `http://localhost:5173` |
| `FIREBASE_PROJECT_ID` | Same project as the web app |
| `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | `client_email` and `private_key` from the service-account JSON. Keep the `\n` escapes and wrap the key in double quotes. |
| `GOOGLE_APPLICATION_CREDENTIALS` | Alternative to the two variables above: path to the JSON file |

### 4. Firestore indexes

Firestore needs a composite index for each combination of filter and sort the catalog supports. They are defined in `firestore.indexes.json` (9 indexes). Deploy them with:

```bash
firebase login
firebase use <your-project-id>
firebase deploy --only firestore:indexes,firestore:rules
```

Indexes take a few minutes to build; the console shows their status under Firestore > Indexes. If you skip this step, filtered or sorted requests fail with an `INDEX_REQUIRED` error (the server log includes a console link that creates the missing index).

### 5. Seed the database

```bash
npm run seed
```

This writes 24 products in 6 categories plus the category list. It is safe to run again: documents are keyed by product id and overwritten.

### 6. Run

Use two terminals:

```bash
npm run server     # API on http://localhost:4000
npm run dev        # web app on http://localhost:5173
```

Production builds: `npm run build` (frontend, output in `dist/`) and `npm run server:build` then `npm start -w server` (API).

Other commands: `npm run lint`, `npm run images` (regenerates the placeholder images).

## Data model

```
products/{productId}        title, description, brand, category, categoryName, price, originalPrice,
                            discountPercentage, rating, stock, images[], thumbnail, specs[], searchKeywords[]
categories/{slug}           name, count
users/{uid}                 email, displayName, createdAt, lastLoginAt
carts/{uid}/items/{productId}   quantity, createdAt, updatedAt
```

Cart documents hold only a product id and a quantity. Prices and totals are read from `products` on every request, so a client can never set its own price.

### How catalog queries work on Firestore

- **Search:** Firestore has no full-text search, so each product stores every prefix (2 to 20 characters) of every word in its title, brand and category in `searchKeywords`. A search uses `array-contains` on the longest word, so "cush" finds "Cushion". For multi-word searches the other words are matched on the rows Firestore returns (capped at 500 documents).
- **Category and sort:** an equality filter on `category` plus `orderBy` on `rating` or `price`. Each combination has an index in `firestore.indexes.json`.
- **Pagination and count:** `offset` and `limit` for the page, and a `count()` aggregation for the total.
- **Scaling note:** offset paging re-reads skipped documents. For a catalog of thousands of products, switch to cursor paging with `startAfter`, and a dedicated search service such as Algolia or Typesense.

## API

Base URL `http://localhost:4000/api`. Errors always look like:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Request validation failed", "details": [{ "field": "sort", "message": "Invalid option" }] } }
```

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/health` | no | Liveness check |
| GET | `/products` | no | Search, filter, sort, paginate |
| GET | `/products/:id` | no | One product |
| GET | `/categories` | no | Categories with product counts |
| GET | `/me` | yes | Verifies the token and syncs `users/{uid}` |
| GET | `/cart` | yes | The caller's cart with totals |
| POST | `/cart/items` | yes | Add a product (adds to the existing line) |
| PATCH | `/cart/items/:productId` | yes | Set a line's quantity |
| DELETE | `/cart/items/:productId` | yes | Remove a line |

Authenticated routes need `Authorization: Bearer <Firebase ID token>`.

### `GET /products`

| Query | Values | Default |
| --- | --- | --- |
| `search` | text, up to 80 characters | none |
| `category` | category slug, for example `ceramics` | all |
| `sort` | `rating_desc`, `price_asc`, `price_desc` | `rating_desc` |
| `page` | 1 to 500 | 1 |
| `limit` | 1 to 48 | 9 |

```bash
curl "http://localhost:4000/api/products?category=lighting&sort=price_asc&limit=2"
```
```json
{
  "data": [
    { "id": "paper-dome-pendant", "title": "Paper Dome Pendant", "brand": "Linden Works", "category": "lighting",
      "categoryName": "Lighting", "price": 96, "originalPrice": null, "discountPercentage": 0, "rating": 4.4,
      "stock": 14, "images": ["/products/paper-dome-pendant-1.svg", "..."], "thumbnail": "/products/paper-dome-pendant-1.svg",
      "specs": [{ "label": "Material", "value": "Rice paper, steel frame" }], "description": "..." }
  ],
  "meta": { "page": 1, "limit": 2, "total": 4, "totalPages": 2, "hasNextPage": true, "hasPrevPage": false }
}
```

### `GET /products/:id`

Returns `{ "data": { ...product } }`, or `404` with code `NOT_FOUND`.

### Cart

```bash
curl -X POST http://localhost:4000/api/cart/items \
  -H "Authorization: Bearer $ID_TOKEN" -H "Content-Type: application/json" \
  -d '{"productId":"sage-stoneware-mug","quantity":2}'
```
```json
{ "data": { "itemCount": 2, "subtotal": 56,
  "items": [{ "productId": "sage-stoneware-mug", "quantity": 2, "lineTotal": 56,
              "product": { "id": "sage-stoneware-mug", "title": "Sage Stoneware Mug", "brand": "Kiln & Field",
                           "categoryName": "Ceramics", "price": 28, "originalPrice": null, "thumbnail": "/products/sage-stoneware-mug-1.svg", "stock": 42 } }] } }
```

Every cart route returns the full updated cart. `PATCH` takes `{ "quantity": 3 }`.

| Status | Code | When |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR`, `INVALID_JSON` | Bad body, query or id |
| 401 | `UNAUTHORIZED` | Missing, invalid or expired token |
| 404 | `NOT_FOUND` | Unknown product, or a line that is not in the caller's cart |
| 409 | `OUT_OF_STOCK`, `QUANTITY_LIMIT` | Stock is 0, or the line would exceed the stock or the 10-per-line cap |
| 500 | `INTERNAL_ERROR`, `INDEX_REQUIRED` | Server fault, or a Firestore index is missing |

## Security approach

- **Passwords:** handled only by Firebase Authentication (salted scrypt hashing). We store no password or hash.
- **Server-side authentication:** `requireAuth` verifies the ID token with the Admin SDK on every cart request.
- **Authorization:** cart paths are built from the verified `uid` (`carts/{uid}/items/...`). No route accepts a user or cart id, so there is nothing a client can change to reach another user's cart. Another user's line returns `404` because it does not exist in the caller's cart.
- **Validation:** every query, param and body is parsed with zod; unknown fields are ignored; quantities are integers from 1 to 10 and checked against stock inside a Firestore transaction.
- **Server-calculated money:** totals are computed in integer cents from database prices.
- **Secrets:** service-account values live only in `server/.env`, which is git-ignored. The frontend bundle contains Firebase web config only, which is public by design.
- **Firestore rules:** deny all direct client reads and writes.
- **Other:** `helmet` headers, CORS limited to `CLIENT_ORIGIN`, 10 kB JSON body limit.

## shadcn/ui components

Customised to the Forme palette (2px radius, hairline borders, forest-green primary):

- `Card` for product cards and the order summary
- `Button` for actions, pagination and the quantity stepper
- `Input` for search and all form fields
- `Badge` for sale and sold-out labels (with a new `sale` variant)
- `Table` for the cart
- `Skeleton` (added) for loading states

## Design notes

- Fonts are Inter (interface) and DM Serif Display (headings), self-hosted through `@fontsource`, so no request goes to Google Fonts.
- The palette follows the brief. One deviation: `#777873` measures 4.15:1 on `#F8F7F4`, under the 4.5:1 WCAG AA minimum for body text, so secondary text uses `#6A6B66` (5.0:1). Sale-coloured text uses `#9C4838`, a darker step of the same terracotta, for the same reason. `#B85C4A` is kept for badges and dots.
- Product photography is generated: `npm run images` writes simple still-life SVGs to `public/products/`. To use real photos, change the `images` URLs in `server/src/seed/products.ts` and run `npm run seed`.

## Verification checklist

1. **Sign up:** open `/register`, create an account. You land on the catalog and the header shows your name.
2. **Browse:** the catalog shows 9 of 24 products with three columns on desktop. Page 2 and 3 load from the pager.
3. **Server-side filtering:** pick Lighting (4 products). Open the browser network tab: each change is a new `GET /api/products?...` request. Search "mug", then "cush". Sort by price both ways.
4. **Details:** open a product. Check the gallery, price, discount (for example Ribbed Bud Vase, 20% off), rating and stock. Brass Task Lamp shows Out of stock with a disabled button.
5. **Add to cart:** add 2 Sage Stoneware Mugs. The header count becomes 2.
6. **Quantity and subtotal:** in `/cart`, use + and −. The line total and subtotal update (2 x $28.00 = $56.00).
7. **Remove:** remove a line; the cart updates. Remove the last one to see the empty state.
8. **Persistence:** add a product, refresh the page, then log out, close the tab, log in again. The cart is still there.
9. **Logout and protection:** log out; the header count resets and `/cart` redirects to `/login`.
10. **Ownership:** with two accounts, the second account's cart never shows the first account's items. Calling `PATCH /api/cart/items/<id>` with the second account's token for a product only the first account holds returns `404`.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Page says "Firebase isn't configured yet" | Fill in `.env` (root), then restart `npm run dev` |
| `Invalid server environment` on `npm run server` | Fill in `server/.env`. `FIREBASE_PROJECT_ID` is required. |
| `Cannot find native binding` or similar after install | Delete `node_modules` and `package-lock.json`, then run `npm install` again (npm optional-dependency bug) |
| `INDEX_REQUIRED` or `FAILED_PRECONDITION` | Deploy `firestore.indexes.json` and wait for the indexes to finish building |
| `Error: Could not load the default credentials` or `invalid_grant` | Check `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` (key in quotes, `\n` kept), or `GOOGLE_APPLICATION_CREDENTIALS` |
| Catalog shows "Can't reach the server" | Start the API with `npm run server`; check the port matches the proxy in `vite.config.ts` |
| CORS error in production | Set `CLIENT_ORIGIN` on the server to your site's exact origin |
| Sign-up says sign-in is turned off | Enable Email/Password in Firebase Authentication |
| Empty catalog | Run `npm run seed` against the same Firebase project |
| Login works but cart calls return 401 | The server and the web app must use the same Firebase project |

## Known limitations

- Checkout and payment are out of scope; the cart ends at the subtotal.
- Prices are shown in USD.
- Search matches word prefixes in title, brand and category, not descriptions or typos.
- Offset pagination, as noted above.
- No automated test suite is included.

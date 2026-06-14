# 🚗 RentCar — Online Vehicle Booking Platform

A complete **Vite + React** frontend for a rent-a-car / seat-booking application.
Drivers sign up, create a profile, post their vehicle (Car, SUV, Van or Bus) on a
city-to-city route, and accept online bookings. Passengers sign up, browse listings,
pick exact seats from a live seat map, and pay online.

> The frontend is wired to a **REST API backend** through the service layer in
> `src/services/`. Configure the API base URL with `VITE_API_URL`
> (default `http://localhost:5000/api`). See [Backend integration](#-backend-integration).

---

## ✨ Features

### For Drivers
- Sign up & build a driver profile (license number, experience, phone)
- Post a vehicle with **type** (Car / SUV / Van / Bus), name, registration, **route** (from → to city), date, time, seat count, price per seat and amenities
- Driver **dashboard** with stats (listings, bookings, seats booked, revenue)
- Edit / delete listings and view incoming bookings in a table

### For Passengers
- Sign up & browse all available vehicles
- Search & filter by departure city, destination, date and vehicle type; sort by price / rating / time
- **Vehicle details** page with a live, interactive **seat map**
- Multi-step checkout: **Review → Payment → Confirmation**
- Multiple (mock) payment methods: card, mobile wallet, cash on boarding
- **My Bookings** page with ticket cards and seat cancellation

### Shared
- Role-aware navigation, protected routes, responsive design (mobile-friendly)
- Polished landing page (hero search, vehicle types, how-it-works, featured trips)

---

## 🛠 Tech Stack

| Concern        | Choice                          |
| -------------- | ------------------------------- |
| Build tool     | Vite                            |
| UI library     | React 18                        |
| Routing        | react-router-dom v6             |
| Icons          | react-icons                     |
| State          | React Context API               |
| Styling        | Hand-written CSS design system  |
| Data           | REST API backend (JWT auth)     |

---

## 🚀 Getting Started

> Start the **backend** first (default `http://localhost:5000`), then:

```bash
# (optional) point the app at a different API
cp .env.example .env   # edit VITE_API_URL if your backend isn't on :5000

# install dependencies
npm install

# start the dev server (http://localhost:5173)
npm run dev

# production build
npm run build

# preview the production build
npm run preview
```

### Accounts
Sign up as a **driver** to post vehicles, or as a **passenger** to book seats.
Any seeded demo accounts depend on the backend's seed script — check the backend
project for credentials.

---

## 📁 Project Structure

```
src/
├── main.jsx                 # App entry; wires providers + router
├── App.jsx                  # Route definitions
├── index.css                # Global styles & design system
├── components/              # Reusable UI
│   ├── Navbar.jsx  Footer.jsx  ScrollToTop.jsx
│   ├── ProtectedRoute.jsx   # Auth + role guard
│   ├── SearchBar.jsx        # Route search / filter form
│   ├── VehicleCard.jsx      # Listing card
│   ├── SeatMap.jsx          # Interactive seat picker
│   ├── Stepper.jsx  StarRating.jsx  EmptyState.jsx
├── context/
│   ├── AuthContext.jsx      # Current user, login/signup/logout
│   └── BookingContext.jsx   # In-progress booking draft
├── pages/                   # Route screens
│   ├── Home.jsx  Login.jsx  Signup.jsx
│   ├── VehicleListings.jsx  VehicleDetails.jsx
│   ├── Booking.jsx  Payment.jsx  BookingConfirmation.jsx
│   ├── MyBookings.jsx  DriverDashboard.jsx  PostVehicle.jsx
│   ├── Profile.jsx  NotFound.jsx
├── services/                # API layer (talks to the backend)
│   ├── apiClient.js         # fetch wrapper: base URL, JWT, error handling
│   ├── authService.js       # signup / login / me / profile
│   ├── vehicleService.js    # listing CRUD + search
│   └── bookingService.js    # create / cancel / list bookings
├── data/
│   ├── constants.js         # vehicle types, amenities, roles
│   └── cities.js            # selectable cities
└── utils/
    └── format.js            # currency / date / time helpers
```

---

## 🔌 Backend Integration

All network access lives behind the **`src/services/`** layer; pages and
components never call `fetch` directly. `apiClient.js` centralizes the base URL,
attaches the JWT (`Authorization: Bearer <token>`), and turns failures into
thrown `Error(message)` values the pages already handle.

Endpoints consumed (base URL = `VITE_API_URL`, default `http://localhost:5000/api`):

| Service            | Endpoint(s)                                                        |
| ------------------ | ------------------------------------------------------------------ |
| `authService`      | `POST /auth/signup`, `POST /auth/login`, `GET /auth/me`, `PATCH /users/:id` |
| `vehicleService`   | `GET /vehicles` (query filters), `GET /vehicles/:id`, `POST /vehicles`, `PATCH /vehicles/:id`, `DELETE /vehicles/:id` |
| `bookingService`   | `GET /bookings?userId=`, `GET /bookings?driverId=`, `POST /bookings`, `PATCH /bookings/:id/cancel` |

Expected response shapes:
- Auth: `{ token, user }` on signup/login, `{ user }` on `/auth/me`.
- Vehicles/bookings: the entity or array, optionally wrapped in `{ data }` /
  `{ vehicle(s) }` / `{ booking(s) }` (the client unwraps either form).
- The client maps Mongo's `_id` to `id` automatically if present.

The backend must enable **CORS** for the frontend origin and hash passwords.

### Payments (JazzCash redirect flow)
`POST /bookings` with `paymentMethod: "jazzcash"` returns a booking whose
`payment.redirectUrl` points at the gateway. The Payment page sends the browser
there; after paying, JazzCash → backend callback → redirects back to:

```
CLIENT_ORIGIN + CLIENT_PAYMENT_RETURN_PATH?bookingId=…&status=success|failed&ref=…
```

The frontend serves that landing page at **`/payment/return`** (`PaymentReturn.jsx`),
which reads the final booking via `GET /bookings/:id` and shows the confirmation
(success) or a retry screen (failure). Configure the backend so:

- `CLIENT_ORIGIN` = the frontend origin (e.g. `http://localhost:5173`)
- `CLIENT_PAYMENT_RETURN_PATH` = `/payment/return`

Methods that settle immediately (card / cash) return a confirmed booking with no
`payment.redirectUrl`, and go straight to the confirmation screen.

---

## 📌 Notes
- The auth token is stored in `localStorage` under `rentcar_token`; a `401`
  response clears it automatically.
- The seat map layout (rows / aisle) is driven by each vehicle type in
  `data/constants.js`.

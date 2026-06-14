# 🚗 RentCar — Online Vehicle Booking Platform

A complete **Vite + React** frontend for a rent-a-car / seat-booking application.
Drivers sign up, create a profile, post their vehicle (Car, SUV, Van or Bus) on a
city-to-city route, and accept online bookings. Passengers sign up, browse listings,
pick exact seats from a live seat map, and pay online.

> This is a **frontend-only** app. Data is persisted in the browser via
> `localStorage` through a mock service layer that is designed to be swapped for a
> real REST API with minimal changes (see [Backend integration](#-backend-integration)).

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
| Persistence    | `localStorage` (mock backend)   |

---

## 🚀 Getting Started

```bash
# install dependencies
npm install

# start the dev server (http://localhost:5173)
npm run dev

# production build
npm run build

# preview the production build
npm run preview
```

### Demo accounts
Two seeded **driver** accounts are available (or create your own):

| Email             | Password   |
| ----------------- | ---------- |
| `ahmed@driver.com`| `password` |
| `sara@driver.com` | `password` |

Sign up as a **passenger** to test the booking flow. To reset all demo data,
clear the site's `localStorage`.

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
├── services/                # 👈 the API layer to replace
│   ├── storage.js           # localStorage "database" + seeding
│   ├── authService.js       # signup / login / profile
│   ├── vehicleService.js    # listing CRUD + search
│   └── bookingService.js    # create / cancel / list bookings
├── data/
│   ├── constants.js         # vehicle types, amenities, roles
│   ├── cities.js            # selectable cities
│   └── seedData.js          # demo users & vehicles
└── utils/
    └── format.js            # currency / date / time helpers
```

---

## 🔌 Backend Integration

All persistence lives behind the **`src/services/`** layer. Each function is
already `async` and returns the shapes the UI expects, so swapping in your REST
API is a localized change — the pages and components don't need to change.

For example, in `authService.js`:

```js
// Before (mock)
export async function login({ email, password }) {
  await delay()
  /* ...localStorage lookup... */
  return sanitize(user)
}

// After (real API)
export async function login({ email, password }) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error((await res.json()).message)
  return res.json() // { id, name, email, role, ... }
}
```

Suggested endpoints to implement on the backend:

| Service            | Endpoint(s)                                                        |
| ------------------ | ------------------------------------------------------------------ |
| `authService`      | `POST /auth/signup`, `POST /auth/login`, `GET /auth/me`, `PATCH /users/:id` |
| `vehicleService`   | `GET /vehicles` (query filters), `GET /vehicles/:id`, `POST /vehicles`, `PATCH /vehicles/:id`, `DELETE /vehicles/:id` |
| `bookingService`   | `GET /bookings?userId=`, `GET /bookings?driverId=`, `POST /bookings`, `PATCH /bookings/:id/cancel` |

Add `VITE_API_URL` to a `.env` file and replace the bodies in the four service
files. Once done, `storage.js` and `data/seedData.js` can be deleted.

---

## 📌 Notes
- Passwords are stored in plain text **only** in the mock layer for demo purposes —
  the real backend must hash them.
- The seat map layout (rows / aisle) is driven by each vehicle type in
  `data/constants.js`.

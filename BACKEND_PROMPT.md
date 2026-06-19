# Backend Build Prompt — gaadi.pk (Online Vehicle Seat-Booking Platform)

> Copy everything below the line and give it to your AI. A React frontend already
> exists and expects the **exact** endpoints and JSON field names defined here, so
> the two will integrate with no changes. The stack is a recommendation — change
> the one "Tech stack" line if you prefer something else; everything else (models,
> endpoints, rules) stays the same.

---

You are a senior backend engineer. Build a complete, production-ready **REST API**
for **"gaadi.pk"**, an online vehicle seat-booking platform. A React frontend
already exists and consumes the endpoints and JSON shapes defined in this document
— implement them **exactly** (same paths, same field names, same value formats) so
the frontend works without modification.

## 1. Tech stack (recommended — swap if you prefer)
- **Node.js + Express** for the API
- **MongoDB + Mongoose** for the database (or PostgreSQL + Prisma — keep the same API contract)
- **JWT** for authentication, **bcrypt** for password hashing
- **express-validator** (or Zod/Joi) for request validation
- **cors**, **dotenv**, **helpers** for config and security
- Provide a `package.json`, `.env.example`, and a README with run instructions

## 2. Product overview
gaadi.pk connects **drivers** who post vehicles on routes to Gilgit-Baltistan
(Hunza, Gilgit, Skardu, Ghizer) — from across GB and from cities like Islamabad,
Rawalpindi and Lahore — with **passengers** who book individual seats and pay online.

There are two user roles:
- **Driver** — signs up, creates a profile, posts vehicles (Car / SUV / Van / Bus)
  on a city-to-city route with a schedule, seat count, price per seat and amenities;
  manages their listings; views bookings made on their vehicles.
- **Passenger** — signs up, browses/searches listings, selects specific seats from a
  seat map, books, pays, and manages their bookings.

## 3. User flows / features to support

### Authentication
1. A visitor signs up as either a **driver** or a **passenger**.
2. Drivers additionally provide `licenseNumber` and `experience` (years).
3. Users log in with email + password and receive a **JWT**.
4. The current user can be fetched from the token and can update their profile.

### Driver flow
5. A logged-in driver **creates a vehicle listing**: vehicle type, name/model,
   registration number, from-city, to-city, departure date, departure time, total
   seats, price per seat, and a list of amenities.
6. A driver can **edit** and **delete** their own listings (and only their own).
7. A driver sees a **dashboard**: their vehicles with occupancy, plus all bookings
   made against their vehicles, and aggregate stats (listings, bookings, seats
   booked, revenue) — stats may be computed client-side from these endpoints.

### Passenger flow
8. Anyone can **browse and search** vehicle listings, filtered by from-city,
   to-city, vehicle type and date.
9. A passenger opens a listing and sees which seats are already taken.
10. A passenger **selects one or more available seats** and **creates a booking**,
    choosing a payment method (card / wallet / cash). Payment itself is mocked — no
    real gateway is required, but design the booking endpoint so a real payment
    step can be added later.
11. On booking: the chosen seats become unavailable, a unique **booking reference**
    is generated, and the total is computed.
12. A passenger sees **"My Bookings"** and can **cancel** a booking, which
    **releases the seats** back to the vehicle.

## 4. Data models

> Expose the primary key as a **string field named `id`** in all JSON responses
> (not `_id`). Never return password hashes.

### User
| Field          | Type     | Notes                                                        |
| -------------- | -------- | ------------------------------------------------------------ |
| `id`           | string   | Primary key                                                  |
| `name`         | string   | Required                                                     |
| `email`        | string   | Required, **unique**, lowercased                             |
| `password`     | string   | Required, **bcrypt-hashed**, never returned                  |
| `role`         | string   | `"driver"` or `"passenger"`, required                        |
| `phone`        | string   | Optional                                                     |
| `licenseNumber`| string   | Driver only                                                  |
| `experience`   | number   | Driver only (years)                                          |
| `createdAt`    | ISO date | Set by server                                                |

### Vehicle (a listing)
| Field          | Type        | Notes                                                     |
| -------------- | ----------- | --------------------------------------------------------- |
| `id`           | string      | Primary key                                               |
| `driverId`     | string      | Owner (User id), set from the JWT                         |
| `driverName`   | string      | Denormalized from the owner for easy display              |
| `driverPhone`  | string      | Denormalized from the owner                               |
| `vehicleType`  | string      | One of `"car" | "suv" | "van" | "bus"`                     |
| `vehicleName`  | string      | e.g. "Toyota Hiace Grand Cabin"                           |
| `vehicleNumber`| string      | Registration number                                       |
| `fromCity`     | string      | Departure city                                            |
| `toCity`       | string      | Destination city (must differ from `fromCity`)            |
| `date`         | string      | Departure date, format **`YYYY-MM-DD`**                   |
| `time`         | string      | Departure time, 24h format **`HH:MM`**                    |
| `totalSeats`   | number      | Integer ≥ 1                                               |
| `pricePerSeat` | number      | In PKR, ≥ 0                                               |
| `amenities`    | string[]    | e.g. `["Air Conditioning","WiFi"]`                        |
| `bookedSeats`  | number[]    | Seat numbers already taken, e.g. `[3,4,12]`; default `[]` |
| `rating`       | number      | 0–5; default `0`                                          |
| `createdAt`    | ISO date    | Set by server                                             |

Seat numbers are integers from `1` to `totalSeats`.

### Booking
| Field           | Type      | Notes                                                       |
| --------------- | --------- | ----------------------------------------------------------- |
| `id`            | string    | Primary key                                                 |
| `bookingRef`    | string    | Short human-friendly ref, e.g. `"RC48571203"`               |
| `vehicleId`     | string    | The booked vehicle                                          |
| `driverId`      | string    | Owner of the vehicle (for driver dashboard queries)         |
| `userId`        | string    | Passenger who booked, from the JWT                          |
| `passengerName` | string    | Denormalized passenger name                                 |
| `vehicleName`   | string    | Denormalized for display on tickets                         |
| `vehicleType`   | string    | Denormalized                                                |
| `fromCity`      | string    | Denormalized                                                |
| `toCity`        | string    | Denormalized                                                |
| `date`          | string    | `YYYY-MM-DD`, denormalized                                  |
| `time`          | string    | `HH:MM`, denormalized                                       |
| `seats`         | number[]  | Booked seat numbers                                         |
| `pricePerSeat`  | number    | Snapshot at booking time                                    |
| `subtotal`      | number    | `seats.length * pricePerSeat`                               |
| `serviceFee`    | number    | 3% of subtotal, rounded                                     |
| `totalAmount`   | number    | `subtotal + serviceFee`                                     |
| `status`        | string    | `"confirmed"` or `"cancelled"`; default `"confirmed"`       |
| `paymentMethod` | string    | `"card" | "wallet" | "cash"`                                |
| `paidAt`        | ISO date  | Set when booking is created                                 |
| `createdAt`     | ISO date  | Set by server                                               |

## 5. REST API contract

Base path: `/api`. All protected routes require an
`Authorization: Bearer <token>` header. Use JSON request/response bodies.

### Auth
| Method | Path              | Auth        | Body                                                                 | Returns |
| ------ | ----------------- | ----------- | -------------------------------------------------------------------- | ------- |
| POST   | `/auth/signup`    | Public      | `{ name, email, password, role, phone, licenseNumber?, experience? }`| `{ token, user }` |
| POST   | `/auth/login`     | Public      | `{ email, password }`                                                | `{ token, user }` |
| GET    | `/auth/me`        | Any user    | —                                                                    | `{ user }` |
| PATCH  | `/users/:id`      | Owner       | `{ name?, phone?, licenseNumber?, experience? }`                     | `{ user }` |

`user` is the User object **without** `password`.

### Vehicles
| Method | Path             | Auth          | Body / Query                                                                                  | Returns |
| ------ | ---------------- | ------------- | -------------------------------------------------------------------------------------------- | ------- |
| GET    | `/vehicles`      | Public        | Query: `fromCity?`, `toCity?`, `vehicleType?`, `date?`, `driverId?`                           | `Vehicle[]` (sorted by date+time ascending) |
| GET    | `/vehicles/:id`  | Public        | —                                                                                            | `Vehicle` |
| POST   | `/vehicles`      | Driver        | `{ vehicleType, vehicleName, vehicleNumber, fromCity, toCity, date, time, totalSeats, pricePerSeat, amenities }` | `Vehicle` |
| PATCH  | `/vehicles/:id`  | Driver (owner)| Any subset of the create fields                                                              | `Vehicle` |
| DELETE | `/vehicles/:id`  | Driver (owner)| —                                                                                            | `204` / `{ success: true }` |

On `POST /vehicles`, the server sets `driverId`, `driverName`, `driverPhone` from
the authenticated user, and initializes `bookedSeats: []` and `rating: 0`.
The `GET /vehicles?driverId=` form powers the driver dashboard.

### Bookings
| Method | Path                    | Auth             | Body / Query                                  | Returns |
| ------ | ----------------------- | ---------------- | --------------------------------------------- | ------- |
| GET    | `/bookings`             | Any user         | Query: `userId?` **or** `driverId?`           | `Booking[]` (newest first) |
| GET    | `/bookings/:id`         | Owner/driver     | —                                             | `Booking` |
| POST   | `/bookings`             | Passenger        | `{ vehicleId, seats: number[], paymentMethod }`| `Booking` |
| PATCH  | `/bookings/:id/cancel`  | Owner (passenger)| —                                             | `Booking` (status `"cancelled"`) |

`POST /bookings` logic (do this transactionally / atomically):
1. Look up the vehicle; 404 if missing.
2. Reject if any requested seat is already in `vehicle.bookedSeats` (return `409`
   with a message naming the clashing seats) — this prevents double-booking under
   concurrency.
3. Add the seats to `vehicle.bookedSeats`.
4. Compute `subtotal`, `serviceFee` (3%), `totalAmount`.
5. Generate `bookingRef`, snapshot the denormalized trip fields, set
   `status: "confirmed"` and `paidAt`.
6. Return the created `Booking`.

`PATCH /bookings/:id/cancel` sets `status: "cancelled"` and removes that booking's
seats from the vehicle's `bookedSeats`.

## 6. Authentication & authorization rules
- Hash passwords with bcrypt; never store or return plaintext.
- Issue a JWT on signup and login containing at least `{ id, role }`.
- Middleware to (a) require a valid token and (b) require a specific role.
- **Ownership checks**: a driver may only edit/delete their own vehicles; a
  passenger may only cancel/view their own bookings; a user may only update their
  own profile. Return `403` otherwise.
- Only **passengers** may create bookings; only **drivers** may create vehicles.

## 7. Validation & business rules
- `email` must be unique and valid; reject duplicates with `409`.
- `password` minimum length 6.
- On vehicles: `fromCity !== toCity`; `totalSeats >= 1`; `pricePerSeat >= 0`;
  `vehicleType` must be one of the four allowed values; `date` not in the past.
- On bookings: every requested seat must be within `1..totalSeats`, unique, and not
  already booked.
- Validate request bodies and return clear field-level error messages.

## 8. Cross-cutting requirements
- **CORS** enabled for the frontend origin (configurable via env).
- Consistent error response shape: `{ "message": "..." }` (the frontend reads
  `message`). Use proper status codes (`400/401/403/404/409/500`).
- Config via environment variables: `PORT`, `MONGODB_URI` (or `DATABASE_URL`),
  `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_ORIGIN`.
- Add a **seed script** that inserts a couple of demo drivers and several vehicles
  so the listings aren't empty (mirroring a typical demo dataset).
- Sensible folder structure (e.g. `models/`, `routes/`, `controllers/`,
  `middleware/`, `config/`), plus a README explaining setup, env vars, and how to
  run the server and the seed script.

## 9. Reference data (for validation / seeds)
- **Vehicle types:** `car`, `suv`, `van`, `bus`
- **Amenities:** Air Conditioning, WiFi, Charging Port, Reclining Seats, Water
  Bottle, Music System, Luggage Space, Reading Light
- **Locations** (Gilgit-Baltistan + major cities/transit): Gilgit, Hunza, Skardu,
  Ghizer, Nagar, Astore, Chilas, Khaplu, Gahkuch, Islamabad, Rawalpindi, Lahore,
  Abbottabad, Mansehra, Besham, Naran

## 10. Frontend integration notes
- The frontend already has a service layer with these calls:
  `signup`, `login`, `getCurrentUser`, `updateProfile`; `getVehicles(filters)`,
  `getVehicleById`, `getVehiclesByDriver`, `createVehicle`, `updateVehicle`,
  `deleteVehicle`; `getBookingById`, `getBookingsByUser`, `getBookingsByDriver`,
  `createBooking`, `cancelBooking`. Map your endpoints to these one-to-one.
- The frontend stores the JWT and sends it as `Authorization: Bearer <token>`, and
  reads the user object from the `user` field of the auth responses.
- Keep all date strings as `YYYY-MM-DD` and times as `HH:MM` (24h) so the existing
  formatters work.

**Deliverables:** the full backend source, `package.json`, `.env.example`, a seed
script, and a README. Make it runnable with `npm install` then `npm run dev`.

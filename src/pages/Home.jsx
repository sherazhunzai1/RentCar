import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FaSearch,
  FaChair,
  FaCreditCard,
  FaUserPlus,
  FaRoute,
  FaShieldAlt,
  FaTags,
  FaHeadset,
  FaArrowRight,
  FaMountain,
} from 'react-icons/fa'
import SearchBar from '../components/SearchBar'
import VehicleCard from '../components/VehicleCard'
import { VEHICLE_TYPES } from '../data/constants'
import { POPULAR_ROUTES, routeHref } from '../data/popularRoutes'
import { getVehicles } from '../services/vehicleService'
import { useAuth } from '../context/AuthContext'
import Seo from '../components/Seo'

export default function Home() {
  const navigate = useNavigate()
  const { isAuthenticated, isDriver } = useAuth()
  const [search, setSearch] = useState({
    fromCity: '',
    toCity: '',
    date: '',
    vehicleType: '',
  })
  const [featured, setFeatured] = useState([])

  useEffect(() => {
    getVehicles().then((all) => setFeatured(all.slice(0, 3)))
  }, [])

  const runSearch = (values) => {
    const params = new URLSearchParams()
    Object.entries(values).forEach(([k, v]) => v && params.set(k, v))
    navigate(`/vehicles?${params.toString()}`)
  }

  return (
    <div className="home">
      <Seo path="/" />
      {/* Hero */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="hero-eyebrow">Gilgit-Baltistan &amp; beyond — apni seat, apni gaadi</span>
            <h1>
              Book your seat to<br />
              <span className="accent">Hunza, Gilgit &amp; Skardu.</span>
            </h1>
            <p>
              Reserve seats or a whole vehicle to Gilgit-Baltistan — Hunza, Gilgit, Skardu and
              Ghizer — from across GB and from Islamabad, Rawalpindi and Lahore. Pick your seat
              and pay online.
            </p>
            <div className="hero-actions">
              <Link to="/vehicles" className="btn btn-primary btn-lg">
                <FaSearch /> Find a Ride
              </Link>
              {!isAuthenticated && (
                <Link to="/signup" className="btn btn-outline btn-lg">
                  Become a Driver
                </Link>
              )}
            </div>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <strong>20+</strong>
              <span>Routes across GB</span>
            </div>
            <div className="stat">
              <strong>500+</strong>
              <span>Seats booked weekly</span>
            </div>
            <div className="stat">
              <strong>4.8★</strong>
              <span>Avg. driver rating</span>
            </div>
          </div>
        </div>

        <div className="container hero-search">
          <SearchBar values={search} onChange={setSearch} onSubmit={runSearch} />
        </div>
      </section>

      {/* Vehicle types */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Choose your ride</h2>
            <p>From shared cars to full coaches for the long haul up to the mountains of GB.</p>
          </div>
          <div className="type-grid">
            {VEHICLE_TYPES.map((t) => {
              const Icon = t.icon
              return (
                <Link
                  key={t.id}
                  to={`/vehicles?vehicleType=${t.id}`}
                  className="type-card"
                >
                  <div className="type-icon">
                    <Icon />
                  </div>
                  <h3>{t.label}</h3>
                  <p>{t.description}</p>
                  <span className="type-link">
                    Browse <FaArrowRight />
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Popular routes */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Popular routes to Gilgit-Baltistan</h2>
            <p>Book seats or a whole vehicle on the most-travelled routes up north.</p>
          </div>
          <div className="route-card-grid">
            {POPULAR_ROUTES.map((route) => (
              <Link
                key={`${route.from}-${route.to}`}
                to={routeHref(route)}
                className="route-card"
                aria-label={`Vehicles from ${route.from} to ${route.to}`}
              >
                <div className="route-card-cities">
                  <span className="route-card-from">{route.from}</span>
                  <FaArrowRight className="route-card-arrow" />
                  <span className="route-card-to">
                    <FaMountain /> {route.to}
                  </span>
                </div>
                <span className="route-card-go">
                  Find seats <FaArrowRight />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section section-muted">
        <div className="container">
          <div className="section-head">
            <h2>How it works</h2>
            <p>Booking a seat takes less than two minutes.</p>
          </div>
          <div className="steps">
            <div className="step">
              <div className="step-icon"><FaUserPlus /></div>
              <span className="step-num">1</span>
              <h3>Create an account</h3>
              <p>Sign up as a passenger to book, or as a driver to post your vehicle and routes.</p>
            </div>
            <div className="step">
              <div className="step-icon"><FaRoute /></div>
              <span className="step-num">2</span>
              <h3>Find your route</h3>
              <p>Search GB routes — Hunza, Gilgit, Skardu, Ghizer — then compare vehicles, times and prices.</p>
            </div>
            <div className="step">
              <div className="step-icon"><FaChair /></div>
              <span className="step-num">3</span>
              <h3>Pick your seat</h3>
              <p>Choose your exact seats from a live seat map and see the total instantly.</p>
            </div>
            <div className="step">
              <div className="step-icon"><FaCreditCard /></div>
              <span className="step-num">4</span>
              <h3>Pay & go</h3>
              <p>Confirm with secure online payment and get your booking reference right away.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="section">
        <div className="container">
          <div className="section-head section-head-row">
            <div>
              <h2>Trips departing soon</h2>
              <p>Grab a seat on these upcoming journeys.</p>
            </div>
            <Link to="/vehicles" className="btn btn-ghost">
              View all <FaArrowRight />
            </Link>
          </div>
          <div className="card-grid">
            {featured.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="section section-muted">
        <div className="container">
          <div className="section-head">
            <h2>Why ride with gaadi.pk</h2>
          </div>
          <div className="feature-grid">
            <div className="feature">
              <FaShieldAlt className="feature-icon" />
              <h3>Verified drivers</h3>
              <p>Every driver has a profile with license details, experience and ratings.</p>
            </div>
            <div className="feature">
              <FaTags className="feature-icon" />
              <h3>Transparent pricing</h3>
              <p>Pay per seat with no hidden fees. See the full breakdown before you book.</p>
            </div>
            <div className="feature">
              <FaChair className="feature-icon" />
              <h3>Pick your seat</h3>
              <p>Live seat maps let you choose exactly where you sit on every vehicle.</p>
            </div>
            <div className="feature">
              <FaHeadset className="feature-icon" />
              <h3>Here to help</h3>
              <p>Manage and track all your bookings from one simple dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      {!isDriver && (
        <section className="cta-band">
          <div className="container cta-inner">
            <div>
              <h2>Drive the GB routes? Start earning today.</h2>
              <p>List your car, van or bus on routes to Hunza, Gilgit, Skardu and Ghizer, set your price, and accept online bookings.</p>
            </div>
            <Link to={isAuthenticated ? '/driver/post' : '/signup'} className="btn btn-light btn-lg">
              Post Your Vehicle
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}

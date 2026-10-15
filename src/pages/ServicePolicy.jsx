import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import { COMPANY } from '../data/company'

export default function ServicePolicy() {
  return (
    <div className="container narrow section legal-page">
      <Seo
        title="Shipping & Service Policy"
        description="How gaadi.pk delivers its booking service — no physical shipping; digital reservations for seats and vehicles across Gilgit-Baltistan."
        path="/service-policy"
      />

      <div className="page-title-block">
        <h1>Shipping &amp; Service Policy</h1>
        <p className="legal-updated">Last updated: 15 October 2026</p>
      </div>

      <div className="legal-prose">
        <p>
          This Shipping &amp; Service Policy describes how {COMPANY.name} delivers its services.
          gaadi.pk is a digital marketplace for intercity seat and vehicle bookings. We do not sell
          or ship physical products.
        </p>

        <h2>1. No physical shipping</h2>
        <p>
          We do not dispatch parcels, goods or merchandise. There are no shipping charges, delivery
          carriers or tracking numbers for physical items. Any &quot;delivery&quot; of value on
          gaadi.pk is the confirmation of a booking and access to trip details through your
          account.
        </p>

        <h2>2. What we provide</h2>
        <ul>
          <li>
            An online Platform where passengers can search routes, select seats or a whole vehicle,
            and pay.
          </li>
          <li>
            Tools for independent drivers to list vehicles, routes, prices and available seats.
          </li>
          <li>
            Booking confirmation, in-app messaging for confirmed trips, and payment facilitation
            through third-party payment providers.
          </li>
        </ul>
        <p>
          The road transport itself is performed by the driver you book — not by gaadi.pk as a
          carrier.
        </p>

        <h2>3. When the service is delivered</h2>
        <ul>
          <li>
            <strong>Online payment:</strong> after successful payment, your booking is confirmed
            immediately (or as soon as the payment gateway confirms success). You can view it under{' '}
            <Link to="/my-bookings">My Bookings</Link>.
          </li>
          <li>
            <strong>Cash on boarding:</strong> your seat is reserved when you complete checkout; you
            pay the driver when you board.
          </li>
          <li>
            Trip details (route, date, time, seats, amount) are available in your account as soon as
            the booking is created or confirmed.
          </li>
        </ul>

        <h2>4. Service area</h2>
        <p>
          We focus on routes to and from Gilgit-Baltistan (including Hunza, Gilgit, Skardu and
          Ghizer) and selected cities such as Islamabad, Rawalpindi and Lahore. Availability depends
          on drivers who list trips on the Platform.
        </p>

        <h2>5. Delays and changes</h2>
        <p>
          Travel times and pick-up arrangements can change due to road conditions, weather or
          driver circumstances. Coordinate via in-app chat after booking. If a trip cannot proceed,
          see our <Link to="/refund-policy">Return &amp; Refund Policy</Link>.
        </p>

        <h2>6. Support</h2>
        <p>
          For booking help or service issues, contact us at{' '}
          <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> or{' '}
          <a href={`tel:+${COMPANY.phoneDigits}`}>{COMPANY.phoneDisplay}</a>.
        </p>
        <p>
          <strong>Registered / local office:</strong>
          <br />
          {COMPANY.officeAddress}
          <br />
          {COMPANY.officeCountry}
        </p>
        <p>
          Related pages:{' '}
          <Link to="/refund-policy">Return &amp; Refund Policy</Link> ·{' '}
          <Link to="/terms">Terms of Service</Link> ·{' '}
          <Link to="/privacy">Privacy Policy</Link> · <Link to="/contact">Contact</Link>
        </p>
      </div>
    </div>
  )
}

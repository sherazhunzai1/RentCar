import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import { COMPANY } from '../data/company'

export default function RefundPolicy() {
  return (
    <div className="container narrow section legal-page">
      <Seo
        title="Return & Refund Policy"
        description="How cancellations, returns and refunds work for seat and vehicle bookings on gaadi.pk."
        path="/refund-policy"
      />

      <div className="page-title-block">
        <h1>Return &amp; Refund Policy</h1>
        <p className="legal-updated">Last updated: 15 October 2026</p>
      </div>

      <div className="legal-prose">
        <p>
          This Return &amp; Refund Policy explains how cancellations and refunds work when you book
          a seat or vehicle through {COMPANY.name}. Because gaadi.pk is a digital booking platform
          (not a seller of physical goods), there are no product returns — refunds apply to paid
          bookings as described below.
        </p>

        <h2>1. Nature of our service</h2>
        <p>
          When you pay online, you are paying for a confirmed reservation arranged through our
          Platform. The transport itself is provided by an independent driver. There is nothing
          physical to ship or return.
        </p>

        <h2>2. How to cancel</h2>
        <ul>
          <li>
            Passengers may cancel a booking from <Link to="/my-bookings">My Bookings</Link> before
            the scheduled trip departure, where the booking status still allows cancellation.
          </li>
          <li>
            You may also request cancellation by emailing{' '}
            <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> or calling{' '}
            <a href={`tel:+${COMPANY.phoneDigits}`}>{COMPANY.phoneDisplay}</a> with your booking
            reference.
          </li>
          <li>Cancelling releases your seat(s) so they can be booked by others.</li>
        </ul>

        <h2>3. Refund eligibility</h2>
        <ul>
          <li>
            <strong>Cash on boarding:</strong> no online payment was taken. Cancelling simply
            releases the reservation; there is nothing to refund.
          </li>
          <li>
            <strong>Online payment (card / wallet / payment gateway):</strong> if you cancel before
            the trip and a refund is due under this policy, we will process a refund of the fare
            and applicable Platform fee paid for that booking, subject to the payment
            provider&apos;s timelines.
          </li>
          <li>
            <strong>Driver or Platform cancellation:</strong> if the driver cancels, the trip cannot
            proceed, or we cancel for operational reasons, you are entitled to a full refund of
            amounts paid online for that booking.
          </li>
          <li>
            <strong>No-show:</strong> if you do not board at the agreed time and place without
            cancelling in advance, the booking is generally non-refundable.
          </li>
          <li>
            <strong>Completed trips:</strong> once the trip has taken place, payments are not
            refundable except where required by law or where we agree after investigating a
            serious service failure.
          </li>
        </ul>

        <h2>4. Refund process and timing</h2>
        <ul>
          <li>
            Approved refunds are initiated back to the original payment method (card, wallet or
            gateway used at checkout).
          </li>
          <li>
            After we submit the refund, banks and payment providers typically take{' '}
            <strong>5–14 business days</strong> to show the credit. Exact timing depends on your
            bank or wallet.
          </li>
          <li>
            We will confirm by email when a refund has been initiated. Keep your booking reference
            for any follow-up.
          </li>
        </ul>

        <h2>5. Partial refunds and disputes</h2>
        <p>
          In limited cases (for example, a material change to route or timing that you did not
          accept), we may offer a partial refund. If you disagree with a refund decision, contact
          us with your booking details and we will review it in good faith.
        </p>

        <h2>6. Contact for refunds</h2>
        <p>
          Refund requests and questions:{' '}
          <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> ·{' '}
          <a href={`tel:+${COMPANY.phoneDigits}`}>{COMPANY.phoneDisplay}</a>
        </p>
        <p>
          <strong>Office:</strong> {COMPANY.officeAddress}, {COMPANY.officeCountry}
        </p>
        <p>
          See also our <Link to="/service-policy">Service Policy</Link>,{' '}
          <Link to="/terms">Terms of Service</Link> and <Link to="/contact">Contact</Link> page.
        </p>
      </div>
    </div>
  )
}

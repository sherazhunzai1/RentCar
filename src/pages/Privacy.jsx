import { Link } from 'react-router-dom'
import Seo from '../components/Seo'

export default function Privacy() {
  return (
    <div className="container narrow section legal-page">
      <Seo
        title="Privacy Policy"
        description="How gaadi.pk collects, uses and protects your personal information when you book seats, list vehicles and message through the platform."
        path="/privacy"
      />

      <div className="page-title-block">
        <h1>Privacy Policy</h1>
        <p className="legal-updated">Last updated: 19 June 2026</p>
      </div>

      <div className="legal-prose">
        <p>
          This Privacy Policy explains how gaadi.pk (&quot;we&quot;, &quot;us&quot;) collects, uses
          and protects your personal information when you use our website, applications and services
          (the &quot;Platform&quot;). By using gaadi.pk, you agree to the practices described here.
        </p>

        <h2>1. Information we collect</h2>
        <p>We collect the information needed to connect passengers with drivers and run the Platform:</p>
        <ul>
          <li>
            <strong>Account information:</strong> your name, email address, phone number, password
            (stored securely/hashed) and whether you are a passenger or a driver. Drivers also
            provide a driving licence number and years of experience.
          </li>
          <li>
            <strong>Listing information (drivers):</strong> vehicle type and details, route, date,
            time, available seats, prices and amenities.
          </li>
          <li>
            <strong>Booking information:</strong> the trips you book or receive, seats, dates, amounts
            and payment method.
          </li>
          <li>
            <strong>Payment information:</strong> payments are processed by third-party payment
            providers (such as JazzCash). We receive confirmation of a payment and store booking and
            transaction references, but we do not store your full card or wallet credentials.
          </li>
          <li>
            <strong>Messages:</strong> messages you send to the other party through the in-app chat
            for a booking.
          </li>
          <li>
            <strong>Technical information:</strong> basic device, browser and log data (such as IP
            address and timestamps) that is generated when you use the Platform.
          </li>
        </ul>

        <h2>2. How we use your information</h2>
        <ul>
          <li>To create and manage your account.</li>
          <li>To let passengers search, book and pay, and to let drivers list vehicles and accept bookings.</li>
          <li>To connect passengers and drivers for confirmed bookings and enable in-app messaging.</li>
          <li>To process payments and apply the service fee.</li>
          <li>To send you booking confirmations and important service messages.</li>
          <li>To keep the Platform secure, prevent fraud and misuse, and improve our service.</li>
          <li>To comply with legal obligations.</li>
        </ul>

        <h2>3. How we share your information</h2>
        <p>We share your information only as needed to provide the service:</p>
        <ul>
          <li>
            <strong>Between passengers and drivers:</strong> when a booking is confirmed, we share
            the information needed for the trip to happen — such as your name and booking details —
            and enable the two of you to message each other to coordinate.
          </li>
          <li>
            <strong>Payment providers:</strong> we share the information required to process your
            payment with providers such as JazzCash.
          </li>
          <li>
            <strong>Service providers:</strong> trusted companies that help us run the Platform (for
            example, hosting and infrastructure), under appropriate confidentiality obligations.
          </li>
          <li>
            <strong>Legal reasons:</strong> where required by law, or to protect the rights, safety
            and security of our users or the Platform.
          </li>
        </ul>
        <p>
          <strong>We do not sell your personal information.</strong>
        </p>

        <h2>4. Cookies and local storage</h2>
        <p>
          To keep you signed in, gaadi.pk stores a secure authentication token and a small number of
          preferences in your browser&apos;s local storage. This is necessary for the Platform to
          work. Clearing your browser storage will sign you out.
        </p>

        <h2>5. Data security</h2>
        <p>
          We take reasonable measures to protect your information — for example, passwords are stored
          in a hashed form and access is restricted. However, no method of transmission or storage is
          completely secure, so we cannot guarantee absolute security.
        </p>

        <h2>6. Data retention</h2>
        <p>
          We keep your information for as long as your account is active and as long as needed to
          provide the service, resolve disputes, and meet legal, accounting or operational
          requirements. You can ask us to delete your account and personal data (see your rights
          below).
        </p>

        <h2>7. Your rights and choices</h2>
        <ul>
          <li>You can view and update most of your account details from your profile at any time.</li>
          <li>
            You can request access to, correction of, or deletion of your personal information by
            emailing us at <a href="mailto:contact@gaadi.pk">contact@gaadi.pk</a>.
          </li>
          <li>
            You can stop using the Platform at any time; ask us to close your account and we will
            delete or anonymise your data where we are not required to keep it.
          </li>
        </ul>

        <h2>8. Children</h2>
        <p>
          gaadi.pk is intended for users aged 18 and over. We do not knowingly collect personal
          information from children. If you believe a child has provided us information, please
          contact us and we will remove it.
        </p>

        <h2>9. Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will post the updated version here
          with a new &quot;last updated&quot; date. Your continued use of the Platform after changes
          take effect means you accept the updated policy.
        </p>

        <h2>10. Contact us</h2>
        <p>
          Questions about your privacy or this policy? Email us at{' '}
          <a href="mailto:contact@gaadi.pk">contact@gaadi.pk</a> or visit our{' '}
          <Link to="/contact">Contact</Link> page. You can also read our{' '}
          <Link to="/terms">Terms of Service</Link>.
        </p>
      </div>
    </div>
  )
}

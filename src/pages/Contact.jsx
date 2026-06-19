import { FaEnvelope, FaPhoneAlt, FaWhatsapp, FaMapMarkerAlt } from 'react-icons/fa'
import Seo from '../components/Seo'

// TODO: replace with your real number before launch (display + tel/WhatsApp digits).
const PHONE_DISPLAY = '+92 300 0000000'
const PHONE_DIGITS = '923000000000' // international format, no "+", for tel:/wa.me
const EMAIL = 'contact@gaadi.pk'

export default function Contact() {
  return (
    <div className="container narrow section">
      <Seo
        title="Contact Us"
        description="Get in touch with the gaadi.pk team — email contact@gaadi.pk, call or message us on WhatsApp for bookings, support or feedback."
        path="/contact"
      />

      <div className="page-title-block">
        <h1>Contact us</h1>
        <p>Questions, bookings or feedback — we&apos;re here to help. Reach us any way you like.</p>
      </div>

      <div className="contact-grid">
        <a className="contact-card" href={`mailto:${EMAIL}`}>
          <span className="contact-icon"><FaEnvelope /></span>
          <h3>Email</h3>
          <span className="contact-value">{EMAIL}</span>
          <span className="contact-hint">We usually reply within a day.</span>
        </a>

        <a className="contact-card" href={`tel:+${PHONE_DIGITS}`}>
          <span className="contact-icon"><FaPhoneAlt /></span>
          <h3>Phone</h3>
          <span className="contact-value">{PHONE_DISPLAY}</span>
          <span className="contact-hint">Call us during the day.</span>
        </a>

        <a
          className="contact-card"
          href={`https://wa.me/${PHONE_DIGITS}`}
          target="_blank"
          rel="noreferrer"
        >
          <span className="contact-icon contact-icon-whatsapp"><FaWhatsapp /></span>
          <h3>WhatsApp</h3>
          <span className="contact-value">{PHONE_DISPLAY}</span>
          <span className="contact-hint">Quickest way to reach us.</span>
        </a>

        <div className="contact-card">
          <span className="contact-icon"><FaMapMarkerAlt /></span>
          <h3>Based in</h3>
          <span className="contact-value">Hunza, Gilgit-Baltistan</span>
          <span className="contact-hint">Serving routes across GB &amp; Pakistan.</span>
        </div>
      </div>

      <p className="contact-foot">
        Prefer email? Write to us at <a href={`mailto:${EMAIL}`}>{EMAIL}</a> and we&apos;ll get back
        to you.
      </p>
    </div>
  )
}

import { FaEnvelope, FaPhoneAlt, FaWhatsapp, FaMapMarkerAlt } from 'react-icons/fa'
import Seo from '../components/Seo'
import { COMPANY } from '../data/company'

export default function Contact() {
  return (
    <div className="container narrow section">
      <Seo
        title="Contact Us"
        description={`Get in touch with gaadi.pk — email ${COMPANY.email}, call ${COMPANY.phoneDisplay}, or visit our office in ${COMPANY.officeAddress}.`}
        path="/contact"
      />

      <div className="page-title-block">
        <h1>Contact us</h1>
        <p>Questions, bookings or feedback — reach us by email, phone or at our local office.</p>
      </div>

      <div className="contact-grid">
        <a className="contact-card" href={`mailto:${COMPANY.email}`}>
          <span className="contact-icon"><FaEnvelope /></span>
          <h3>Email</h3>
          <span className="contact-value">{COMPANY.email}</span>
          <span className="contact-hint">We usually reply within a day.</span>
        </a>

        <a className="contact-card" href={`tel:+${COMPANY.phoneDigits}`}>
          <span className="contact-icon"><FaPhoneAlt /></span>
          <h3>Phone</h3>
          <span className="contact-value">{COMPANY.phoneDisplay}</span>
          <span className="contact-hint">Call us during business hours.</span>
        </a>

        <a
          className="contact-card"
          href={`https://wa.me/${COMPANY.phoneDigits}`}
          target="_blank"
          rel="noreferrer"
        >
          <span className="contact-icon contact-icon-whatsapp"><FaWhatsapp /></span>
          <h3>WhatsApp</h3>
          <span className="contact-value">{COMPANY.phoneDisplay}</span>
          <span className="contact-hint">Quickest way to reach us.</span>
        </a>

        <div className="contact-card">
          <span className="contact-icon"><FaMapMarkerAlt /></span>
          <h3>Local office</h3>
          <span className="contact-value">{COMPANY.officeAddress}</span>
          <span className="contact-hint">{COMPANY.officeCountry}</span>
        </div>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h3 className="card-section-title">Office address</h3>
        <p className="muted-note" style={{ margin: 0 }}>
          {COMPANY.name}
          <br />
          {COMPANY.officeAddress}
          <br />
          {COMPANY.officeCountry}
          <br />
          Phone:{' '}
          <a href={`tel:+${COMPANY.phoneDigits}`}>{COMPANY.phoneDisplay}</a>
          <br />
          Email: <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
        </p>
      </div>

      <p className="contact-foot">
        Prefer email? Write to us at <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> and
        we&apos;ll get back to you.
      </p>
    </div>
  )
}

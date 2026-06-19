import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaMountain, FaUsers, FaLock, FaArrowRight } from 'react-icons/fa'
import Seo from '../components/Seo'

export default function About() {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="container narrow section about-page">
      <Seo
        title="About Us & Our Founder, Sheraz Ali"
        description="gaadi.pk was built by Sheraz Ali, a senior full-stack & blockchain developer and a native of Hunza, to make finding a seat or vehicle to and from Gilgit-Baltistan simple and reliable."
        path="/about"
      />

      <div className="page-title-block">
        <h1>About gaadi.pk</h1>
        <p>Built in the mountains, for the mountains.</p>
      </div>

      {/* Founder */}
      <div className="card founder-card">
        <div className="founder-photo">
          {imgError ? (
            <div className="founder-initials" aria-label="Sheraz Ali">SA</div>
          ) : (
            <img
              src="/sheraz-ali.jpg"
              alt="Sheraz Ali — Founder & Developer of gaadi.pk"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          )}
        </div>
        <div className="founder-bio">
          <span className="founder-tag">Founder &amp; Developer</span>
          <h2>Sheraz Ali</h2>
          <p className="founder-role">
            Senior Full-Stack &amp; Blockchain Developer · 6 years of experience · Native of Hunza,
            Gilgit-Baltistan
          </p>
          <p>
            I&apos;m Sheraz Ali — the founder and the developer behind gaadi.pk. Over the last six
            years I&apos;ve built web and software products as a full-stack and blockchain engineer,
            but this one is personal: I was born and raised in Hunza, in the heart of
            Gilgit-Baltistan, and gaadi.pk grew straight out of a problem I&apos;ve lived with my
            whole life.
          </p>
        </div>
      </div>

      {/* Story */}
      <div className="about-prose">
        <h2>Why I built gaadi.pk</h2>
        <p>
          Like most people from the north, I&apos;ve spent countless hours on the long road between
          Gilgit-Baltistan and the cities — Islamabad, Rawalpindi, Lahore. And nearly every trip
          began with the same headache: finding a ride. Whether I was heading home to Hunza or down
          to the city, securing a seat — let alone a whole vehicle — was never simple.
        </p>
        <p>
          It usually meant a string of phone calls, asking around, waiting at crowded terminals, and
          never quite knowing if you had a seat until you were standing next to the van. For locals
          it&apos;s a constant hassle, and for the thousands of travellers visiting Hunza, Gilgit,
          Skardu and Ghizer every season, it&apos;s even harder.
        </p>
        <p>
          I knew it didn&apos;t have to be this way. So I put my experience as a developer to work and
          built gaadi.pk — a simple, reliable way to connect passengers directly with drivers. Now
          anyone can search a route, compare vehicles, pick the exact seat they want (or reserve the
          whole vehicle), and lock it in online in minutes — no phone tag, no uncertainty.
        </p>
        <p>
          That&apos;s the whole idea behind our promise: <strong>Apni seat, apni gaadi</strong>. Every
          journey to and from the mountains should start with a seat you can count on.
        </p>
      </div>

      {/* Values */}
      <div className="about-values">
        <div className="about-value">
          <FaMountain className="about-value-icon" />
          <h3>Built by a local</h3>
          <p>Made by someone who has travelled these routes for years and knows exactly what was missing.</p>
        </div>
        <div className="about-value">
          <FaUsers className="about-value-icon" />
          <h3>For everyone</h3>
          <p>Resident of GB or a traveller heading north — booking a ride is now just a few taps away.</p>
        </div>
        <div className="about-value">
          <FaLock className="about-value-icon" />
          <h3>Secure &amp; direct</h3>
          <p>Book and pay online and connect with verified drivers — your seat is locked in before you leave home.</p>
        </div>
      </div>

      {/* CTA */}
      <div className="about-cta card">
        <div>
          <h2>Ready to ride?</h2>
          <p>Find your seat to Hunza, Gilgit, Skardu or Ghizer — or list your vehicle and start earning.</p>
        </div>
        <div className="about-cta-actions">
          <Link to="/vehicles" className="btn btn-primary btn-lg">
            Browse vehicles <FaArrowRight />
          </Link>
          <Link to="/signup" className="btn btn-outline btn-lg">
            Become a driver
          </Link>
        </div>
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <Link to="/" className="brand brand-light">
            <Logo />
          </Link>
          <p>
            Apni seat, apni gaadi. Book seats and vehicles to Gilgit-Baltistan — Hunza, Gilgit,
            Skardu and Ghizer — from across GB and from Islamabad, Rawalpindi and Lahore.
          </p>
          <div className="footer-social">
            <a href="#" aria-label="Facebook"><FaFacebookF /></a>
            <a href="#" aria-label="Twitter"><FaTwitter /></a>
            <a href="#" aria-label="Instagram"><FaInstagram /></a>
            <a href="#" aria-label="LinkedIn"><FaLinkedinIn /></a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Explore</h4>
          <Link to="/vehicles">Browse Vehicles</Link>
          <Link to="/signup">Become a Driver</Link>
          <Link to="/signup">Sign Up</Link>
          <Link to="/login">Login</Link>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div className="footer-col">
          <h4>Support</h4>
          <a href="#">Help Center</a>
          <a href="#">Safety</a>
          <a href="#">Terms of Service</a>
          <a href="#">Privacy Policy</a>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>© {new Date().getFullYear()} gaadi.pk. All rights reserved.</p>
          <p>Made in Pakistan 🇵🇰</p>
        </div>
      </div>
    </footer>
  )
}

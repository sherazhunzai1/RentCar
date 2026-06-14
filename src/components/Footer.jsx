import { Link } from 'react-router-dom'
import { FaCarSide, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <Link to="/" className="brand brand-light">
            <FaCarSide className="brand-icon" />
            <span>
              Rent<strong>Car</strong>
            </span>
          </Link>
          <p>
            Book your seat and travel smart. Connecting trusted drivers with passengers across
            the country.
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
          <a href="#">About Us</a>
          <a href="#">How It Works</a>
          <a href="#">Careers</a>
          <a href="#">Contact</a>
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
          <p>© {new Date().getFullYear()} RentCar. All rights reserved.</p>
          <p>Built with React + Vite.</p>
        </div>
      </div>
    </footer>
  )
}

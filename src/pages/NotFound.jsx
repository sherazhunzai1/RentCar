import { Link } from 'react-router-dom'
import { FaCarSide } from 'react-icons/fa'

export default function NotFound() {
  return (
    <div className="container narrow notfound">
      <FaCarSide className="notfound-icon" />
      <h1>404</h1>
      <h2>Looks like you took a wrong turn</h2>
      <p>The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <Link to="/" className="btn btn-primary btn-lg">
        Back to Home
      </Link>
    </div>
  )
}

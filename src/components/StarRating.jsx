import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa'

// Renders a 5-star rating. `value` is 0–5 (decimals allowed).
export default function StarRating({ value = 0, showvalue = true, size }) {
  const stars = []
  for (let i = 1; i <= 5; i++) {
    if (value >= i) stars.push(<FaStar key={i} />)
    else if (value >= i - 0.5) stars.push(<FaStarHalfAlt key={i} />)
    else stars.push(<FaRegStar key={i} />)
  }
  return (
    <span className="star-rating" style={size ? { fontSize: size } : undefined}>
      <span className="stars">{stars}</span>
      {showvalue && <span className="rating-value">{value > 0 ? value.toFixed(1) : 'New'}</span>}
    </span>
  )
}

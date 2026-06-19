import { FaRegCommentDots } from 'react-icons/fa'
import { useChat } from '../context/ChatContext'

// Opens the chat drawer for a booking. Only renders for confirmed bookings
// (chat opens once a booking is confirmed). Shows an unread-count badge.
export default function ChatButton({ booking, label = 'Message', className = 'btn btn-ghost btn-sm' }) {
  const { openChat, unread } = useChat()
  if (booking.status !== 'confirmed') return null

  const count = unread[booking.id] || 0
  return (
    <button type="button" className={`${className} chat-btn`} onClick={() => openChat(booking)}>
      <FaRegCommentDots /> {label}
      {count > 0 && <span className="chat-badge">{count > 9 ? '9+' : count}</span>}
    </button>
  )
}

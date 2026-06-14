import { FaInbox } from 'react-icons/fa'

// Friendly placeholder for empty lists, with an optional action button.
export default function EmptyState({ icon: Icon = FaInbox, title, message, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon />
      </div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  )
}

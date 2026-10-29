import { FaUserCircle } from 'react-icons/fa'
import { mediaUrl } from '../utils/media'

/**
 * Shared people avatar used across the site.
 * Falls back to the user-circle icon when no photo is set.
 */
export default function UserAvatar({
  src,
  name = '',
  size = 'md',
  className = '',
  title,
}) {
  const url = mediaUrl(src)
  const label = name ? `${name}'s photo` : 'Profile photo'
  const classes = `user-avatar user-avatar-${size} ${className}`.trim()

  if (url) {
    return (
      <img
        src={url}
        alt={label}
        title={title || name || undefined}
        className={classes}
      />
    )
  }

  return (
    <span
      className={`user-avatar-fallback user-avatar-${size} ${className}`.trim()}
      title={title || name || undefined}
      aria-hidden={name ? undefined : true}
      role={name ? 'img' : undefined}
      aria-label={name ? label : undefined}
    >
      <FaUserCircle />
    </span>
  )
}

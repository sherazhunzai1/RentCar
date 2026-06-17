// gaadi.pk brand logo: a vehicle mark on a rounded badge + the wordmark, where
// ".pk" carries a Pakistani-green accent. Text colour is inherited from the
// parent `.brand` / `.brand-light` so it adapts to light and dark backgrounds.
export default function Logo() {
  return (
    <>
      <svg className="brand-icon" viewBox="0 0 32 32" role="img" aria-label="gaadi.pk logo">
        <rect width="32" height="32" rx="8" fill="#2563eb" />
        <path
          d="M7 18.5l1.4-4.2A2.5 2.5 0 0 1 10.8 12.5h10.4a2.5 2.5 0 0 1 2.4 1.8L25 18.5v3.2a1 1 0 0 1-1 1h-1.2a1 1 0 0 1-1-1V21H10.2v.7a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1z"
          fill="#fff"
        />
        <circle cx="10.5" cy="18.3" r="1.3" fill="#2563eb" />
        <circle cx="21.5" cy="18.3" r="1.3" fill="#2563eb" />
        <rect x="7" y="25.2" width="18" height="2.1" rx="1.05" fill="#22c55e" />
      </svg>
      <span className="brand-word">
        gaadi<span className="brand-tld">.pk</span>
      </span>
    </>
  )
}

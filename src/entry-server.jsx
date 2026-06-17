// Server entry used only at build time by prerender.js to render each static
// route to HTML. Mirrors the provider/router setup in main.jsx, but with
// StaticRouter instead of BrowserRouter.
//
// Browser-only work (data fetching, localStorage, document/window) lives in
// useEffect/handlers, which do NOT run during renderToString — so this renders
// the static shell of each page safely without a backend.
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import { AuthProvider } from './context/AuthContext'
import { BookingProvider } from './context/BookingContext'
import App from './App'

export function render(location) {
  return renderToString(
    <StaticRouter location={location}>
      <AuthProvider>
        <BookingProvider>
          <App />
        </BookingProvider>
      </AuthProvider>
    </StaticRouter>,
  )
}

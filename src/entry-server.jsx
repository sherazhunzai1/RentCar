// Server entry used only at build time by prerender.js to render each static
// route to HTML. Mirrors the provider/router setup in main.jsx, but with
// StaticRouter instead of BrowserRouter.
//
// Browser-only work (data fetching, sockets, localStorage, document/window)
// lives in useEffect/handlers, which do NOT run during renderToString — so this
// renders the static shell of each page safely without a backend.
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { ChatProvider } from './context/ChatContext'
import { BookingProvider } from './context/BookingContext'
import App from './App'

export function render(location) {
  return renderToString(
    <StaticRouter location={location}>
      <AuthProvider>
        <ToastProvider>
          <ChatProvider>
            <BookingProvider>
              <App />
            </BookingProvider>
          </ChatProvider>
        </ToastProvider>
      </AuthProvider>
    </StaticRouter>,
  )
}

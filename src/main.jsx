import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { ConfirmProvider } from './context/ConfirmContext.jsx'
import { ChatProvider } from './context/ChatContext.jsx'
import { RideAlertProvider } from './context/RideAlertContext.jsx'
import { BookingProvider } from './context/BookingContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ConfirmProvider>
            <ChatProvider>
              <RideAlertProvider>
                <BookingProvider>
                  <App />
                </BookingProvider>
              </RideAlertProvider>
            </ChatProvider>
          </ConfirmProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

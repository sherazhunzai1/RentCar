import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import BottomNav from './components/BottomNav'
import ChatModal from './components/ChatModal'
import ScrollToTop from './components/ScrollToTop'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import About from './pages/About'
import Contact from './pages/Contact'
import VehicleListings from './pages/VehicleListings'
import VehicleDetails from './pages/VehicleDetails'
import Booking from './pages/Booking'
import Payment from './pages/Payment'
import PaymentReturn from './pages/PaymentReturn'
import BookingConfirmation from './pages/BookingConfirmation'
import MyBookings from './pages/MyBookings'
import DriverDashboard from './pages/DriverDashboard'
import PostVehicle from './pages/PostVehicle'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <div className="app-shell">
      <ScrollToTop />
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/vehicles" element={<VehicleListings />} />
          <Route path="/vehicles/:id" element={<VehicleDetails />} />

          {/* Passenger-only */}
          <Route
            path="/booking"
            element={
              <ProtectedRoute role="passenger">
                <Booking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedRoute role="passenger">
                <Payment />
              </ProtectedRoute>
            }
          />
          {/* Payment gateway callback — public so the redirect back always lands */}
          <Route path="/payment/return" element={<PaymentReturn />} />
          <Route
            path="/booking/confirmation/:id"
            element={
              <ProtectedRoute role="passenger">
                <BookingConfirmation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute role="passenger">
                <MyBookings />
              </ProtectedRoute>
            }
          />

          {/* Driver-only */}
          <Route
            path="/driver/dashboard"
            element={
              <ProtectedRoute role="driver">
                <DriverDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver/post"
            element={
              <ProtectedRoute role="driver">
                <PostVehicle />
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver/edit/:id"
            element={
              <ProtectedRoute role="driver">
                <PostVehicle />
              </ProtectedRoute>
            }
          />

          {/* Any logged-in user */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <BottomNav />
      <ChatModal />
    </div>
  )
}

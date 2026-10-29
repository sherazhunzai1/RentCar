import { createContext, useContext, useMemo, useState } from 'react'

// Holds the in-progress booking as the passenger moves through
// listing → seat selection → payment → confirmation,
// or ride-request → accepted offer → payment → confirmation.
const BookingContext = createContext(null)

export function BookingProvider({ children }) {
  const [draft, setDraft] = useState(null)

  const value = useMemo(
    () => ({
      draft,
      // Begin a booking for a vehicle. `opts` = { seats, bookWholeVehicle }.
      startBooking(vehicle, opts = {}) {
        setDraft({
          type: 'seats',
          vehicle,
          seats: opts.seats || [],
          bookWholeVehicle: !!opts.bookWholeVehicle,
        })
      },
      // Begin payment for an accepted ride-request offer.
      startOfferPayment({ offer, request }) {
        setDraft({ type: 'offer', offer, request })
      },
      updateSeats(seats) {
        setDraft((d) => (d && d.type !== 'offer' ? { ...d, seats } : d))
      },
      clearBooking() {
        setDraft(null)
      },
    }),
    [draft],
  )

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBooking() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking must be used within a BookingProvider')
  return ctx
}

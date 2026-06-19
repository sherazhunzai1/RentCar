import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from './AuthContext'
import { connectSocket, disconnectSocket } from '../services/socketService'
import { getMessages } from '../services/chatService'
import { getBookingsByUser, getBookingsByDriver } from '../services/bookingService'

const ChatContext = createContext(null)

export function ChatProvider({ children }) {
  const { isAuthenticated, user } = useAuth()
  const [openBooking, setOpenBooking] = useState(null)
  const [unread, setUnread] = useState({}) // { [bookingId]: count }
  const [connected, setConnected] = useState(false)
  const openIdRef = useRef(null)
  const userId = user?.id

  // Connect the shared socket while logged in; track unread for closed chats.
  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket()
      setConnected(false)
      setUnread({})
      return
    }
    const socket = connectSocket()

    const onConnect = () => setConnected(true)
    const onDisconnect = () => setConnected(false)
    const onError = (err) =>
      // Surfaces the reason live chat isn't connecting (CORS, auth, transport…).
      console.warn('[chat] socket connect_error:', err?.message || err)

    const onMessage = (msg) => {
      if (!msg || msg.senderId === userId) return
      // The open chat handles its own messages (and marks them read).
      if (msg.bookingId === openIdRef.current) return
      setUnread((u) => ({ ...u, [msg.bookingId]: (u[msg.bookingId] || 0) + 1 }))
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('connect_error', onError)
    socket.on('chat:message', onMessage)
    if (socket.connected) setConnected(true)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('connect_error', onError)
      socket.off('chat:message', onMessage)
    }
  }, [isAuthenticated, userId])

  const openChat = useCallback((booking) => {
    openIdRef.current = booking.id
    setOpenBooking(booking)
    setUnread((u) => ({ ...u, [booking.id]: 0 }))
  }, [])

  const closeChat = useCallback(() => {
    openIdRef.current = null
    setOpenBooking(null)
  }, [])

  // Seed unread badges for a set of bookings (confirmed only) from history.
  const refreshUnread = useCallback(
    async (bookings) => {
      const confirmed = (bookings || []).filter((b) => b.status === 'confirmed')
      const entries = await Promise.all(
        confirmed.map(async (b) => {
          try {
            const msgs = await getMessages(b.id)
            return [b.id, msgs.filter((m) => m.senderId !== userId && !m.readAt).length]
          } catch {
            return [b.id, 0]
          }
        }),
      )
      setUnread((u) => {
        const next = { ...u }
        for (const [id, count] of entries) next[id] = count
        return next
      })
    },
    [userId],
  )

  // Seed unread badges once on login (the user's own confirmed bookings) so the
  // navbar / bottom-nav indicator works app-wide, before visiting My Bookings.
  useEffect(() => {
    if (!isAuthenticated || !user) return
    let active = true
    const fetchBookings = user.role === 'driver' ? getBookingsByDriver : getBookingsByUser
    fetchBookings(user.id)
      .then((list) => {
        if (active) refreshUnread(list)
      })
      .catch(() => {})
    return () => {
      active = false
    }
    // refreshUnread is stable per user; listed to satisfy the linter.
  }, [isAuthenticated, user, refreshUnread])

  const totalUnread = useMemo(
    () => Object.values(unread).reduce((sum, n) => sum + (n || 0), 0),
    [unread],
  )

  const value = useMemo(
    () => ({ openBooking, openChat, closeChat, unread, totalUnread, refreshUnread, connected }),
    [openBooking, openChat, closeChat, unread, totalUnread, refreshUnread, connected],
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within a ChatProvider')
  return ctx
}

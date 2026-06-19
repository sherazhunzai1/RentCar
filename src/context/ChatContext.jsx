import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from './AuthContext'
import { connectSocket, disconnectSocket } from '../services/socketService'
import { getMessages } from '../services/chatService'

const ChatContext = createContext(null)

export function ChatProvider({ children }) {
  const { isAuthenticated, user } = useAuth()
  const [openBooking, setOpenBooking] = useState(null)
  const [unread, setUnread] = useState({}) // { [bookingId]: count }
  const openIdRef = useRef(null)
  const userId = user?.id

  // Connect the shared socket while logged in; track unread for closed chats.
  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket()
      setUnread({})
      return
    }
    const socket = connectSocket()

    const onMessage = (msg) => {
      if (!msg || msg.senderId === userId) return
      // The open chat handles its own messages (and marks them read).
      if (msg.bookingId === openIdRef.current) return
      setUnread((u) => ({ ...u, [msg.bookingId]: (u[msg.bookingId] || 0) + 1 }))
    }
    socket.on('chat:message', onMessage)

    return () => {
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

  const value = useMemo(
    () => ({ openBooking, openChat, closeChat, unread, refreshUnread }),
    [openBooking, openChat, closeChat, unread, refreshUnread],
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within a ChatProvider')
  return ctx
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { FaTimes, FaPaperPlane } from 'react-icons/fa'
import { useChat } from '../context/ChatContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getSocket } from '../services/socketService'
import { getMessages, sendMessage, markRead } from '../services/chatService'
import { formatDate, formatMessageTime } from '../utils/format'

const isClosedError = (m = '') => /confirm|closed/i.test(m)

export default function ChatModal() {
  const { openBooking, closeChat } = useChat()
  if (!openBooking) return null
  // key remounts the panel (fresh state) when switching bookings.
  return <ChatPanel key={openBooking.id} booking={openBooking} onClose={closeChat} />
}

function ChatPanel({ booking, onClose }) {
  const { user } = useAuth()
  const toast = useToast()
  const bookingId = booking.id

  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [closed, setClosed] = useState(booking.status !== 'confirmed')
  const [otherTyping, setOtherTyping] = useState(false)

  const listRef = useRef(null)
  const typingTimer = useRef(null)
  const typingSent = useRef(false)

  const addMessage = useCallback((msg) => {
    if (!msg) return
    setMessages((prev) =>
      prev.some((m) => m.id === msg.id)
        ? prev
        : [...prev, msg].sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt))),
    )
  }, [])

  const markReadSafe = useCallback(() => {
    const socket = getSocket()
    if (socket && socket.connected) socket.emit('chat:read', { bookingId }, () => {})
    else markRead(bookingId).catch(() => {})
  }, [bookingId])

  // Load history, join the room, and wire up live events.
  useEffect(() => {
    const socket = getSocket()
    let active = true

    getMessages(bookingId)
      .then((msgs) => {
        if (!active) return
        setMessages(msgs)
        setLoading(false)
        if (msgs.some((m) => m.senderId !== user.id && !m.readAt)) markReadSafe()
      })
      .catch((e) => {
        if (!active) return
        setLoading(false)
        toast(e.message, 'error')
        if (isClosedError(e.message)) setClosed(true)
      })

    socket.emit('chat:join', { bookingId }, (res) => {
      if (res && res.ok === false) {
        toast(res.error || 'Could not open this chat.', 'error')
        setClosed(true)
      }
    })

    const onMessage = (msg) => {
      if (!msg || msg.bookingId !== bookingId) return
      addMessage(msg)
      if (msg.senderId !== user.id) markReadSafe()
    }
    const onTyping = (e) => {
      if (!e || e.bookingId !== bookingId || e.userId === user.id) return
      setOtherTyping(!!e.isTyping)
    }
    const onRead = (e) => {
      if (!e || e.bookingId !== bookingId || e.readerId === user.id) return
      const at = e.at || new Date().toISOString()
      setMessages((prev) =>
        prev.map((m) => (m.senderId === user.id && !m.readAt ? { ...m, readAt: at } : m)),
      )
    }
    socket.on('chat:message', onMessage)
    socket.on('chat:typing', onTyping)
    socket.on('chat:read', onRead)

    return () => {
      active = false
      if (typingSent.current) socket.emit('chat:typing', { bookingId, isTyping: false })
      socket.emit('chat:leave', { bookingId })
      socket.off('chat:message', onMessage)
      socket.off('chat:typing', onTyping)
      socket.off('chat:read', onRead)
      clearTimeout(typingTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId])

  // Auto-scroll to the newest message.
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages, otherTyping])

  const stopTyping = useCallback(() => {
    clearTimeout(typingTimer.current)
    if (typingSent.current) {
      getSocket().emit('chat:typing', { bookingId, isTyping: false })
      typingSent.current = false
    }
  }, [bookingId])

  const onChangeText = (e) => {
    setText(e.target.value)
    if (closed) return
    const socket = getSocket()
    if (!socket.connected) return
    if (!typingSent.current) {
      socket.emit('chat:typing', { bookingId, isTyping: true })
      typingSent.current = true
    }
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(stopTyping, 1800)
  }

  const handleSend = (e) => {
    e.preventDefault()
    const body = text.trim()
    if (!body || sending || closed) return
    setSending(true)
    stopTyping()
    const socket = getSocket()

    if (socket && socket.connected) {
      socket.emit('chat:send', { bookingId, body }, (ack) => {
        setSending(false)
        if (ack && ack.ok === false) {
          toast(ack.error || 'Message not sent.', 'error')
          if (isClosedError(ack.error)) setClosed(true)
          return
        }
        if (ack && ack.message) addMessage(ack.message)
        setText('')
      })
    } else {
      // Fallback to REST when the socket is unavailable.
      sendMessage(bookingId, body)
        .then((msg) => {
          addMessage(msg)
          setText('')
        })
        .catch((err) => {
          toast(err.message, 'error')
          if (isClosedError(err.message)) setClosed(true)
        })
        .finally(() => setSending(false))
    }
  }

  const amPassenger = user.role === 'passenger'
  const otherName =
    messages.find((m) => m.senderId !== user.id)?.senderName ||
    (amPassenger ? booking.driverName || 'Driver' : booking.passengerName || 'Passenger')
  const lastMineId = [...messages].reverse().find((m) => m.senderId === user.id)?.id

  return (
    <div className="chat-overlay" onClick={onClose}>
      <aside
        className="chat-drawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Booking chat"
      >
        <header className="chat-header">
          <div className="chat-header-info">
            <strong>{otherName}</strong>
            <span>
              {booking.fromCity} → {booking.toCity} · {formatDate(booking.date)}
            </span>
          </div>
          <button className="chat-close" onClick={onClose} aria-label="Close chat">
            <FaTimes />
          </button>
        </header>

        <div className="chat-body" ref={listRef}>
          {loading ? (
            <div className="chat-loading">
              <div className="spinner" />
            </div>
          ) : messages.length === 0 ? (
            <div className="chat-empty">No messages yet — say hello 👋</div>
          ) : (
            messages.map((m) => {
              const mine = m.senderId === user.id
              return (
                <div key={m.id} className={`chat-msg ${mine ? 'mine' : 'theirs'}`}>
                  {!mine && <span className="chat-msg-name">{m.senderName}</span>}
                  <div className="chat-bubble">{m.body}</div>
                  <span className="chat-msg-meta">
                    {formatMessageTime(m.createdAt)}
                    {mine && m.id === lastMineId && (m.readAt ? ' · Seen' : ' · Sent')}
                  </span>
                </div>
              )
            })
          )}
          {otherTyping && <div className="chat-typing">{otherName} is typing…</div>}
        </div>

        {closed ? (
          <div className="chat-closed">Chat is closed for this booking.</div>
        ) : (
          <form className="chat-input" onSubmit={handleSend}>
            <input
              type="text"
              value={text}
              onChange={onChangeText}
              onBlur={stopTyping}
              placeholder="Type a message…"
              maxLength={2000}
              autoFocus
            />
            <button type="submit" className="btn btn-primary" disabled={!text.trim() || sending}>
              <FaPaperPlane />
            </button>
          </form>
        )}
      </aside>
    </div>
  )
}

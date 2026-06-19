// Single shared Socket.IO connection for booking chat. Connected once after
// login (see ChatContext) with the JWT; reused across all chat screens.
import { io } from 'socket.io-client'
import { tokenStore, getSocketUrl } from './apiClient'

let socket = null

export function getSocket() {
  if (!socket) {
    const url = getSocketUrl()
    // Visible in the console so you can confirm the chat is targeting the right
    // Socket.IO server (paired with the connect_error log in ChatContext).
    console.info('[chat] socket target:', url)
    socket = io(url, {
      auth: { token: tokenStore.get() },
      // Let Socket.IO negotiate the transport (HTTP long-polling first, then
      // upgrade to WebSocket). This still connects when a raw WebSocket is
      // blocked by a proxy/firewall — unlike forcing transports: ['websocket'].
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
    })
  }
  return socket
}

export function connectSocket() {
  const s = getSocket()
  // Refresh the token in case it changed since the socket was created.
  s.auth = { token: tokenStore.get() }
  if (!s.connected) s.connect()
  return s
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
  }
}

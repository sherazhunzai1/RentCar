// Single shared Socket.IO connection for booking chat. Connected once after
// login (see ChatContext) with the JWT; reused across all chat screens.
import { io } from 'socket.io-client'
import { tokenStore, getApiOrigin } from './apiClient'

let socket = null

export function getSocket() {
  if (!socket) {
    socket = io(getApiOrigin(), {
      auth: { token: tokenStore.get() },
      transports: ['websocket'],
      autoConnect: false,
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

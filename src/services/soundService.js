// Short UI sounds for the booking chat, synthesized with the Web Audio API so
// no audio files are needed. Message receive/send and typing start/stop.
//
// Browsers require a user gesture before audio can play — primeAudio() (called
// on the first interaction) unlocks the AudioContext for the session.

const KEY = 'gaadi_chat_sound'
let ctx = null

function getCtx() {
  if (typeof window === 'undefined') return null
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  if (!ctx) ctx = new AC()
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

export function primeAudio() {
  getCtx()
}

export function soundEnabled() {
  try {
    return localStorage.getItem(KEY) !== 'off'
  } catch {
    return true
  }
}

export function setSoundEnabled(on) {
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off')
  } catch {
    /* ignore */
  }
}

// One short tone with a quick attack and exponential decay.
function blip(c, freq, start, dur, peak, type = 'sine') {
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.008)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur)
  osc.connect(gain).connect(c.destination)
  osc.start(start)
  osc.stop(start + dur + 0.03)
}

function play(builder) {
  if (!soundEnabled()) return
  const c = getCtx()
  if (!c) return
  try {
    builder(c, c.currentTime)
  } catch {
    /* ignore */
  }
}

export const sounds = {
  // Incoming message: gentle rising two-tone "ti-ding".
  receive() {
    play((c, t) => {
      blip(c, 660, t, 0.1, 0.16)
      blip(c, 988, t + 0.085, 0.14, 0.16)
    })
  },
  // Sent message: soft, lower, descending "pop".
  send() {
    play((c, t) => {
      blip(c, 620, t, 0.07, 0.1)
      blip(c, 440, t + 0.05, 0.07, 0.08)
    })
  },
  // Typing started (bubble appears): very short soft blip.
  typingStart() {
    play((c, t) => blip(c, 520, t, 0.05, 0.05))
  },
  // Typing stopped (bubble disappears): slightly lower soft blip.
  typingStop() {
    play((c, t) => blip(c, 380, t, 0.05, 0.045))
  },
}

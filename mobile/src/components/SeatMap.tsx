import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, spacing } from '../theme'

type Props = {
  totalSeats: number
  bookedSeats?: number[]
  selectedSeats?: number[]
  frontSeats?: number[]
  seatGenders?: Record<string, string>
  onToggle: (seat: number) => void
  layout?: { hasDriver?: boolean; frontRow?: number; cols?: number }
  maxSelectable?: number
}

export default function SeatMap({
  totalSeats,
  bookedSeats = [],
  selectedSeats = [],
  frontSeats = [],
  seatGenders = {},
  onToggle,
  layout = { hasDriver: true, frontRow: 1, cols: 3 },
  maxSelectable = Infinity,
}: Props) {
  const cols = layout.cols ?? 3
  const frontRow = layout.frontRow ?? 1
  const hasDriver = layout.hasDriver ?? true

  const stateOf = (seat: number) => {
    if (bookedSeats.includes(seat)) return 'booked'
    if (selectedSeats.includes(seat)) return 'selected'
    return 'available'
  }

  const press = (seat: number) => {
    const st = stateOf(seat)
    if (st === 'booked') return
    if (st === 'available' && selectedSeats.length >= maxSelectable) return
    onToggle(seat)
  }

  const renderSeat = (seat: number) => {
    const st = stateOf(seat)
    const isFront = frontSeats.includes(seat)
    const gender = st === 'booked' ? seatGenders[String(seat)] : null
    return (
      <Pressable
        key={seat}
        onPress={() => press(seat)}
        disabled={st === 'booked'}
        style={[
          styles.seat,
          st === 'selected' && styles.seatSelected,
          st === 'booked' && styles.seatBooked,
          st === 'available' && isFront && styles.seatFront,
        ]}
      >
        <Text style={[styles.seatNum, st !== 'available' && { color: '#fff' }]}>{seat}</Text>
        {st === 'available' && isFront ? <Text style={styles.badge}>F</Text> : null}
        {gender === 'female' ? <Text style={styles.gF}>F</Text> : null}
        {gender === 'male' ? <Text style={styles.gM}>M</Text> : null}
      </Pressable>
    )
  }

  const frontSeatNums = Array.from({ length: Math.min(frontRow, totalSeats) }, (_, i) => i + 1)
  const backRows: number[][] = []
  for (let i = frontSeatNums.length + 1; i <= totalSeats; i += cols) {
    backRows.push(
      Array.from({ length: cols }, (_, c) => i + c).filter((n) => n <= totalSeats),
    )
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {frontSeatNums.map(renderSeat)}
        {hasDriver ? (
          <View style={styles.driver}>
            <Text style={styles.driverText}>Driver</Text>
          </View>
        ) : null}
      </View>
      {backRows.map((row, idx) => (
        <View key={idx} style={styles.row}>
          {row.map(renderSeat)}
        </View>
      ))}
      <Text style={styles.legend}>
        Tap seats to select · F = front price · booked seats show M/F when known
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, alignItems: 'center', paddingVertical: spacing.sm },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  seat: {
    width: 52,
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatSelected: { backgroundColor: colors.primary, borderColor: colors.primaryDark },
  seatBooked: { backgroundColor: '#94a3b8', borderColor: '#64748b' },
  seatFront: { borderColor: colors.accent, backgroundColor: '#f0fdf4' },
  seatNum: { fontWeight: '800', color: colors.primary, fontSize: 15 },
  badge: { position: 'absolute', top: 2, right: 4, fontSize: 9, fontWeight: '800', color: colors.accent },
  gF: { position: 'absolute', bottom: 2, fontSize: 9, fontWeight: '800', color: '#fff' },
  gM: { position: 'absolute', bottom: 2, fontSize: 9, fontWeight: '800', color: '#fff' },
  driver: {
    width: 64,
    height: 52,
    borderRadius: 10,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  legend: { color: colors.muted, fontSize: 12, textAlign: 'center', marginTop: 8 },
})

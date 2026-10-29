import React, { useMemo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, spacing } from '../theme'

type Props = {
  totalSeats: number
  bookedSeats?: number[]
  selectedSeats?: number[]
  frontSeats?: number[]
  seatGenders?: Record<string, string>
  onToggle?: (seat: number) => void
  layout?: { hasDriver?: boolean; frontRow?: number; cols?: number }
  maxSelectable?: number
  readOnly?: boolean
}

function toSeatSet(list?: number[]) {
  return new Set(
    (Array.isArray(list) ? list : [])
      .map((s) => Number(s))
      .filter((n) => Number.isInteger(n) && n > 0),
  )
}

function normalizeGenders(map?: Record<string, string>) {
  if (!map || typeof map !== 'object') return {} as Record<string, string>
  const out: Record<string, string> = {}
  Object.entries(map).forEach(([key, value]) => {
    const n = Number(key)
    if (!Number.isInteger(n) || n < 1) return
    if (value === 'male' || value === 'female') out[String(n)] = value
  })
  return out
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
  readOnly = false,
}: Props) {
  const cols = layout.cols ?? 3
  const frontRow = layout.frontRow ?? 1
  const hasDriver = layout.hasDriver ?? true
  const bookedSet = useMemo(() => toSeatSet(bookedSeats), [bookedSeats])
  const selectedSet = useMemo(() => toSeatSet(selectedSeats), [selectedSeats])
  const frontSet = useMemo(() => toSeatSet(frontSeats), [frontSeats])
  const genders = useMemo(() => normalizeGenders(seatGenders), [seatGenders])

  const stateOf = (seat: number) => {
    if (bookedSet.has(seat)) return 'booked'
    if (selectedSet.has(seat)) return 'selected'
    return 'available'
  }

  const press = (seat: number) => {
    if (readOnly || !onToggle) return
    const st = stateOf(seat)
    if (st === 'booked') return
    if (st === 'available' && selectedSeats.length >= maxSelectable) return
    onToggle(seat)
  }

  const renderSeat = (seat: number) => {
    const st = stateOf(seat)
    const isFront = frontSet.has(seat)
    const gender = st === 'booked' ? genders[String(seat)] : null
    return (
      <Pressable
        key={seat}
        onPress={() => press(seat)}
        disabled={st === 'booked' || readOnly}
        style={[
          styles.seat,
          st === 'selected' && styles.seatSelected,
          st === 'booked' && styles.seatBooked,
          st === 'booked' && gender === 'female' && styles.seatFemale,
          st === 'booked' && gender === 'male' && styles.seatMale,
          st === 'available' && isFront && styles.seatFront,
        ]}
      >
        <Text
          style={[
            styles.seatNum,
            (st === 'selected' || st === 'booked') && { color: st === 'booked' && gender ? undefined : '#fff' },
            gender === 'female' && { color: '#be185d' },
            gender === 'male' && { color: '#1d4ed8' },
          ]}
        >
          {seat}
        </Text>
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
        Booked seats are locked · F/M = female/male passenger · F badge = front price
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
  seatBooked: { backgroundColor: '#e2e8f0', borderColor: '#94a3b8' },
  seatFemale: { backgroundColor: '#fdf2f8', borderColor: '#f9a8d4' },
  seatMale: { backgroundColor: '#eff6ff', borderColor: '#93c5fd' },
  seatFront: { borderColor: colors.accent, backgroundColor: '#f0fdf4' },
  seatNum: { fontWeight: '800', color: colors.primary, fontSize: 15 },
  badge: { position: 'absolute', top: 2, right: 4, fontSize: 9, fontWeight: '800', color: colors.accent },
  gF: {
    position: 'absolute',
    top: 2,
    left: 3,
    fontSize: 9,
    fontWeight: '800',
    color: '#fff',
    backgroundColor: '#db2777',
    paddingHorizontal: 3,
    borderRadius: 3,
    overflow: 'hidden',
  },
  gM: {
    position: 'absolute',
    top: 2,
    left: 3,
    fontSize: 9,
    fontWeight: '800',
    color: '#fff',
    backgroundColor: '#2563eb',
    paddingHorizontal: 3,
    borderRadius: 3,
    overflow: 'hidden',
  },
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

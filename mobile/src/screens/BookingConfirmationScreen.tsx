import React, { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import { getBookingById, type Booking } from '../api/bookings'
import { Button, Card, ErrorBox, Muted } from '../components/ui'
import { formatCurrency, formatDate, formatTime } from '../utils/format'
import { colors, spacing } from '../theme'

function normalizeSeats(seats?: number[]) {
  if (!Array.isArray(seats)) return []
  return [...new Set(seats.map((s) => Number(s)).filter((n) => Number.isInteger(n) && n > 0))].sort(
    (a, b) => a - b,
  )
}

export default function BookingConfirmationScreen({ navigation, route }: any) {
  const { id } = route.params
  const [booking, setBooking] = useState<Booking | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBookingById(id)
      .then(setBooking)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
  if (!booking) return <ErrorBox message={error || 'Booking not found'} />

  const seats = normalizeSeats(booking.seats)
  const gender = booking.gender === 'male' || booking.gender === 'female' ? booking.gender : null

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.title}>
        Booking {booking.status === 'confirmed' ? 'confirmed' : booking.status}
      </Text>
      <Muted>Ref {booking.bookingRef || booking.id}</Muted>
      <ErrorBox message={error} />
      <Card>
        <Text style={styles.line}>
          {booking.fromCity} → {booking.toCity}
        </Text>
        <Text style={styles.line}>
          {formatDate(booking.date)} · {formatTime(booking.time)}
        </Text>
        <Text style={styles.seatsLabel}>Your seat number{seats.length === 1 ? '' : 's'}</Text>
        <View style={styles.chips}>
          {seats.length ? (
            seats.map((n) => (
              <View key={n} style={styles.chip}>
                <Text style={styles.chipText}>Seat {n}</Text>
                {gender ? (
                  <Text style={[styles.chipGender, gender === 'female' ? styles.gF : styles.gM]}>
                    {gender === 'female' ? 'F' : 'M'}
                  </Text>
                ) : null}
              </View>
            ))
          ) : (
            <Text style={styles.line}>—</Text>
          )}
        </View>
        <Muted>These seats are locked and cannot be booked by others.</Muted>
        {booking.passengerName ? (
          <Text style={styles.line}>
            Passenger: {booking.passengerName}
            {gender ? ` · ${gender}` : ''}
          </Text>
        ) : null}
        <Text style={styles.line}>
          Payment: {booking.paymentMethod} ({booking.paymentStatus || booking.status || '—'})
        </Text>
        <Text style={styles.total}>Total {formatCurrency(booking.totalAmount)}</Text>
      </Card>
      <Button title="My bookings" onPress={() => navigation.navigate('MyBookings')} />
      <View style={{ height: 10 }} />
      <Button title="Find another ride" variant="outline" onPress={() => navigation.navigate('Vehicles')} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.md, backgroundColor: colors.bg, flexGrow: 1 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 4 },
  line: { color: colors.text, marginBottom: 6, fontSize: 15 },
  seatsLabel: { color: colors.text, fontWeight: '700', marginTop: 8, marginBottom: 8, fontSize: 15 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  chipText: { fontWeight: '700', color: colors.primaryDark },
  chipGender: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    overflow: 'hidden',
  },
  gF: { backgroundColor: '#db2777' },
  gM: { backgroundColor: '#2563eb' },
  total: { marginTop: 10, fontSize: 18, fontWeight: '800', color: colors.primary },
})

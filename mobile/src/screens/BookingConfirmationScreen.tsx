import React, { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text } from 'react-native'
import { getBookingById, type Booking } from '../api/bookings'
import { Button, Card, ErrorBox, Muted } from '../components/ui'
import { formatCurrency, formatDate, formatTime } from '../utils/format'
import { colors, spacing } from '../theme'

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

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.title}>Booking {booking.status === 'confirmed' ? 'confirmed' : booking.status}</Text>
      <Muted>Ref {booking.bookingRef || booking.id}</Muted>
      <ErrorBox message={error} />
      <Card>
        <Text style={styles.line}>
          {booking.fromCity} → {booking.toCity}
        </Text>
        <Text style={styles.line}>
          {formatDate(booking.date)} · {formatTime(booking.time)}
        </Text>
        <Text style={styles.line}>Seats: {(booking.seats || []).join(', ')}</Text>
        <Text style={styles.line}>Payment: {booking.paymentMethod} ({booking.paymentStatus || '—'})</Text>
        <Text style={styles.total}>Total {formatCurrency(booking.totalAmount)}</Text>
      </Card>
      <Button title="My bookings" onPress={() => navigation.navigate('MyBookings')} />
      <ViewSpacer />
      <Button title="Find another ride" variant="outline" onPress={() => navigation.navigate('Vehicles')} />
    </ScrollView>
  )
}

function ViewSpacer() {
  return <Text style={{ height: 10 }} />
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.md, backgroundColor: colors.bg, flexGrow: 1 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 4 },
  line: { color: colors.text, marginBottom: 6, fontSize: 15 },
  total: { marginTop: 10, fontSize: 18, fontWeight: '800', color: colors.primary },
})

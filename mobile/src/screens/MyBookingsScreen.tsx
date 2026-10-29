import React, { useCallback, useState } from 'react'
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { cancelBooking, getBookingsByUser, type Booking } from '../api/bookings'
import { useAuth } from '../context/AuthContext'
import { Button, Card, Empty, ErrorBox, Muted } from '../components/ui'
import { formatCurrency, formatDate, formatTime } from '../utils/format'
import { colors, spacing } from '../theme'

export default function MyBookingsScreen({ navigation }: any) {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      setBookings(await getBookingsByUser(user.id))
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useFocusEffect(
    useCallback(() => {
      load()
    }, [load]),
  )

  const onCancel = async (id: string) => {
    try {
      await cancelBooking(id)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  if (loading && !bookings.length) {
    return <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
  }

  return (
    <View style={styles.screen}>
      <ErrorBox message={error} />
      <FlatList
        data={bookings}
        keyExtractor={(b) => b.id}
        contentContainerStyle={{ padding: spacing.md }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={<Empty message="No bookings yet. Find a ride to get started." />}
        renderItem={({ item }) => (
          <Card>
            <Text style={styles.route}>
              {item.fromCity} → {item.toCity}
            </Text>
            <Muted>
              {formatDate(item.date)} · {formatTime(item.time)} · seats {(item.seats || []).join(', ')}
            </Muted>
            <Muted>
              {item.status} · {item.paymentMethod} · {formatCurrency(item.totalAmount)}
            </Muted>
            <View style={styles.actions}>
              <Button title="Details" variant="outline" onPress={() => navigation.navigate('BookingConfirmation', { id: item.id })} />
              {item.status !== 'cancelled' ? (
                <Button title="Cancel" variant="danger" onPress={() => onCancel(item.id)} />
              ) : null}
            </View>
          </Card>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  route: { fontWeight: '800', fontSize: 16, color: colors.text, marginBottom: 4 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
})

import React, { useCallback, useState } from 'react'
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { deleteVehicle, getVehiclesByDriver, type Vehicle } from '../api/vehicles'
import { getBookingsByDriver, type Booking } from '../api/bookings'
import { useAuth } from '../context/AuthContext'
import { Button, Card, Empty, ErrorBox, Muted } from '../components/ui'
import { formatCurrency, formatDate, formatTime } from '../utils/format'
import { colors, spacing } from '../theme'

export default function DriverDashboardScreen({ navigation }: any) {
  const { user } = useAuth()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      const [v, b] = await Promise.all([getVehiclesByDriver(user.id), getBookingsByDriver(user.id)])
      setVehicles(v)
      setBookings(b)
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

  const remove = async (id: string) => {
    try {
      await deleteVehicle(id)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  if (loading && !vehicles.length) {
    return <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.hi}>Welcome, {user?.name?.split(' ')[0]}</Text>
        <Button title="Post vehicle" onPress={() => navigation.navigate('PostVehicle')} />
      </View>
      <ErrorBox message={error} />
      <FlatList
        data={vehicles}
        keyExtractor={(v) => v.id}
        contentContainerStyle={{ padding: spacing.md }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListHeaderComponent={
          <Text style={styles.section}>Your listings ({vehicles.length}) · Bookings ({bookings.length})</Text>
        }
        ListEmptyComponent={<Empty message="No listings yet. Post your first vehicle." />}
        renderItem={({ item }) => (
          <Card>
            <Text style={styles.route}>
              {item.fromCity} → {item.toCity}
            </Text>
            <Muted>
              {formatDate(item.date)} · {formatTime(item.time)} · {formatCurrency(item.pricePerSeat)}/seat
            </Muted>
            <View style={styles.actions}>
              <Button title="Edit" variant="outline" onPress={() => navigation.navigate('PostVehicle', { id: item.id })} />
              <Button title="Delete" variant="danger" onPress={() => remove(item.id)} />
            </View>
          </Card>
        )}
        ListFooterComponent={
          <View style={{ marginTop: 12 }}>
            <Text style={styles.section}>Recent passenger bookings</Text>
            {bookings.slice(0, 10).map((b) => (
              <Card key={b.id}>
                <Text style={styles.route}>
                  {b.passengerName || 'Passenger'} · {(b.seats || []).join(', ')}
                </Text>
                <Muted>
                  {b.fromCity} → {b.toCity} · {b.status} · {formatCurrency(b.totalAmount)}
                </Muted>
              </Card>
            ))}
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { padding: spacing.md, paddingBottom: 0, gap: 10 },
  hi: { fontSize: 22, fontWeight: '800', color: colors.text },
  section: { fontWeight: '800', fontSize: 16, marginBottom: 10, color: colors.text },
  route: { fontWeight: '800', color: colors.text, marginBottom: 4 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
})

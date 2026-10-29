import React, { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import { getVehicleById, type Vehicle } from '../api/vehicles'
import SeatMap from '../components/SeatMap'
import { Button, Card, ErrorBox, Muted } from '../components/ui'
import { getVehicleType } from '../data/constants'
import { useAuth } from '../context/AuthContext'
import { formatCurrency, formatDate, formatTime } from '../utils/format'
import { computePricing } from '../utils/pricing'
import { colors, spacing } from '../theme'

export default function VehicleDetailScreen({ navigation, route }: any) {
  const { id } = route.params
  const { isAuthenticated, isPassenger } = useAuth()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [selected, setSelected] = useState<number[]>([])
  const [whole, setWhole] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getVehicleById(id)
      .then(setVehicle)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
  if (!vehicle) return <ErrorBox message={error || 'Vehicle not found'} />

  const layout = getVehicleType(vehicle.vehicleType).seatLayout
  const pricing = computePricing(vehicle, { seats: selected, bookWholeVehicle: whole })

  const toggle = (seat: number) => {
    setWhole(false)
    setSelected((prev) => (prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat].sort((a, b) => a - b)))
  }

  const book = () => {
    if (!isAuthenticated) {
      navigation.navigate('Login')
      return
    }
    if (!isPassenger) {
      setError('Only passenger accounts can book seats.')
      return
    }
    if (!whole && selected.length === 0) {
      setError('Select at least one seat, or book the whole vehicle.')
      return
    }
    navigation.navigate('Payment', {
      vehicleId: vehicle.id,
      seats: selected,
      bookWholeVehicle: whole,
      previewTotal: pricing.total,
    })
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: spacing.md }}>
      <Text style={styles.route}>
        {vehicle.fromCity} → {vehicle.toCity}
      </Text>
      <Muted>
        {vehicle.vehicleName} · {formatDate(vehicle.date)} · {formatTime(vehicle.time)}
      </Muted>
      <Muted>
        From {formatCurrency(vehicle.pricePerSeat)}/seat
        {vehicle.driverName ? ` · Driver ${vehicle.driverName}` : ''}
      </Muted>

      <ErrorBox message={error} />

      <Card>
        <Text style={styles.section}>Choose seats</Text>
        <SeatMap
          totalSeats={vehicle.totalSeats}
          bookedSeats={vehicle.bookedSeats || []}
          selectedSeats={whole ? [] : selected}
          frontSeats={vehicle.frontSeats || []}
          seatGenders={vehicle.seatGenders || {}}
          layout={layout}
          onToggle={toggle}
        />
        {vehicle.wholeVehiclePrice ? (
          <View style={{ marginTop: 10 }}>
            <Button
              title={
                whole
                  ? `Whole vehicle selected (${formatCurrency(vehicle.wholeVehiclePrice)})`
                  : `Book whole vehicle — ${formatCurrency(vehicle.wholeVehiclePrice)}`
              }
              variant={whole ? 'primary' : 'outline'}
              onPress={() => {
                setWhole((w) => !w)
                setSelected([])
              }}
            />
          </View>
        ) : null}
      </Card>

      <Card>
        <Text style={styles.section}>Price</Text>
        <Text style={styles.line}>Subtotal: {formatCurrency(pricing.subtotal)}</Text>
        <Text style={styles.line}>Service fee: {formatCurrency(pricing.serviceFee)}</Text>
        <Text style={styles.total}>Total: {formatCurrency(pricing.total)}</Text>
        <Button title="Continue to payment" onPress={book} />
      </Card>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  route: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 4 },
  section: { fontSize: 16, fontWeight: '800', marginBottom: 8, color: colors.text },
  line: { color: colors.muted, marginBottom: 4 },
  total: { fontSize: 18, fontWeight: '800', color: colors.primary, marginVertical: 10 },
})

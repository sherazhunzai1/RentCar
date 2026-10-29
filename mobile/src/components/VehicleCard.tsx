import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { Vehicle } from '../api/vehicles'
import { formatCurrency, formatDate, formatTime } from '../utils/format'
import { colors, spacing } from '../theme'

export default function VehicleCard({
  vehicle,
  onPress,
}: {
  vehicle: Vehicle
  onPress: () => void
}) {
  const available =
    vehicle.availableSeats ??
    Math.max(0, vehicle.totalSeats - (vehicle.bookedSeats?.length || 0))

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}>
      <View style={styles.top}>
        <Text style={styles.route}>
          {vehicle.fromCity} → {vehicle.toCity}
        </Text>
        <Text style={styles.price}>{formatCurrency(vehicle.pricePerSeat)}/seat</Text>
      </View>
      <Text style={styles.meta}>
        {vehicle.vehicleName} · {vehicle.vehicleType?.toUpperCase()}
      </Text>
      <Text style={styles.meta}>
        {formatDate(vehicle.date)} · {formatTime(vehicle.time)} · {available} seats left
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 6 },
  route: { flex: 1, fontSize: 16, fontWeight: '800', color: colors.text },
  price: { fontSize: 14, fontWeight: '700', color: colors.primary },
  meta: { color: colors.muted, fontSize: 13, marginTop: 2 },
})

import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Linking, ScrollView, StyleSheet, Text, View } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import { getVehicleById } from '../api/vehicles'
import { createBooking } from '../api/bookings'
import { Button, Card, ErrorBox, Muted } from '../components/ui'
import { formatCurrency } from '../utils/format'
import { computePricing } from '../utils/pricing'
import { colors, spacing } from '../theme'

export default function PaymentScreen({ navigation, route }: any) {
  const { vehicleId, seats = [], bookWholeVehicle = false } = route.params || {}
  const [method, setMethod] = useState<'safepay' | 'cash'>('safepay')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [vehicle, setVehicle] = useState<any>(null)

  useEffect(() => {
    getVehicleById(vehicleId)
      .then(setVehicle)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [vehicleId])

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
  if (!vehicle) return <ErrorBox message={error || 'Trip not found'} />

  const pricing = computePricing(vehicle, { seats, bookWholeVehicle })

  const pay = async () => {
    setError('')
    setSubmitting(true)
    try {
      const booking = await createBooking({
        vehicle,
        seats,
        bookWholeVehicle,
        paymentMethod: method,
      })

      if (method === 'safepay' && booking.payment?.redirectUrl) {
        await WebBrowser.openBrowserAsync(booking.payment.redirectUrl)
        navigation.replace('BookingConfirmation', { id: booking.id })
        return
      }

      navigation.replace('BookingConfirmation', { id: booking.id })
    } catch (e: any) {
      setError(e.message || 'Payment failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.title}>Checkout</Text>
      <Muted>
        {vehicle.fromCity} → {vehicle.toCity} · {bookWholeVehicle ? 'Whole vehicle' : `Seats ${seats.join(', ')}`}
      </Muted>
      <ErrorBox message={error} />

      <Card>
        <Text style={styles.section}>Payment method</Text>
        <View style={styles.row}>
          <Button
            title="Safepay (Card / Online)"
            variant={method === 'safepay' ? 'primary' : 'outline'}
            onPress={() => setMethod('safepay')}
          />
        </View>
        <View style={{ height: 10 }} />
        <Button
          title="Cash on boarding"
          variant={method === 'cash' ? 'primary' : 'outline'}
          onPress={() => setMethod('cash')}
        />
      </Card>

      <Card>
        <Text style={styles.line}>Subtotal: {formatCurrency(pricing.subtotal)}</Text>
        <Text style={styles.line}>Service fee: {formatCurrency(pricing.serviceFee)}</Text>
        <Text style={styles.total}>Total: {formatCurrency(pricing.total)}</Text>
        <Button
          title={method === 'safepay' ? 'Pay with Safepay' : 'Confirm reservation'}
          onPress={pay}
          loading={submitting}
        />
        <View style={{ height: 8 }} />
        <Button title="Open website help" variant="outline" onPress={() => Linking.openURL('https://gaadi.pk/contact')} />
      </Card>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.md, backgroundColor: colors.bg, flexGrow: 1 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 6 },
  section: { fontWeight: '800', marginBottom: 10, color: colors.text },
  row: { gap: 8 },
  line: { color: colors.muted, marginBottom: 4 },
  total: { fontSize: 18, fontWeight: '800', color: colors.primary, marginVertical: 10 },
})

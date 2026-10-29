import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { createVehicle, getVehicleById, updateVehicle } from '../api/vehicles'
import { getLocations } from '../api/locations'
import { AMENITIES, FALLBACK_CITIES, VEHICLE_TYPES, getVehicleType } from '../data/constants'
import { Button, ErrorBox, Field, Title } from '../components/ui'
import { todayISO } from '../utils/format'
import { useAuth } from '../context/AuthContext'
import { colors, spacing } from '../theme'

const emptyForm = {
  vehicleType: 'car',
  vehicleName: '',
  vehicleNumber: '',
  fromCity: '',
  toCity: '',
  date: todayISO(),
  time: '09:00',
  totalSeats: '4',
  pricePerSeat: '',
  frontSeatPrice: '',
  wholeVehiclePrice: '',
  amenities: [] as string[],
}

export default function PostVehicleScreen({ navigation, route }: any) {
  const editId = route.params?.id as string | undefined
  const { user } = useAuth()
  const [form, setForm] = useState(emptyForm)
  const [cities, setCities] = useState<string[]>(FALLBACK_CITIES)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(!!editId)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getLocations()
      .then((locs) => {
        if (locs.length) setCities(locs.map((l) => l.name))
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!editId) return
    getVehicleById(editId)
      .then((v) => {
        if (v.driverId !== user?.id) {
          setError('You can only edit your own listings.')
          return
        }
        setForm({
          vehicleType: v.vehicleType,
          vehicleName: v.vehicleName,
          vehicleNumber: v.vehicleNumber,
          fromCity: v.fromCity,
          toCity: v.toCity,
          date: v.date,
          time: v.time,
          totalSeats: String(v.totalSeats),
          pricePerSeat: String(v.pricePerSeat),
          frontSeatPrice: v.frontSeatPrice != null ? String(v.frontSeatPrice) : '',
          wholeVehiclePrice: v.wholeVehiclePrice != null ? String(v.wholeVehiclePrice) : '',
          amenities: v.amenities || [],
        })
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [editId, user?.id])

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const toggleAmenity = (a: string) =>
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }))

  const pickType = (typeId: string) => {
    const type = getVehicleType(typeId)
    setForm((f) => ({
      ...f,
      vehicleType: typeId,
      totalSeats: String(Math.min(Number(f.totalSeats) || type.defaultSeats, type.maxSeats)),
    }))
  }

  const save = async () => {
    setError('')
    if (form.fromCity === form.toCity) {
      setError('Departure and destination must differ.')
      return
    }
    const max = getVehicleType(form.vehicleType).maxSeats
    const seats = Number(form.totalSeats)
    if (!(seats >= 1 && seats <= max)) {
      setError(`Seats must be between 1 and ${max}.`)
      return
    }
    if (!(Number(form.pricePerSeat) > 0)) {
      setError('Enter a valid price per seat.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        vehicleType: form.vehicleType,
        vehicleName: form.vehicleName,
        vehicleNumber: form.vehicleNumber,
        fromCity: form.fromCity,
        toCity: form.toCity,
        date: form.date,
        time: form.time,
        totalSeats: seats,
        pricePerSeat: Number(form.pricePerSeat),
        frontSeatPrice: form.frontSeatPrice,
        wholeVehiclePrice: form.wholeVehiclePrice,
        frontSeats: [1],
        amenities: form.amenities,
      }
      if (editId) await updateVehicle(editId, payload)
      else await createVehicle(payload)
      navigation.goBack()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />

  return (
    <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
      <Title>{editId ? 'Edit listing' : 'Post a vehicle'}</Title>
      <ErrorBox message={error} />

      <Text style={styles.label}>Vehicle type</Text>
      <View style={styles.chips}>
        {VEHICLE_TYPES.map((t) => (
          <Pressable key={t.id} onPress={() => pickType(t.id)} style={[styles.chip, form.vehicleType === t.id && styles.chipOn]}>
            <Text style={[styles.chipText, form.vehicleType === t.id && styles.chipTextOn]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      <Field label="Vehicle name" value={form.vehicleName} onChangeText={(v) => set('vehicleName', v)} />
      <Field label="Registration number" value={form.vehicleNumber} onChangeText={(v) => set('vehicleNumber', v)} />
      <Field label="From city" value={form.fromCity} onChangeText={(v) => set('fromCity', v)} placeholder={cities[0]} />
      <Field label="To city" value={form.toCity} onChangeText={(v) => set('toCity', v)} placeholder={cities[1]} />
      <Field label="Date (YYYY-MM-DD)" value={form.date} onChangeText={(v) => set('date', v)} />
      <Field label="Time (HH:MM)" value={form.time} onChangeText={(v) => set('time', v)} />
      <Field label="Total seats" keyboardType="number-pad" value={form.totalSeats} onChangeText={(v) => set('totalSeats', v)} />
      <Field label="Price per seat (PKR)" keyboardType="number-pad" value={form.pricePerSeat} onChangeText={(v) => set('pricePerSeat', v)} />
      <Field label="Front seat price (optional)" keyboardType="number-pad" value={form.frontSeatPrice} onChangeText={(v) => set('frontSeatPrice', v)} />
      <Field label="Whole vehicle price (optional)" keyboardType="number-pad" value={form.wholeVehiclePrice} onChangeText={(v) => set('wholeVehiclePrice', v)} />

      <Text style={styles.label}>Amenities</Text>
      <View style={styles.chips}>
        {AMENITIES.map((a) => (
          <Pressable key={a} onPress={() => toggleAmenity(a)} style={[styles.chip, form.amenities.includes(a) && styles.chipOn]}>
            <Text style={[styles.chipText, form.amenities.includes(a) && styles.chipTextOn]}>{a}</Text>
          </Pressable>
        ))}
      </View>

      <Button title={editId ? 'Save changes' : 'Publish listing'} onPress={save} loading={saving} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.md, backgroundColor: colors.bg, flexGrow: 1, paddingBottom: 40 },
  label: { fontWeight: '700', marginBottom: 8, color: colors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  chipOn: { borderColor: colors.primary, backgroundColor: '#eff6ff' },
  chipText: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  chipTextOn: { color: colors.primary },
})

import React, { useCallback, useState } from 'react'
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { getVehicles, type Vehicle } from '../api/vehicles'
import VehicleCard from '../components/VehicleCard'
import { Empty, ErrorBox, Field, Button } from '../components/ui'
import { colors, spacing } from '../theme'

export default function VehiclesScreen({ navigation, route }: any) {
  const initial = route.params || {}
  const [fromCity, setFromCity] = useState(initial.fromCity || '')
  const [toCity, setToCity] = useState(initial.toCity || '')
  const [date, setDate] = useState(initial.date || '')
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const list = await getVehicles({
        fromCity: fromCity.trim() || undefined,
        toCity: toCity.trim() || undefined,
        date: date.trim() || undefined,
      })
      setVehicles(list)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [fromCity, toCity, date])

  useFocusEffect(
    useCallback(() => {
      load()
    }, [load]),
  )

  return (
    <View style={styles.screen}>
      <View style={styles.filters}>
        <Field label="From" value={fromCity} onChangeText={setFromCity} placeholder="Any" />
        <Field label="To" value={toCity} onChangeText={setToCity} placeholder="Any" />
        <Field label="Date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
        <Button title="Apply filters" onPress={load} />
      </View>
      <ErrorBox message={error} />
      {loading && !vehicles.length ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.md, paddingTop: 0 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
          ListEmptyComponent={<Empty message="No vehicles match your search." />}
          renderItem={({ item }) => (
            <VehicleCard
              vehicle={item}
              onPress={() => navigation.navigate('VehicleDetail', { id: item.id })}
            />
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  filters: { padding: spacing.md, paddingBottom: 0 },
})

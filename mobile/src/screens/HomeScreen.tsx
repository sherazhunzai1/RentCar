import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { getVehicles, type Vehicle } from '../api/vehicles'
import VehicleCard from '../components/VehicleCard'
import { Button, Field, Card } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { colors, spacing } from '../theme'

export default function HomeScreen({ navigation }: any) {
  const { isAuthenticated, isDriver } = useAuth()
  const [fromCity, setFromCity] = useState('')
  const [toCity, setToCity] = useState('')
  const [date, setDate] = useState('')
  const [featured, setFeatured] = useState<Vehicle[]>([])

  useEffect(() => {
    getVehicles()
      .then((all) => setFeatured(all.slice(0, 5)))
      .catch(() => {})
  }, [])

  const search = () => {
    navigation.navigate('Vehicles', {
      fromCity: fromCity.trim(),
      toCity: toCity.trim(),
      date: date.trim(),
    })
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Gilgit-Baltistan & beyond</Text>
        <Text style={styles.heroTitle}>Book your seat to Hunza, Gilgit & Skardu.</Text>
        <Text style={styles.heroSub}>
          Reserve seats or a whole vehicle — pick your seat and pay online with gaadi.pk.
        </Text>
        <Button title="Find a Ride" onPress={() => navigation.navigate('Vehicles')} />
        {!isAuthenticated ? (
          <View style={{ marginTop: 10 }}>
            <Button title="Become a Driver" variant="outline" onPress={() => navigation.navigate('Signup')} />
          </View>
        ) : null}
        {isDriver ? (
          <View style={{ marginTop: 10 }}>
            <Button title="Driver Dashboard" variant="outline" onPress={() => navigation.navigate('Driver')} />
          </View>
        ) : null}
      </View>

      <Card>
        <Text style={styles.section}>Search</Text>
        <Field label="From" placeholder="e.g. Islamabad" value={fromCity} onChangeText={setFromCity} />
        <Field label="To" placeholder="e.g. Hunza" value={toCity} onChangeText={setToCity} />
        <Field label="Date (YYYY-MM-DD)" placeholder="optional" value={date} onChangeText={setDate} />
        <Button title="Search vehicles" onPress={search} />
      </Card>

      <Text style={styles.section}>Featured trips</Text>
      {featured.map((v) => (
        <VehicleCard
          key={v.id}
          vehicle={v}
          onPress={() => navigation.navigate('VehicleDetail', { id: v.id })}
        />
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 40 },
  hero: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  eyebrow: { color: '#bfdbfe', fontWeight: '700', marginBottom: 8, fontSize: 12 },
  heroTitle: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 8 },
  heroSub: { color: '#dbeafe', fontSize: 15, lineHeight: 22, marginBottom: 16 },
  section: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 10, marginTop: 8 },
})

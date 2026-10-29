import React, { useState } from 'react'
import { Linking, ScrollView, StyleSheet, Text } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { Button, ErrorBox, Field, Title, Muted } from '../components/ui'
import { SITE_URL } from '../config'
import { colors, spacing } from '../theme'

export default function ProfileScreen() {
  const { user, updateProfile, logout, isDriver } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [licenseNumber, setLicenseNumber] = useState(user?.licenseNumber || '')
  const [experience, setExperience] = useState(String(user?.experience ?? ''))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const save = async () => {
    setError('')
    setSaved(false)
    setSaving(true)
    try {
      const updates: Record<string, unknown> = { name, phone }
      if (isDriver) {
        updates.licenseNumber = licenseNumber
        updates.experience = Number(experience) || 0
      }
      await updateProfile(updates)
      setSaved(true)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Title>Profile</Title>
      <Muted>
        {user?.email} · {user?.role}
      </Muted>
      <ErrorBox message={error} />
      {saved ? <Text style={styles.ok}>Profile updated.</Text> : null}
      <Field label="Name" value={name} onChangeText={setName} />
      <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      {isDriver ? (
        <>
          <Field label="Licence number" value={licenseNumber} onChangeText={setLicenseNumber} />
          <Field label="Experience (years)" value={experience} onChangeText={setExperience} keyboardType="number-pad" />
        </>
      ) : null}
      <Button title="Save changes" onPress={save} loading={saving} />
      <Text style={{ height: 12 }} />
      <Button title="Open gaadi.pk (policies & chat)" variant="outline" onPress={() => Linking.openURL(SITE_URL)} />
      <Text style={{ height: 12 }} />
      <Button title="Log out" variant="danger" onPress={() => logout()} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.md, backgroundColor: colors.bg, flexGrow: 1 },
  ok: { color: colors.success, marginBottom: 10, fontWeight: '600' },
})

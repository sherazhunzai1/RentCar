import React, { useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { Button, ErrorBox, Field, Title, Subtitle } from '../components/ui'
import { colors, spacing } from '../theme'

export default function SignupScreen({ navigation }: any) {
  const { signup } = useAuth()
  const [role, setRole] = useState<'passenger' | 'driver'>('passenger')
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
    gender: '',
    licenseNumber: '',
    experience: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const onSubmit = async () => {
    setError('')
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    if (role === 'passenger' && !form.gender) {
      setError('Please select your gender.')
      return
    }
    setLoading(true)
    try {
      await signup({ ...form, role })
    } catch (e: any) {
      setError(e.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
        <Title>Join gaadi.pk</Title>
        <Subtitle>Choose passenger to book seats, or driver to post vehicles and accept bookings.</Subtitle>

        <View style={styles.roleRow}>
          {(['passenger', 'driver'] as const).map((r) => (
            <Pressable
              key={r}
              onPress={() => setRole(r)}
              style={[styles.role, role === r && styles.roleActive]}
            >
              <Text style={[styles.roleText, role === r && styles.roleTextActive]}>
                {r === 'passenger' ? "I'm a Passenger" : "I'm a Driver"}
              </Text>
            </Pressable>
          ))}
        </View>

        <ErrorBox message={error} />
        <Field label="Full name" value={form.name} onChangeText={(v) => set('name', v)} />
        <Field label="Email" autoCapitalize="none" keyboardType="email-address" value={form.email} onChangeText={(v) => set('email', v)} />
        <Field label="Phone" keyboardType="phone-pad" value={form.phone} onChangeText={(v) => set('phone', v)} />
        <Field label="Password" secureTextEntry value={form.password} onChangeText={(v) => set('password', v)} />
        <Field label="Confirm password" secureTextEntry value={form.confirm} onChangeText={(v) => set('confirm', v)} />

        {role === 'passenger' ? (
          <View style={styles.roleRow}>
            {['male', 'female'].map((g) => (
              <Pressable
                key={g}
                onPress={() => set('gender', g)}
                style={[styles.role, form.gender === g && styles.roleActive]}
              >
                <Text style={[styles.roleText, form.gender === g && styles.roleTextActive]}>
                  {g[0].toUpperCase() + g.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <>
            <Field label="Licence number" value={form.licenseNumber} onChangeText={(v) => set('licenseNumber', v)} />
            <Field label="Years of experience" keyboardType="number-pad" value={form.experience} onChangeText={(v) => set('experience', v)} />
          </>
        )}

        <Button title="Sign Up" onPress={onSubmit} loading={loading} />
        <View style={styles.foot}>
          <Text style={styles.footText}>Already have an account? </Text>
          <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
            Log in
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.lg, backgroundColor: colors.bg, flexGrow: 1 },
  roleRow: { flexDirection: 'row', gap: 8, marginBottom: spacing.md },
  role: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  roleActive: { borderColor: colors.primary, backgroundColor: '#eff6ff' },
  roleText: { fontWeight: '600', color: colors.muted, fontSize: 13 },
  roleTextActive: { color: colors.primary },
  foot: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg, flexWrap: 'wrap' },
  footText: { color: colors.muted },
  link: { color: colors.primary, fontWeight: '700' },
})

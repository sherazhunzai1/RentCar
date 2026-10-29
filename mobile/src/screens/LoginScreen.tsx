import React, { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { Button, ErrorBox, Field, Title, Subtitle } from '../components/ui'
import { colors, spacing } from '../theme'

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      await login({ email: email.trim(), password })
    } catch (e: any) {
      setError(e.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
        <Title>Welcome to gaadi.pk</Title>
        <Subtitle>
          Log in to book seats as a passenger, or manage your vehicles as a driver.
        </Subtitle>
        <ErrorBox message={error} />
        <Field
          label="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
        />
        <Field
          label="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="Your password"
        />
        <Button title="Log In" onPress={onSubmit} loading={loading} />

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.or}>or</Text>
          <View style={styles.line} />
        </View>

        <Button title="Create passenger or driver account" variant="outline" onPress={() => navigation.navigate('Signup')} />

        <Text style={styles.hint}>
          Passengers book seats to Hunza, Gilgit & Skardu. Drivers post trips and earn.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.lg, backgroundColor: colors.bg, flexGrow: 1, justifyContent: 'center' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.lg, gap: 10 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  or: { color: colors.muted, fontWeight: '600' },
  hint: { marginTop: spacing.lg, color: colors.muted, textAlign: 'center', lineHeight: 20, fontSize: 13 },
})

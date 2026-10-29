import React from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native'
import { colors, spacing } from '../theme'

export function Screen({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.screen, style]}>{children}</View>
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>
}

export function Title({ children }: { children: React.ReactNode }) {
  return <Text style={styles.title}>{children}</Text>
}

export function Subtitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.subtitle}>{children}</Text>
}

export function Muted({ children }: { children: React.ReactNode }) {
  return <Text style={styles.muted}>{children}</Text>
}

export function Field({
  label,
  ...props
}: { label: string } & TextInputProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        style={styles.input}
        {...props}
      />
    </View>
  )
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  loading,
}: {
  title: string
  onPress: () => void
  variant?: 'primary' | 'outline' | 'danger'
  disabled?: boolean
  loading?: boolean
}) {
  const isOutline = variant === 'outline'
  const isDanger = variant === 'danger'
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        isOutline && styles.btnOutline,
        isDanger && styles.btnDanger,
        (disabled || loading) && styles.btnDisabled,
        pressed && !disabled && { opacity: 0.9 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? colors.primary : '#fff'} />
      ) : (
        <Text style={[styles.btnText, isOutline && styles.btnTextOutline]}>{title}</Text>
      )}
    </Pressable>
  )
}

export function ErrorBox({ message }: { message?: string }) {
  if (!message) return null
  return (
    <View style={styles.errorBox}>
      <Text style={styles.errorText}>{message}</Text>
    </View>
  )
}

export function Empty({ message }: { message: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.muted}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, marginBottom: 6 },
  subtitle: { fontSize: 15, color: colors.muted, marginBottom: spacing.md, lineHeight: 22 },
  muted: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  field: { marginBottom: spacing.md },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  btnOutline: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  btnDanger: { backgroundColor: colors.danger },
  btnDisabled: { opacity: 0.55 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  btnTextOutline: { color: colors.primary },
  errorBox: {
    backgroundColor: colors.dangerBg,
    borderRadius: 10,
    padding: 12,
    marginBottom: spacing.md,
  },
  errorText: { color: colors.danger, fontSize: 14 },
  empty: { padding: spacing.xl, alignItems: 'center' },
})

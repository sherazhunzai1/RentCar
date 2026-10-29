import React from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../context/AuthContext'
import { colors } from '../theme'

import HomeScreen from '../screens/HomeScreen'
import LoginScreen from '../screens/LoginScreen'
import SignupScreen from '../screens/SignupScreen'
import VehiclesScreen from '../screens/VehiclesScreen'
import VehicleDetailScreen from '../screens/VehicleDetailScreen'
import PaymentScreen from '../screens/PaymentScreen'
import MyBookingsScreen from '../screens/MyBookingsScreen'
import BookingConfirmationScreen from '../screens/BookingConfirmationScreen'
import DriverDashboardScreen from '../screens/DriverDashboardScreen'
import PostVehicleScreen from '../screens/PostVehicleScreen'
import ProfileScreen from '../screens/ProfileScreen'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

type IconName = React.ComponentProps<typeof Ionicons>['name']

function tabIcon(focused: IconName, outline: IconName) {
  return ({ color, size, focused: isFocused }: { color: string; size: number; focused: boolean }) => (
    <Ionicons name={isFocused ? focused : outline} size={size} color={color} />
  )
}

const tabScreenOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.muted,
  tabBarStyle: {
    backgroundColor: '#fff',
    borderTopColor: colors.border,
    height: 60,
    paddingBottom: 6,
    paddingTop: 4,
  },
  tabBarLabelStyle: { fontSize: 11, fontWeight: '600' as const },
}

function PassengerTabs() {
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ title: 'Home', tabBarIcon: tabIcon('home', 'home-outline') }}
      />
      <Tab.Screen
        name="VehiclesTab"
        component={VehiclesScreen}
        options={{ title: 'Rides', tabBarIcon: tabIcon('car', 'car-outline') }}
      />
      <Tab.Screen
        name="MyBookings"
        component={MyBookingsScreen}
        options={{ title: 'Bookings', tabBarIcon: tabIcon('ticket', 'ticket-outline') }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile', tabBarIcon: tabIcon('person', 'person-outline') }}
      />
    </Tab.Navigator>
  )
}

function DriverTabs() {
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen
        name="DriverHome"
        component={DriverDashboardScreen}
        options={{ title: 'Dashboard', tabBarIcon: tabIcon('speedometer', 'speedometer-outline') }}
      />
      <Tab.Screen
        name="Rides"
        component={VehiclesScreen}
        options={{ title: 'Browse', tabBarIcon: tabIcon('car', 'car-outline') }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile', tabBarIcon: tabIcon('person', 'person-outline') }}
      />
    </Tab.Navigator>
  )
}

function AuthHeader() {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>
        gaadi<Text style={{ color: colors.accent }}>.pk</Text>
      </Text>
    </View>
  )
}

export default function RootNavigator() {
  const { user, loading, isDriver } = useAuth()

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    )
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerTintColor: colors.primary,
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        {!user ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerTitle: () => <AuthHeader />, headerBackVisible: false }}
            />
            <Stack.Screen
              name="Signup"
              component={SignupScreen}
              options={{ title: 'Create account', headerTitle: () => <AuthHeader /> }}
            />
          </>
        ) : isDriver ? (
          <>
            <Stack.Screen name="Main" component={DriverTabs} options={{ headerShown: false }} />
            <Stack.Screen name="Vehicles" component={VehiclesScreen} options={{ title: 'Browse rides' }} />
            <Stack.Screen name="VehicleDetail" component={VehicleDetailScreen} options={{ title: 'Trip details' }} />
            <Stack.Screen name="Driver" component={DriverDashboardScreen} options={{ title: 'Dashboard' }} />
            <Stack.Screen name="PostVehicle" component={PostVehicleScreen} options={{ title: 'Post vehicle' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={PassengerTabs} options={{ headerShown: false }} />
            <Stack.Screen name="Vehicles" component={VehiclesScreen} options={{ title: 'Find a ride' }} />
            <Stack.Screen name="VehicleDetail" component={VehicleDetailScreen} options={{ title: 'Trip details' }} />
            <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Payment' }} />
            <Stack.Screen
              name="BookingConfirmation"
              component={BookingConfirmationScreen}
              options={{ title: 'Confirmation' }}
            />
            <Stack.Screen name="MyBookings" component={MyBookingsScreen} options={{ title: 'My bookings' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

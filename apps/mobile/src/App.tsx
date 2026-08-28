import { useState, useEffect, useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { AuthProvider, useAuth } from "./auth";
import { colors } from "./theme";
import { api, type ClinicListItem, type ClinicDetail, type ServiceItem, type MyBooking } from "./api";

// Screens
import { HomeScreen } from "./screens/HomeScreen";
import { ClinicDetailScreen } from "./screens/ClinicDetailScreen";
import { ServiceListScreen } from "./screens/ServiceListScreen";
import { BookingScreen } from "./screens/BookingScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { RegisterScreen } from "./screens/RegisterScreen";
import { MyBookingsScreen } from "./screens/MyBookingsScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { BookingsTabScreen } from "./screens/BookingsTabScreen";
import { ClinicsTabScreen } from "./screens/ClinicsTabScreen";

export type RootStackParamList = {
  Home: undefined;
  ClinicDetail: { slug: string };
  ServiceList: { slug: string; clinicId: string; category?: string };
  Booking: { clinicId: string; slug: string; serviceId: string; serviceName: string; category?: string };
  Login: { clinicId?: string; slug?: string };
  Register: { clinicId?: string; slug?: string };
  MyBookings: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="ClinicsTab"
        component={ClinicsTabScreen}
        options={{
          tabBarLabel: "Clinics",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="storefront-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="BookingsTab"
        component={BookingsTabScreen}
        options={{
          tabBarLabel: "Bookings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { customer, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={MainTabs} />
        <Stack.Screen name="ClinicDetail" component={ClinicDetailScreen} />
        <Stack.Screen name="ServiceList" component={ServiceListScreen} />
        <Stack.Screen name="Booking" component={BookingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppNavigator />
      </SafeAreaView>
    </AuthProvider>
  );
}

import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect, type ParamListBase } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { api, type MyBooking } from "../api";
import { useAuth } from "../auth";
import { colors, formatDateTime, formatPrice, bookingStatusColor } from "../theme";

type Nav = NativeStackNavigationProp<ParamListBase>;

export function BookingsTabScreen() {
  const { customer } = useAuth();
  const [bookings, setBookings] = useState<MyBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nav = useNavigation<Nav>();

  const load = useCallback(async () => {
    if (!customer) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    setError(null);
    try {
      const data = await api.myBookings();
      setBookings(data.items);
    } catch (e: any) {
      setError(e.message ?? "Unable to load bookings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [customer]);

  useFocusEffect(
    useCallback(() => {
      if (customer) {
        setLoading(true);
        load();
      }
    }, [customer, load]),
  );

  const onCancel = (id: string, ref: string) => {
    Alert.alert("Cancel Booking", `Cancel booking ${ref}?`, [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: async () => {
          try {
            await api.cancelBooking(id);
            setBookings((prev) => prev.filter((b) => b.id !== id));
            Alert.alert("Cancelled", `Booking ${ref} has been cancelled`);
          } catch (e: any) {
            Alert.alert("Error", e.message ?? "Unable to cancel");
          }
        },
      },
    ]);
  };

  if (!customer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authGate}>
          <Ionicons name="calendar-outline" size={56} color={colors.textTertiary} />
          <Text style={styles.authTitle}>Your Bookings</Text>
          <Text style={styles.authSubtitle}>Login to view and manage your appointments</Text>
          <View style={styles.authButtons}>
            <TouchableOpacity style={[styles.authBtn, styles.loginBtn]} onPress={() => nav.navigate("Login", {})}>
              <Text style={styles.authBtnText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.authBtn, styles.registerBtn]} onPress={() => nav.navigate("Register", {})}>
              <Text style={styles.authBtnText}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error && bookings.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorState}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Connection Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => { setRefreshing(true); load(); }}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.title}>My Bookings</Text>}
        renderItem={({ item }) => {
          const statusColor = bookingStatusColor(item.status);
          const canCancel = item.status === "Pending" || item.status === "Confirmed";
          return (
            <View style={styles.bookingCard}>
              <View style={styles.bookingHeader}>
                <Text style={styles.bookingRef}>{item.ref}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
                  <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
                </View>
              </View>
              <Text style={styles.serviceName}>{item.service.nameEn}</Text>
              <Text style={styles.bookingTime}>{formatDateTime(item.startsAt)}</Text>
              <View style={styles.bookingFooter}>
                <Text style={styles.bookingPrice}>{formatPrice(item.price)}</Text>
                <View style={styles.employeeChip}>
                  <View style={[styles.employeeDot, { backgroundColor: item.employee.color }]} />
                  <Text style={styles.employeeName}>{item.employee.nameEn}</Text>
                </View>
              </View>
              {canCancel && (
                <TouchableOpacity style={styles.cancelBtn} onPress={() => onCancel(item.id, item.ref)}>
                  <Text style={styles.cancelText}>Cancel Booking</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No bookings yet</Text>
            <Text style={styles.emptySubtext}>Browse clinics to book your first appointment</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { padding: 16 },
  title: { fontSize: 24, fontWeight: "700", color: colors.text, marginBottom: 16 },
  authGate: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
  authTitle: { fontSize: 22, fontWeight: "700", color: colors.text, marginBottom: 8, marginTop: 12 },
  authSubtitle: { fontSize: 14, color: colors.textSecondary, textAlign: "center", marginBottom: 24 },
  authButtons: { flexDirection: "row", gap: 12, justifyContent: "center" },
  authBtn: { borderRadius: 10, paddingVertical: 12, paddingHorizontal: 28 },
  loginBtn: { backgroundColor: colors.primary },
  registerBtn: { backgroundColor: colors.primaryLight },
  authBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  errorState: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
  errorIcon: { fontSize: 48, marginBottom: 12 },
  errorTitle: { fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: 8 },
  errorMessage: { fontSize: 14, color: colors.textSecondary, textAlign: "center", marginBottom: 20 },
  retryBtn: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  retryText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  bookingCard: { backgroundColor: colors.card, borderRadius: 14, marginBottom: 12, padding: 16 },
  bookingHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  bookingRef: { fontSize: 12, color: colors.textTertiary, fontWeight: "500" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: "600" },
  serviceName: { fontSize: 16, fontWeight: "600", color: colors.text, marginBottom: 4 },
  bookingTime: { fontSize: 13, color: colors.textSecondary, marginBottom: 12 },
  bookingFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  bookingPrice: { fontSize: 15, fontWeight: "700", color: colors.primary },
  employeeChip: { flexDirection: "row", alignItems: "center", gap: 6 },
  employeeDot: { width: 8, height: 8, borderRadius: 4 },
  employeeName: { fontSize: 12, color: colors.textSecondary },
  cancelBtn: { marginTop: 12, paddingVertical: 8, alignItems: "center", borderRadius: 8, backgroundColor: colors.danger + "10" },
  cancelText: { fontSize: 13, color: colors.danger, fontWeight: "500" },
  emptyText: { fontSize: 16, color: colors.textSecondary, fontWeight: "600" },
  emptySubtext: { fontSize: 13, color: colors.textTertiary, marginTop: 4 },
});

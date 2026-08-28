import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, type ParamListBase } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { api, type EmployeeItem } from "../api";
import { useAuth } from "../auth";
import { colors } from "../theme";

type Nav = NativeStackNavigationProp<ParamListBase>;

const TIME_SLOTS = [
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
  "20:00", "20:30",
];

const DAYS_AHEAD = 14;

export function BookingScreen() {
  const route = useRoute<any>();
  const nav = useNavigation<Nav>();
  const { customer } = useAuth();
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [empLoading, setEmpLoading] = useState(true);
  const [empError, setEmpError] = useState<string | null>(null);

  const { clinicId, serviceId, serviceName, slug, category } = route.params;
  const clinicSlug = slug ?? route.params.slug;
  const serviceCategory = category ?? "";

  const dates = Array.from({ length: DAYS_AHEAD }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      label: d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }),
      value: d,
    };
  });

  const loadEmployees = useCallback(async () => {
    if (!clinicSlug) {
      setEmpError("Missing clinic information");
      setEmpLoading(false);
      return;
    }
    setEmpError(null);
    try {
      const data = await api.getEmployees(clinicSlug, serviceCategory);
      setEmployees(data.items);
    } catch (e: any) {
      setEmpError(e.message ?? "Unable to load staff");
    } finally {
      setEmpLoading(false);
    }
  }, [clinicSlug, serviceCategory]);

  useEffect(() => { loadEmployees(); }, [loadEmployees]);

  const handleBooking = async () => {
    if (!customer) {
      nav.navigate("Login", { clinicId, slug: clinicSlug });
      return;
    }
    if (!selectedSlot) {
      Alert.alert("Select a time", "Please choose a time slot");
      return;
    }

    const date = dates[selectedDate].value;
    const [h, m] = selectedSlot.split(":");
    date.setHours(parseInt(h), parseInt(m), 0, 0);

    setLoading(true);
    try {
      const result = await api.createBooking({
        serviceId,
        employeeId: selectedEmployee ?? "00000000-0000-0000-0000-000000000000",
        startsAt: date.toISOString(),
        notes: notes.trim() || undefined,
      });
      Alert.alert(
        "Booking Confirmed!",
        `Your booking ref: ${result.ref}\nStatus: ${result.status}`,
        [
          { text: "View Bookings", onPress: () => nav.navigate("Home", {}) },
          { text: "OK", onPress: () => nav.goBack() },
        ],
      );
    } catch (e: any) {
      Alert.alert("Booking Failed", e.message ?? "Unable to create booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.serviceCard}>
          <Text style={styles.serviceName}>{serviceName}</Text>
        </View>

        <Text style={styles.label}>Select Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
          {dates.map((d, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.dateChip, selectedDate === i && styles.dateChipActive]}
              onPress={() => { setSelectedDate(i); setSelectedSlot(null); }}
            >
              <Text style={[styles.dateText, selectedDate === i && styles.dateTextActive]}>{d.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Select Time</Text>
        <View style={styles.slotsGrid}>
          {TIME_SLOTS.map((slot) => (
            <TouchableOpacity
              key={slot}
              style={[styles.slotChip, selectedSlot === slot && styles.slotChipActive]}
              onPress={() => setSelectedSlot(slot)}
            >
              <Text style={[styles.slotText, selectedSlot === slot && styles.slotTextActive]}>{slot}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Choose Specialist (optional)</Text>
        {empLoading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginBottom: 16 }} />
        ) : empError ? (
          <Text style={styles.empErrorText}>Unable to load specialists — we'll auto-assign for you</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.empScroll}>
            <TouchableOpacity
              style={[styles.empChip, !selectedEmployee && styles.empChipActive]}
              onPress={() => setSelectedEmployee(null)}
            >
              <Text style={[styles.empText, !selectedEmployee && styles.empTextActive]}>Any available</Text>
            </TouchableOpacity>
            {employees.map((emp) => (
              <TouchableOpacity
                key={emp.id}
                style={[styles.empChip, selectedEmployee === emp.id && styles.empChipActive]}
                onPress={() => setSelectedEmployee(emp.id)}
              >
                <View style={[styles.empDot, { backgroundColor: emp.color }]} />
                <Text style={[styles.empText, selectedEmployee === emp.id && styles.empTextActive]}>{emp.nameEn}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <Text style={styles.label}>Notes (optional)</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Any specific concerns or preferences..."
          placeholderTextColor={colors.textTertiary}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        {!customer && (
          <View style={styles.authPrompt}>
            <Text style={styles.authPromptText}>You need to login or register to book</Text>
            <View style={styles.authButtons}>
              <TouchableOpacity style={[styles.authBtn, styles.loginBtn]} onPress={() => nav.navigate("Login", { clinicId, slug: clinicSlug })}>
                <Text style={styles.authBtnText}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.authBtn, styles.registerBtn]} onPress={() => nav.navigate("Register", { clinicId, slug: clinicSlug })}>
                <Text style={styles.authBtnText}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.bookButton} onPress={handleBooking} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.bookButtonText}>Confirm Booking</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  backText: { fontSize: 14, color: colors.primary },
  headerTitle: { fontSize: 16, fontWeight: "600", color: colors.text },
  body: { padding: 16 },
  serviceCard: { backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 20 },
  serviceName: { fontSize: 16, fontWeight: "600", color: colors.text },
  label: { fontSize: 14, fontWeight: "600", color: colors.text, marginBottom: 10 },
  dateScroll: { marginBottom: 20 },
  dateChip: { backgroundColor: colors.card, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginRight: 8, borderWidth: 1, borderColor: colors.border },
  dateChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dateText: { fontSize: 13, color: colors.textSecondary },
  dateTextActive: { color: "#fff", fontWeight: "600" },
  slotsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  slotChip: { backgroundColor: colors.card, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: colors.border, minWidth: 70, alignItems: "center" },
  slotChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  slotText: { fontSize: 13, color: colors.textSecondary },
  slotTextActive: { color: "#fff", fontWeight: "600" },
  empScroll: { marginBottom: 20 },
  empChip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.card, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, borderWidth: 1, borderColor: colors.border },
  empChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  empDot: { width: 8, height: 8, borderRadius: 4 },
  empText: { fontSize: 13, color: colors.textSecondary },
  empTextActive: { color: "#fff", fontWeight: "600" },
  empErrorText: { fontSize: 13, color: colors.textTertiary, marginBottom: 16 },
  notesInput: { backgroundColor: colors.card, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: colors.text, marginBottom: 20, minHeight: 80, borderWidth: 1, borderColor: colors.border },
  authPrompt: { backgroundColor: colors.warning + "15", borderRadius: 12, padding: 16, marginBottom: 16 },
  authPromptText: { fontSize: 14, color: colors.warning, textAlign: "center", marginBottom: 12 },
  authButtons: { flexDirection: "row", gap: 12, justifyContent: "center" },
  authBtn: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 24 },
  loginBtn: { backgroundColor: colors.primary },
  registerBtn: { backgroundColor: colors.primaryLight },
  authBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  bookButton: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: "center", marginBottom: 32 },
  bookButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});

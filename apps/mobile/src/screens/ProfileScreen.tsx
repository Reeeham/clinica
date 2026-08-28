import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, type ParamListBase } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../auth";
import { colors } from "../theme";

type Nav = NativeStackNavigationProp<ParamListBase>;

export function ProfileScreen() {
  const { customer, signOut } = useAuth();
  const nav = useNavigation<Nav>();

  if (!customer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authGate}>
          <Ionicons name="person-circle-outline" size={64} color={colors.textTertiary} />
          <Text style={styles.authTitle}>Welcome</Text>
          <Text style={styles.authSubtitle}>Login or register to view your profile and bookings</Text>
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

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => signOut() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {customer.nameEn.substring(0, 2).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{customer.nameEn}</Text>
        <Text style={styles.phone}>{customer.phone}</Text>
        {customer.email && <Text style={styles.email}>{customer.email}</Text>}
      </View>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem} onPress={() => nav.navigate("Home", {})}>
          <Ionicons name="calendar-outline" size={22} color={colors.primary} />
          <Text style={styles.menuText}>My Bookings</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={20} color={colors.danger} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  authGate: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
  authTitle: { fontSize: 22, fontWeight: "700", color: colors.text, marginTop: 12 },
  authSubtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4, textAlign: "center", marginBottom: 24 },
  authButtons: { flexDirection: "row", gap: 12, justifyContent: "center" },
  authBtn: { borderRadius: 10, paddingVertical: 12, paddingHorizontal: 28 },
  loginBtn: { backgroundColor: colors.primary },
  registerBtn: { backgroundColor: colors.primaryLight },
  authBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  header: { alignItems: "center", paddingVertical: 32, borderBottomWidth: 1, borderBottomColor: colors.border },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  avatarText: { fontSize: 24, fontWeight: "700", color: "#fff" },
  name: { fontSize: 20, fontWeight: "700", color: colors.text },
  phone: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  email: { fontSize: 13, color: colors.textTertiary, marginTop: 2 },
  menu: { padding: 16 },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 14, gap: 12 },
  menuText: { flex: 1, fontSize: 15, color: colors.text },
  signOutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, marginHorizontal: 16, marginTop: "auto", marginBottom: 32, borderRadius: 12, backgroundColor: colors.danger + "10" },
  signOutText: { fontSize: 15, color: colors.danger, fontWeight: "600" },
});

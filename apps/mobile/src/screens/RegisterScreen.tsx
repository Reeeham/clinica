import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, type ParamListBase } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { api, DEFAULT_CLINIC_ID } from "../api";
import { useAuth } from "../auth";
import { colors } from "../theme";

type Nav = NativeStackNavigationProp<ParamListBase>;

export function RegisterScreen() {
  const route = useRoute<any>();
  const nav = useNavigation<Nav>();
  const { signIn } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [marketing, setMarketing] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert("Error", "Name and phone are required");
      return;
    }
    setLoading(true);
    try {
      const result = await api.register({
        clinicId: route.params?.clinicId ?? DEFAULT_CLINIC_ID,
        nameEn: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        marketingOptIn: marketing,
      });
      await signIn(result.token, result.customer);
      if (nav.canGoBack()) {
        nav.goBack();
      } else {
        nav.navigate("Home", {});
      }
    } catch (e: any) {
      Alert.alert("Registration Failed", e.message ?? "Unable to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => nav.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <View style={styles.body}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Book appointments in seconds</Text>
        <TextInput style={styles.input} placeholder="Full name" placeholderTextColor={colors.textTertiary} value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="01XXXXXXXXX" placeholderTextColor={colors.textTertiary} value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Email (optional)" placeholderTextColor={colors.textTertiary} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <View style={styles.marketingRow}>
          <Text style={styles.marketingText}>Receive offers & updates</Text>
          <Switch value={marketing} onValueChange={setMarketing} trackColor={{ true: colors.primary }} />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  backBtn: { padding: 16 },
  backText: { fontSize: 14, color: colors.primary },
  body: { flex: 1, justifyContent: "center", paddingHorizontal: 24 },
  title: { fontSize: 26, fontWeight: "700", color: colors.text, textAlign: "center" },
  subtitle: { fontSize: 14, color: colors.textSecondary, textAlign: "center", marginTop: 4, marginBottom: 32 },
  input: { backgroundColor: colors.card, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: colors.text, marginBottom: 12 },
  marketingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  marketingText: { fontSize: 14, color: colors.textSecondary },
  button: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});

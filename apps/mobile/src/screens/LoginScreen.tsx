import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, type ParamListBase } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { api, DEFAULT_CLINIC_ID } from "../api";
import { useAuth } from "../auth";
import { colors } from "../theme";

type Nav = NativeStackNavigationProp<ParamListBase>;

export function LoginScreen() {
  const route = useRoute<any>();
  const nav = useNavigation<Nav>();
  const { signIn } = useAuth();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone.trim()) {
      Alert.alert("Error", "Please enter your phone number");
      return;
    }
    setLoading(true);
    try {
      const result = await api.login({ clinicId: route.params?.clinicId ?? DEFAULT_CLINIC_ID, phone: phone.trim() });
      await signIn(result.token, result.customer);
      if (nav.canGoBack()) {
        nav.goBack();
      } else {
        nav.navigate("Home", {});
      }
    } catch (e: any) {
      Alert.alert("Login Failed", e.message ?? "Unable to login");
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
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Enter your phone number to login</Text>
        <TextInput
          style={styles.input}
          placeholder="01XXXXXXXXX"
          placeholderTextColor={colors.textTertiary}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => nav.navigate("Register", { clinicId: route.params?.clinicId })}>
          <Text style={styles.linkText}>New here? Create an account</Text>
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
  input: { backgroundColor: colors.card, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: colors.text, marginBottom: 16 },
  button: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: "center", marginBottom: 16 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  linkText: { color: colors.primary, fontSize: 14, textAlign: "center" },
});

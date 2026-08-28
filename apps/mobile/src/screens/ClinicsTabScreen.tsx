import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, type ParamListBase } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { api, type ClinicListItem } from "../api";
import { colors } from "../theme";

type Nav = NativeStackNavigationProp<ParamListBase>;

export function ClinicsTabScreen() {
  const [clinics, setClinics] = useState<ClinicListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nav = useNavigation<Nav>();

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await api.listClinics();
      setClinics(data.items);
    } catch (e: any) {
      setError(e.message ?? "Unable to load clinics. Make sure the server is running.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error && clinics.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorState}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Connection Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={onRefresh}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={clinics}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.title}>Discover Clinics</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => nav.navigate("ClinicDetail", { slug: item.slug })}
            activeOpacity={0.8}
          >
            <View style={[styles.cardAccent, { backgroundColor: item.palette[0] ?? colors.primary }]} />
            <View style={styles.cardBody}>
              <View style={styles.cardHeader}>
                <Text style={styles.clinicName}>{item.nameEn}</Text>
                {item.verified && (
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>✓ Verified</Text>
                  </View>
                )}
              </View>
              <Text style={styles.clinicTagline}>{item.taglineEn}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.clinicLocation}>📍 {item.areaEn}, {item.cityEn}</Text>
                <Text style={styles.clinicRating}>★ {item.rating.toFixed(1)} ({item.reviewCount})</Text>
              </View>
              <View style={styles.specialties}>
                {item.specialties.slice(0, 3).map((s) => (
                  <View key={s} style={styles.specialtyChip}>
                    <Text style={styles.specialtyText}>{s}</Text>
                  </View>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No clinics found</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={onRefresh}>
              <Text style={styles.retryText}>Refresh</Text>
            </TouchableOpacity>
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
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardAccent: { height: 4 },
  cardBody: { padding: 16 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  clinicName: { fontSize: 18, fontWeight: "700", color: colors.text, flex: 1 },
  verifiedBadge: { backgroundColor: colors.success + "20", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  verifiedText: { fontSize: 10, fontWeight: "600", color: colors.success },
  clinicTagline: { fontSize: 14, color: colors.textSecondary, marginBottom: 8 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  clinicLocation: { fontSize: 12, color: colors.textTertiary },
  clinicRating: { fontSize: 12, color: colors.warning, fontWeight: "600" },
  specialties: { flexDirection: "row", gap: 6 },
  specialtyChip: { backgroundColor: colors.primary + "15", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  specialtyText: { fontSize: 11, color: colors.primary, fontWeight: "500" },
  emptyText: { fontSize: 14, color: colors.textTertiary, marginBottom: 16 },
  errorState: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
  errorIcon: { fontSize: 48, marginBottom: 12 },
  errorTitle: { fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: 8 },
  errorMessage: { fontSize: 14, color: colors.textSecondary, textAlign: "center", marginBottom: 20 },
  retryBtn: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  retryText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});

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
import { useNavigation, useRoute, type ParamListBase } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { api, type ServiceItem } from "../api";
import { colors, formatPrice } from "../theme";

type Nav = NativeStackNavigationProp<ParamListBase>;

export function ServiceListScreen() {
  const route = useRoute<any>();
  const nav = useNavigation<Nav>();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await api.getServices(route.params.slug, route.params.category);
      setServices(data.items);
    } catch (e: any) {
      setError(e.message ?? "Unable to load services");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [route.params.slug, route.params.category]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error && services.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => nav.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Services</Text>
          <View style={{ width: 50 }} />
        </View>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => { setLoading(true); load(); }}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Services</Text>
        <View style={{ width: 50 }} />
      </View>
      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => nav.navigate("Booking", {
              clinicId: route.params.clinicId,
              slug: route.params.slug,
              serviceId: item.id,
              serviceName: item.nameEn,
              category: item.category,
            })}
            activeOpacity={0.8}
          >
            <View style={styles.cardInfo}>
              <Text style={styles.serviceName}>{item.nameEn}</Text>
              <Text style={styles.serviceDesc} numberOfLines={2}>{item.descriptionEn}</Text>
              <Text style={styles.serviceMeta}>{item.durationMin} min · {item.recommendedSessions} sessions</Text>
            </View>
            <Text style={styles.servicePrice}>{formatPrice(item.price)}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No services found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  backText: { fontSize: 14, color: colors.primary },
  headerTitle: { fontSize: 16, fontWeight: "600", color: colors.text },
  list: { padding: 16 },
  card: { flexDirection: "row", backgroundColor: colors.card, borderRadius: 12, marginBottom: 8, padding: 14, alignItems: "center" },
  cardInfo: { flex: 1 },
  serviceName: { fontSize: 15, fontWeight: "600", color: colors.text },
  serviceDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  serviceMeta: { fontSize: 12, color: colors.textTertiary, marginTop: 4 },
  servicePrice: { fontSize: 15, fontWeight: "700", color: colors.primary, marginLeft: 12 },
  emptyText: { fontSize: 14, color: colors.textTertiary },
  errorText: { fontSize: 14, color: colors.textSecondary, textAlign: "center", marginBottom: 16, paddingHorizontal: 32 },
  retryBtn: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  retryText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});

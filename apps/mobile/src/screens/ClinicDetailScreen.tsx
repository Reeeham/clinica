import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, type ParamListBase } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { api, type ClinicDetail, type ServiceItem, type PackageItem, type OfferItem, type ReviewItem } from "../api";
import { colors, formatPrice } from "../theme";

type Nav = NativeStackNavigationProp<ParamListBase>;

export function ClinicDetailScreen() {
  const route = useRoute<any>();
  const nav = useNavigation<Nav>();
  const [data, setData] = useState<{ clinic: ClinicDetail; services: ServiceItem[]; packages: PackageItem[]; offers: OfferItem[]; reviews?: ReviewItem[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const result = await api.getClinic(route.params.slug);
      setData(result);
    } catch (e: any) {
      setError(e.message ?? "Unable to load clinic details");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [route.params.slug]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error ?? "Clinic not found"}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => { setLoading(true); load(); }}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { clinic, services, packages, offers, reviews } = data;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
    >
      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: clinic.palette[0] ?? colors.primary }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => nav.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.heroName}>{clinic.nameEn}</Text>
        <Text style={styles.heroTagline}>{clinic.taglineEn}</Text>
        <View style={styles.heroMeta}>
          <Text style={styles.heroMetaText}>★ {clinic.rating.toFixed(1)} ({clinic.reviewCount} reviews)</Text>
          <Text style={styles.heroMetaText}>📍 {clinic.areaEn}, {clinic.cityEn}</Text>
        </View>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>{clinic.aboutEn}</Text>
        <View style={styles.amenitiesRow}>
          {clinic.amenitiesEn.map((a) => (
            <View key={a} style={styles.amenityChip}>
              <Text style={styles.amenityText}>{a}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Contact */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact</Text>
        <View style={styles.contactRow}>
          <TouchableOpacity onPress={() => Linking.openURL(`tel:${clinic.phone}`)}>
            <Text style={styles.contactLink}>📞 {clinic.phone}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL(`https://wa.me/${clinic.whatsapp.replace(/[^0-9]/g, "")}`)}>
            <Text style={styles.contactLink}>💬 WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Offers */}
      {offers.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Offers</Text>
          {offers.map((offer) => (
            <View key={offer.id} style={styles.offerCard}>
              <View style={styles.offerAccent} />
              <View style={styles.offerBody}>
                <Text style={styles.offerTitle}>{offer.titleEn}</Text>
                <Text style={styles.offerDesc}>{offer.descriptionEn}</Text>
                <Text style={styles.offerCode}>Code: {offer.code}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Services */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Services</Text>
        {services.map((svc) => (
          <TouchableOpacity
            key={svc.id}
            style={styles.serviceCard}
            onPress={() => nav.navigate("Booking", {
              clinicId: clinic.id,
              slug: clinic.slug,
              serviceId: svc.id,
              serviceName: svc.nameEn,
              category: svc.category,
            })}
            activeOpacity={0.8}
          >
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{svc.nameEn}</Text>
              <Text style={styles.serviceDesc} numberOfLines={2}>{svc.descriptionEn}</Text>
              <Text style={styles.serviceMeta}>{svc.durationMin} min · {svc.recommendedSessions} sessions recommended</Text>
            </View>
            <View style={styles.serviceRight}>
              <Text style={styles.servicePrice}>{formatPrice(svc.price)}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Reviews */}
      {reviews && reviews.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          {reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <Text style={styles.reviewRating}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</Text>
              <Text style={styles.reviewBody}>{review.bodyEn}</Text>
              {review.replyEn && (
                <View style={styles.reviewReply}>
                  <Text style={styles.reviewReplyLabel}>Clinic reply:</Text>
                  <Text style={styles.reviewReplyText}>{review.replyEn}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Packages */}
      {packages.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Packages</Text>
          {packages.map((pkg) => (
            <View key={pkg.id} style={styles.packageCard}>
              {pkg.featured && <View style={styles.featuredBadge}><Text style={styles.featuredText}>FEATURED</Text></View>}
              <Text style={styles.packageName}>{pkg.nameEn}</Text>
              <Text style={styles.packageDesc}>{pkg.descriptionEn}</Text>
              <View style={styles.packageFooter}>
                <Text style={styles.packagePrice}>{formatPrice(pkg.price)}</Text>
                {pkg.listPrice > pkg.price && (
                  <Text style={styles.packageOriginal}>{formatPrice(pkg.listPrice)}</Text>
                )}
                <Text style={styles.packageValidity}> · {pkg.validityDays} days</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  hero: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 24 },
  backBtn: { position: "absolute", top: 50, left: 16, zIndex: 10 },
  heroName: { fontSize: 26, fontWeight: "700", color: "#fff", marginTop: 20 },
  heroTagline: { fontSize: 15, color: "#ffffff99", marginTop: 4 },
  heroMeta: { flexDirection: "row", gap: 16, marginTop: 12 },
  heroMetaText: { fontSize: 13, color: "#ffffffcc" },
  section: { padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: 12 },
  aboutText: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
  amenitiesRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  amenityChip: { backgroundColor: colors.primary + "10", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  amenityText: { fontSize: 12, color: colors.primary },
  contactRow: { flexDirection: "row", gap: 20 },
  contactLink: { fontSize: 14, color: colors.info },
  offerCard: { flexDirection: "row", backgroundColor: colors.card, borderRadius: 12, marginBottom: 8, overflow: "hidden" },
  offerAccent: { width: 4, backgroundColor: colors.accent },
  offerBody: { padding: 14, flex: 1 },
  offerTitle: { fontSize: 15, fontWeight: "600", color: colors.text },
  offerDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  offerCode: { fontSize: 12, color: colors.primary, fontWeight: "600", marginTop: 6 },
  serviceCard: { flexDirection: "row", backgroundColor: colors.card, borderRadius: 12, marginBottom: 8, padding: 14, alignItems: "center" },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 15, fontWeight: "600", color: colors.text },
  serviceDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  serviceMeta: { fontSize: 12, color: colors.textTertiary, marginTop: 4 },
  serviceRight: { alignItems: "flex-end", gap: 4 },
  servicePrice: { fontSize: 15, fontWeight: "700", color: colors.primary },
  packageCard: { backgroundColor: colors.card, borderRadius: 12, marginBottom: 8, padding: 16 },
  featuredBadge: { position: "absolute", top: 8, right: 8, backgroundColor: colors.accent + "30", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  featuredText: { fontSize: 9, fontWeight: "700", color: colors.accent },
  packageName: { fontSize: 15, fontWeight: "600", color: colors.text },
  packageDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  packageFooter: { flexDirection: "row", alignItems: "baseline", marginTop: 8 },
  packagePrice: { fontSize: 16, fontWeight: "700", color: colors.primary },
  packageOriginal: { fontSize: 13, color: colors.textTertiary, textDecorationLine: "line-through", marginLeft: 6 },
  packageValidity: { fontSize: 12, color: colors.textTertiary },
  errorText: { fontSize: 14, color: colors.textSecondary, textAlign: "center", marginBottom: 16, paddingHorizontal: 32 },
  retryBtn: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  retryText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  reviewCard: { backgroundColor: colors.card, borderRadius: 12, marginBottom: 8, padding: 14 },
  reviewRating: { fontSize: 14, color: colors.warning, marginBottom: 4 },
  reviewBody: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  reviewReply: { marginTop: 8, backgroundColor: colors.bg, borderRadius: 8, padding: 10 },
  reviewReplyLabel: { fontSize: 12, color: colors.primary, fontWeight: "600", marginBottom: 2 },
  reviewReplyText: { fontSize: 13, color: colors.textSecondary },
});

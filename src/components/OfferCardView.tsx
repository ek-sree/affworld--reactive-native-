// components/OfferCardView.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

type CategoryIconName = | "shopping"| "heart-pulse"| "cash-multiple"| "gamepad-variant"| "school"| "airplane"| "devices"| "tshirt-crew"| "food"| "tag";

interface Offer {
  advertiser_id: string;
  name: string;
  status: "active" | "paused" | "expired";
  category: string;
  country: string;
  iframe_url?: string;
  tracking_link?: string;
  code: string;
}

interface OfferCardViewProps {
  offers: Offer[];
  affiliateId: string;
  onCopy: (message: string, description: string) => void;
  navigation: any;
}

const STATUS_COLORS = {
  active: { text: "#0E9F6E", bg: "#F3FAF7", border: "#D1FAE5" },
  paused: { text: "#D97706", bg: "#FFFBEB", border: "#FEF3C7" },
  expired: { text: "#DC2626", bg: "#FEF2F2", border: "#FEE2E2" },
};

const CATEGORY_ICONS: Record<string, CategoryIconName> = {
  "E-commerce": "shopping",
  "Health & Fitness": "heart-pulse",
  "Finance": "cash-multiple",
  "Gaming": "gamepad-variant",
  "Education": "school",
  "Travel": "airplane",
  "Technology": "devices",
  "Fashion": "tshirt-crew",
  "Food": "food",
  default: "tag",
};

const OfferCardView: React.FC<OfferCardViewProps> = ({
  offers,
  affiliateId,
  onCopy,
  navigation,
}) => {
  const getCategoryIcon = (category: string): CategoryIconName =>
    CATEGORY_ICONS[category] || CATEGORY_ICONS.default;

  const OfferCard: React.FC<{ offer: Offer; index: number }> = ({ offer, index }) => {
    const handleCopy = async () => {
      const link = `https://admin-api.affworld.io/${offer.code}?affiliate_id=${affiliateId}`;
      await Clipboard.setStringAsync(link);
      onCopy("Link Copied!", "The tracking link has been copied to your clipboard");
    };

    const statusStyle = STATUS_COLORS[offer.status];
    const categoryIcon = getCategoryIcon(offer.category);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.offerNumberBadge}>
            <Text style={styles.offerNumberText}>{index + 1}</Text>
          </View>
          <View
            style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}
          >
            <View style={[styles.statusDot, { backgroundColor: statusStyle.text }]} />
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {offer.status}
            </Text>
          </View>
        </View>
        <View style={styles.cardContent}>
          <View style={styles.categoryIconContainer}>
            <MaterialCommunityIcons name={categoryIcon} size={28} color="#4F46E5" />
          </View>
          <View style={styles.offerDetails}>
            <Text style={styles.offerName} numberOfLines={1} ellipsizeMode="tail">
              {offer.name}
            </Text>
            <View style={styles.offerMeta}>
              <Text style={styles.offerCategory}>{offer.category}</Text>
              <View style={styles.countryContainer}>
                <Ionicons name="location-outline" size={12} color="#6B7280" />
                <Text style={styles.countryText}>{offer.country}</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCopy}>
            <Ionicons name="copy-outline" size={16} color="#4F46E5" />
            <Text style={styles.actionButtonText}>Copy Link</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => navigation.navigate("OfferDetails", { name: offer.name })}
          >
            <Text style={styles.detailsButtonText}>View Details</Text>
            <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={offers}
      renderItem={({ item, index }) => <OfferCard offer={item} index={index} />}
      keyExtractor={(item, index) => item.advertiser_id || `${index}`}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContent: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  offerNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },
  offerNumberText: { fontSize: 14, fontWeight: "700", color: "#4F46E5" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 12, fontWeight: "600", textTransform: "capitalize" },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  offerDetails: { flex: 1 },
  offerName: { fontSize: 16, fontWeight: "700", color: "#1F2A44", marginBottom: 6 },
  offerMeta: { flexDirection: "row", alignItems: "center", gap: 12 },
  offerCategory: { fontSize: 12, color: "#6B7280", fontWeight: "500" },
  countryContainer: { flexDirection: "row", alignItems: "center", gap: 4 },
  countryText: { fontSize: 12, color: "#6B7280" },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4F46E5",
    backgroundColor: "#FFFFFF",
  },
  actionButtonText: { color: "#4F46E5", fontSize: 14, fontWeight: "600" },
  detailsButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#4F46E5",
  },
  detailsButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
});

export default OfferCardView;
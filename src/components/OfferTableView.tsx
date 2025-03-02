// components/OfferTableView.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import * as Clipboard from "expo-clipboard";

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

interface OfferTableViewProps {
  offers: Offer[];
  affiliateId: string;
  onCopy: (message: string, description: string) => void;
  navigation: any;
}

const STATUS_COLORS = {
  active: "#34C759",
  paused: "#FF9500",
  expired: "#FF3B30",
};

const OfferTableView: React.FC<OfferTableViewProps> = ({
  offers,
  affiliateId,
  onCopy,
  navigation,
}) => {
  const TableRow: React.FC<{ offer: Offer; index: number }> = ({ offer, index }) => {
    const handleCopy = async () => {
      const link = `https://admin-api.affworld.io/${offer.code}?affiliate_id=${affiliateId}`;
      await Clipboard.setStringAsync(link);
      onCopy("Link Copied!", "The tracking link has been copied to your clipboard");
    };

    return (
      <View style={styles.row}>
        <Text style={[styles.cell, styles.noCell]}>{index + 1}</Text>
        <View style={[styles.cell, styles.offersCell]}>
          <Text style={styles.offerName} numberOfLines={1} ellipsizeMode="tail">
            {offer.name}
          </Text>
          <Text style={styles.offerCategory}>{offer.category}</Text>
        </View>
        <View style={[styles.cell, styles.statusCell]}>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[offer.status] }]} />
          </View>
        </View>
        <TouchableOpacity style={[styles.cell, styles.actionCell]} onPress={handleCopy}>
          <Text style={styles.actionButtonText}>Copy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.cell, styles.detailsCell]}
          onPress={() => navigation.navigate("OfferDetails", { name: offer.name })}
        >
          <Text style={styles.detailsButtonText}>Details</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const TableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.headerCell, styles.noCell]}>No</Text>
      <Text style={[styles.headerCell, styles.offersCell]}>Offers</Text>
      <Text style={[styles.headerCell, styles.statusCell]}>Status</Text>
      <Text style={[styles.headerCell, styles.actionCell]}>Action</Text>
      <Text style={[styles.headerCell, styles.detailsCell]}>Details</Text>
    </View>
  );

  return (
    <View style={styles.tableContainer}>
      <TableHeader />
      <FlatList
        data={offers}
        renderItem={({ item, index }) => <TableRow offer={item} index={index} />}
        keyExtractor={(item, index) => item.advertiser_id || `${index}`}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  tableContainer: {
    margin: 16,
    marginTop:40,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    margin:10
  },
  headerCell: {
    padding: 2,
    fontWeight: "700",
    color: "#374151",
    fontSize: 12,
    letterSpacing: 0.2,
    textAlign: "center", 
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  cell: { 
    padding: 8, 
    justifyContent: "center",
    alignItems: "center", 
  },
  noCell: { 
    width: 40, 
    color: "#6B7280",
  },
  offersCell: { 
    flex: 1, 
    minWidth: 120, 
    maxWidth: 150, 
    alignItems: "flex-start", 
  },
  statusCell: { 
    width: 40, 
  },
  actionCell: { 
    width: 60,
  },
  detailsCell: { 
    width: 70,
  },
  offerName: { 
    fontSize: 14, 
    fontWeight: "600", 
    color: "#1F2A44", 
    marginBottom: 2,
  },
  offerCategory: { 
    fontSize: 10, 
    color: "#6B7280", 
    fontWeight: "400",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    backgroundColor: "transparent",
  },
  statusDot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4,
  },
  actionButtonText: { 
    color: "#5850EC", 
    fontSize: 12, 
    fontWeight: "600",
  },
  detailsButtonText: { 
    color: "#5850EC", 
    fontSize: 12, 
    fontWeight: "600",
  },
});

export default OfferTableView;
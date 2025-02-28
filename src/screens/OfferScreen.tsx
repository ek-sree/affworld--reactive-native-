import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from "react-native";
import axios from "axios";
import { StackNavigationProp } from "@react-navigation/stack";
import { DrawerParamList } from "../types/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API } from "../constant/api";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import CustomNotification from "../components/common/CustomNotification";

type OfferScreenNavigationProp = StackNavigationProp<DrawerParamList, "Offer">;

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

interface DropdownProps {
  visible: boolean;
  onClose: () => void;
  options: string[];
  onSelect: (value: string) => void;
  selectedValue: string;
}

interface FilterState {
  offer: string;
  category: string;
  country: string;
}

interface OfferScreenProps {
  navigation: OfferScreenNavigationProp;
}

const ITEMS_PER_PAGE = 10;
const STATUS_COLORS = {
  active: "#34C759",
  paused: "#FF9500",
  expired: "#FF3B30",
};

const OFFER_STATUS_OPTIONS = ["All Offers", "active", "paused", "expired"];

const OfferScreen: React.FC<OfferScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [dropdownState, setDropdownState] = useState({
    offer: false,
    category: false,
    country: false,
  });
  const [filters, setFilters] = useState<FilterState>({
    offer: "All Offers",
    category: "All Categories",
    country: "All Countries",
  });
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [affiliateId, setAffiliateId] = useState<string>("");
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    description?: string;
  }>({ show: false, message: "", description: "" });
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const getAffiliationId = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/api/affiliates/`, {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem("authToken")}`,
        },
      });
      if (response.status === 200) setAffiliateId(response.data.affiliate_id);
    } catch (error) {
      console.log("Error occurred while getting affiliate_id: " + error);
    }
  }, []);

  useEffect(() => {
    getAffiliationId();
  }, [getAffiliationId]);

  const getDropdownOptions = (filterType: keyof FilterState): string[] => {
    switch (filterType) {
      case "offer":
        return OFFER_STATUS_OPTIONS;
      case "category":
        return [
          "All Categories",
          ...Array.from(new Set(offers.map((offer) => offer.category))),
        ];
      case "country":
        return [
          "All Countries",
          ...Array.from(new Set(offers.map((offer) => offer.country))),
        ];
      default:
        return [];
    }
  };

  const StyledDropdown: React.FC<DropdownProps> = ({
    visible,
    onClose,
    options,
    onSelect,
    selectedValue,
  }) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        onPress={onClose}
        activeOpacity={1}
      >
        <View style={styles.dropdownContainer}>
          <View style={styles.dropdownHeader}>
            <Text style={styles.dropdownTitle}>Choose an Option</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#A1A1AA" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={options}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.dropdownItem,
                  selectedValue === item && styles.selectedItem,
                ]}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    selectedValue === item && styles.selectedItemText,
                  ]}
                >
                  {item}
                </Text>
                {selectedValue === item && (
                  <Ionicons name="checkmark" size={18} color="#5850EC" />
                )}
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item}
            style={styles.dropdownList}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const fetchOffers = useCallback(
    async (pageNum: number, isNewFilter: boolean = false) => {
      if (!hasMore && !isNewFilter) return;
      try {
        setLoading(true);
        const response = await axios.get<Offer[]>(
          `https://admin-api.affworld.io/campaign/?page=${pageNum}&status=${
            filters.offer === "All Offers" ? "" : filters.offer
          }`
        );
        if (response.status === 200) {
          const newOffers = response.data;
          setOffers((prev) =>
            isNewFilter ? newOffers : [...prev, ...newOffers]
          );
          setHasMore(newOffers.length === ITEMS_PER_PAGE);
          applyFilters(isNewFilter ? newOffers : [...offers, ...newOffers]);
        }
      } catch (error) {
        console.error("Error fetching offers:", error);
      } finally {
        setLoading(false);
      }
    },
    [filters.offer, offers]
  );

  const applyFilters = (data: Offer[]) => {
    let filtered = [...data];
    if (filters.offer !== "All Offers")
      filtered = filtered.filter((offer) => offer.status === filters.offer);
    if (filters.category !== "All Categories")
      filtered = filtered.filter(
        (offer) => offer.category === filters.category
      );
    if (filters.country !== "All Countries")
      filtered = filtered.filter((offer) => offer.country === filters.country);
    setFilteredOffers(filtered);
  };

  const TableRow: React.FC<{ offer: Offer; index: number }> = ({
    offer,
    index,
  }) => {
    const handleCopy = async () => {
      const link = `https://admin-api.affworld.io/${offer.code}?affiliate_id=${affiliateId}`;
      await Clipboard.setStringAsync(link);
      setNotification({
        show: true,
        message: "Link Copied!",
        description: "The tracking link has been copied to your clipboard",
      });
    };

    return (
      <View style={styles.row}>
        <Text style={[styles.cell, styles.noCell]}>{index + 1}</Text>
        <View style={[styles.cell, styles.offersCell]}>
          <Text style={styles.offerName}>{offer.name}</Text>
          <Text style={styles.offerCategory}>{offer.category}</Text>
        </View>
        <View style={[styles.cell, styles.statusCell]}>
          <View
            style={[
              styles.statusContainer,
              { backgroundColor: `${STATUS_COLORS[offer.status]}20` },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: STATUS_COLORS[offer.status] },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: STATUS_COLORS[offer.status] },
              ]}
            >
              {offer.status}
            </Text>
          </View>
        </View>
        <View style={[styles.cell, styles.actionCell]}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCopy}
            disabled={!affiliateId}
          >
            <Text style={styles.actionButtonText}>Copy Link</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.cell, styles.detailsCell]}>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() =>
              navigation.navigate("OfferDetails", { name: offer.name })
            }
          >
            <Text style={styles.detailsButtonText}>Details</Text>
          </TouchableOpacity>
        </View>
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

  useEffect(() => {
    fetchOffers(1, true);
  }, [filters.offer]);
  useEffect(() => {
    applyFilters(offers);
  }, [filters]);

  const loadMore = () => {
    if (!loading && hasMore)
      setPage((prev) => {
        const nextPage = prev + 1;
        fetchOffers(nextPage);
        return nextPage;
      });
  };

  const renderFooter = () =>
    loading ? (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="large" color="#5850EC" />
      </View>
    ) : null;

  const renderFilterChip = (type: keyof FilterState, value: string) => {
    const isSelected =
      filters[type] !==
      (type === "offer"
        ? "All Offers"
        : type === "category"
        ? "All Categories"
        : "All Countries");
    return (
      <TouchableOpacity
        style={[styles.filterChip, isSelected && styles.activeFilterChip]}
        onPress={() => setDropdownState((prev) => ({ ...prev, [type]: true }))}
      >
        <Text
          style={[
            styles.filterChipText,
            isSelected && styles.activeFilterChipText,
          ]}
        >
          {value}
        </Text>
        <Ionicons
          name="chevron-down"
          size={16}
          color={isSelected ? "#5850EC" : "#A1A1AA"}
          style={styles.filterChipIcon}
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomNotification
        visible={notification.show}
        message={notification.message}
        description={notification.description}
        onClose={() => setNotification((prev) => ({ ...prev, show: false }))}
      />
      <View style={styles.header}>
        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>Offers Dashboard</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.filterToggleButton}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Ionicons
                name={showFilters ? "filter-outline" : "filter"}
                size={24}
                color="#5850EC"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setFilters({
                  offer: "All Offers",
                  category: "All Categories",
                  country: "All Countries",
                });
                setPage(1);
                setOffers([]);
                fetchOffers(1, true);
              }}
            >
              <Text style={styles.clearButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>
        {showFilters && (
          <View style={styles.filterContainer}>
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Status</Text>
              {renderFilterChip("offer", filters.offer)}
            </View>
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Category</Text>
              {renderFilterChip("category", filters.category)}
            </View>
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Country</Text>
              {renderFilterChip("country", filters.country)}
            </View>
          </View>
        )}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tableContainer}>
          <TableHeader />
          <FlatList
            data={filteredOffers}
            renderItem={({ item, index }) => (
              <TableRow offer={item} index={index} />
            )}
            keyExtractor={(item, index) => item.advertiser_id || `${index}`}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No Offers Available</Text>
                <Text style={styles.emptyStateSubtext}>
                  Adjust filters to find offers
                </Text>
              </View>
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ScrollView>
      <StyledDropdown
        visible={dropdownState.offer}
        onClose={() => setDropdownState((prev) => ({ ...prev, offer: false }))}
        options={getDropdownOptions("offer")}
        onSelect={(value) => setFilters((prev) => ({ ...prev, offer: value }))}
        selectedValue={filters.offer}
      />
      <StyledDropdown
        visible={dropdownState.category}
        onClose={() =>
          setDropdownState((prev) => ({ ...prev, category: false }))
        }
        options={getDropdownOptions("category")}
        onSelect={(value) =>
          setFilters((prev) => ({ ...prev, category: value }))
        }
        selectedValue={filters.category}
      />
      <StyledDropdown
        visible={dropdownState.country}
        onClose={() =>
          setDropdownState((prev) => ({ ...prev, country: false }))
        }
        options={getDropdownOptions("country")}
        onSelect={(value) =>
          setFilters((prev) => ({ ...prev, country: value }))
        }
        selectedValue={filters.country}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F4F9" },
  header: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2A44",
    letterSpacing: 0.2,
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 16 },
  filterToggleButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F0F0FF",
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#5850EC",
    elevation: 2,
  },
  clearButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  filterContainer: { flexDirection: "row", gap: 16, flexWrap: "wrap" },
  filterSection: { flex: 1, minWidth: 150 },
  filterLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 1,
  },
  activeFilterChip: { borderColor: "#5850EC", backgroundColor: "#F0F0FF" },
  filterChipText: {
    flex: 1,
    color: "#1F2A44",
    fontSize: 14,
    fontWeight: "500",
  },
  activeFilterChipText: { color: "#5850EC" },
  filterChipIcon: { marginLeft: 8 },
  tableContainer: {
    margin: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    minWidth: 700,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerCell: {
    padding: 16,
    fontWeight: "700",
    color: "#374151",
    fontSize: 14,
    letterSpacing: 0.2,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "#FFFFFF",
  },
  cell: { padding: 16, justifyContent: "center" },
  noCell: { width: 60, alignItems: "center", color: "#6B7280" },
  offersCell: { width: 240 },
  statusCell: { width: 120 },
  actionCell: { width: 140 },
  detailsCell: { width: 140 },
  offerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2A44",
    marginBottom: 4,
  },
  offerCategory: { fontSize: 12, color: "#6B7280", fontWeight: "400" },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontSize: 12, fontWeight: "600", textTransform: "capitalize" },
  actionButton: {
    backgroundColor: "#F0F0FF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    elevation: 1,
  },
  actionButtonText: { color: "#5850EC", fontSize: 14, fontWeight: "600" },
  detailsButton: {
    backgroundColor: "#5850EC",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    elevation: 2,
  },
  detailsButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  emptyState: { padding: 60, alignItems: "center", minWidth: 840 },
  emptyStateText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  emptyStateSubtext: { fontSize: 14, color: "#6B7280" },
  footerLoader: { padding: 24, alignItems: "center", minWidth: 840 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  dropdownContainer: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    maxWidth: 360,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 6,
    maxHeight: "80%",
  },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  dropdownTitle: { fontSize: 18, fontWeight: "700", color: "#1F2A44" },
  dropdownList: { maxHeight: 320 },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  selectedItem: { backgroundColor: "#F0F0FF" },
  dropdownItemText: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  selectedItemText: { color: "#5850EC", fontWeight: "600" },
});

export default OfferScreen;

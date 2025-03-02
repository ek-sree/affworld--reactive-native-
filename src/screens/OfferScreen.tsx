import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  SafeAreaView,
  FlatList,
} from "react-native";
import axios from "axios";
import { StackNavigationProp } from "@react-navigation/stack";
import { DrawerParamList } from "../types/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API } from "../constant/api";
import { Ionicons } from "@expo/vector-icons";
import CustomNotification from "../components/common/CustomNotification";
import { LinearGradient } from "expo-linear-gradient";
import OfferTableView from "../components/OfferTableView";
import OfferCardView from "../components/OfferCardView";

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
  const [viewMode, setViewMode] = useState<"list" | "card">("card"); 

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
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose} activeOpacity={1}>
        <View style={styles.dropdownContainer}>
          <LinearGradient
            colors={["#6366F1", "#4F46E5"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.dropdownHeader}
          >
            <Text style={styles.dropdownTitle}>Choose an Option</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </LinearGradient>
          <FlatList
            data={options}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.dropdownItem, selectedValue === item && styles.selectedItem]}
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
                  <Ionicons name="checkmark-circle" size={20} color="#4F46E5" />
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
          setOffers((prev) => (isNewFilter ? newOffers : [...prev, ...newOffers]));
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
      filtered = filtered.filter((offer) => offer.category === filters.category);
    if (filters.country !== "All Countries")
      filtered = filtered.filter((offer) => offer.country === filters.country);
    setFilteredOffers(filtered);
  };

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
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    ) : null;

  const renderFilterChip = (type: keyof FilterState, value: string) => {
    const isSelected =
      filters[type] !==
      (type === "offer" ? "All Offers" : type === "category" ? "All Categories" : "All Countries");
    return (
      <TouchableOpacity
        style={[styles.filterChip, isSelected && styles.activeFilterChip]}
        onPress={() => setDropdownState((prev) => ({ ...prev, [type]: true }))}
      >
        <Text style={[styles.filterChipText, isSelected && styles.activeFilterChipText]}>
          {value}
        </Text>
        <Ionicons
          name="chevron-down"
          size={16}
          color={isSelected ? "#4F46E5" : "#A1A1AA"}
          style={styles.filterChipIcon}
        />
      </TouchableOpacity>
    );
  };

  const handleCopyNotification = (message: string, description: string) => {
    setNotification({ show: true, message, description });
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomNotification
        visible={notification.show}
        message={notification.message}
        description={notification.description}
        onClose={() => setNotification((prev) => ({ ...prev, show: false }))}
      />
      <LinearGradient
        colors={["#6366F1", "#4F46E5"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>Offers Dashboard</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.viewToggleButton}
              onPress={() => setViewMode(viewMode === "card" ? "list" : "card")}
            >
              <Ionicons
                name={viewMode === "card" ? "list" : "grid-outline"}
                size={22}
                color="#FFFFFF"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.filterToggleButton}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Ionicons
                name={showFilters ? "funnel-outline" : "funnel"}
                size={22}
                color="#FFFFFF"
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
              <Ionicons name="refresh-outline" size={16} color="#FFFFFF" />
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
      </LinearGradient>
      <View style={styles.tableContainer}>
        {viewMode === "list" ? (
          <OfferTableView
            offers={filteredOffers}
            affiliateId={affiliateId}
            onCopy={handleCopyNotification}
            navigation={navigation}
          />
        ) : (
          <OfferCardView
            offers={filteredOffers}
            affiliateId={affiliateId}
            onCopy={handleCopyNotification}
            navigation={navigation}
          />
        )}
        {renderFooter()}
      </View>
      <StyledDropdown
        visible={dropdownState.offer}
        onClose={() => setDropdownState((prev) => ({ ...prev, offer: false }))}
        options={getDropdownOptions("offer")}
        onSelect={(value) => setFilters((prev) => ({ ...prev, offer: value }))}
        selectedValue={filters.offer}
      />
      <StyledDropdown
        visible={dropdownState.category}
        onClose={() => setDropdownState((prev) => ({ ...prev, category: false }))}
        options={getDropdownOptions("category")}
        onSelect={(value) => setFilters((prev) => ({ ...prev, category: value }))}
        selectedValue={filters.category}
      />
      <StyledDropdown
        visible={dropdownState.country}
        onClose={() => setDropdownState((prev) => ({ ...prev, country: false }))}
        options={getDropdownOptions("country")}
        onSelect={(value) => setFilters((prev) => ({ ...prev, country: value }))}
        selectedValue={filters.country}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F5F7" },
  header: {
    padding: 16,
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
  filterTitle: { fontSize: 24, fontWeight: "700", color: "#FFFFFF", letterSpacing: 0.2 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  viewToggleButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  filterToggleButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  clearButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  filterContainer: { flexDirection: "row", gap: 12, flexWrap: "wrap", marginTop: 8 },
  filterSection: { flex: 1, minWidth: 150 },
  filterLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  activeFilterChip: { borderColor: "#FFFFFF", backgroundColor: "rgba(255, 255, 255, 1)" },
  filterChipText: { flex: 1, color: "#1F2A44", fontSize: 14, fontWeight: "500" },
  activeFilterChipText: { color: "#4F46E5", fontWeight: "600" },
  filterChipIcon: { marginLeft: 8 },
  tableContainer: {
    flex: 1,
    marginTop: -16,
    backgroundColor: "transparent",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  footerLoader: { padding: 20, alignItems: "center" },
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
  },
  dropdownTitle: { fontSize: 18, fontWeight: "700", color: "#FFFFFF" },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownList: { maxHeight: 320 },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  selectedItem: { backgroundColor: "#EEF2FF" },
  dropdownItemText: { fontSize: 16, color: "#374151", fontWeight: "500" },
  selectedItemText: { color: "#4F46E5", fontWeight: "600" },
});

export default OfferScreen;
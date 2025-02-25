import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Modal, ActivityIndicator, ScrollView, Dimensions, SafeAreaView } from 'react-native';
import axios from 'axios';
import { StackNavigationProp } from '@react-navigation/stack';
import { DrawerParamList } from '../types/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API } from '../constant/api';
import * as Clipboard from 'expo-clipboard';
import { Toaster, toast } from 'sonner-native';

type OfferScreenNavigationProp = StackNavigationProp<DrawerParamList, 'Offer'>;

interface Offer {
  advertiser_id: string;
  name: string;
  status: 'active' | 'paused' | 'expired';
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
  active: '#4CAF50',
  paused: '#FFA000',
  expired: '#F44336'
};

const OFFER_STATUS_OPTIONS = ['All Offers', 'active', 'paused', 'expired'];


const OfferScreen: React.FC<OfferScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [dropdownState, setDropdownState] = useState({
    offer: false,
    category: false,
    country: false
  });
  const [filters, setFilters] = useState<FilterState>({
    offer: 'All Offers',
    category: 'All Categories',
    country: 'All Countries'
  });
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [affiliateId, setAffiliateId] = useState<string>('');


  const getAffiliationId = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/api/affiliates/`, {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('authToken')}`,
        },
      });
      if (response.status === 200) {
        setAffiliateId(response.data.affiliate_id);
      }
    } catch (error) {
      console.log("Error occurred while getting affiliate_id: " + error);
    }
  }, []);

  useEffect(() => {
    getAffiliationId();
  }, [getAffiliationId]);


  const getDropdownOptions = (filterType: keyof FilterState): string[] => {
    switch (filterType) {
      case 'offer':
        return OFFER_STATUS_OPTIONS;
      case 'category':
        return ['All Categories', ...Array.from(new Set(offers.map(offer => offer.category)))];
      case 'country':
        return ['All Countries', ...Array.from(new Set(offers.map(offer => offer.country)))];
      default:
        return [];
    }
  };

  const StyledDropdown: React.FC<DropdownProps> = ({ 
    visible, 
    onClose, 
    options, 
    onSelect, 
    selectedValue 
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
            <Text style={styles.dropdownTitle}>Select Option</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={options}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.dropdownItem,
                  selectedValue === item && styles.selectedItem
                ]}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text style={[
                  styles.dropdownItemText,
                  selectedValue === item && styles.selectedItemText
                ]}>{item}</Text>
                {selectedValue === item && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
            style={styles.dropdownList}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const fetchOffers = useCallback(async (pageNum: number, isNewFilter: boolean = false) => {
    if (!hasMore && !isNewFilter) return;

    try {
      setLoading(true);
      const response = await axios.get<Offer[]>(
        `https://admin-api.affworld.io/campaign/?page=${pageNum}&status=${
          filters.offer === 'All Offers' ? '' : filters.offer
        }`
      );
      
      if (response.status === 200) {
        const newOffers = response.data;
        setOffers(prev => isNewFilter ? newOffers : [...prev, ...newOffers]);
        setHasMore(newOffers.length === ITEMS_PER_PAGE);
        applyFilters(isNewFilter ? newOffers : [...offers, ...newOffers]);
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
    } finally {
      setLoading(false);
    }
  }, [filters.offer, offers]);

  const applyFilters = (data: Offer[]) => {
    let filtered = [...data];
    if (filters.offer !== 'All Offers') {
      filtered = filtered.filter(offer => offer.status === filters.offer);
    }
    if (filters.category !== 'All Categories') {
      filtered = filtered.filter(offer => offer.category === filters.category);
    }
    if (filters.country !== 'All Countries') {
      filtered = filtered.filter(offer => offer.country === filters.country);
    }
    setFilteredOffers(filtered);
  };

  const TableRow: React.FC<{ offer: Offer; index: number }> = ({ offer, index }) => {
    const handleCopy = async () => { 
      const link = `https://admin-api.affworld.io/${offer.code}?affiliate_id=${affiliateId}`;
      await Clipboard.setStringAsync(link); 
      toast.success('Link Copied!', {
        description: 'The tracking link has been copied to your clipboard',
        duration: 2000,
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
          <View style={[
            styles.statusContainer,
            { backgroundColor: `${STATUS_COLORS[offer.status]}15` }
          ]}>
            <View style={[
              styles.statusDot,
              { backgroundColor: STATUS_COLORS[offer.status] }
            ]} />
            <Text style={[
              styles.statusText,
              { color: STATUS_COLORS[offer.status] }
            ]}>{offer.status}</Text>
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
            onPress={() => navigation.navigate('OfferDetails', { name: offer.name })}
          >
            <Text style={styles.detailsButtonText}>View Details</Text>
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
    if (!loading && hasMore) {
      setPage(prev => {
        const nextPage = prev + 1;
        fetchOffers(nextPage);
        return nextPage;
      });
    }
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  };

  const renderFilterLabel = (label: string) => {
    return (
      <View style={styles.filterLabelContainer}>
        <Text style={styles.filterLabel}>{label}</Text>
      </View>
    );
  };

  // Render filter chip
  const renderFilterChip = (type: keyof FilterState, value: string) => {
    const isSelected = filters[type] !== (
      type === 'offer' ? 'All Offers' : 
      type === 'category' ? 'All Categories' : 'All Countries'
    );
    
    return (
      <TouchableOpacity
        style={[
          styles.filterChip,
          isSelected && styles.activeFilterChip
        ]}
        onPress={() => setDropdownState(prev => ({ ...prev, [type]: true }))}
      >
        <Text style={[
          styles.filterChipText,
          isSelected && styles.activeFilterChipText
        ]}>
          {value}
        </Text>
        <View style={styles.filterIconContainer}>
          <Text style={[
            styles.filterChipIcon,
            isSelected && styles.activeFilterChipIcon
          ]}>▼</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>Manage Filters</Text>
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => {
              setFilters({
                offer: 'All Offers',
                category: 'All Categories',
                country: 'All Countries'
              });
              setPage(1);
              setOffers([]);
              fetchOffers(1, true);
            }}
          >
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterContainer}>
          <View style={styles.filterSection}>
            {renderFilterLabel("Offer Status")}
            {renderFilterChip('offer', filters.offer)}
          </View>
          
          <View style={styles.filterSection}>
            {renderFilterLabel("Category")}
            {renderFilterChip('category', filters.category)}
          </View>
          
          <View style={styles.filterSection}>
            {renderFilterLabel("Country")}
            {renderFilterChip('country', filters.country)}
          </View>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tableContainer}>
          <TableHeader />
          <FlatList
            data={filteredOffers}
            renderItem={({ item, index }) => <TableRow offer={item} index={index} />}
            keyExtractor={(item, index) => item.advertiser_id || `${index}`}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No offers found</Text>
                <Text style={styles.emptyStateSubtext}>Try adjusting your filters</Text>
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
        onClose={() => setDropdownState(prev => ({ ...prev, offer: false }))}
        options={getDropdownOptions('offer')}
        onSelect={(value) => setFilters(prev => ({ ...prev, offer: value }))}
        selectedValue={filters.offer}
      />
      <StyledDropdown
        visible={dropdownState.category}
        onClose={() => setDropdownState(prev => ({ ...prev, category: false }))}
        options={getDropdownOptions('category')}
        onSelect={(value) => setFilters(prev => ({ ...prev, category: value }))}
        selectedValue={filters.category}
      />
      <StyledDropdown
        visible={dropdownState.country}
        onClose={() => setDropdownState(prev => ({ ...prev, country: false }))}
        options={getDropdownOptions('country')}
        onSelect={(value) => setFilters(prev => ({ ...prev, country: value }))}
        selectedValue={filters.country}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  clearButton: {
    backgroundColor: '#F7F9FC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  clearButtonText: {
    color: '#5A67D8',
    fontWeight: '500',
    fontSize: 12,
  },
  filterContainer: {
    width: '100%',
  },
  filterSection: {
    marginBottom: 12,
  },
  filterLabelContainer: {
    marginBottom: 6,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeFilterChip: {
    backgroundColor: '#EBF4FF',
    borderColor: '#4299E1',
  },
  filterChipText: {
    flex: 1,
    color: '#4A5568',
    fontSize: 14,
    fontWeight: '500',
  },
  activeFilterChipText: {
    color: '#2C5282',
  },
  filterIconContainer: {
    paddingLeft: 8,
  },
  filterChipIcon: {
    color: '#A0AEC0',
    fontSize: 10,
  },
  activeFilterChipIcon: {
    color: '#4299E1',
  },
  tableContainer: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    minWidth: 700,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerCell: {
    padding: 16,
    fontWeight: '600',
    color: '#495057',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: '#fff',
  },
  cell: {
    padding: 16,
    justifyContent: 'center',
  },
  noCell: {
    width: 60,
    alignItems: 'center',
  },
  offersCell: {
    width: 240,
  },
  statusCell: {
    width: 120,
  },
  actionCell: {
    width: 140,
  },
  detailsCell: {
    width: 140,
  },
  offerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 4,
  },
  offerCategory: {
    fontSize: 12,
    color: '#6c757d',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 16,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  actionButton: {
    backgroundColor: '#e9ecef',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#495057',
    fontSize: 12,
    fontWeight: '500',
  },
  detailsButton: {
    backgroundColor: '#1a73e815',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: '#1a73e8',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    padding: 48,
    alignItems: 'center',
    minWidth: 840,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6c757d',
  },
  footerLoader: {
    padding: 20,
    alignItems: 'center',
    minWidth: 840,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    width: '100%',
    maxWidth: 400,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    maxHeight: '80%',
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  closeButton: {
    fontSize: 18,
    color: '#6c757d',
    padding: 4,
  },
  dropdownList: {
    maxHeight: 300,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  selectedItem: {
    backgroundColor: '#EBF4FF',
  },
  dropdownItemText: {
    flex: 1,
    fontSize: 14,
    color: '#495057',
  },
  selectedItemText: {
    color: '#4299E1',
    fontWeight: '500',
  },
  checkmark: {
    color: '#4299E1',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default OfferScreen;
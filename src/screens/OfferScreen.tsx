import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, FlatList, ActivityIndicator } from 'react-native';
import axios from 'axios';
import OfferDetailsModal from '../components/OfferDetailsModal';

interface Offer {
  advertiser_id: string;
  name: string;
  status: 'active' | 'paused' | 'expired';
  category: string;
  country: string;
  iframe_url?: string;
  tracking_link?: string;
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

const ITEMS_PER_PAGE = 10;
const STATUS_COLORS = {
  active: '#4CAF50',
  paused: '#FFA000',
  expired: '#F44336'
};

const OFFER_STATUS_OPTIONS = ['All Offers', 'active', 'paused', 'expired'];

const OfferScreen: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null); 
  const [modalVisible, setModalVisible] = useState(false);
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
      animationType="slide"
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
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await axios.get<Offer[]>(
        `https://admin-api.affworld.io/campaign/?page=${currentPage}&status=${
          filters.offer === 'All Offers' ? '' : filters.offer
        }` 
      );
      
      if (response.status === 200) {
        setOffers(response.data);
        applyFilters(response.data);
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const TableRow: React.FC<{ offer: Offer; index: number }> = ({ offer, index }) => (
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
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Copy Iframe</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.cell, styles.actionCell]}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Copy Link</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.cell, styles.detailsCell]}>
        <TouchableOpacity 
          style={styles.detailsButton} 
          onPress={() => {
            setSelectedOffer(offer); 
            setModalVisible(true);
          }}
        >
          <Text style={styles.detailsButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  useEffect(() => {
    fetchOffers();
  }, [currentPage, filters.offer]);

  useEffect(() => {
    applyFilters(offers);
  }, [filters]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => setFilters({
              offer: 'All Offers',
              category: 'All Categories',
              country: 'All Countries'
            })}
          >
            <Text style={styles.clearButtonText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setDropdownState(prev => ({ ...prev, offer: true }))}
          >
            <Text style={styles.filterButtonText}>{filters.offer}</Text>
            <Text style={styles.filterButtonIcon}>▼</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setDropdownState(prev => ({ ...prev, category: true }))}
          >
            <Text style={styles.filterButtonText}>{filters.category}</Text>
            <Text style={styles.filterButtonIcon}>▼</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setDropdownState(prev => ({ ...prev, country: true }))}
          >
            <Text style={styles.filterButtonText}>{filters.country}</Text>
            <Text style={styles.filterButtonIcon}>▼</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.noCell]}>No</Text>
            <Text style={[styles.headerCell, styles.offersCell]}>Offers</Text>
            <Text style={[styles.headerCell, styles.statusCell]}>Status</Text>
            <Text style={[styles.headerCell, styles.actionCell]}>Iframe</Text>
            <Text style={[styles.headerCell, styles.actionCell]}>Action</Text>
            <Text style={[styles.headerCell, styles.detailsCell]}>Details</Text>
          </View>

          {filteredOffers.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No offers found</Text>
              <Text style={styles.emptyStateSubtext}>Try adjusting your filters</Text>
            </View>
          ) : (
            <ScrollView>
              {filteredOffers.map((offer, index) => (
                <TableRow key={offer.advertiser_id ||index} offer={offer} index={index} />
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
          onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          <Text style={styles.pageButtonText}>Previous</Text>
        </TouchableOpacity>
        
        <View style={styles.pageInfo}>
          <Text style={styles.pageInfoText}>Page {currentPage}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.pageButton}
          onPress={() => setCurrentPage(prev => prev + 1)}
        >
          <Text style={styles.pageButtonText}>Next</Text>
        </TouchableOpacity>
      </View>

      <OfferDetailsModal
  visible={modalVisible}
  onClose={() => setModalVisible(false)}
  name={selectedOffer?.name || ''}
/>

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

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1a73e8" />
        </View>
      )}
    </View>
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
  },
  headerActions: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  clearButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1a73e8',
  },
  clearButtonText: {
    color: '#1a73e8',
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    minWidth: 160,
  },
  filterButtonText: {
    flex: 1,
    color: '#495057',
    fontSize: 14,
  },
  filterButtonIcon: {
    color: '#adb5bd',
    fontSize: 12,
  },
  tableContainer: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    gap: 12,
  },
  pageButton: {
    backgroundColor: '#1a73e8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    elevation: 1,
  },
  pageButtonDisabled: {
    backgroundColor: '#e9ecef',
  },
  pageButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  pageInfo: {
    paddingHorizontal: 16,
  },
  pageInfoText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
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
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  selectedItem: {
    backgroundColor: '#f8f9fa',
  },
  dropdownItemText: {
    flex: 1,
    fontSize: 14,
    color: '#495057',
  },
  selectedItemText: {
    color: '#1a73e8',
    fontWeight: '500',
  },
  checkmark: {
    color: '#1a73e8',
    fontSize: 16,
    marginLeft: 8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OfferScreen;
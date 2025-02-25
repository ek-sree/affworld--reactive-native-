import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  ScrollView,
  Alert,
  TouchableWithoutFeedback,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/types';
import { API } from '../constant/api';

interface Service {
  _id: string;
  name: string;
  rate?: number;
}

interface CategoryData {
  category: string;
  services: Service[];
}

const AffPulseScreen = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAdvanced, setIsAdvanced] = useState<boolean>(false);
  const [category, setCategory] = useState<string>('Please Select a Category');
  const [service, setService] = useState<string>('Select Service');
  const [link, setLink] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('100');
  const [maxExecutions, setMaxExecutions] = useState<string>('1');
  const [timeGap, setTimeGap] = useState<string>('');
  const [serviceName, setServiceName] = useState<string>('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState<boolean>(false);
  const [showServiceDropdown, setShowServiceDropdown] = useState<boolean>(false);
  const [totalQuantity, setTotalQuantity] = useState<string>('100');
  const [pricePerQuantity, setPricePerQuantity] = useState<string>('0');
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [selectedServiceRate, setSelectedServiceRate] = useState<number>(0);
  const [totalCharges, setTotalCharges] = useState<string>('0');
  const [apiData, setApiData] = useState<CategoryData[]>([]);
  const [affiliate_id, setAffiliate_id] = useState('');
  const [totalBalance, setTotalBalance] = useState(0);
  
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleWalletPress = () => {
    navigation.navigate('Wallet');
  };

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Authentication Error", "Please log in again.");
        return;
      }
      
      const [getServiceListResponse, getAffiliationIdResponse, balanceResponse] = await Promise.all([
        axios.get<CategoryData[]>(`https://jpi.affworld.io/api/service-list`),
        axios.get(`${API}/api/affiliates/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get(`https://affiliate-api.affworld.io/api/wallet/total-remaining-balance`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      
      if (getServiceListResponse.status === 200) {
        setApiData(getServiceListResponse.data);
      }
      
      if (getAffiliationIdResponse.status === 200) {
        setAffiliate_id(getAffiliationIdResponse.data.affiliate_id);
      }
      
      if (balanceResponse.status === 200) {
        setTotalBalance(parseFloat(balanceResponse.data.total_remaining_balance.toFixed(2)));
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        Alert.alert('Error', `Failed to load data: ${error.message}`);
      } else {
        Alert.alert('Error', 'An unexpected error occurred while loading data.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    if (quantity && selectedServiceRate) {
      const charges = (parseFloat(quantity) * selectedServiceRate).toFixed(4);
      setTotalCharges(charges.toString());
    }
  }, [quantity, selectedServiceRate]);

  // Calculate total quantity when quantity and maxExecutions change
  useEffect(() => {
    if (isAdvanced && quantity && maxExecutions) {
      const total = (parseFloat(quantity) * parseFloat(maxExecutions)).toString();
      setTotalQuantity(total);
    } else {
      setTotalQuantity(quantity);
    }
  }, [quantity, maxExecutions, isAdvanced]);

  const handleCategorySelect = useCallback((selectedCategory: string) => {
    setCategory(selectedCategory);
    const selectedCategoryData = apiData.find(item => item.category === selectedCategory);
    
    if (selectedCategoryData) {
      const services = selectedCategoryData.services;
      setAvailableServices(services);
      
      if (services.length > 0) {
        const firstService = services[0];
        setService(firstService.name);
        setSelectedServiceRate(firstService.rate || 0);
        setPricePerQuantity((firstService.rate || 0).toString());
      }
    }
  }, [apiData]);

  const handleServiceSelect = useCallback((serviceName: string) => {
    setService(serviceName);
    const selectedService = availableServices.find(s => s.name === serviceName);
    if (selectedService) {
      setSelectedServiceRate(selectedService.rate || 0);
      setPricePerQuantity((selectedService.rate || 0).toString());
    }
  }, [availableServices]);

  const parseTimeGapToMilliseconds = (timeGap: string): number => {
    const [daysStr = '0', hoursStr = '0', minutesStr = '0'] = timeGap.split('/');
    const days = parseInt(daysStr, 10) || 0; 
    const hours = parseInt(hoursStr, 10) || 0; 
    const minutes = parseInt(minutesStr, 10) || 0; 
    return (days * 24 * 60 * 60 * 1000) + (hours * 60 * 60 * 1000) + (minutes * 60 * 1000);
  };

  const handleSubmit = async () => {
    if (!affiliate_id) {
      Alert.alert('Error', 'Affiliate ID is not available. Please try again later.');
      return;
    }
    if (category === 'Please Select a Category') {
      Alert.alert('Error', 'Please select a category.');
      return;
    }
    if (service === 'Select Service') {
      Alert.alert('Error', 'Please select a service.');
      return;
    }
    if (!link) {
      Alert.alert('Error', 'Please enter a link.');
      return;
    }
    if (!quantity || isNaN(parseFloat(quantity))) {
      Alert.alert('Error', 'Please enter a valid quantity.');
      return;
    }

    const basePayload = {
      affiliate_id,
      category,
      serviceName: service,
      link,
      name: serviceName ? serviceName : 'Single Affpulse', 
      quantity: parseFloat(quantity),
      timing: '', 
      maxExecutions: 1, 
    };

    let payload;

    if (isAdvanced) {
      if (!serviceName) {
        Alert.alert('Error', 'Please enter a service name.');
        return;
      }
      if (!maxExecutions || isNaN(parseFloat(maxExecutions))) {
        Alert.alert('Error', 'Please enter a valid max executions value.');
        return;
      }
      if (!timeGap || !timeGap.match(/^\d+\/\d+\/\d+$/)) {
        Alert.alert('Error', 'Please enter a valid time gap in dd/hh/mm format.');
        return;
      }

      payload = {
        ...basePayload,
        maxExecutions: parseFloat(maxExecutions),
        timing: parseTimeGapToMilliseconds(timeGap).toString(), 
        totalQuantity: parseFloat(totalQuantity),
      };
    } else {
      payload = basePayload;
    }

    setIsLoading(true);
    const token = await AsyncStorage.getItem('authToken');
    try {
      const response = await axios.post('https://jpi.affworld.io/api/jobs', payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        Alert.alert('Success', 'Job submitted successfully!');
        fetchInitialData();
        // Reset form
        setLink('');
        setQuantity('100');
        setMaxExecutions('1');
        setTimeGap('');
        setServiceName('');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          Alert.alert('Failed', 'Insufficient balance');
        } else {
          Alert.alert('Error', `Failed to submit job: ${error.message}`);
        }
      } else {
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to safely close dropdowns
  const closeCategoryDropdown = () => {
    setShowCategoryDropdown(false);
  };

  const closeServiceDropdown = () => {
    setShowServiceDropdown(false);
  };

  const renderDropdownModal = (
    visible: boolean,
    items: (string | Service)[],
    onSelect: (value: string) => void,
    onClose: () => void
  ) => (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.dropdownList}>
              <ScrollView>
                {items.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownItem}
                    onPress={() => {
                      const itemName = typeof item === 'string' ? item : item.name;
                      onSelect(itemName);
                      onClose();
                    }}
                  >
                    <Text style={styles.dropdownItemText}>
                      {typeof item === 'string' ? item : item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  if (isLoading && !apiData.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498DB" />
        <Text style={styles.loadingText}>Loading data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#2C3E50', '#3498DB']}
        style={styles.headerGradient}
      >
        <Text style={styles.logo}>AFFPULSE</Text>
        <View style={styles.walletContainer}>
          <Text style={styles.walletText}>
            Wallet: <Text style={styles.walletAmount}>${totalBalance.toFixed(2)}</Text>
          </Text>
          <TouchableOpacity style={styles.addMoneyButton} onPress={handleWalletPress}>
            <Text style={styles.addMoneyText}>Add Money</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.toggleContainer}>
          <Text style={styles.advanceText}>Advanced Mode</Text>
          <TouchableOpacity 
            style={[styles.toggleSwitch, isAdvanced && styles.toggleActive]}
            onPress={() => setIsAdvanced(!isAdvanced)}
          >
            <View style={[styles.toggleButton, isAdvanced && styles.toggleButtonActive]} />
          </TouchableOpacity>
        </View>

        <View style={styles.formSection}>
          {isAdvanced && (
            <>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Service name"
                placeholderTextColor="#999"
                value={serviceName}
                onChangeText={setServiceName}
              />
            </>
          )}

          <Text style={styles.label}>Category</Text>
          <TouchableOpacity 
            style={styles.select}
            onPress={() => setShowCategoryDropdown(true)}
          >
            <Text style={category === 'Please Select a Category' ? styles.selectPlaceholder : styles.selectText}>
              {category}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Services</Text>
          <TouchableOpacity 
            style={styles.select}
            onPress={() => setShowServiceDropdown(true)}
            disabled={category === 'Please Select a Category'}
          >
            <Text style={service === 'Select Service' ? styles.selectPlaceholder : styles.selectText}>
              {service}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Link:</Text>
          <TextInput
            style={styles.input}
            placeholder="Please enter link"
            placeholderTextColor="#999"
            value={link}
            onChangeText={setLink}
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Quantity</Text>
              <TextInput
                style={styles.input}
                placeholder="100"
                placeholderTextColor="#999"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
              />
            </View>
            {isAdvanced && (
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Max Executions</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1"
                  placeholderTextColor="#999"
                  value={maxExecutions}
                  onChangeText={setMaxExecutions}
                  keyboardType="numeric"
                />
              </View>
            )}
          </View>

          {isAdvanced && (
            <>
              <Text style={styles.label}>Time Gap (Days/Hours/Minutes)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter timing (dd/hh/mm)"
                placeholderTextColor="#999"
                value={timeGap}
                onChangeText={setTimeGap}
              />

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Total Quantity</Text>
                  <TextInput
                    style={[styles.input, styles.disabledInput]}
                    value={totalQuantity}
                    editable={false}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Price Per Quantity</Text>
                  <TextInput
                    style={[styles.input, styles.disabledInput]}
                    value={pricePerQuantity}
                    editable={false}
                  />
                </View>
              </View>
            </>
          )}

          <Text style={styles.label}>Total Charges</Text>
          <TextInput
            style={[styles.input, styles.chargesInput]}
            value={`$${totalCharges}`}
            editable={false}
          />

          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Render both dropdown modals */}
      {renderDropdownModal(
        showCategoryDropdown,
        apiData.map(item => item.category),
        handleCategorySelect,
        closeCategoryDropdown
      )}

      {renderDropdownModal(
        showServiceDropdown,
        availableServices,
        handleServiceSelect,
        closeServiceDropdown
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f6fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2C3E50',
  },
  headerGradient: {
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
  },
  logo: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  walletContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  walletText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  walletAmount: {
    fontWeight: 'bold',
    color: '#2C3E50',
    fontSize: 16,
  },
  addMoneyButton: {
    backgroundColor: '#3498DB',
    padding: 8,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  addMoneyText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  advanceText: {
    fontSize: 18,
    fontWeight: '500',
    marginRight: 10,
    color: '#2C3E50',
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    backgroundColor: '#ddd',
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#4CAF50',
  },
  toggleButton: {
    width: 24,
    height: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    transform: [{ translateX: 0 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  toggleButtonActive: {
    transform: [{ translateX: 22 }],
  },
  formSection: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 8,
    marginTop: 12,
    fontWeight: '500',
  },
  select: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    backgroundColor: '#f8f9fa',
  },
  selectText: {
    color: '#2C3E50',
    fontSize: 16,
  },
  selectPlaceholder: {
    color: '#999',
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    color: '#666',
  },
  chargesInput: {
    backgroundColor: '#f0f8ff',
    color: '#3498DB',
    fontWeight: 'bold',
    fontSize: 18,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  halfWidth: {
    width: '48%',
  },
  submitButton: {
    backgroundColor: '#3498DB',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownList: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 10,
    width: '85%',
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#2C3E50',
  },
});

export default AffPulseScreen;
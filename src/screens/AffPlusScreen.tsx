import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/types';


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
    const [totalBalance, setTotalBalance] = useState(0)

const navigation = useNavigation<NavigationProp<RootStackParamList>>();

const handleWalletPress = () => {
  navigation.navigate('Wallet');
};

async function fetchInitialData(){
    try {
        const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.error("No token found! Ensure user is logged in.");
        return;
      }
      const [getServiceListResponse, getAffiliationIdResponse,balanceResponse] = await Promise.all([
        axios.get<CategoryData[]>('https://jpi.affworld.io/api/service-list'),
        axios.get('https://affiliate-api.affworld.io/api/affiliates/', {
            headers: {
              Authorization: `Bearer ${await AsyncStorage.getItem('authToken')}`,
            },
          }),
          axios.get(`https://affiliate-api.affworld.io/api/wallet/total-remaining-balance`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
      ])
      if(getServiceListResponse.status==200) {
        setApiData(getServiceListResponse.data);
      }
      if(getAffiliationIdResponse.status==200){
        setAffiliate_id(getAffiliationIdResponse.data.affiliate_id);
      }
      if(balanceResponse.status==200){
        setTotalBalance(parseFloat(balanceResponse.data.total_remaining_balance.toFixed(2)));
    }
    } catch (error) {
        
    }
}


useEffect(() => {
    fetchInitialData();
}, [])

  useEffect(() => {
    if (quantity && selectedServiceRate) {
      const charges = (parseFloat(quantity) * selectedServiceRate).toFixed(4);
      setTotalCharges(charges.toString());
    }
  }, [quantity, selectedServiceRate]);

  const handleCategorySelect = (selectedCategory: string) => {
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
    setShowCategoryDropdown(false);
  };

  const handleServiceSelect = (serviceName: string) => {
    setService(serviceName);
    const selectedService = availableServices.find(s => s.name === serviceName);
    if (selectedService) {
      setSelectedServiceRate(selectedService.rate || 0);
      setPricePerQuantity((selectedService.rate || 0).toString());
    }
    setShowServiceDropdown(false);
  };

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
    const token = await AsyncStorage.getItem('authToken');
console.log("Checking token and affiliation_id", token, affiliate_id,payload);

    try {
      const response = await axios.post('https://jpi.affworld.io/api/jobs', payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        Alert.alert('Success', 'Job submitted successfully!');
        setLink('');
        setQuantity('100');
        setMaxExecutions('1');
        setTimeGap('');
        setServiceName('');
      }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.log('Error status:', error.response?.status);
            console.log('Error response data:', error.response?.data);
            console.log('Error message:', error.message);
            if (error.response?.status === 403) {
              Alert.alert('Failed', 'Insufficient balance');
            } else {
              Alert.alert('Error', `Failed to submit job: ${error.message}`);
            }
          } else {
            console.log('Unexpected error:', error);
            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
          }
        }
      };
  

  const renderDropdown = (
    items: (string | Service)[],
    onSelect: (value: string) => void,
    closeDropdown: () => void
  ) => (
    <View style={styles.dropdownList}>
      <ScrollView>
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.dropdownItem}
            onPress={() => {
              onSelect(typeof item === 'string' ? item : item.name);
              closeDropdown();
            }}
          >
            <Text style={styles.dropdownItemText}>
              {typeof item === 'string' ? item : item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#2C3E50', '#3498DB']}
        style={styles.headerGradient}
      >
        <Text style={styles.logo}>AFFPULSE</Text>
        <View style={styles.walletContainer}>
          <Text style={styles.walletText}>
            Wallet : <Text style={styles.walletAmount}>{totalBalance}</Text>
          </Text>
          <TouchableOpacity style={styles.addMoneyButton} onPress={handleWalletPress}>
            <Text style={styles.addMoneyText}>Add Money</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.toggleContainer}>
          <Text style={styles.advanceText}>Advance</Text>
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
            <Text style={styles.selectText}>{category}</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Services</Text>
          <TouchableOpacity 
            style={styles.select}
            onPress={() => setShowServiceDropdown(true)}
          >
            <Text style={styles.selectText}>{service}</Text>
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
                    style={styles.input}
                    value={totalQuantity}
                    onChangeText={setTotalQuantity}
                    keyboardType="numeric"
                    editable={false}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Price Per Quantity</Text>
                  <TextInput
                    style={styles.input}
                    value={pricePerQuantity}
                    onChangeText={setPricePerQuantity}
                    keyboardType="numeric"
                    editable={false}
                  />
                </View>
              </View>
            </>
          )}

          <Text style={styles.label}>Total Charges</Text>
          <TextInput
            style={styles.input}
            value={totalCharges}
            editable={false}
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>

        </View>

        <Modal
          visible={showCategoryDropdown}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCategoryDropdown(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            onPress={() => setShowCategoryDropdown(false)}
          >
            {renderDropdown(
              apiData.map(item => item.category),
              handleCategorySelect,
              () => setShowCategoryDropdown(false)
            )}
          </TouchableOpacity>
        </Modal>

        <Modal
          visible={showServiceDropdown}
          transparent
          animationType="fade"
          onRequestClose={() => setShowServiceDropdown(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            onPress={() => setShowServiceDropdown(false)}
          >
            {renderDropdown(
              availableServices,
              handleServiceSelect,
              () => setShowServiceDropdown(false)
            )}
          </TouchableOpacity>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  headerGradient: {
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
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
  },
  walletText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  walletAmount: {
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  addMoneyButton: {
    backgroundColor: '#3498DB',
    padding: 8,
    borderRadius: 5,
  },
  addMoneyText: {
    color: 'white',
    fontSize: 14,
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
  },
  label: {
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 8,
    marginTop: 12,
  },
  select: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f8f9fa',
  },
  selectText: {
    color: '#2C3E50',
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
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
    borderRadius: 8,
    padding: 10,
    width: '80%',
    maxHeight: 300,
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
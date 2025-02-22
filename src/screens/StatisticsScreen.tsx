import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Modal,
} from 'react-native';
import ExecutionModal from '../components/ExecutionModal';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { ModalPosition, StatisticsItem } from '../interface/IStatistics';
import { ExecutionData } from '../interface/IExecution';
import { API } from '../constant/api';


const StatisticsScreen = () => {
  const [affiliate_id, setAffiliate_id] = useState('');
  const [statisticsData, setStatisticsData] = useState<StatisticsItem[]>([]);
  const [isLoadingStatistics, setIsLoadingStatistics] = useState<boolean>(false);
  const [showAction, setShowAction] = useState<boolean>(false);
  const [modalPosition, setModalPosition] = useState<ModalPosition>({ x: 0, y: 0 });
  const [isExecutionModal, setIsExecutionModal] = useState<boolean>(false);
  const [selectedExecutions, setSelectedExecutions] = useState<ExecutionData[]>([]);
  const [endReached, setEndReached] = useState<boolean>(false); 

  const totalContentWidth = 840;

  async function getAffiliationId() {
    try {
      const response = await axios.get(`${API}/api/affiliates/`, {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('authToken')}`,
        },
      });
      if (response.status === 200) {
        setAffiliate_id(response.data.affiliate_id);
      }
    } catch (error) {
      console.log("Error occurred while getting affiliate_id: " + error);
    }
  }

  const handleStaticsData = async () => {
    try {
      setIsLoadingStatistics(true);
      const response = await axios.get(`${API}/api/particularjobs/${affiliate_id}`);
      if (Array.isArray(response.data)) {
        setStatisticsData(response.data);
      } else {
        console.error("Response data is not an array:", response.data);
        setStatisticsData([]);
      }
    } catch (error) {
      console.error("Error fetching statistics data", error);
    } finally {
      setIsLoadingStatistics(false);
    }
  };

  const handleExportData = () => {
    console.log('Exporting data to Excel...');
  };

  const handleActionPress = (event: any, item: StatisticsItem) => {
    const { pageX, pageY } = event.nativeEvent;
    setModalPosition({ x: pageX, y: pageY });
    setShowAction(true);
    setSelectedExecutions(item.apiResponse || []);
  };

  const handleShowExecutions = () => {
    setIsExecutionModal(true);
    setShowAction(false);
  };

  const handleEndReached = () => {
    if (!isLoadingStatistics) {
      setEndReached(true); 
    }
  };

  useEffect(() => {
    getAffiliationId();
  }, []);

  useEffect(() => {
    if (affiliate_id) {
      handleStaticsData();
    }
  }, [affiliate_id]);

  const renderStatisticsItem = ({ item }: { item: StatisticsItem }) => {
    const timingMs = parseInt(item.timing);
    const days = Math.floor(timingMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timingMs % (1000 * 60 * 60)) / (1000 * 60));
    const timingString = `${days}d/${hours}h/${minutes}m`;

    return (
      <View style={[styles.tableRow, { width: totalContentWidth }]}>
        <View style={[styles.cell, { width: 120 }]}>
          <Text>{item.name}</Text>
        </View>
        <View style={[styles.cell, { width: 100 }]}>
          <Text>{`${item.executionCount}/${item.maxExecutions}`}</Text>
        </View>
        <View style={[styles.cell, { width: 100 }]}>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: item.status === 'active' ? 'green' : 'red' },
              ]}
            />
            <Text>{item.status}</Text>
          </View>
        </View>
        <View style={[styles.cell, { width: 100 }]}>
          <Text>{timingString}</Text>
        </View>
        <View style={[styles.cell, { width: 100 }]}>
          <Text>{item.quantity}</Text>
        </View>
        <View style={[styles.cell, { width: 120 }]}>
          <Text>₹{item.totalCharges.toFixed(4)}</Text>
        </View>
        <View style={[styles.cell, { width: 120 }]}>
          <Text>{item.totalQuantity}</Text>
        </View>
        <View style={[styles.cell, { width: 80 }]}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(event) => handleActionPress(event, item)}
          >
            <Text style={styles.actionButtonText}>...</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (isLoadingStatistics) {
      return (
        <View style={[styles.loadingContainer, { width: totalContentWidth }]}>
          <ActivityIndicator size="large" color="#3498DB" />
          <Text style={styles.loadingText}>Loading Statistics...</Text>
        </View>
      );
    }
    if (endReached && statisticsData.length > 0) {
      return (
        <View style={[styles.footerContainer, { width: totalContentWidth }]}>
          <Text style={styles.footerText}>Over</Text>
        </View>
      );
    }
    return null;
  };

  const StatisticsTable = () => (
    <View style={styles.tableWrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View>
          <View style={[styles.tableHeader, { width: totalContentWidth }]}>
            <View style={[styles.headerCell, { width: 120 }]}>
              <Text style={styles.headerText}>Name</Text>
            </View>
            <View style={[styles.headerCell, { width: 100 }]}>
              <Text style={styles.headerText}>Execution</Text>
            </View>
            <View style={[styles.headerCell, { width: 100 }]}>
              <Text style={styles.headerText}>Status</Text>
            </View>
            <View style={[styles.headerCell, { width: 100 }]}>
              <Text style={styles.headerText}>Timing</Text>
            </View>
            <View style={[styles.headerCell, { width: 100 }]}>
              <Text style={styles.headerText}>Quantity</Text>
            </View>
            <View style={[styles.headerCell, { width: 120 }]}>
              <Text style={styles.headerText}>Total Charges</Text>
            </View>
            <View style={[styles.headerCell, { width: 120 }]}>
              <Text style={styles.headerText}>Total Quantity</Text>
            </View>
            <View style={[styles.headerCell, { width: 80 }]}>
              <Text style={styles.headerText}>Action</Text>
            </View>
          </View>

          {statisticsData.length === 0 && !isLoadingStatistics ? (
            <View style={[styles.noDataContainer, { width: totalContentWidth }]}>
              <Text style={styles.noDataText}>No Statistics Available</Text>
            </View>
          ) : (
            <FlatList
              data={statisticsData}
              renderItem={renderStatisticsItem}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{ paddingBottom: 20 }}
              scrollEnabled={true}
              ListFooterComponent={renderFooter} 
              onEndReached={handleEndReached} 
              onEndReachedThreshold={0.1} 
            />
          )}
        </View>
      </ScrollView>
      <Modal
  visible={showAction}
  transparent
  animationType="fade"
  onRequestClose={() => setShowAction(false)}
>
  <TouchableOpacity
    style={styles.modalOverlay}
    onPress={() => setShowAction(false)}
  >
    <View
      style={[
        styles.actionMenu,
        {
          position: 'absolute',
          left: modalPosition.x - 150,
          top: modalPosition.y - 130,
        },
      ]}
    >
      <View style={styles.actionHeader}>
        <Text style={styles.actionTitle}>Actions</Text>
        <TouchableOpacity 
          onPress={() => setShowAction(false)}
          style={styles.closeButton}
        >
          <MaterialIcons name="close" size={20} color="#666" />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.actionItem}>
        <Feather name="link" size={18} color="#3498DB" />
        <Text style={styles.actionText}>Copy Link</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.actionItem} 
        onPress={handleShowExecutions}
      >
        <Feather name="play-circle" size={18} color="#3498DB" />
        <Text style={styles.actionText}>Show Execution</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.actionItem}>
        <Feather name="toggle-right" size={18} color="#3498DB" />
        <Text style={styles.actionText}>Change Status</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
</Modal>
      <ExecutionModal
        visible={isExecutionModal}
        onClose={() => setIsExecutionModal(false)}
        executionData={selectedExecutions}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.statisticsContent}>
        <TouchableOpacity style={styles.exportButton} onPress={handleExportData}>
          <Text style={styles.exportButtonText}>Export Data to Excel Sheet</Text>
        </TouchableOpacity>
        <StatisticsTable />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  statisticsContent: {
    padding: 15,
    flex: 1,
  },
  exportButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  exportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  tableWrapper: {
    flex: 1,
  },
  headerCell: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(135, 131, 131, 0.7)',
    padding: 12,
  },
  tableRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  actionButton: {
    backgroundColor: '#3498DB',
    padding: 8,
    borderRadius: 4,
    width: 40,
    alignItems: 'center',
    zIndex: 1000,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    height: 200,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2C3E50',
  },
  noDataContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    height: 200,
  },
  noDataText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  footerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  footerText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  actionMenu: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: 220,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  actionHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    letterSpacing: 0.5,
  },
  closeButton: {
    padding: 4,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  actionText: {
    fontSize: 15,
    color: '#2C3E50',
    marginLeft: 12,
    fontWeight: '500',
  },
});

export default StatisticsScreen;
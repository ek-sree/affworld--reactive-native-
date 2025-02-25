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
  StatusBar,
  Dimensions,
} from 'react-native';
import ExecutionModal from '../components/ExecutionModal';
import { MaterialIcons, Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ModalPosition, StatisticsItem } from '../interface/IStatistics';
import { ExecutionData } from '../interface/IExecution';
import { API } from '../constant/api';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const StatisticsScreen = () => {
  const [affiliate_id, setAffiliate_id] = useState('');
  const [statisticsData, setStatisticsData] = useState<StatisticsItem[]>([]);
  const [isLoadingStatistics, setIsLoadingStatistics] = useState<boolean>(false);
  const [showAction, setShowAction] = useState<boolean>(false);
  const [modalPosition, setModalPosition] = useState<ModalPosition>({ x: 0, y: 0 });
  const [isExecutionModal, setIsExecutionModal] = useState<boolean>(false);
  const [selectedExecutions, setSelectedExecutions] = useState<ExecutionData[]>([]);
  const [endReached, setEndReached] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<StatisticsItem | null>(null);

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
      const response = await axios.get(`https://jpi.affworld.io/api/particularjobs/${affiliate_id}`);
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

  const handleActionPress = (event: any, item: StatisticsItem) => {
    const { pageX, pageY } = event.nativeEvent;
    setModalPosition({ x: pageX, y: pageY });
    setShowAction(true);
    setSelectedExecutions(item.apiResponse || []);
    setCurrentItem(item);
  };

  const handleShowExecutions = () => {
    setIsExecutionModal(true);
    setShowAction(false);
  };

  const handleCopyLink = () => {
    setShowAction(false);
  };

  const handleChangeStatus = () => {
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
      <TouchableOpacity activeOpacity={0.7} onPress={() => handleItemPress(item)}>
        <View style={[styles.tableRow, { width: totalContentWidth }]}>
          <View style={[styles.cell, { width: 120 }]}>
            <Text style={styles.cellText} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
          </View>
          <View style={[styles.cell, { width: 100 }]}>
            <Text style={styles.cellText}>{`${item.executionCount}/${item.maxExecutions}`}</Text>
          </View>
          <View style={[styles.cell, { width: 100 }]}>
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: item.status === 'active' ? '#4CAF50' : '#E74C3C' },
                ]}
              />
              <Text style={[
                styles.statusText,
                { color: item.status === 'active' ? '#4CAF50' : '#E74C3C' }
              ]}>
                {item.status}
              </Text>
            </View>
          </View>
          <View style={[styles.cell, { width: 100 }]}>
            <Text style={styles.cellText}>{timingString}</Text>
          </View>
          <View style={[styles.cell, { width: 100 }]}>
            <Text style={styles.cellText}>{item.quantity}</Text>
          </View>
          <View style={[styles.cell, { width: 120 }]}>
            <Text style={styles.cellText}>₹{item.totalCharges.toFixed(4)}</Text>
          </View>
          <View style={[styles.cell, { width: 120 }]}>
            <Text style={styles.cellText}>{item.totalQuantity}</Text>
          </View>
          <View style={[styles.cell, { width: 80 }]}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(event) => handleActionPress(event, item)}
            >
              <MaterialCommunityIcons name="dots-horizontal" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const handleItemPress = (item: StatisticsItem) => {
    setSelectedExecutions(item.apiResponse || []);
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
          <Text style={styles.footerText}>End of List</Text>
        </View>
      );
    }
    return null;
  };

  const StatisticsTable = () => (
    <View style={styles.tableWrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View>
          {/* Table Header */}
          <LinearGradient
            colors={['#2980B9', '#3498DB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.tableHeader, { width: totalContentWidth }]}
          >
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
          </LinearGradient>

          {/* Table Content */}
          {statisticsData.length === 0 && !isLoadingStatistics ? (
            <View style={[styles.noDataContainer, { width: totalContentWidth }]}>
              <MaterialIcons name="error-outline" size={60} color="#BDC3C7" />
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
          activeOpacity={1}
          onPress={() => setShowAction(false)}
        >
          <View
            style={[
              styles.actionMenu,
              {
                position: 'absolute',
                left: Math.min(modalPosition.x - 150, width - 240),
                top: modalPosition.y - 130,
              },
            ]}
          >
            <LinearGradient
              colors={['#3498DB', '#2980B9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionHeader}
            >
              <Text style={styles.actionTitle}>Actions</Text>
              <TouchableOpacity
                onPress={() => setShowAction(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={20} color="white" />
              </TouchableOpacity>
            </LinearGradient>

            <TouchableOpacity style={styles.actionItem} onPress={handleCopyLink}>
              <View style={styles.actionIconContainer}>
                <Feather name="link" size={18} color="white" />
              </View>
              <Text style={styles.actionText}>Copy Link</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleShowExecutions}
            >
              <View style={styles.actionIconContainer}>
                <Feather name="play-circle" size={18} color="white" />
              </View>
              <Text style={styles.actionText}>Show Execution</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={handleChangeStatus}>
              <View style={styles.actionIconContainer}>
                <Feather name="toggle-right" size={18} color="white" />
              </View>
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
      <StatusBar barStyle="dark-content" backgroundColor="#f5f6fa" />
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Statistics</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleStaticsData}>
          <Ionicons name="refresh" size={22} color="#3498DB" />
        </TouchableOpacity>
      </View>
      <View style={styles.statisticsContent}>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  statisticsContent: {
    padding: 15,
    flex: 1,
  },
  tableWrapper: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: 'white',
  },
  tableHeader: {
    flexDirection: 'row',
    padding: 12,
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
  cellText: {
    fontSize: 14,
    color: '#2C3E50',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(240, 240, 240, 0.8)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  statusText: {
    fontWeight: '600',
    fontSize: 13,
  },
  actionButton: {
    backgroundColor: '#3498DB',
    padding: 8,
    borderRadius: 8,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
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
    color: '#7F8C8D',
    marginTop: 10,
  },
  footerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionMenu: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    overflow: 'hidden',
  },
  actionHeader: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
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
  actionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3498DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionText: {
    fontSize: 15,
    color: '#2C3E50',
    fontWeight: '500',
  },
});

export default StatisticsScreen;
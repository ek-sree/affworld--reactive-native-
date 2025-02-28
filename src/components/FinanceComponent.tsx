import { View, Text, FlatList, ScrollView, StyleSheet, TouchableOpacity, StatusBar } from "react-native";
import { useEffect, useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ChoosePaymentMethod from "./ChoosePaymentMethod";
import { LinearGradient } from 'expo-linear-gradient';

interface AnalyticWalletData {
  total_earnings: number;
  unapproved_wallet: number;
}

interface AnalyticTransactionData {
  campaign_id: string;
  amount: number;
  approved: boolean;
  campaign_name: string;
  event: string;
  initiated_at: Date;
}

const FinanceComponent = () => {
  const [showApproved, setShowApproved] = useState<boolean>(false);
  const [analyticsWalletData, setAnalyticsWalletData] = useState<AnalyticWalletData | undefined>(undefined);
  const [analyticTransactionData, setAnalyticTransactionData] = useState<AnalyticTransactionData[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'balances' | 'history'>('balances');

  async function getAnalyticWallet() {
    try {
      const response = await axios.get('https://affiliate-api.affworld.io/api/analytics/wallet', {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('authToken')}`,
        },
      });
      if (response.status === 200) {
        setAnalyticsWalletData(response.data[0]);
      }
    } catch (error) {
      console.error("Error getting analytics wallet", error);
    }
  }

  async function analyticTransaction() {
    try {
      const response = await axios.get('https://affiliate-api.affworld.io/api/analytics/transactions', {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('authToken')}`,
        },
      });
      if (response.status === 200) {
        setAnalyticTransactionData(response.data);
      }
    } catch (error) {
      console.error("Error getting analytics transaction", error);
    }
  }

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    analyticTransaction();
    getAnalyticWallet();
  }, []);

  const renderTransactionItem = ({ item }: { item: AnalyticTransactionData }) => (
    <View style={styles.tableRow}>
      <Text style={[styles.tableCell, styles.campaignIdCell]} numberOfLines={1} ellipsizeMode="middle">
        {item.campaign_id}
      </Text>
      <Text style={[styles.tableCell, styles.campaignNameCell]} numberOfLines={1}>
        {item.campaign_name || "N/A"}
      </Text>
      <Text style={[styles.tableCell, styles.eventCell]}>{item.event}</Text>
      <Text 
        style={[
          styles.tableCell, 
          styles.amountCell, 
          {color: item.approved ? '#10B981' : '#6366F1'}
        ]}
      >
        ${item.amount.toFixed(2)}
      </Text>
      <View style={[
        styles.statusPill, 
        {backgroundColor: item.approved ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)'}
      ]}>
        <Text style={[
          styles.statusText, 
          {color: item.approved ? '#10B981' : '#6366F1'}
        ]}>
          {item.approved ? "Approved" : "Pending"}
        </Text>
      </View>
      <Text style={[styles.tableCell, styles.dateCell]} numberOfLines={1}>
        {new Date(item.initiated_at).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4F46E5', '#7E22CE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Finance Overview</Text>
        
        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'balances' && styles.activeTab]} 
            onPress={() => setActiveTab('balances')}
          >
            <Text style={[styles.tabText, activeTab === 'balances' && styles.activeTabText]}>Balances</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'history' && styles.activeTab]} 
            onPress={() => setActiveTab('history')}
          >
            <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>History</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'balances' ? (
          <>
            <View style={styles.cardsContainer}>
              <View style={[styles.balanceCard, styles.primaryCard]}>
                <View style={styles.cardIconContainer}>
                  <View style={styles.cardIcon}>
                    <Text style={styles.cardIconText}>💰</Text>
                  </View>
                </View>
                <Text style={styles.cardLabel}>All-time earnings</Text>
                <Text style={styles.cardValue}>
                  {analyticsWalletData?.total_earnings !== undefined
                    ? `$${analyticsWalletData.total_earnings.toFixed(2)}`
                    : "Loading..."}
                </Text>
              </View>

              <View style={styles.balanceRow}>
                <View style={[styles.balanceCard, styles.secondaryCard]}>
                  <View style={[styles.cardIconContainer, styles.pendingIcon]}>
                    <View style={styles.cardIcon}>
                      <Text style={styles.cardIconText}>⏳</Text>
                    </View>
                  </View>
                  <Text style={styles.cardLabel}>In processing</Text>
                  <Text style={styles.cardValue}>
                    {analyticsWalletData?.unapproved_wallet !== undefined
                      ? `$${analyticsWalletData.unapproved_wallet.toFixed(2)}`
                      : "Loading..."}
                  </Text>
                </View>

                <View style={[styles.balanceCard, styles.secondaryCard]}>
                  <View style={[styles.cardIconContainer, styles.paymentIcon]}>
                    <View style={styles.cardIcon}>
                      <Text style={styles.cardIconText}>💸</Text>
                    </View>
                  </View>
                  <Text style={styles.cardLabel}>To payment</Text>
                  <Text style={styles.cardValue}>$1000.00</Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Payment Methods</Text>
            <View style={styles.paymentOptionsContainer}>
              <TouchableOpacity 
                style={styles.paymentCard} 
                onPress={()=>setIsModalVisible(true)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#4F46E5', '#7E22CE']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.paymentCardGradient}
                >
                  <View style={styles.paymentCardContent}>
                    <View>
                      <Text style={styles.paymentCardTitle}>Manual Payment</Text>
                      <Text style={styles.paymentCardSubtitle}>Receive funds within 3 business days</Text>
                    </View>
                    <View style={styles.orderButtonContainer}>
                      <TouchableOpacity 
                        style={styles.orderButton} 
                        onPress={()=>setIsModalVisible(true)}
                      >
                        <Text style={styles.buttonText}>Order Payment</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.autopayCard}>
                <View style={styles.autopayCardContent}>
                  <View style={styles.autopayIconContainer}>
                    <View style={styles.autopayIcon}>
                      <Text style={styles.autopayIconText}>⚡</Text>
                    </View>
                  </View>
                  <View>
                    <Text style={styles.autopayTitle}>Autopay</Text>
                    <Text style={styles.autopaySubtitle}>You haven't activated autopay yet</Text>
                  </View>
                  {/* <TouchableOpacity style={styles.setupButton}>
                    <Text style={styles.setupButtonText}>Set up</Text>
                  </TouchableOpacity> */}
                </View>
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={styles.historySection}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyTitle}>Payment History</Text>
                <View style={styles.filterContainer}>
                  <TouchableOpacity 
                    style={[
                      styles.filterButton, 
                      showApproved && styles.activeFilterButton
                    ]} 
                    onPress={() => setShowApproved(!showApproved)}
                  >
                    <Text 
                      style={[
                        styles.filterButtonText,
                        showApproved && styles.activeFilterText
                      ]}
                    >
                      {showApproved ? "Showing Approved" : "Show Approved"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.tableContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                  <View>
                    <View style={styles.tableHeader}>
                      <Text style={[styles.tableHeaderCell, styles.campaignIdCell]}>Campaign ID</Text>
                      <Text style={[styles.tableHeaderCell, styles.campaignNameCell]}>Campaign Name</Text>
                      <Text style={[styles.tableHeaderCell, styles.eventCell]}>Event</Text>
                      <Text style={[styles.tableHeaderCell, styles.amountCell]}>Amount</Text>
                      <Text style={[styles.tableHeaderCell, styles.approvedCell]}>Status</Text>
                      <Text style={[styles.tableHeaderCell, styles.dateCell]}>Date</Text>
                    </View>
                    <FlatList
                      data={showApproved ? analyticTransactionData.filter((t) => t.approved) : analyticTransactionData}
                      renderItem={renderTransactionItem}
                      keyExtractor={(item, index) => `${item.campaign_id}-${index}`}
                      showsVerticalScrollIndicator={false}
                      nestedScrollEnabled
                      style={styles.tableList}
                    />
                  </View>
                </ScrollView>
              </View>
            </View>
          </>
        )}
      </ScrollView>
      <ChoosePaymentMethod
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 12,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  tabText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  cardsContainer: {
    marginBottom: 24,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  balanceCard: {
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    padding: 20,
  },
  primaryCard: {
    marginBottom: 12,
  },
  secondaryCard: {
    width: '48%',
    padding: 16,
  },
  cardIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  pendingIcon: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  paymentIcon: {
    backgroundColor: 'rgba(126, 34, 206, 0.1)',
  },
  cardIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIconText: {
    fontSize: 20,
  },
  cardLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  paymentOptionsContainer: {
    marginBottom: 24,
  },
  paymentCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  paymentCardGradient: {
    padding: 2,
  },
  paymentCardContent: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 20,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentCardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  paymentCardSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  orderButtonContainer: {
    marginTop:10,
    alignItems: 'flex-end',
  },
  orderButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
  autopayCard: {
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    padding: 20,
  },
  autopayCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  autopayIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  autopayIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  autopayIconText: {
    fontSize: 16,
  },
  autopayTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  autopaySubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  // setupButton: {
  //   marginLeft: 'auto',
  //   paddingVertical: 8,
  //   paddingHorizontal: 16,
  //   backgroundColor: 'rgba(245, 158, 11, 0.1)',
  //   borderRadius: 8,
  // },
  // setupButtonText: {
  //   color: '#F59E0B',
  //   fontWeight: '600',
  // },
  historySection: {
    marginBottom: 24,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
  },
  activeFilterButton: {
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
  },
  filterButtonText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '500',
  },
  activeFilterText: {
    fontWeight: '600',
  },
  tableContainer: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: '#FFFFFF',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    fontWeight: "600",
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    paddingHorizontal: 8,
  },
  tableList: {
    maxHeight: 400,
  },
  tableRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    paddingHorizontal: 8,
  },
  campaignIdCell: {
    width: 200,
  },
  campaignNameCell: {
    width: 150,
  },
  eventCell: {
    width: 100,
  },
  amountCell: {
    width: 100,
    fontWeight: '600',
  },
  approvedCell: {
    width: 100,
  },
  dateCell: {
    width: 200,
  },
  statusPill: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    width: 90,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default FinanceComponent;
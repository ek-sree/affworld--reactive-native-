import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { Menu, Divider, Provider } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import AddMoneyModal from "../components/AddMoneyModal";
import { API } from "../constant/api";
import { FormattedTransaction, WalletTransaction } from "../interface/IWallet";
import { useNavigation } from "@react-navigation/native";

interface TransactionAnim {
  fade: Animated.Value;
  translateY: Animated.Value;
}

const WalletScreen = () => {
  const [visible, setVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState("All Transactions");
  const [selectedTransaction, setSelectedTransaction] = useState<FormattedTransaction[]>([]);
  const [isAddMoneyModalVisible, setIsAddMoneyModalVisible] = useState(false);
  const [totalBalance, setTotalBalance] = useState<number>(0); // Default to 0
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [allTransactions, setAllTransactions] = useState<FormattedTransaction[]>([]);

  const navigation = useNavigation();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const balanceScaleAnim = useRef(new Animated.Value(0.8)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;
  const spinValue = useRef(new Animated.Value(0)).current;

  const transactionAnims = useRef<TransactionAnim[]>([]);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const fetchWalletData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setIsLoading(true);

    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.error("No token found! Ensure user is logged in.");
        return;
      }

      const [balanceResponse, transactionsResponse] = await Promise.all([
        axios.get(`${API}/api/wallet/total-remaining-balance`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API}/api/wallet/balance-statements`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (balanceResponse.status === 200) {
        const balance = balanceResponse.data.total_remaining_balance;
        setTotalBalance(parseFloat(balance ? balance.toFixed(2) : "0")); 
      } else {
        setTotalBalance(0); 
      }

      if (transactionsResponse.status === 200) {
        const formattedTransactions = transactionsResponse.data.map((item: WalletTransaction) => ({
          date: new Date(item.timestamp).toLocaleDateString(),
          orderId: item.order_id,
          amount: `₹ ${item.amount.toFixed(2)}`,
          status: item.verified === true ? "Success" : item.verified === "pending" ? "Pending" : "Failed",
        }));
        setAllTransactions(formattedTransactions);
        setSelectedTransaction(formattedTransactions);
        transactionAnims.current = formattedTransactions.map(() => ({
          fade: new Animated.Value(0),
          translateY: new Animated.Value(50),
        }));
      } else {
        setAllTransactions([]);
        setSelectedTransaction([]);
      }
    } catch (error: any) {
      console.error("Error fetching wallet data:", error.response ? error.response.data : error.message);
      setTotalBalance(0);
      setAllTransactions([]);
      setSelectedTransaction([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchWalletData();
    });
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (!isLoading && selectedTransaction) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(translateYAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(balanceScaleAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.elastic(1.2),
          useNativeDriver: true,
        }),
        ...(selectedTransaction.length > 0
          ? transactionAnims.current.map((anim, index) =>
              Animated.sequence([
                Animated.delay(index * 120),
                Animated.parallel([
                  Animated.timing(anim.fade, { toValue: 1, duration: 400, useNativeDriver: true }),
                  Animated.timing(anim.translateY, {
                    toValue: 0,
                    duration: 500,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                  }),
                ]),
              ])
            )
          : []),
      ]).start();
    }
  }, [selectedTransaction, isLoading]);

  const bounceAnimation = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.timing(bounceAnimation, { toValue: 0.9, duration: 100, useNativeDriver: true }).start();
  };

  const onPressOut = () => {
    Animated.timing(bounceAnimation, {
      toValue: 1,
      duration: 200,
      easing: Easing.elastic(1.5),
      useNativeDriver: true,
    }).start();
  };

  const filterTransactions = (option: string) => {
    setSelectedOption(option);
    if (option === "All Transactions") {
      setSelectedTransaction(allTransactions);
    } else if (option === "Added Balance") {
      setSelectedTransaction(allTransactions.filter((txn) => txn.status === "Success"));
    } else if (option === "Total Bill") {
      setSelectedTransaction(allTransactions.filter((txn) => txn.status !== "Success"));
    }
  };

  const renderIconForStatus = (status: string) => {
    if (status === "Success") return "checkmark-circle";
    if (status === "Pending") return "time";
    return "close-circle";
  };

  return (
    <Provider>
      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Ionicons name="wallet-outline" size={50} color="#00BFFF" />
            </Animated.View>
            <Text style={styles.loadingText}>Fetching your wallet...</Text>
          </View>
        ) : (
          <>
            <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
              <Animated.View style={{ transform: [{ scale: bounceAnimation }] }}>
                <TouchableOpacity
                  style={styles.addMoneyButton}
                  onPress={() => setIsAddMoneyModalVisible(true)}
                  onPressIn={onPressIn}
                  onPressOut={onPressOut}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#fff" />
                  <Text style={styles.addMoneyText}>Add Money</Text>
                </TouchableOpacity>
              </Animated.View>
              <Animated.View style={{ transform: [{ scale: balanceScaleAnim }] }}>
                <Text style={styles.balanceLabel}>Total Balance</Text>
                <Text style={styles.balanceAmount}>₹ {totalBalance}</Text>
              </Animated.View>
            </Animated.View>

            <Animated.View
              style={[styles.dropdownContainer, { opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }]}
            >
              <Menu
                visible={visible}
                onDismiss={closeMenu}
                anchor={
                  <TouchableOpacity onPress={openMenu} style={styles.dropdownButton}>
                    <Text style={styles.dropdownText}>{selectedOption}</Text>
                    <Ionicons
                      name={visible ? "chevron-up" : "chevron-down"}
                      size={18}
                      color="#333"
                    />
                  </TouchableOpacity>
                }
                contentStyle={styles.menuContent}
              >
                <Menu.Item
                  onPress={() => {
                    filterTransactions("All Transactions");
                    closeMenu();
                  }}
                  title="All Transactions"
                  leadingIcon="format-list-bulleted"
                />
                <Divider />
                <Menu.Item
                  onPress={() => {
                    filterTransactions("Added Balance");
                    closeMenu();
                  }}
                  title="Added Balance"
                  leadingIcon="arrow-up-bold"
                />
                <Divider />
                <Menu.Item
                  onPress={() => {
                    filterTransactions("Total Bill");
                    closeMenu();
                  }}
                  title="Total Bill"
                  leadingIcon="receipt"
                />
              </Menu>
            </Animated.View>

            <ScrollView
              style={styles.transactionsContainer}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {selectedTransaction.length > 0 ? (
                selectedTransaction.map((transaction, index) => (
                  <Animated.View
                    key={`${transaction.orderId}-${index}`}
                    style={[
                      styles.transactionItem,
                      {
                        opacity: transactionAnims.current[index]?.fade || 0,
                        transform: [{ translateY: transactionAnims.current[index]?.translateY || 50 }],
                      },
                    ]}
                  >
                    <View style={styles.transactionLeft}>
                      <View
                        style={[
                          styles.iconContainer,
                          transaction.status === "Success"
                            ? styles.successIconBg
                            : transaction.status === "Pending"
                            ? styles.pendingIconBg
                            : styles.failedIconBg,
                        ]}
                      >
                        <Ionicons
                          name={renderIconForStatus(transaction.status)}
                          size={22}
                          color={
                            transaction.status === "Success"
                              ? "#0A8A0A"
                              : transaction.status === "Pending"
                              ? "#E9940A"
                              : "#D50000"
                          }
                        />
                      </View>
                      <View>
                        <Text style={styles.transactionTitle}>Added to Wallet</Text>
                        <Text style={styles.transactionDate}>{transaction.date}</Text>
                        <Text style={styles.transactionOrderId}>Order ID: {transaction.orderId}</Text>
                      </View>
                    </View>
                    <View style={styles.transactionRight}>
                      <Text style={styles.transactionAmount}>{transaction.amount}</Text>
                      <View
                        style={[
                          styles.statusChip,
                          transaction.status === "Success"
                            ? styles.statusSuccess
                            : transaction.status === "Pending"
                            ? styles.statusPending
                            : styles.statusFailed,
                        ]}
                      >
                        <Text style={styles.statusText}>{transaction.status}</Text>
                      </View>
                    </View>
                  </Animated.View>
                ))
              ) : (
                <Animated.View
                  style={[styles.noTransactionContainer, { opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }]}
                >
                  <Ionicons name="wallet-outline" size={60} color="#DDD" />
                  <Text style={styles.noTransactionText}>No transactions found</Text>
                  <Text style={styles.noTransactionSubText}>Add money to your wallet to get started</Text>
                </Animated.View>
              )}
            </ScrollView>
          </>
        )}
      </View>
      <AddMoneyModal
        visible={isAddMoneyModalVisible}
        onClose={() => setIsAddMoneyModalVisible(false)}
        onSuccess={() => {
          setIsAddMoneyModalVisible(false);
          fetchWalletData(true);
        }}
      />
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: "#555",
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  addMoneyButton: {
    backgroundColor: "#2E7AFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#2E7AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addMoneyText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  balanceLabel: {
    fontSize: 15,
    color: "#666",
    textAlign: "right",
  },
  balanceAmount: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "right",
    color: "#1E293B",
  },
  dropdownContainer: {
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  dropdownButton: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: 180,
  },
  dropdownText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  menuContent: {
    width: 200,
    borderRadius: 12,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  noTransactionContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
    padding: 20,
  },
  noTransactionText: {
    fontSize: 18,
    color: "#555",
    fontWeight: "600",
    marginTop: 20,
  },
  noTransactionSubText: {
    fontSize: 14,
    color: "#888",
    marginTop: 8,
  },
  transactionsContainer: {
    flex: 1,
  },
  transactionItem: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 14,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  successIconBg: {
    backgroundColor: "rgba(10, 138, 10, 0.12)",
  },
  pendingIconBg: {
    backgroundColor: "rgba(233, 148, 10, 0.12)",
  },
  failedIconBg: {
    backgroundColor: "rgba(213, 0, 0, 0.12)",
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  transactionDate: {
    fontSize: 13,
    color: "#777",
    marginTop: 3,
  },
  transactionOrderId: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 5,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  statusPending: {
    backgroundColor: "rgba(233, 148, 10, 0.15)",
  },
  statusSuccess: {
    backgroundColor: "rgba(10, 138, 10, 0.15)",
  },
  statusFailed: {
    backgroundColor: "rgba(213, 0, 0, 0.15)",
  },
});

export default WalletScreen;
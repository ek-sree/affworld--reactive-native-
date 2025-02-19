import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Menu, Divider, Provider } from "react-native-paper";
import AddMoneyModal from "../components/AddMoneyModal";
import { API } from "../constant/api";

interface WalletTransaction {
  _id: string;
  amount: number;
  order_id: string;
  timestamp: string;
  verified: boolean | string;
}

interface FormattedTransaction {
  date: string;
  orderId: string;
  amount: string;
  status: string;
}

const WalletScreen = () => {
  const [visible, setVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState("All Transactions");
  const [selectedTransaction, setSelectedTransaction] = useState<FormattedTransaction[]>([]);
  const [isAddMoneyModalVisible, setIsAddMoneyModalVisible] = useState(false);
  const [totalBalance, setTotalBalance] = useState<number>(0);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const fetchWalletData = async () => {
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
        setTotalBalance(parseFloat(balanceResponse.data.total_remaining_balance.toFixed(2)));
      }
      if (transactionsResponse.status === 200) {
        const formattedTransactions = transactionsResponse.data.map((item: WalletTransaction) => ({
          date: new Date(item.timestamp).toLocaleDateString(),
          orderId: item.order_id,
          amount: `₹ ${item.amount.toFixed(2)}`,
          status: item.verified === true ? "Success" : item.verified === "pending" ? "Pending" : "Failed",
        }));
        setSelectedTransaction(formattedTransactions);
      }
    } catch (error: any) {
      console.error("Error fetching wallet data:", error.response ? error.response.data : error.message);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);
  

  return (
    <Provider>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.addMoneyButton} 
            onPress={() => setIsAddMoneyModalVisible(true)}
          >
            <Text style={styles.addMoneyText}>Add Money</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>₹ {totalBalance}</Text>
          </View>
        </View>

        <View style={styles.dropdownContainer}>
          <Menu
            visible={visible}
            onDismiss={closeMenu}
            anchor={
              <TouchableOpacity onPress={openMenu} style={styles.dropdownButton}>
                <Text style={styles.dropdownText}>{selectedOption}</Text>
                <Text style={styles.dropdownIcon}>⌄</Text>
              </TouchableOpacity>
            }
            contentStyle={styles.menuContent}
          >
            <Menu.Item
              onPress={() => {
                setSelectedOption("All Transactions");
                closeMenu();
              }}
              title="All Transactions"
            />
            <Divider />
            <Menu.Item
              onPress={() => {
                setSelectedOption("Added Balance");
                closeMenu();
              }}
              title="Added Balance"
            />
            <Divider />
            <Menu.Item
              onPress={() => {
                setSelectedOption("Total Bill");
                closeMenu();
              }}
              title="Total Bill"
            />
          </Menu>
        </View>

        <ScrollView style={styles.transactionsContainer}>
          {selectedTransaction.length > 0 ? (
            selectedTransaction.map((transaction, index) => (
              <View key={index} style={styles.transactionItem}>
                <View style={styles.transactionLeft}>
                  <View style={styles.iconContainer}>
                    <Text style={styles.iconText}>🏦</Text>
                  </View>
                  <View>
                    <Text style={styles.transactionTitle}>Added to Wallet</Text>
                    <Text style={styles.transactionDate}>{transaction.date}</Text>
                    <Text style={styles.transactionOrderId}>Order ID: {transaction.orderId}</Text>
                  </View>
                </View>
                <View style={styles.transactionRight}>
                  <Text style={styles.transactionAmount}>{transaction.amount}</Text>
                  <Text
                    style={[
                      styles.transactionStatus,
                      transaction.status === "Pending" ? styles.statusPending :
                      transaction.status === "Failed" ? styles.statusFailed :
                      styles.statusSuccess,
                    ]}
                  >
                    {transaction.status}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.noTransactionContainer}>
              <Text style={styles.noTransactionText}>No statements for this affiliate.</Text>
            </View>
          )}
        </ScrollView>
      </View>
      <AddMoneyModal
        visible={isAddMoneyModalVisible}
        onClose={() => setIsAddMoneyModalVisible(false)}
        onSuccess={fetchWalletData}
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  addMoneyButton: {
    backgroundColor: "#00BFFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addMoneyText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  balanceLabel: {
    fontSize: 14,
    color: "#666",
    textAlign: "right",
  },
  balanceAmount: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "right",
  },
  dropdownContainer: {
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  dropdownButton: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
  },
  dropdownIcon: {
    fontSize: 16,
    color: "#333",
    marginTop: -6, 
    marginLeft: 8,
  },
  menuContent: {
    width: 180,
  },
  noTransactionContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  noTransactionText: {
    fontSize: 16,
    color: "#777",
    fontStyle: "italic",
  },
  transactionsContainer: {
    flex: 1,
  },
  transactionItem: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  iconText: {
    fontSize: 18,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  transactionDate: {
    fontSize: 12,
    color: "#777",
  },
  transactionOrderId: {
    fontSize: 12,
    color: "#999",
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  transactionStatus: {
    fontSize: 14,
    marginTop: 5,
  },
  statusPending: {
    color: "orange",
  },
  statusSuccess: {
    color: "green",
  },
  statusFailed: {
    color: "red",
  },
});

export default WalletScreen;
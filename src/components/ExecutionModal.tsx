import axios from "axios";
import { useState } from "react";
import { Text, TouchableOpacity, TouchableWithoutFeedback, Modal, View, StyleSheet, ScrollView } from "react-native";
import { ExecutionData, ExecutionDetails, ExecutionModalProps } from "../interface/IExecution";
import { API } from "../constant/api";


const ExecutionModal = ({ visible, onClose, executionData }: ExecutionModalProps) => {
  const [openDetails, setOpenDetails] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<ExecutionDetails | null>(null);

  const displayData = executionData.find((item) => item.response && item.response.order) || executionData[0] || null;

  const handleShowDetails = async(item: ExecutionData) => {
    setOpenDetails(true);
    try {
        const response = await axios.post(`${API}/api/check-order-status`,{
            order: displayData.response.order
        })
        console.log("response: " , response.data);
        setSelectedOrder(response.data);
    } catch (error) {
        console.log("Failed to get execution details", error);
        
    }
  };

  if (!displayData) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.header}>
                  <Text style={styles.title}>Execution</Text>
                  <TouchableOpacity onPress={onClose}>
                    <Text style={styles.closeButton}>Close</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.noDataText}>No Execution Data Available</Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.header}>
                <Text style={styles.title}>Execution</Text>
                <TouchableOpacity onPress={onClose}>
                  <Text style={styles.closeButton}>Close</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, styles.noCell]}>No.</Text>
                <Text style={[styles.headerCell, styles.orderCell]}>Order</Text>
                <Text style={[styles.headerCell, styles.timeCell]}>Timestamp</Text>
                <Text style={[styles.headerCell, styles.statusCell]}>Details</Text>
              </View>

              <ScrollView>
                <View style={styles.row}>
                  <Text style={[styles.cell, styles.noCell]}>1</Text>
                  <Text style={[styles.cell, styles.orderCell]}>
                    {displayData.response.order || "N/A"}
                  </Text>
                  <Text style={[styles.cell, styles.timeCell]}>
                    {displayData.timestamp}
                  </Text>
                  <View style={[ styles.statusCell]}>
                    <TouchableOpacity
                      style={styles.detailsButton}
                      onPress={() => handleShowDetails(displayData)}
                    >
                      <Text style={styles.detailsButtonText}>Details</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>

              {/* Details Modal */}
              <Modal
                visible={openDetails}
                transparent
                animationType="fade"
                onRequestClose={() => setOpenDetails(false)}
              >
                <TouchableWithoutFeedback onPress={() => setOpenDetails(false)}>
                  <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                      <View style={[styles.modalContent, styles.detailsModal]}>
                        <View style={styles.detailsHeader}>
                          <View style={styles.detailsHeaderRow}>
                            <Text style={styles.detailsHeaderText}>Status</Text>
                            <Text style={styles.detailsHeaderText}>Remaining</Text>
                          </View>
                        </View>
                        <View style={styles.detailsContent}>
                          <View style={styles.detailsDataRow}>
                            <Text style={styles.detailsDataText}>
                              {selectedOrder?.status || ""}
                            </Text>
                            <Text style={styles.detailsDataText}>
                              {selectedOrder?.remains || ""}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </TouchableWithoutFeedback>
              </Modal>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "100%",
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 8,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    color: "red",
    fontSize: 16,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    backgroundColor: "#F5F5F5",
    padding: 12,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    padding: 12,
  },
  headerCell: {
    fontWeight: "bold",
    color: "#666",
  },
  cell: {
    color: "#333",
  },
  noCell: {
    flex: 0.5,
  },
  orderCell: {
    flex: 1,
  },
  timeCell: {
    flex: 2,
  },
  statusCell: {
    flex: 1,
    alignItems: "center",
  },
  detailsButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  detailsButtonText: {
    color: "white",
    fontSize: 14,
  },
  detailsModal: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
  },
  detailsHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    padding: 16,
  },
  detailsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  detailsHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  detailsContent: {
    padding: 16,
  },
  detailsDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  detailsDataText: {
    fontSize: 16,
    color: '#333',
  },
  noDataText: {
    padding: 20,
    textAlign: "center",
    color: "#666",
    fontSize: 16,
  },
});

export default ExecutionModal;
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface ConversionsStatusModalProps{
    visible: boolean;
    onClose: () => void;
    campaign_id: string;
}

interface ConversionsStatus{
    count:string;
    event_id:string;
}
const ConversionsStatusModal: React.FC<ConversionsStatusModalProps> = ({ visible, onClose, campaign_id }) => {
    const [conversionData, setConversionData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
  
    async function getConversionStatusData() {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://affiliate-api.affworld.io/api/analytics/postback?campaign_id=${campaign_id}`,
          {
            headers: {
              Authorization: `Bearer ${await AsyncStorage.getItem('authToken')}`,
            },
          }
        );
        setConversionData(response.data || []); 
      } catch (err) {
        console.error("Error fetching conversionsStatus", err);
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    }
  
    useEffect(() => {
      if (campaign_id) {
        getConversionStatusData();
      }
    }, [campaign_id]);
  
    const TableHeader = () => (
      <View style={styles.headerRow}>
        <View style={styles.headerCell}>
          <Text style={styles.headerText}>No.</Text>
        </View>
        <View style={styles.headerCell}>
          <Text style={styles.headerText}>Count</Text>
        </View>
        <View style={styles.headerCell}>
          <Text style={styles.headerText}>Event ID</Text>
        </View>
      </View>
    );
  
    const TableRow = ({ item, index }:{item: ConversionsStatus, index:number}) => (
      <View style={styles.row}>
        <View style={styles.cell}>
          <Text style={styles.cellText}>{index + 1}</Text>
        </View>
        <View style={styles.cell}>
          <Text style={styles.cellText}>{item.count}</Text>
        </View>
        <View style={styles.cell}>
          <Text style={styles.cellText}>{item.event_id || "N/A"}</Text>
        </View>
      </View>
    );
  
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Conversion Details</Text>
  
            {loading ? (
              <Text style={{textAlign:"center",margin:10}}>Loading...</Text>
            ) : error ? (
              <Text style={{ color: 'red' }}>{error}</Text>
            ) : conversionData.length > 0 ? (
              <ScrollView style={styles.tableContainer}>
                <TableHeader />
                {conversionData.map((item, index) => (
                  <TableRow key={index} item={item} index={index} />
                ))}
              </ScrollView>
            ) : (
              <Text style={{textAlign:"center",margin:10}}>No data available for this campaign.</Text>
            )}
  
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };
  

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  tableContainer: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  row: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerCell: {
    flex: 1,
    justifyContent: 'center',
  },
  cell: {
    flex: 1,
    justifyContent: 'center',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  cellText: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ConversionsStatusModal;
import { View, Text, Modal, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { LinearGradient } from 'expo-linear-gradient'

interface PaymentData {
  account_number: string
  beneficiary_name: string
  account_type: string
  bank_name: string
  beneficiary_address: string
  sort_code: string
  swift: string
  iban: string
  bank_address: string
  payment_detail_id: string
}

interface PaymentDetailsModalProps {
  visible: boolean
  onClose: () => void
}

const { width } = Dimensions.get('window')
const isTablet = width >= 768

const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({ visible, onClose }) => {
  const [paymentData, setPaymentData] = useState<PaymentData[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  async function paymentDetails() {
    setLoading(true)
    setError(null)
    try {
      const token = await AsyncStorage.getItem('authToken')
      if (!token) {
        setError('Authentication token not found. Please log in again.')
        setLoading(false)
        return
      }

      const response = await axios.get('https://affiliate-api.affworld.io/api/affiliates/payment_info', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      if (response.status === 200) {
        setPaymentData(response.data)
      }
    } catch (error: any) {
      console.error("Error occurred while fetching payment details", error)
      setError(error.response?.data?.message || 'Failed to load payment details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (visible) {
      paymentDetails()
    }
  }, [visible])

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <LinearGradient
            colors={['#6366f1', '#a855f7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.modalHeader}
          >
            <Text style={styles.modalTitle}>Saved Payment Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <AntDesign name="closecircle" size={26} color="white" />
            </TouchableOpacity>
          </LinearGradient>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading payment details...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons name="alert-circle-outline" size={36} color="#ef4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : paymentData.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="credit-card-outline" size={48} color="#94a3b8" />
              <Text style={styles.emptyText}>No payment details found</Text>
              <Text style={styles.emptySubText}>Your saved payment information will appear here</Text>
            </View>
          ) : (
            <ScrollView style={styles.detailsContainer}>
              {paymentData.map((payment, index) => (
                <View key={payment.payment_detail_id || index} style={styles.paymentCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardTitleContainer}>
                      <MaterialCommunityIcons name="bank" size={22} color="#6366f1" style={styles.cardIcon} />
                      <Text style={styles.cardTitle}>Payment Details {index + 1}</Text>
                    </View>
                    <View style={styles.accountTypeBadge}>
                      <Text style={styles.accountTypeText}>
                        {payment.account_type.charAt(0).toUpperCase() + payment.account_type.slice(1)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardBody}>
                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Beneficiary Information</Text>
                      <View style={styles.detailRow}>
                        <Text style={styles.label}>Name</Text>
                        <Text style={styles.value}>{payment.beneficiary_name}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.label}>Address</Text>
                        <Text style={styles.value}>{payment.beneficiary_address || 'Not provided'}</Text>
                      </View>
                    </View>

                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Account Information</Text>
                      <View style={styles.detailRow}>
                        <Text style={styles.label}>Account Number</Text>
                        <Text style={styles.value}>{payment.account_number}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.label}>Sort Code</Text>
                        <Text style={styles.value}>{payment.sort_code}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.label}>IBAN</Text>
                        <Text style={styles.value}>{payment.iban}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.label}>SWIFT</Text>
                        <Text style={styles.value}>{payment.swift}</Text>
                      </View>
                    </View>

                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Bank Information</Text>
                      <View style={styles.detailRow}>
                        <Text style={styles.label}>Bank Name</Text>
                        <Text style={styles.value}>{payment.bank_name}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.label}>Bank Address</Text>
                        <Text style={styles.value}>{payment.bank_address || 'Not provided'}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#f8fafc',
    width: '95%',
    maxWidth: 550,
    maxHeight: '85%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginTop: 12,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 6,
    textAlign: 'center',
  },
  detailsContainer: {
    padding: 12,
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
  accountTypeBadge: {
    backgroundColor: '#818cf8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  accountTypeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  cardBody: {
    padding: 16,
  },
  detailSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    flexWrap: 'wrap',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    flex: isTablet ? 0.3 : 0.4,
  },
  value: {
    fontSize: 14,
    color: '#334155',
    flex: isTablet ? 0.7 : 0.6,
    textAlign: 'right',
    fontWeight: '400',
  },
})

export default PaymentDetailsModal
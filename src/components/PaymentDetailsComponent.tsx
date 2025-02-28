import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useState } from 'react'
import { SelectList } from 'react-native-dropdown-select-list'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import PaymentDetailsModal from './PaymentDetailsModal'
import { LinearGradient } from 'expo-linear-gradient'

interface PaymentInfoErrorProps {
    accountNumber?: string
    beneficiaryName?: string
    beneficiaryAddress?: string
    bankName?: string
    bankAddress?: string
    sortCode?: string
    iban?: string
    swift?: string
    accountType?: string
}

interface ApiValidationError {
    detail: Array<{
        loc: string[]
        msg: string
        type: string
    }>
}

const PaymentDetailsComponent = () => {
    const [accountNumber, setAccountNumber] = useState('')
    const [beneficiaryName, setBeneficiaryName] = useState('')
    const [beneficiaryAddress, setBeneficiaryAddress] = useState('')
    const [bankName, setBankName] = useState('')
    const [bankAddress, setBankAddress] = useState('')
    const [sortCode, setSortCode] = useState('')
    const [iban, setIban] = useState('')
    const [swift, setSwift] = useState('')
    const [accountType, setAccountType] = useState('')
    const [errors, setErrors] = useState<Partial<PaymentInfoErrorProps>>({})
    const [apiError, setApiError] = useState<string>('')
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

    const accountTypes = [
        { key: 'current', value: 'Current' },
        { key: 'saving', value: 'Saving' },
    ]

    const validateForm = () => {
        let newErrors: Partial<PaymentInfoErrorProps> = {}

        if (!accountNumber) newErrors.accountNumber = 'Account number is required'
        if (!beneficiaryName) newErrors.beneficiaryName = 'Beneficiary name is required'
        if (!beneficiaryAddress) newErrors.beneficiaryAddress = 'Beneficiary address is required'
        if (!bankName) newErrors.bankName = 'Bank name is required'
        if (!bankAddress) newErrors.bankAddress = 'Bank address is required'
        if (!sortCode) newErrors.sortCode = 'Sort code is required'
        if (!iban) newErrors.iban = 'IBAN is required'
        if (!swift) newErrors.swift = 'SWIFT code is required'
        if (!accountType) newErrors.accountType = 'Account type is required'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleAccountChange = (text: string) => {
        const numericText = text.replace(/[^0-9]/g, '')
        setAccountNumber(numericText)
    }

    const handleIbanChange = (text: string) => {
        const numericText = text.replace(/[^0-9]/g, '')
        setIban(numericText)
    }

    const handleSubmit = async () => {
        if (!validateForm()) {
            return
        }

        const token = await AsyncStorage.getItem("authToken")
        if (!token) {
            setApiError("No authentication token found. Please log in.")
            return
        }

        try {
            setErrors({})
            setApiError('')

            const response = await axios.post(
                'https://affiliate-api.affworld.io/api/affiliates/payment_info',
                {
                    account_number: accountNumber,
                    beneficiary_name: beneficiaryName,
                    beneficiary_address: beneficiaryAddress,
                    bank_name: bankName,
                    bank_address: bankAddress,
                    sort_code: sortCode,
                    iban: iban,
                    swift: swift,
                    account_type: accountType.toLowerCase(),
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    timeout: 30000,
                }
            )
            if (response.status === 200) {
                Alert.alert('Success', 'Payment information submitted successfully!')
                setAccountNumber('')
                setBeneficiaryName('')
                setBeneficiaryAddress('')
                setBankName('')
                setBankAddress('')
                setSortCode('')
                setIban('')
                setSwift('')
                setAccountType('')
                setErrors({})
                setApiError('')
            }
        } catch (error: any) {
            if (axios.isAxiosError(error) && error.response) {
                if (error.response.status === 422) {
                    const errorData: ApiValidationError = error.response.data
                    setApiError('Validation failed. Please check your inputs.')
                    const newErrors: Partial<PaymentInfoErrorProps> = {}
                    errorData.detail.forEach(err => {
                        const field = err.loc[0]
                        switch (field) {
                            case 'account_number':
                                newErrors.accountNumber = err.msg
                                break
                            case 'beneficiary_name':
                                newErrors.beneficiaryName = err.msg
                                break
                            case 'beneficiary_address':
                                newErrors.beneficiaryAddress = err.msg
                                break
                            case 'bank_name':
                                newErrors.bankName = err.msg
                                break
                            case 'bank_address':
                                newErrors.bankAddress = err.msg
                                break
                            case 'sort_code':
                                newErrors.sortCode = err.msg
                                break
                            case 'iban':
                                newErrors.iban = err.msg
                                break
                            case 'swift':
                                newErrors.swift = err.msg
                                break
                            case 'account_type':
                                newErrors.accountType = err.msg
                                break
                        }
                    })
                    setErrors(newErrors)
                } else {
                    setApiError(`Request failed: ${error.message}`)
                }
            } else if (error.code === 'ECONNABORTED') {
                setApiError('Request timed out. Please try again.')
            } else {
                setApiError('An unexpected error occurred')
            }
            console.error('Full error:', error.response?.data || error)
        }
    }

    const handleOpenModal = () => {
        setIsModalOpen(true)
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView style={styles.container}>
                <LinearGradient
                    colors={['#6366f1', '#a855f7']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.headerGradient}
                >
                    <Text style={styles.title}>Payment Details</Text>
                </LinearGradient>

                {apiError && (
                    <View style={styles.apiErrorContainer}>
                        <Text style={styles.apiErrorText}>{apiError}</Text>
                    </View>
                )}

                <View style={styles.formContainer}>
                    <View style={styles.formHeader}>
                        <View style={styles.formIcon}>
                            <Text style={styles.formIconText}>💳</Text>
                        </View>
                        <Text style={styles.formHeaderText}>Bank Account Information</Text>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Account Number</Text>
                            <TextInput
                                style={[styles.input, errors.accountNumber && styles.inputError]}
                                value={accountNumber}
                                onChangeText={handleAccountChange}
                                keyboardType="numeric"
                                placeholder="Enter account number"
                                placeholderTextColor="#a1a1aa"
                            />
                            {errors.accountNumber && <Text style={styles.errorText}>{errors.accountNumber}</Text>}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Beneficiary Name</Text>
                            <TextInput
                                style={[styles.input, errors.beneficiaryName && styles.inputError]}
                                value={beneficiaryName}
                                onChangeText={setBeneficiaryName}
                                placeholder="Enter beneficiary name"
                                placeholderTextColor="#a1a1aa"
                            />
                            {errors.beneficiaryName && <Text style={styles.errorText}>{errors.beneficiaryName}</Text>}
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Beneficiary Address</Text>
                            <TextInput
                                style={[styles.input, errors.beneficiaryAddress && styles.inputError]}
                                value={beneficiaryAddress}
                                onChangeText={setBeneficiaryAddress}
                                placeholder="Enter beneficiary address"
                                placeholderTextColor="#a1a1aa"
                            />
                            {errors.beneficiaryAddress && <Text style={styles.errorText}>{errors.beneficiaryAddress}</Text>}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Bank Name</Text>
                            <TextInput
                                style={[styles.input, errors.bankName && styles.inputError]}
                                value={bankName}
                                onChangeText={setBankName}
                                placeholder="Enter bank name"
                                placeholderTextColor="#a1a1aa"
                            />
                            {errors.bankName && <Text style={styles.errorText}>{errors.bankName}</Text>}
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Bank Address</Text>
                            <TextInput
                                style={[styles.input, errors.bankAddress && styles.inputError]}
                                value={bankAddress}
                                onChangeText={setBankAddress}
                                placeholder="Enter bank address"
                                placeholderTextColor="#a1a1aa"
                            />
                            {errors.bankAddress && <Text style={styles.errorText}>{errors.bankAddress}</Text>}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Sort Code</Text>
                            <TextInput
                                style={[styles.input, errors.sortCode && styles.inputError]}
                                value={sortCode}
                                onChangeText={setSortCode}
                                placeholder="Enter sort code"
                                placeholderTextColor="#a1a1aa"
                            />
                            {errors.sortCode && <Text style={styles.errorText}>{errors.sortCode}</Text>}
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>IBAN</Text>
                            <TextInput
                                style={[styles.input, errors.iban && styles.inputError]}
                                value={iban}
                                onChangeText={handleIbanChange}
                                keyboardType="numeric"
                                placeholder="Enter IBAN"
                                placeholderTextColor="#a1a1aa"
                            />
                            {errors.iban && <Text style={styles.errorText}>{errors.iban}</Text>}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>SWIFT</Text>
                            <TextInput
                                style={[styles.input, errors.swift && styles.inputError]}
                                value={swift}
                                onChangeText={setSwift}
                                placeholder="Enter SWIFT code"
                                placeholderTextColor="#a1a1aa"
                            />
                            {errors.swift && <Text style={styles.errorText}>{errors.swift}</Text>}
                        </View>
                    </View>

                    <View style={styles.fullRow}>
                        <Text style={styles.label}>Type of Account</Text>
                        <SelectList
                            setSelected={setAccountType}
                            data={accountTypes}
                            placeholder="Select account type"
                            boxStyles={StyleSheet.flatten([styles.dropdownBox, errors.accountType && styles.inputError])}
                            inputStyles={styles.dropdownInput}
                            dropdownStyles={styles.dropdown}
                            dropdownTextStyles={styles.dropdownText}
                            searchPlaceholder="Search"
                        />
                        {errors.accountType && <Text style={styles.errorText}>{errors.accountType}</Text>}
                    </View>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.savedButton} onPress={handleOpenModal}>
                            <Text style={styles.savedButtonText}>Saved Details</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity onPress={handleSubmit}>
                            <LinearGradient
                                colors={['#6366f1', '#8b5cf6']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.submitButton}
                            >
                                <Text style={styles.submitButtonText}>Submit</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
                <PaymentDetailsModal
                    visible={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    headerGradient: {
        paddingVertical: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    apiErrorContainer: {
        margin: 16,
        padding: 12,
        backgroundColor: '#fee2e2',
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#ef4444',
    },
    apiErrorText: {
        color: '#b91c1c',
        fontSize: 14,
    },
    formContainer: {
        margin: 16,
        padding: 24,
        backgroundColor: '#fff',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 3,
    },
    formHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    formIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f3e8ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    formIconText: {
        fontSize: 20,
    },
    formHeaderText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        flexWrap: 'wrap',
    },
    fullRow: {
        marginBottom: 16,
    },
    inputGroup: {
        flex: 1,
        marginHorizontal: 5,
        minWidth: 250,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4b5563',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        backgroundColor: '#f9fafb',
        color: '#111827',
    },
    dropdownBox: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        padding: 14,
        backgroundColor: '#f9fafb',
    },
    dropdownInput: {
        fontSize: 15,
        color: '#111827',
    },
    dropdown: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        marginTop: 5,
        backgroundColor: '#fff',
    },
    dropdownText: {
        color: '#111827',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
        alignItems: 'center',
    },
    submitButton: {
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    savedButton: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#6366f1',
        backgroundColor: 'transparent',
    },
    savedButtonText: {
        color: '#6366f1',
        fontSize: 16,
        fontWeight: '500',
    },
    inputError: {
        borderColor: '#ef4444',
        borderWidth: 1,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
        marginTop: 4,
        fontWeight: '500',
    },
})

export default PaymentDetailsComponent
<<<<<<< HEAD
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import React, { useState, useCallback, useEffect } from "react";
=======
import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"
import type React from "react"
import { useState, useCallback } from "react"
>>>>>>> afe560583af16468ca5aaaf1dc2e1c1d8e271caf
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert,
<<<<<<< HEAD
} from "react-native";
import { RadioButton } from "react-native-paper";
import RazorpayCheckout from "react-native-razorpay";
import { Key_Id } from "@env"; 

interface AddMoneyModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
=======
  Platform,
} from "react-native"
import { RadioButton } from "react-native-paper"
import RazorpayCheckout from "react-native-razorpay"
import { Key_Id } from "@env"

interface AddMoneyModalProps {
  visible: boolean
  onClose: () => void
  onSuccess: () => void

>>>>>>> afe560583af16468ca5aaaf1dc2e1c1d8e271caf
}

const AddMoneyModal: React.FC<AddMoneyModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
<<<<<<< HEAD
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) {
      setError(""); 
    }
  }, [visible]);

  const validateAmount = useCallback((value: string) => {
    const numAmount = Number(value);
    if (isNaN(numAmount) || numAmount < 10) {
      return "Minimum amount is ₹10";
    }
    if (numAmount > 100000) {
      return "Maximum amount is ₹100,000";
    }
    return "";
  }, []);

  const createPaymentIntent = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) throw new Error("Please login to continue");

      const response = await axios.post(
        "https://affiliate-api.affworld.io/api/wallet/create-payment-intent",
        { amount: amount, payment_method: paymentMethod },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.data || !response.data.order_id) {
        throw new Error("Invalid payment intent response");
      }
      if (response.status === 200) {        
        return response.data;
      }
      return null;
    } catch (error: any) {
      console.error("Payment Intent Error:", error.response?.data || error.message);
      setError("Failed to initialize payment. Please try again.");
      throw error;
    }
  };

  const verifyPayment = async (paymentResponse: any) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) throw new Error("Authentication failed");
=======
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("razorpay")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const validateAmount = useCallback((value: string) => {
    const numAmount = Number(value)
    if (isNaN(numAmount) || numAmount < 10) {
      return "Minimum amount is ₹10"
    }
    if (numAmount > 100000) {
      return "Maximum amount is ₹100,000"
    }
    return ""
  }, [])

  const createPaymentIntent = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken")
      if (!token) throw new Error("Please login to continue")

      const response = await axios.post(
        "https://affiliate-api.affworld.io/api/wallet/create-payment-intent",
        {
          amount: Number(amount),
          payment_method: paymentMethod,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response.data || !response.data.order_id) {
        throw new Error("Invalid payment intent response")
      }

      return response.data
    } catch (error: any) {
      console.error("Payment Intent Error:", error.response?.data || error.message)
      throw new Error(error.response?.data?.message || "Failed to initialize payment")
    }
  }

  const verifyPayment = async (paymentResponse: any) => {
    try {
      const token = await AsyncStorage.getItem("authToken")
      if (!token) throw new Error("Authentication failed")
>>>>>>> afe560583af16468ca5aaaf1dc2e1c1d8e271caf

      const response = await axios.post(
        "https://affiliate-api.affworld.io/api/wallet/verify-payment",
        {
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_signature: paymentResponse.razorpay_signature,
          order_id: paymentResponse.order_id,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
<<<<<<< HEAD
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("Verification Error:", error.response?.data || error.message);
      if (axios.isAxiosError(error) && error.response?.status === 504) {
        setError("Payment failed due to timeout. Please try again later.");
      }
      throw new Error("Payment verification failed. Please contact support if amount was deducted.");
    }
  };

  const handleSubmit = async () => {
    const validationError = validateAmount(amount);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const paymentIntent = await createPaymentIntent();      
      if (!paymentIntent) {
        setError("Failed to create payment intent. Please logout and try again.");
        setLoading(false);
        return;
      }

      console.log("Payment Intent:", paymentIntent);
      if(!Key_Id){
        setError("razorPay key not found")
        return;
      }
      const options = {
        key: Key_Id, 
        amount: paymentIntent.amount,
        currency: "INR",
        name: "Affworld",
        description: "Recharge",
        order_id: paymentIntent.order_id,
        prefill: {
          email: "affworldtechnologies@gmail.com",
          name: "Affworld",
        },
        theme: { color: "#F37254" },
      };
      RazorpayCheckout.open(options)
        .then(async (data) => {
=======
        },
      )

      return response.data
    } catch (error: any) {
      console.error("Verification Error:", error.response?.data || error.message)
      throw new Error("Payment verification failed. Please contact support if amount was deducted.")
    }
  }

  const handleSubmit = async () => {
    const validationError = validateAmount(amount)
    if (validationError) {
      setError(validationError)
      return
    }

    setError("")
    setLoading(true)

    try {
      const paymentIntent = await createPaymentIntent()
      console.log("Payment Intent", paymentIntent)

      const options = {
        description: "Wallet Recharge",
        image: "../../assets/images/Loginlogo.webp",
        currency: "INR",
        key: Key_Id,
        amount: Number(amount) * 100,
        name: "Affworld",
        order_id: paymentIntent.order_id,
        prefill: {
          email: 'affworldtechnologies@gmail.com',
          name: 'Affworld',
        },
        theme: { color: "#F37254" },
        send_sms_hash: true,
        remember_customer: true,
        retry: {
          enabled: true,
          max_count: 1,
        },
        modal: {
          escape: false,
          confirm_close: true,
        },
        external: {
          wallets: ["paytm"],
        },
        notes: {
          platform: Platform.OS,
        },
      }

      console.log("Razorpay Options:", options)

      RazorpayCheckout.open(options)
        .then(async (data: any) => {
          console.log("Payment Success:", data)
>>>>>>> afe560583af16468ca5aaaf1dc2e1c1d8e271caf
          try {
            const verificationResult = await verifyPayment({
              ...data,
              order_id: paymentIntent.order_id,
<<<<<<< HEAD
            });
            if (verificationResult.success) {
              Alert.alert("Success", "Payment successful!");
              onSuccess();
              onClose();
            } else {
              setError("Payment verification failed.");
            }
          } catch (verifyError:any) {
            setError(verifyError.message);
          }
        })
        .catch((error: any) => {
          console.error("Razorpay Payment Error:", error);
          let errorDesc = "Payment failed. Please try again.";
          if (error && error.code) {
            errorDesc = error.description || `Error Code: ${error.code}`;
            if (error.reason) {
              errorDesc += ` - ${error.reason}`;
            }
          }
          setError(errorDesc);
        })
        .finally(() => setLoading(false));
    } catch (error: any) {
      console.error("Setup Error:", error);
      setError(error.message || "Failed to initialize payment.");
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(""); 
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
=======
            })

            if (verificationResult.success) {
              Alert.alert("Success", "Payment successful!")
              onSuccess()
              onClose()
            } else {
              throw new Error("Payment verification failed")
            }
          } catch (error) {
            console.error("Verification Error:", error)
            setError("Payment verification failed. Please contact support.")
          }
        })
        .catch((error: any) => {
          console.error("Payment Error:", error)
          if (error.code === "PAYMENT_CANCELLED") {
            setError("Payment was cancelled. Please try again.")
          } else if (error.description?.includes("network")) {
            setError("Network error. Please check your internet connection.")
          } else {
            console.log("Payment", error)
            setError(error.message || "Payment failed. Please try again.")
          }
        })
        .finally(() => {
          setLoading(false)
        })
    } catch (error: any) {
      console.error("Payment Setup Error:", error)
      setError(error.message || "Failed to initialize payment. Please try again.")
      setLoading(false)
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
>>>>>>> afe560583af16468ca5aaaf1dc2e1c1d8e271caf
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Money to Wallet</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.paymentOptions}>
                <View style={styles.radioOption}>
                  <RadioButton
                    value="razorpay"
                    status={paymentMethod === "razorpay" ? "checked" : "unchecked"}
                    onPress={() => setPaymentMethod("razorpay")}
                    color="#00BFFF"
                  />
                  <Text style={styles.radioLabel}>Razorpay</Text>
                </View>
<<<<<<< HEAD
=======

                <View style={styles.radioOption}>
                  <RadioButton
                    value="upi"
                    status={paymentMethod === "upi" ? "checked" : "unchecked"}
                    onPress={() => setPaymentMethod("upi")}
                    color="#00BFFF"
                  />
                  <Text style={styles.radioLabel}>Direct UPI</Text>
                </View>
>>>>>>> afe560583af16468ca5aaaf1dc2e1c1d8e271caf
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Amount (₹)</Text>
                <TextInput
                  style={styles.input}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  placeholder="Enter amount"
                  editable={!loading}
                />
              </View>

              {error && <Text style={styles.errorText}>{error}</Text>}

              <TouchableOpacity
                style={[
                  styles.addButton,
                  {
                    backgroundColor: Number(amount) >= 10 && !loading ? "#00BFFF" : "#E5E5E5",
                  },
                ]}
                onPress={handleSubmit}
                disabled={Number(amount) < 10 || loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.addButtonText}>Add ₹{amount || "0"}</Text>
                )}
              </TouchableOpacity>

              <Text style={styles.minimumNote}>Minimum amount: ₹10</Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
<<<<<<< HEAD
  );
};
=======
  )
}
>>>>>>> afe560583af16468ca5aaaf1dc2e1c1d8e271caf

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  paymentOptions: {
    marginBottom: 20,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  radioLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  addButton: {
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  minimumNote: {
    fontSize: 12,
    color: "#666",
    textAlign: "left",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    fontSize: 14,
    textAlign: "center",
  },
<<<<<<< HEAD
});

export default AddMoneyModal;
=======
})

export default AddMoneyModal

>>>>>>> afe560583af16468ca5aaaf1dc2e1c1d8e271caf

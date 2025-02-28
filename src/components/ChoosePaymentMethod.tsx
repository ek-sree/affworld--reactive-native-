import { useState } from "react"
import { View, Text, Modal, TouchableOpacity, StyleSheet, Pressable, SafeAreaView } from "react-native"

type PaymentMethod = "UPI" | "Astropay" | "Bitcoin" | "Other"

interface ChoosePaymentMethodProps {
  visible: boolean
  onClose: () => void
}

const ChoosePaymentMethod = ({ visible, onClose }: ChoosePaymentMethodProps) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("UPI")

  const handleSave = () => {
    onClose()
  }

  const RadioButton = ({ selected }: { selected: boolean }) => (
    <View style={[styles.radioButton, selected && styles.radioButtonSelected]}>
      {selected && <View style={styles.radioButtonInner} />}
    </View>
  )

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <SafeAreaView style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Payment Method</Text>

            <Text style={styles.modalSubtitle}>Choose your payment method:</Text>

            <View style={styles.optionsContainer}>
              <Pressable style={styles.optionRow} onPress={() => setSelectedMethod("UPI")}>
                <RadioButton selected={selectedMethod === "UPI"} />
                <Text style={styles.optionText}>UPI</Text>
              </Pressable>

              <Pressable style={styles.optionRow} onPress={() => setSelectedMethod("Astropay")}>
                <RadioButton selected={selectedMethod === "Astropay"} />
                <Text style={styles.optionText}>Astropay</Text>
              </Pressable>

              <Pressable style={styles.optionRow} onPress={() => setSelectedMethod("Bitcoin")}>
                <RadioButton selected={selectedMethod === "Bitcoin"} />
                <Text style={styles.optionText}>Bitcoin</Text>
              </Pressable>

              <Pressable style={styles.optionRow} onPress={() => setSelectedMethod("Other")}>
                <RadioButton selected={selectedMethod === "Other"} />
                <Text style={styles.optionText}>Other</Text>
              </Pressable>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, styles.closeButton]} onPress={onClose}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    color: "#333",
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 15,
    color: "#555",
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#2196F3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  radioButtonSelected: {
    borderColor: "#2196F3",
  },
  radioButtonInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: "#2196F3",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginLeft: 10,
  },
  closeButton: {
    backgroundColor: "#2196F3",
  },
  closeButtonText: {
    color: "white",
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "500",
  },
})

export default ChoosePaymentMethod


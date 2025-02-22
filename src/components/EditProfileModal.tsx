import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, ScrollView } from "react-native";
import TagCollection from "./common/TagCollection";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { trafficSourcesEnum, verticalsEnum } from "../constant/verticsTrafficEnums";
import { API } from "../constant/api";
import { EditProfileModalProps } from "../interface/IEditModal";


const EditProfileModal: React.FC<EditProfileModalProps> = ({ isVisible, onClose, initialData, onSave }) => {
  const [formData, setFormData] = useState({
    ...initialData,
    verticals: initialData.verticals || [],
    traffic_sources: initialData.traffic_sources || [],
  });

  const [availableVerticals, setAvailableVerticals] = useState<string[]>([]);
  const [availableTrafficSources, setAvailableTrafficSources] = useState<string[]>([]);

  useEffect(() => {
    setAvailableVerticals(verticalsEnum.filter((v) => !formData.verticals.includes(v)));
    setAvailableTrafficSources(trafficSourcesEnum.filter((t) => !formData.traffic_sources.includes(t)));
  }, [formData.verticals, formData.traffic_sources]);

  useEffect(() => {
    setFormData({
      ...initialData,
      verticals: initialData.verticals || [],
      traffic_sources: initialData.traffic_sources || [],
    });
  }, [initialData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddVertical = (vertical: string) => {
    setFormData((prev) => ({
      ...prev,
      verticals: [...prev.verticals, vertical],
    }));
  };

  const handleRemoveVertical = (vertical: string) => {
    setFormData((prev) => ({
      ...prev,
      verticals: prev.verticals.filter((v) => v !== vertical),
    }));
  };

  const handleAddTrafficSource = (source: string) => {
    setFormData((prev) => ({
      ...prev,
      traffic_sources: [...prev.traffic_sources, source],
    }));
  };

  const handleRemoveTrafficSource = (source: string) => {
    setFormData((prev) => ({
      ...prev,
      traffic_sources: prev.traffic_sources.filter((t) => t !== source),
    }));
  };

  async function handleSave() {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const updatedData = {
        affiliate_id: formData.affiliate_id,
        verticals: formData.verticals,
        traffic_sources: formData.traffic_sources,
        traffic_source_country: formData.trafficSourceCountry,
        affiliate_country: formData.affiliate_country,
        company_name: formData.company_name,
        profile: formData.profile,
        experience: formData.experience,
        company_address: formData.company_address,
        contact_number:formData.contact_number,
        email_id:formData.email_id,
        website_address:formData.website_address,
        youtube_channel_link:formData.youtube_channel_link,
        pinterest_profile_link:formData.pinterest_profile_link,
        tiktok_profile_link:formData.tiktok_profile_link,
        twitter_handle:formData.twitter_handle,
        linkedin_profile_link:formData.linkedin_profile_link,
        telegram_channel_link:formData.telegram_channel_link,
        snapchat_handle:formData.snapchat_handle,
        reddit_profile_link:formData.reddit_profile_link,
        skype_id:formData.skype_id
      };

      const response = await axios.post(
        `${API}/api/affiliates/additional_info`,
        updatedData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        onSave(formData);
        onClose();
      }
    } catch (error: any) {
      console.log("Error occurred while updating info", error);
      if (error.response) {
        console.log("Error details:", error.response.data);
      }
    }
  }

  return (
    <Modal visible={isVisible} animationType="slide" transparent={false}>
      <ScrollView style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Edit Profile</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Profile</Text>
          <TextInput
            placeholder="Profile"
            style={styles.input}
            value={formData.profile}
            onChangeText={(text) => handleInputChange("profile", text)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Experience</Text>
          <TextInput
            placeholder="Experience"
            style={styles.input}
            value={formData.experience}
            onChangeText={(text) => handleInputChange("experience", text)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Company Name</Text>
          <TextInput
            placeholder="Company Name"
            style={styles.input}
            value={formData.company_name}
            onChangeText={(text) => handleInputChange("company_name", text)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Company Address</Text>
          <TextInput
            placeholder="Company Address"
            style={styles.input}
            value={formData.company_address}
            onChangeText={(text) => handleInputChange("company_address", text)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Traffic Source Country</Text>
          <TextInput
            placeholder="Traffic Source Country"
            style={styles.input}
            value={formData.trafficSourceCountry}
            onChangeText={(text) => handleInputChange("trafficSourceCountry", text)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Affiliate Country</Text>
          <TextInput
            placeholder="Affiliate Country"
            style={styles.input}
            value={formData.affiliate_country}
            onChangeText={(text) => handleInputChange("affiliate_country", text)}
          />
        </View>

        <TagCollection
          title="Verticals"
          tags={formData.verticals}
          availableTags={availableVerticals}
          onRemoveTag={handleRemoveVertical}
          onAddTag={handleAddVertical}
          editable={true}
        />

        <TagCollection
          title="Traffic Sources"
          tags={formData.traffic_sources}
          availableTags={availableTrafficSources}
          onRemoveTag={handleRemoveTrafficSource}
          onAddTag={handleAddTrafficSource}
          editable={true}
        />

        <View style={styles.container}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          <View style={styles.infoContainer}>
            <View style={styles.labelContainer}>
              <MaterialCommunityIcons name="phone" size={24} color="#666" />
              <Text style={styles.label}>Phone Number</Text>
            </View>
            <TextInput
            placeholder="Enter contact number"
            style={styles.value}
            value={formData.contact_number}
            onChangeText={(text) => handleInputChange("contact_number", text)}
          />          </View>

          <View style={styles.infoContainer}>
            <View style={styles.labelContainer}>
              <MaterialCommunityIcons name="email" size={24} color="#666" />
              <Text style={styles.label}>Email</Text>
            </View>
            <TextInput
            placeholder="Enter email Id"
            style={styles.value}
            value={formData.email_id}
            onChangeText={(text) => handleInputChange("email_id", text)}
          />         
           </View>
        </View>

        <View style={styles.container}>
          <Text style={styles.sectionTitle}>Social Links</Text>

          <View style={styles.infoContainer}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Website</Text>
            </View>
            <TextInput
            placeholder="Enter website"
            style={styles.value}
            value={formData.website_address}
            onChangeText={(text) => handleInputChange("website_address", text)}
          />
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>YouTube</Text>
            </View>
            <TextInput
            placeholder="Enter youtube"
            style={styles.value}
            value={formData.youtube_channel_link}
            onChangeText={(text) => handleInputChange("youtube_channel_link", text)}
          />        
            </View>

          <View style={styles.infoContainer}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Pinterest</Text>
            </View>
            <TextInput
            placeholder="Enter Pinterest"
            style={styles.value}
            value={formData.pinterest_profile_link}
            onChangeText={(text) => handleInputChange("pinterest_profile_link", text)}
          />
                    </View>

          <View style={styles.infoContainer}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>TikTok</Text>
            </View>
            <TextInput
            placeholder="Enter TickTok"
            style={styles.value}
            value={formData.tiktok_profile_link}
            onChangeText={(text) => handleInputChange("tiktok_profile_link", text)}
          />
                    </View>

          <View style={styles.infoContainer}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Twitter</Text>
            </View>
            <TextInput
            placeholder="Enter Twitter"
            style={styles.value}
            value={formData.twitter_handle}
            onChangeText={(text) => handleInputChange("twitter_handle", text)}
          />
                    </View>

          <View style={styles.infoContainer}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>LinkedIn</Text>
            </View>
            <TextInput
            placeholder="Enter LinkedIn"
            style={styles.value}
            value={formData.linkedin_profile_link}
            onChangeText={(text) => handleInputChange("linkedin_profile_link", text)}
          />
                    </View>

          <View style={styles.infoContainer}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Telegram</Text>
            </View>
            <TextInput
            placeholder="Enter Telegram"
            style={styles.value}
            value={formData.telegram_channel_link}
            onChangeText={(text) => handleInputChange("telegram_channel_link", text)}
          />
                    </View>

          <View style={styles.infoContainer}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Snapchat</Text>
            </View>

            <TextInput
            placeholder="Enter snapchat"
            style={styles.value}
            value={formData.snapchat_handle}
            onChangeText={(text) => handleInputChange("snapchat_handle", text)}
          />
                    </View>

          <View style={styles.infoContainer}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Reddit</Text>
            </View>
            <TextInput
            placeholder="Enter Reddit"
            style={styles.value}
            value={formData.reddit_profile_link}
            onChangeText={(text) => handleInputChange("reddit_profile_link", text)}
          />
                    </View>
        </View>

        <View style={styles.modalButtonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
    textAlign: "center",
  },
  infoContainer: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    color: "#333",
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginLeft: 32,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 40,
  },
  saveButton: {
    backgroundColor: "#2563EB",
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#ccc",
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#000",
    fontWeight: "bold",
  },
  container: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
});

export default EditProfileModal;
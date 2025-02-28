import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  StatusBar,
  SafeAreaView
} from "react-native";
import TagCollection from "./common/TagCollection";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons, Feather, Ionicons } from "@expo/vector-icons";
import { trafficSourcesEnum, verticalsEnum } from "../constant/verticsTrafficEnums";
import { API } from "../constant/api";
import { EditProfileModalProps } from "../interface/IEditModal";
import { LinearGradient } from 'expo-linear-gradient';

const socialIcons: Record<string, { icon: string; color: string }> = {
  website_address: { icon: "globe", color: "#4285F4" },
  youtube_channel_link: { icon: "youtube", color: "#FF0000" },
  pinterest_profile_link: { icon: "pinterest", color: "#E60023" },
  tiktok_profile_link: { icon: "music", color: "#000000" },
  twitter_handle: { icon: "twitter", color: "#1DA1F2" },
  linkedin_profile_link: { icon: "linkedin", color: "#0077B5" },
  telegram_channel_link: { icon: "send", color: "#0088CC" },
  snapchat_handle: { icon: "snapchat", color: "#FFFC00" },
  reddit_profile_link: { icon: "reddit", color: "#FF4500" },
  skype_id: { icon: "skype", color: "#00AFF0" },
};

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isVisible, onClose, initialData, onSave }) => {
  const [formData, setFormData] = useState({
    ...initialData,
    verticals: initialData.verticals || [],
    traffic_sources: initialData.traffic_sources || [],
  });
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("profile");

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
      setLoading(true);
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
        contact_number: formData.contact_number,
        email_id: formData.email_id,
        website_address: formData.website_address,
        youtube_channel_link: formData.youtube_channel_link,
        pinterest_profile_link: formData.pinterest_profile_link,
        tiktok_profile_link: formData.tiktok_profile_link,
        twitter_handle: formData.twitter_handle,
        linkedin_profile_link: formData.linkedin_profile_link,
        telegram_channel_link: formData.telegram_channel_link,
        snapchat_handle: formData.snapchat_handle,
        reddit_profile_link: formData.reddit_profile_link,
        skype_id: formData.skype_id
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
    } finally {
      setLoading(false);
    }
  }

  const renderSectionButton = (section: string, label: string, icon: string) => (
    <TouchableOpacity
      style={[styles.sectionButton, activeSection === section && styles.activeSectionButton]}
      onPress={() => setActiveSection(section)}
    >
      <MaterialCommunityIcons 
        name={icon as any} 
        size={20} 
        color={activeSection === section ? "#ffffff" : "#666666"} 
      />
      <Text style={[styles.sectionButtonText, activeSection === section && styles.activeSectionButtonText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const FormInput = ({ label, icon, field, placeholder }: { label: string; icon?: string; field: string; placeholder: string }) => (
    <View style={styles.formGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        {icon && <MaterialCommunityIcons name={icon as any} size={20} color="#2563EB" style={styles.inputIcon} />}
        <TextInput
          placeholder={placeholder}
          style={[styles.formInput, icon && styles.inputWithIcon]}
          value={formData[field as keyof typeof formData] as string}
          onChangeText={(text) => handleInputChange(field, text)}
          placeholderTextColor="#A0AEC0"
        />
      </View>
    </View>
  );

  const renderSocialInput = (field: string, label: string) => {
    const iconInfo = socialIcons[field] || { icon: "link", color: "#666666" };
    
    return (
      <View style={styles.socialInputContainer}>
        <Feather name={iconInfo.icon as any} size={20} color={iconInfo.color} style={styles.socialIcon} />
        <View style={styles.socialInputWrapper}>
          <Text style={styles.socialLabel}>{label}</Text>
          <TextInput
            placeholder={`Enter ${label}`}
            style={styles.socialInput}
            value={formData[field as keyof typeof formData] as string}
            onChangeText={(text) => handleInputChange(field, text)}
            placeholderTextColor="#A0AEC0"
          />
        </View>
      </View>
    );
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#2D3748" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <TouchableOpacity 
              style={[styles.saveHeaderButton, loading && styles.disabledButton]} 
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveHeaderButtonText}>
                {loading ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sectionTabs}>
            {renderSectionButton("profile", "Profile", "account-outline")}
            {renderSectionButton("business", "Business", "office-building-outline")}
            {renderSectionButton("verticals", "Interests", "tag-outline")}
            {renderSectionButton("contact", "Contact", "phone-outline")}
            {renderSectionButton("social", "Social", "earth")}
          </View>

          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollViewContent}
          >
            {activeSection === "profile" && (
              <View style={styles.section}>
                <LinearGradient
                  colors={['#EBF4FF', '#E6FFFA']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.sectionHeader}
                >
                  <MaterialCommunityIcons name="account-outline" size={24} color="#2563EB" />
                  <Text style={styles.sectionTitle}>Personal Information</Text>
                </LinearGradient>
                
                <FormInput 
                  label="Profile" 
                  icon="account-circle-outline"
                  field="profile" 
                  placeholder="Enter your profile description"
                />
                
                <FormInput 
                  label="Experience" 
                  icon="briefcase-outline" 
                  field="experience" 
                  placeholder="Enter your experience"
                />
                
                <FormInput 
                  label="Affiliate Country" 
                  icon="flag-outline" 
                  field="affiliate_country" 
                  placeholder="Enter your country"
                />
              </View>
            )}

            {activeSection === "business" && (
              <View style={styles.section}>
                <LinearGradient
                  colors={['#EBF4FF', '#E6FFFA']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.sectionHeader}
                >
                  <MaterialCommunityIcons name="office-building-outline" size={24} color="#2563EB" />
                  <Text style={styles.sectionTitle}>Business Information</Text>
                </LinearGradient>
                
                <FormInput 
                  label="Company Name" 
                  icon="domain"
                  field="company_name" 
                  placeholder="Enter your company name"
                />
                
                <FormInput 
                  label="Company Address" 
                  icon="map-marker-outline" 
                  field="company_address" 
                  placeholder="Enter your company address"
                />

                <FormInput 
                  label="Traffic Source Country" 
                  icon="map-outline" 
                  field="trafficSourceCountry" 
                  placeholder="Enter traffic source country"
                />
              </View>
            )}

            {activeSection === "verticals" && (
              <View style={styles.section}>
                <LinearGradient
                  colors={['#EBF4FF', '#E6FFFA']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.sectionHeader}
                >
                  <MaterialCommunityIcons name="tag-multiple-outline" size={24} color="#2563EB" />
                  <Text style={styles.sectionTitle}>Interests & Traffic</Text>
                </LinearGradient>
                
                <View style={styles.tagCollectionWrapper}>
                  <TagCollection
                    title="Verticals"
                    tags={formData.verticals}
                    availableTags={availableVerticals}
                    onRemoveTag={handleRemoveVertical}
                    onAddTag={handleAddVertical}
                    editable={true}
                  />
                </View>
                
                <View style={styles.tagCollectionWrapper}>
                  <TagCollection
                    title="Traffic Sources"
                    tags={formData.traffic_sources}
                    availableTags={availableTrafficSources}
                    onRemoveTag={handleRemoveTrafficSource}
                    onAddTag={handleAddTrafficSource}
                    editable={true}
                  />
                </View>
              </View>
            )}

            {activeSection === "contact" && (
              <View style={styles.section}>
                <LinearGradient
                  colors={['#EBF4FF', '#E6FFFA']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.sectionHeader}
                >
                  <MaterialCommunityIcons name="card-account-phone-outline" size={24} color="#2563EB" />
                  <Text style={styles.sectionTitle}>Contact Information</Text>
                </LinearGradient>
                
                <FormInput 
                  label="Phone Number" 
                  icon="phone-outline"
                  field="contact_number" 
                  placeholder="Enter your contact number"
                />
                
                <FormInput 
                  label="Email" 
                  icon="email-outline" 
                  field="email_id" 
                  placeholder="Enter your email address"
                />
                
                <FormInput 
                  label="Skype ID" 
                  icon="skype" 
                  field="skype_id" 
                  placeholder="Enter your Skype ID"
                />
              </View>
            )}

            {activeSection === "social" && (
              <View style={styles.section}>
                <LinearGradient
                  colors={['#EBF4FF', '#E6FFFA']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.sectionHeader}
                >
                  <MaterialCommunityIcons name="web" size={24} color="#2563EB" />
                  <Text style={styles.sectionTitle}>Social Media Links</Text>
                </LinearGradient>
                
                <View style={styles.socialContainer}>
                  {renderSocialInput("website_address", "Website")}
                  {renderSocialInput("youtube_channel_link", "YouTube")}
                  {renderSocialInput("linkedin_profile_link", "LinkedIn")}
                  {renderSocialInput("twitter_handle", "Twitter")}
                  {renderSocialInput("telegram_channel_link", "Telegram")}
                  {renderSocialInput("pinterest_profile_link", "Pinterest")}
                  {renderSocialInput("tiktok_profile_link", "TikTok")}
                  {renderSocialInput("snapchat_handle", "Snapchat")}
                  {renderSocialInput("reddit_profile_link", "Reddit")}
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.bottomButtons}>
            <TouchableOpacity 
              style={[styles.cancelButton]} 
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.saveButton, loading && styles.disabledButton]} 
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <Text style={styles.saveButtonText}>Saving...</Text>
              ) : (
                <>
                  <MaterialCommunityIcons name="content-save-outline" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7FAFC",
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2D3748",
  },
  closeButton: {
    padding: 8,
  },
  saveHeaderButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#EBF4FF",
  },
  saveHeaderButtonText: {
    color: "#2563EB",
    fontWeight: "600",
    fontSize: 14,
  },
  sectionTabs: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 10,
  },
  sectionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginHorizontal: 2,
    backgroundColor: "#F7FAFC",
  },
  activeSectionButton: {
    backgroundColor: "#2563EB",
  },
  sectionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4A5568",
    marginLeft: 4,
  },
  activeSectionButtonText: {
    color: "#fff",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#F7FAFC",
  },
  scrollViewContent: {
    paddingBottom: 80,
  },
  section: {
    marginVertical: 12,
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2D3748",
    marginLeft: 8,
  },
  formGroup: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF2F7",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A5568",
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    left: 12,
    zIndex: 1,
  },
  formInput: {
    flex: 1,
    backgroundColor: "#F7FAFC",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#2D3748",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  inputWithIcon: {
    paddingLeft: 40,
  },
  tagCollectionWrapper: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF2F7",
  },
  socialContainer: {
    padding: 8,
  },
  socialInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF2F7",
  },
  socialIcon: {
    width: 36,
    textAlign: "center",
  },
  socialInputWrapper: {
    flex: 1,
    marginLeft: 8,
  },
  socialLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4A5568",
    marginBottom: 4,
  },
  socialInput: {
    backgroundColor: "#F7FAFC",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: "#2D3748",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  bottomButtons: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    backgroundColor: "#fff",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginRight: 8,
    backgroundColor: "#fff",
  },
  cancelButtonText: {
    color: "#4A5568",
    fontWeight: "600",
    fontSize: 15,
  },
  saveButton: {
    flex: 2,
    flexDirection: "row",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#2563EB",
    marginLeft: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default EditProfileModal;
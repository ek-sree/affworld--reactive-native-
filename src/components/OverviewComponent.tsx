import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Clipboard from 'expo-clipboard';
import EditProfileModal from './EditProfileModal';
import TagCollection from "./common/TagCollection";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API } from "../constant/api";

interface OverViewProps {
  overViewData: {
    name: string;
    bio: string;
    email: string;
    affiliate_id: string;
  };
  isModalVisible: boolean;
  onCloseModal: () => void;
  onOpenModal: () => void;
}

const OverviewComponent: React.FC<OverViewProps> = ({ overViewData, isModalVisible, onCloseModal, onOpenModal }) => {
  const [icon, setIcon] = useState<"content-copy" | "check-circle">("content-copy");
  const [isCopied, setIsCopied] = useState(false);
  const [formData, setFormData] = useState({
    affiliate_id:overViewData.affiliate_id,
    name: overViewData.name,
    bio: overViewData.bio,
    profile: "",
    experience: "",
    company_name: "",
    company_address: "",
    trafficSourceCountry: "",
    affiliate_country: "",
    contact_number:"",
    email_id:"",
    website_address:"",
    youtube_channel_link:"",
    pinterest_profile_link:"",
    tiktok_profile_link:"",
    twitter_handle:"",
    linkedin_profile_link:"",
    telegram_channel_link:"",
    snapchat_handle:"",
    reddit_profile_link:"",
    skype_id:"",
    verticals:  [],
    traffic_sources: [],
  });

useEffect(() => {
  setFormData(prevData => ({
    ...prevData,
    affiliate_id: overViewData.affiliate_id,
    name: overViewData.name,
    bio: overViewData.bio
  }));
}, [overViewData]);
  async function getAdditionalInfo() {    
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response  = await axios.get(`${API}/api/affiliates/additional_info`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )      
      if(response.status==200){
      setFormData(prevData => ({
        ...prevData,
        ...response.data
      }));
      }
    } catch (error) {
      console.log("Error occured additional",error);
      
    }
  }

  useEffect(()=>{
    getAdditionalInfo()
  },[])

  const handleCopy = async () => {
    await Clipboard.setStringAsync(overViewData.affiliate_id);
    setIcon("check-circle");
    setIsCopied(true);
    setTimeout(() => {
      setIcon("content-copy");
      setIsCopied(false);
    }, 1000);
  };

  const handleSaveProfile = (updatedData: any) => {
    setFormData(updatedData);
    onCloseModal();
  };

  return (
    <View>
      <View style={styles.affiliateIDArea}>
        <Text>Affiliate ID:</Text>
        <View style={styles.affiliateIDRow}>
          <Text style={styles.affiliateIDText}>{overViewData.affiliate_id}</Text>
          <TouchableOpacity onPress={handleCopy}>
            <MaterialCommunityIcons name={icon} size={20} color="#2563EB" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Name</Text>
        <TouchableOpacity onPress={onOpenModal}>
          <TextInput placeholder="Name" style={styles.input} value={overViewData.name} editable={false} onPress={onOpenModal}/>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Profile</Text>
        <TouchableOpacity onPress={onOpenModal}>
          <TextInput placeholder="Profile" style={styles.input} value={formData.profile || ""} editable={false} onPress={onOpenModal} />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Experience</Text>
        <TouchableOpacity onPress={onOpenModal}>
          <TextInput placeholder="Experience" style={styles.input} value={formData.experience || ""} editable={false} onPress={onOpenModal} />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Company Name</Text>
        <TouchableOpacity onPress={onOpenModal}>
          <TextInput placeholder="Company Name" style={styles.input} value={formData.company_name || ""} editable={false} onPress={onOpenModal} />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Company Address</Text>
        <TouchableOpacity onPress={onOpenModal}>
          <TextInput placeholder="Company Address" style={styles.input} value={formData.company_address || ""} editable={false} onPress={onOpenModal} />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Traffic Source Country</Text>
        <TouchableOpacity onPress={onOpenModal}>
          <TextInput placeholder="Traffic Source Country" style={styles.input} value={formData.trafficSourceCountry} editable={false} onPress={onOpenModal} />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Affiliate Country</Text>
        <TouchableOpacity onPress={onOpenModal}>
          <TextInput placeholder="Affiliate Country" style={styles.input} value={formData.affiliate_country || ""} editable={false} onPress={onOpenModal} />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
  <Text style={styles.label}>Bio</Text>
  <TouchableOpacity onPress={onOpenModal}>
    <TextInput
      placeholder="Bio"
      style={styles.textArea}
      value={formData.bio}
      editable={false}
      onPress={onOpenModal}
      multiline={true} 
      textAlignVertical="top"
    />
  </TouchableOpacity>
</View>


<TouchableOpacity onPress={onOpenModal}>
      <TagCollection title="Verticals" tags={formData.verticals || []} editable={false} />
</TouchableOpacity>
<TouchableOpacity onPress={onOpenModal}>
      <TagCollection title="Traffic Sources" tags={formData.traffic_sources || []} editable={false} />
</TouchableOpacity>

<TouchableOpacity>
  <View>
 <View style={styles.container}>
      <Text style={styles.sectionTitle}>Contact Information</Text>
      
      <View style={styles.infoContainer}>
        <View style={styles.labelContainer}>
          <MaterialCommunityIcons name="phone" size={24} color="#666" />
          <Text style={styles.label}>Phone Number</Text>
        </View>
        <Text style={styles.value}>{formData.contact_number}</Text>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.labelContainer}>
          <MaterialCommunityIcons name="email" size={24} color="#666" />
          <Text style={styles.label}>Email</Text>
        </View>
        <Text style={styles.value}>{formData.email_id}</Text>
      </View>
    </View>
  </View>
</TouchableOpacity>


<TouchableOpacity>
  <View>
 <View style={styles.container}>
      <Text style={styles.sectionTitle}>Socials Links</Text>
      
      <View style={styles.infoContainer}>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>Website</Text>
        </View>
        <Text style={styles.value}>{formData.website_address}</Text>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>Youtube</Text>
        </View>
        <Text style={styles.value}>{formData.youtube_channel_link}</Text>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>Pinterest</Text>
        </View>
        <Text style={styles.value}>{formData.pinterest_profile_link}</Text>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>TickTok</Text>
        </View>
        <Text style={styles.value}>{formData.tiktok_profile_link}</Text>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>Twitter</Text>
        </View>
        <Text style={styles.value}>{formData.twitter_handle}</Text>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>Linkedin</Text>
        </View>
        <Text style={styles.value}>{formData.linkedin_profile_link}</Text>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>Telegram</Text>
        </View>
        <Text style={styles.value}>{formData.telegram_channel_link}</Text>
      </View>


      <View style={styles.infoContainer}>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>SnapChat</Text>
        </View>
        <Text style={styles.value}>{formData.snapchat_handle}</Text>
      </View>


      <View style={styles.infoContainer}>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>Reddit</Text>
        </View>
        <Text style={styles.value}>{formData.reddit_profile_link}</Text>
      </View>
    </View>
  </View>
</TouchableOpacity>

      <EditProfileModal isVisible={isModalVisible} onClose={onCloseModal} initialData={formData} onSave={handleSaveProfile} />
    </View>
  );
};

const styles = StyleSheet.create({
  affiliateIDArea: {
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  affiliateIDRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  affiliateIDText: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  inputContainer: {
    marginTop: 20,
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
  textArea: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    minHeight: 100,
    textAlignVertical: "top",
  },
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign:"center"
  },
  socialTitle: {
    marginTop: 24,
  },
  infoContainer: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginLeft: 32,
  },
});

export default OverviewComponent;

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import OverviewComponent from '../components/OverviewComponent';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProfileImageModal from '../components/common/ProfileImageModal';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/types';
import { API } from '../constant/api';

const ProfileScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [overviewData, setOverViewData] = useState({ name: "", affiliate_id: "", bio: "", email: "" });
  const [profileData, setProfileData] = useState<{created_at:number, level:string}>({created_at:0,level:""})
  const [isModalVisible, setIsModalVisible] = useState(false); 
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>();

const navigation = useNavigation<NavigationProp<RootStackParamList>>();

const handleWalletPress = () => {
  navigation.navigate('Wallet');
};


  const tabs = ['Overview', 'Managers', 'Campaigns', 'PostBack', 'Payouts', 'Company'];

  const renderTabContent = () => {
    switch (activeTab) {
      case "Overview":
        return <OverviewComponent overViewData={overviewData} isModalVisible={isModalVisible} onCloseModal={() => setIsModalVisible(false)} onOpenModal={handleEditProfile}/>;
      case "Managers":
        return <Text style={styles.placeholderText}>Managers Section</Text>;
      case "Campaigns":
        return <Text style={styles.placeholderText}>Campaigns Section</Text>;
      case "PostBack":
        return <Text style={styles.placeholderText}>PostBack Section</Text>;
      case "Payouts":
        return <Text style={styles.placeholderText}>Payouts Section</Text>;
      case "Company":
        return <Text style={styles.placeholderText}>Company Section</Text>;
      default:
        return <Text style={styles.placeholderText}>Select a Tab</Text>;
    }
  };

  async function getaffiliates() {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.get(
        `${API}/api/affiliates/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.status == 200) {
        const { affiliate_id, name, email, bio } = response.data;
        setOverViewData({
          affiliate_id,
          name,
          email,
          bio
        });
        const year = new Date(response.data.created_at).getFullYear();
        setProfileData({
          created_at:year,
          level:response.data.level
        })
      }
    } catch (error: any) {
      console.log("Error occurred while fetching affiliated data:", error.response?.data || error);
    }
  }

  useEffect(() => {
    getaffiliates();
  }, []);

  const handleEditProfile = () => {    
    setIsModalVisible(true); 
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.topRightCircle} />
        <View style={styles.bottomLeftCircle} />

        <TouchableOpacity 
  style={styles.profileCircleContainer} 
  onPress={() => setIsImageModalVisible(true)}
>
  <View style={styles.profileCircle}>
    {profileImageUrl ? (
      <Image 
        source={{ uri: profileImageUrl }} 
        style={styles.profileImage}
      />
    ) : (
      <MaterialCommunityIcons name="account" size={40} color="#666" />
    )}
  </View>
</TouchableOpacity>

        <Text style={styles.companyName}>Affworld Technologies</Text>
        <Text style={styles.subTitle}>Affworld</Text>

        <View style={styles.tagsContainer}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Affworld Active</Text>
          </View>
          <View style={styles.subTag}>
            <Text style={styles.tagText}>{profileData.level} Level</Text>
          </View>
        </View>

        <Text style={styles.memberSince}>Member since {profileData.created_at}</Text>

        <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleWalletPress}>
              <MaterialCommunityIcons name="wallet" size={20} color="#fff" />
            <Text style={styles.buttonText}>Wallet</Text>
              </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleEditProfile}>
            <MaterialCommunityIcons name="pencil" size={20} color="#fff" />
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Share Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statsItem}>
            <Text style={styles.statsValue}>₹0</Text>
            <Text style={styles.statsLabel}>Earnings (INR)</Text>
          </View>
          <View style={styles.statsItem}>
            <Text style={styles.statsValue}>1</Text>
            <Text style={styles.statsLabel}>Offers</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statsItem}>
            <Text style={styles.statsValue}>0</Text>
            <Text style={styles.statsLabel}>Clicks</Text>
          </View>
          <View style={styles.statsItem}>
            <Text style={styles.statsValue}>{profileData.level}</Text>
            <Text style={styles.statsLabel}>Level</Text>
          </View>
        </View>

        <View style={styles.tabContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{ paddingBottom: 5 }}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  activeTab === tab && styles.activeTab
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText
                ]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {renderTabContent()}
        <ProfileImageModal
  isVisible={isImageModalVisible}
  onClose={() => setIsImageModalVisible(false)}
  currentImageUrl={profileImageUrl}
  onImageUpdate={(newImageUrl) => setProfileImageUrl(newImageUrl)}
/>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    backgroundColor: '#f5f5f5',
  },
  profileCard: {
    backgroundColor: '#2563EB',
    padding: 30,
    marginLeft: 8,
    marginBottom: 40,
    paddingBottom: 40,
    alignItems: 'flex-start',
    borderRadius: 20,
    margin: 15,
    marginTop: 50,
    overflow: 'hidden',
    position: 'relative',
  },
  topRightCircle: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  bottomLeftCircle: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  profileCircleContainer: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  profileCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    marginTop: 10,
  },
  subTitle: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.7,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    marginTop: 5,
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  subTag: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  memberSince: {
    color: '#fff',
    opacity: 0.7,
    fontWeight: 'semibold',
    marginBottom: 40,
    fontSize: 15,
    marginLeft: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap:"wrap",
    gap: 16,
    marginTop: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 16,
  },
  statsContainer: {
    padding: 16,
    gap: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statsItem: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsLabel: {
    color: '#666',
    fontSize: 14,
  },
  tabContainer: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#2563EB',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  placeholderText: {
    fontSize: 18,
    textAlign: "center",
    padding: 20,
    color: "#666",
  },
});

export default ProfileScreen;
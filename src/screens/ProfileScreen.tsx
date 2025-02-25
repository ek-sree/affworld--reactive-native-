import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, StatusBar, Dimensions } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import OverviewComponent from '../components/OverviewComponent';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProfileImageModal from '../components/common/ProfileImageModal';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/types';
import { API } from '../constant/api';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const ProfileScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [overviewData, setOverViewData] = useState({ name: "", affiliate_id: "", bio: "", email: "" });
  const [profileData, setProfileData] = useState<{created_at: number, level: string}>({created_at: 0, level: ""});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>();
  const [isRefreshing, setIsRefreshing] = useState(false);

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
        return <EmptyStateCard title="Managers" message="Your managers will appear here" />;
      case "Campaigns":
        return <EmptyStateCard title="Campaigns" message="Your campaign analytics will appear here" />;
      case "PostBack":
        return <EmptyStateCard title="PostBack" message="Your postback settings will appear here" />;
      case "Payouts":
        return <EmptyStateCard title="Payouts" message="Your payout history will appear here" />;
      case "Company":
        return <EmptyStateCard title="Company" message="Your company details will appear here" />;
      default:
        return <EmptyStateCard title="Select a Tab" message="Choose a section to view details" />;
    }
  };

  const EmptyStateCard = ({ title, message }: { title: string; message: string }) => (
    <View style={styles.emptyStateContainer}>
      <MaterialCommunityIcons name="information-outline" size={48} color="#BDC3C7" />
      <Text style={styles.emptyStateTitle}>{title}</Text>
      <Text style={styles.emptyStateMessage}>{message}</Text>
    </View>
  );

  async function getaffiliates() {
    setIsRefreshing(true);
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
          bio,
        });
        setProfileImageUrl(response.data.profile_pic);
        const year = new Date(response.data.created_at).getFullYear();
        setProfileData({
          created_at: year,
          level: response.data.level
        });
      }
    } catch (error: any) {
      console.log("Error occurred while fetching affiliated data:", error.response?.data || error);
    } finally {
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    getaffiliates();
    StatusBar.setBarStyle('light-content');
    return () => {
      StatusBar.setBarStyle('dark-content');
    };
  }, []);

  const handleEditProfile = () => {    
    setIsModalVisible(true); 
  };

  const StatCard = ({ value, label, icon }: { value: string | number, label: string, icon: string }) => (
    <View style={styles.statsItem}>
      <View style={styles.statsIconContainer}>
        <MaterialCommunityIcons name={icon as any} size={24} color="#2563EB" />
      </View>
      <View style={styles.statsTextContainer}>
        <Text style={styles.statsValue}>{value}</Text>
        <Text style={styles.statsLabel}>{label}</Text>
      </View>
    </View>
  );

  return (
    <>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#1E40AF', '#3B82F6', '#60A5FA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileHeader}
        >
          <View style={styles.headerContentContainer}>
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
                <View style={styles.editOverlay}>
                  <Feather name="edit-2" size={18} color="#fff" />
                </View>
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
              <TouchableOpacity style={styles.primaryButton} onPress={handleWalletPress}>
                <MaterialCommunityIcons name="wallet-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Wallet</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={handleEditProfile}>
                <MaterialCommunityIcons name="pencil-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton}>
                <MaterialCommunityIcons name="share-variant-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Share Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            <StatCard value="₹0" label="Earnings (INR)" icon="currency-inr" />
            <StatCard value="1" label="Offers" icon="gift-outline" />
            <StatCard value="0" label="Clicks" icon="cursor-default-click-outline" />
            <StatCard value={profileData.level} label="Level" icon="star-outline" />
          </View>
        </View>

        <View style={styles.tabSection}>
          <View style={styles.tabContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.tabScrollContainer}
            >
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

          <View style={styles.tabContentContainer}>
            {renderTabContent()}
          </View>
        </View>
        
        <ProfileImageModal
          isVisible={isImageModalVisible}
          onClose={() => setIsImageModalVisible(false)}
          currentImageUrl={profileImageUrl}
          onImageUpdate={(newImageUrl) => setProfileImageUrl(newImageUrl)}
        />
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  profileHeader: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContentContainer: {
    alignItems: 'center',
  },
  profileCircleContainer: {
    marginBottom: 16,
    alignSelf: 'center',
  },
  profileCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    position: 'relative',
  },
  editOverlay: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#3B82F6',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 55,
  },
  companyName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subTitle: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    marginVertical: 12,
    justifyContent: 'center',
    gap: 12,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  subTag: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  memberSince: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 24,
    opacity: 0.85,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
    minWidth: 120,
    justifyContent: 'center',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
    minWidth: 120,
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 15,
  },
  statsSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statsItem: {
    width: (width - 44) / 2,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    gap: 14,
  },
  statsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsTextContainer: {
    flex: 1,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  statsLabel: {
    color: '#64748B',
    fontSize: 14,
  },
  tabSection: {
    marginTop: 8,
    paddingBottom: 40,
  },
  tabContainer: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  tabScrollContainer: {
    paddingHorizontal: 12,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#2563EB',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#64748B',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tabContentContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  emptyStateContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginVertical: 10,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 12,
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
});

export default ProfileScreen;
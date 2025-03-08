<<<<<<< HEAD
import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Animated,
  Easing
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types/types';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API } from '../constant/api';
=======
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ParamListBase } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
>>>>>>> afe560583af16468ca5aaaf1dc2e1c1d8e271caf

type HomeScreenNavigationProp = StackNavigationProp<ParamListBase>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

interface Campaign {
<<<<<<< HEAD
  name: string;
  progress: number;
=======
  name: string
  progress: number
>>>>>>> afe560583af16468ca5aaaf1dc2e1c1d8e271caf
}

const campaigns: Campaign[] = [
  { name: "Campaign A", progress: 85 },
  { name: "Campaign B", progress: 62 },
  { name: "Campaign C", progress: 38 },
<<<<<<< HEAD
];

const HomeScreen: React.FC<HomeScreenProps> = () => {
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const balanceAnim = useRef(new Animated.Value(0)).current;
  const progressAnims = useRef(campaigns.map(() => new Animated.Value(0))).current;
  
  const handleWalletPress = () => {
    navigation.navigate('Wallet');
  };

  const handleNavigate = (screen: keyof RootStackParamList) => {
    navigation.navigate(screen);
  };

  async function fetchWalletBalance() {
    const token = await AsyncStorage.getItem("authToken");
    if (!token) {
      console.error("No token found! Ensure user is logged in.");
      return;
    }
    try {
      const response = await axios.get(`${API}/api/wallet/total-remaining-balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status == 200) {
        setTotalBalance(parseFloat(response.data.total_remaining_balance.toFixed(2)));
        animateBalance();
      }
    } catch (error) {
      console.error("Error occurred while fetching wallet balance", error);
    }
  }
  
  const animateBalance = () => {
    Animated.timing(balanceAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: false,
      easing: Easing.out(Easing.ease)
    }).start();
  };
  
  const animateProgressBars = () => {
    progressAnims.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: campaigns[index].progress / 100,
        duration: 1000,
        delay: index * 300,
        useNativeDriver: false,
        easing: Easing.out(Easing.ease)
      }).start();
    });
  };
  
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchWalletBalance(); 
    });
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true
      })
    ]).start(() => {
      animateProgressBars();
    });
    return unsubscribe;
  }, [navigation]);
  
  const renderCampaign = (campaign: Campaign, index: number) => {
    const progressWidth = progressAnims[index].interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%']
    });
    
    const animatedWidth = {
      width: Animated.multiply(
        progressAnims[index],
        Animated.multiply(
          campaign.progress,
          new Animated.Value(1)
        )
      ).interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%']
      })
    };
    
    return (
      <View key={campaign.name} style={styles.campaignItem}>
        <View style={styles.campaignHeader}>
          <Text style={styles.campaignName}>{campaign.name}</Text>
          <Text style={styles.campaignProgress}>{campaign.progress}%</Text>
        </View>
        <View style={styles.progressBarBackground}>
          <Animated.View style={{ width: progressWidth }}>
            <LinearGradient
              colors={['#6366F1', '#4F46E5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.progressBarFill}
            />
          </Animated.View>
        </View>
      </View>
    );
  };
  
  const displayedBalance = balanceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, totalBalance]
  });

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#4F46E5', '#6366F1']}
        style={styles.header}
      >
        <Animated.View 
          style={[
            styles.balanceCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Animated.Text style={styles.balanceAmount}>
            {displayedBalance}
          </Animated.Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleWalletPress}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="plus" size={20} color="white" />
              <Text style={styles.buttonText}>Add Money</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="bank-transfer" size={20} color="white" />
              <Text style={styles.buttonText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View 
          style={[
            styles.statsContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <MaterialCommunityIcons name="trending-up" size={24} color="#4F46E5" />
=======
]

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { logout, userEmail } = useAuth();

  const handleNavigateProfile = () => {
    navigation.navigate('Profile');
  };
  

  const renderCampaign = (campaign: Campaign) => (
    <View key={campaign.name} style={styles.campaignItem}>
      <View style={styles.campaignHeader}>
        <Text style={styles.campaignName}>{campaign.name}</Text>
        <Text style={styles.campaignProgress}>{campaign.progress}%</Text>
      </View>
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${campaign.progress}%` }]} />
      </View>
    </View>
  )

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.leftSection}>
            <View style={styles.avatarContainer}>
              <MaterialCommunityIcons name="account" size={24} color="#666" onPress={handleNavigateProfile}/>
            </View>
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>Welcome back</Text>
              <Text style={styles.nameText}>{userEmail}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationContainer}>
            <MaterialCommunityIcons name="bell" size={24} color="#000" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>₹3,653.36</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.buttonText}>Add Money</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.buttonText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <MaterialCommunityIcons name="trending-up" size={20} color="#4A90E2" />
>>>>>>> afe560583af16468ca5aaaf1dc2e1c1d8e271caf
              <Text style={styles.statsTitle}>Today's Clicks</Text>
            </View>
            <View style={styles.statsContent}>
              <Text style={styles.statsValue}>856</Text>
              <Text style={styles.statsChange}>+12.5%</Text>
            </View>
          </View>

          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
<<<<<<< HEAD
              <MaterialCommunityIcons name="chart-line" size={24} color="#4F46E5" />
=======
              <MaterialCommunityIcons name="chart-line" size={20} color="#4A90E2" />
>>>>>>> afe560583af16468ca5aaaf1dc2e1c1d8e271caf
              <Text style={styles.statsTitle}>Conversions</Text>
            </View>
            <View style={styles.statsContent}>
              <Text style={styles.statsValue}>43</Text>
              <Text style={[styles.statsChange, styles.negativeChange]}>-3.2%</Text>
            </View>
          </View>
<<<<<<< HEAD
        </Animated.View>
      </LinearGradient>

      <Animated.Text 
        style={[
          styles.sectionTitle, 
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        Quick Actions
      </Animated.Text>
      
      <Animated.ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={[
          styles.quickActionsScroll,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.quickActions}>
          {['Conversions', 'Statistics', 'Wallet', 'AffPlus', 'Offer'].map((action, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.actionItem}
              activeOpacity={0.8}
              onPress={() => handleNavigate(action as keyof RootStackParamList)}
            >
              <LinearGradient
                colors={['#F8FAFC', '#F1F5F9']}
                style={styles.actionItemGradient}
              >
                <MaterialCommunityIcons 
                  name={getIconName(action)} 
                  size={28} 
                  color="#4F46E5" 
                />
                <Text style={styles.actionText}>{action}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.ScrollView>

      <Animated.View 
        style={[
          styles.campaignsSection,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Campaigns</Text>
          <TouchableOpacity 
            style={styles.viewAllButton}
            activeOpacity={0.8}
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.campaignsList}>
          {campaigns.map((campaign, index) => renderCampaign(campaign, index))}
        </View>
      </Animated.View>

      <Animated.View 
        style={[
          styles.recentActivitySection,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity 
            style={styles.viewAllButton}
            activeOpacity={0.8}
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.activityList}>
          {[
            { text: "New conversion from Campaign A", time: "2h ago", value: "₹45.00" },
            { text: "Click milestone reached", time: "4h ago", value: "1,000 clicks" },
            { text: "New conversion from Campaign B", time: "6h ago", value: "₹32.50" },
          ].map((activity, index) => (
            <Animated.View 
              key={index} 
              style={[
                styles.activityItem,
                {
                  opacity: fadeAnim,
                  transform: [{ 
                    translateX: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20 * (index + 1), 0]
                    }) 
                  }]
                }
              ]}
            >
              <View style={styles.activityInfo}>
                <Text style={styles.activityText}>{activity.text}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
              <Text style={styles.activityValue}>{activity.value}</Text>
            </Animated.View>
          ))}
        </View>
      </Animated.View>
=======
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          {['Campaigns', 'Statistics', 'Wallet', 'Affpulse','Settings'].map((action, index) => (
            <TouchableOpacity key={index} style={styles.actionItem}>
              <MaterialCommunityIcons 
                name={getIconName(action)} 
                size={24} 
                color="#4A90E2" 
              />
              <Text style={styles.actionText}>{action}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.campaignsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Campaigns</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.campaignsList}>{campaigns.map(renderCampaign)}</View>
        </View>

        <View style={styles.recentActivitySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <View style={styles.activityInfo}>
                <Text style={styles.activityText}>New conversion from Campaign A</Text>
                <Text style={styles.activityTime}>2h ago</Text>
              </View>
              <Text style={styles.activityValue}>₹45.00</Text>
            </View>
            <View style={styles.activityItem}>
              <View style={styles.activityInfo}>
                <Text style={styles.activityText}>Click milestone reached</Text>
                <Text style={styles.activityTime}>4h ago</Text>
              </View>
              <Text style={styles.activityValue}>1,000 clicks</Text>
            </View>
            <View style={styles.activityItem}>
              <View style={styles.activityInfo}>
                <Text style={styles.activityText}>New conversion from Campaign B</Text>
                <Text style={styles.activityTime}>6h ago</Text>
              </View>
              <Text style={styles.activityValue}>₹32.50</Text>
            </View>
          </View>
        </View>
      
        <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Logout ({userEmail})</Text>
        </TouchableOpacity>
      </View>
>>>>>>> afe560583af16468ca5aaaf1dc2e1c1d8e271caf
    </ScrollView>
  );
};

const getIconName = (action: string): keyof typeof MaterialCommunityIcons.glyphMap => {
  switch (action) {
<<<<<<< HEAD
    case 'Conversions': return 'rotate-3d-variant';
    case 'Statistics': return 'chart-bell-curve';
    case 'Wallet': return 'wallet-plus';
    case 'AffPlus': return 'pulse';
    case 'Offer': return 'offer';
=======
    case 'Campaigns': return 'account-group';
    case 'Statistics': return 'chart-line';
    case 'Wallet': return 'wallet';
    case 'Affpulse': return 'lightning-bolt';
    case 'Settings': return 'cog';
>>>>>>> afe560583af16468ca5aaaf1dc2e1c1d8e271caf
    default: return 'circle';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
<<<<<<< HEAD
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  balanceCard: {
    marginBottom: 24,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontWeight: '500',
  },
  balanceAmount: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
    marginVertical: 8,
=======
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeContainer: {
    marginLeft: 12,
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
  },
  nameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  balanceCard: {
    backgroundColor: '#2563EB',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  balanceLabel: {
    color: 'white',
    fontSize: 16,
  },
  balanceAmount: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 10,
>>>>>>> afe560583af16468ca5aaaf1dc2e1c1d8e271caf
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
<<<<<<< HEAD
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 12,
    borderRadius: 12,
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
=======
    marginTop: 15,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 10,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
>>>>>>> afe560583af16468ca5aaaf1dc2e1c1d8e271caf
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statsCard: {
    backgroundColor: 'white',
<<<<<<< HEAD
    borderRadius: 16,
    padding: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
=======
    borderRadius: 12,
    padding: 15,
    width: '48%',
>>>>>>> afe560583af16468ca5aaaf1dc2e1c1d8e271caf
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
<<<<<<< HEAD
    marginBottom: 12,
  },
  statsTitle: {
    marginLeft: 8,
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
=======
    marginBottom: 8,
  },
  statsTitle: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
>>>>>>> afe560583af16468ca5aaaf1dc2e1c1d8e271caf
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
<<<<<<< HEAD
    color: '#1E293B',
  },
  statsChange: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  negativeChange: {
    color: '#EF4444',
  },
  quickActionsScroll: {
    marginVertical: 24,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    margin:8
  },
  actionItem: {
    marginRight: 16,
  },
  actionItemGradient: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
=======
    color: '#000',
  },
  statsChange: {
    color: '#4CAF50',
    fontSize: 14,
  },
  negativeChange: {
    color: '#FF5252',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    marginLeft: 16,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionItem: {
    backgroundColor: 'white',
    width: '23%',
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
>>>>>>> afe560583af16468ca5aaaf1dc2e1c1d8e271caf
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
<<<<<<< HEAD
    color: '#64748B',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginLeft: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 20,
    marginBottom: 16,
  },
  viewAllButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  viewAllText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '600',
=======
    color: '#666',
>>>>>>> afe560583af16468ca5aaaf1dc2e1c1d8e271caf
  },
  campaignsSection: {
    marginBottom: 24,
  },
<<<<<<< HEAD
  campaignsList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  campaignItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  campaignName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  campaignProgress: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
=======
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  viewAllText: {
    color: "#4A90E2",
    fontSize: 14,
    paddingRight:15,
  },
  campaignsList: {
    margin:10,
    gap: 12,
  },
  campaignItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  campaignHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  campaignName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
  campaignProgress: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#000",
>>>>>>> afe560583af16468ca5aaaf1dc2e1c1d8e271caf
    borderRadius: 4,
  },
  recentActivitySection: {
    marginBottom: 24,
  },
  activityList: {
<<<<<<< HEAD
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
=======
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    margin:10,
  },
  activityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
>>>>>>> afe560583af16468ca5aaaf1dc2e1c1d8e271caf
  },
  activityInfo: {
    flex: 1,
    marginRight: 16,
  },
  activityText: {
    fontSize: 14,
<<<<<<< HEAD
    fontWeight: '600',
    color: '#1E293B',
=======
    fontWeight:"bold",
    color: "#000",
>>>>>>> afe560583af16468ca5aaaf1dc2e1c1d8e271caf
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
<<<<<<< HEAD
    color: '#64748B',
  },
  activityValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
=======
    color: "#666",
  },
  activityValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
  },
  footer: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#FF5252',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
>>>>>>> afe560583af16468ca5aaaf1dc2e1c1d8e271caf
  },
});

export default HomeScreen;
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types/types';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API } from '../constant/api';

type HomeScreenNavigationProp = StackNavigationProp<ParamListBase>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

interface Campaign {
  name: string;
  progress: number;
}

const campaigns: Campaign[] = [
  { name: "Campaign A", progress: 85 },
  { name: "Campaign B", progress: 62 },
  { name: "Campaign C", progress: 38 },
];

const HomeScreen: React.FC<HomeScreenProps> = () => {
    const [totalBalance, setTotalBalance] = useState<number>(0);
  
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  const handleWalletPress = () => {
    navigation.navigate('Wallet');
  };
  

  async function fetchWalletBalance(){
    const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.error("No token found! Ensure user is logged in.");
        return;
      }
    try {
      const response =  await axios.get(`${API}/api/wallet/total-remaining-balance`, {
        headers: { Authorization: `Bearer ${token}` },
      })      
      if(response.status==200){
        setTotalBalance(parseFloat(response.data.total_remaining_balance.toFixed(2)));
      }
    } catch (error) {
      console.error("Error occured while fetching wallet balance",error)
    }
  }

  useEffect(()=>{
    fetchWalletBalance()
  },[])

  const renderCampaign = (campaign: Campaign) => (
    <View key={campaign.name} style={styles.campaignItem}>
      <View style={styles.campaignHeader}>
        <Text style={styles.campaignName}>{campaign.name}</Text>
        <Text style={styles.campaignProgress}>{campaign.progress}%</Text>
      </View>
      <View style={styles.progressBarBackground}>
        <LinearGradient
          colors={['#6366F1', '#4F46E5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressBarFill, { width: `${campaign.progress}%` }]}
        />
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#4F46E5', '#6366F1']}
        style={styles.header}
      >
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>₹{totalBalance}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleWalletPress}>
              <MaterialCommunityIcons name="plus" size={20} color="white" />
              <Text style={styles.buttonText}>Add Money</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialCommunityIcons name="bank-transfer" size={20} color="white" />
              <Text style={styles.buttonText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <MaterialCommunityIcons name="trending-up" size={24} color="#4F46E5" />
              <Text style={styles.statsTitle}>Today's Clicks</Text>
            </View>
            <View style={styles.statsContent}>
              <Text style={styles.statsValue}>856</Text>
              <Text style={styles.statsChange}>+12.5%</Text>
            </View>
          </View>

          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <MaterialCommunityIcons name="chart-line" size={24} color="#4F46E5" />
              <Text style={styles.statsTitle}>Conversions</Text>
            </View>
            <View style={styles.statsContent}>
              <Text style={styles.statsValue}>43</Text>
              <Text style={[styles.statsChange, styles.negativeChange]}>-3.2%</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickActionsScroll}>
        <View style={styles.quickActions}>
          {['Campaigns', 'Statistics', 'Wallet', 'Affpulse', 'Settings'].map((action, index) => (
            <TouchableOpacity key={index} style={styles.actionItem}>
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
      </ScrollView>

      <View style={styles.campaignsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Campaigns</Text>
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.campaignsList}>{campaigns.map(renderCampaign)}</View>
      </View>

      <View style={styles.recentActivitySection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.activityList}>
          {[
            { text: "New conversion from Campaign A", time: "2h ago", value: "₹45.00" },
            { text: "Click milestone reached", time: "4h ago", value: "1,000 clicks" },
            { text: "New conversion from Campaign B", time: "6h ago", value: "₹32.50" },
          ].map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={styles.activityInfo}>
                <Text style={styles.activityText}>{activity.text}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
              <Text style={styles.activityValue}>{activity.value}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const getIconName = (action: string): keyof typeof MaterialCommunityIcons.glyphMap => {
  switch (action) {
    case 'Campaigns': return 'rocket-launch';
    case 'Statistics': return 'chart-bell-curve';
    case 'Wallet': return 'wallet-plus';
    case 'Affpulse': return 'pulse';
    case 'Settings': return 'cog';
    default: return 'circle';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsTitle: {
    marginLeft: 8,
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
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
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
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
  },
  campaignsSection: {
    marginBottom: 24,
  },
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
    borderRadius: 4,
  },
  recentActivitySection: {
    marginBottom: 24,
  },
  activityList: {
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
  },
  activityInfo: {
    flex: 1,
    marginRight: 16,
  },
  activityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#64748B',
  },
  activityValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
});

export default HomeScreen;
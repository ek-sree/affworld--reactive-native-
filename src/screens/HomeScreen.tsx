import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ParamListBase } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

type HomeScreenNavigationProp = StackNavigationProp<ParamListBase>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

interface Campaign {
  name: string
  progress: number
}

const campaigns: Campaign[] = [
  { name: "Campaign A", progress: 85 },
  { name: "Campaign B", progress: 62 },
  { name: "Campaign C", progress: 38 },
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
              <Text style={styles.statsTitle}>Today's Clicks</Text>
            </View>
            <View style={styles.statsContent}>
              <Text style={styles.statsValue}>856</Text>
              <Text style={styles.statsChange}>+12.5%</Text>
            </View>
          </View>

          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <MaterialCommunityIcons name="chart-line" size={20} color="#4A90E2" />
              <Text style={styles.statsTitle}>Conversions</Text>
            </View>
            <View style={styles.statsContent}>
              <Text style={styles.statsValue}>43</Text>
              <Text style={[styles.statsChange, styles.negativeChange]}>-3.2%</Text>
            </View>
          </View>
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
    </ScrollView>
  );
};

const getIconName = (action: string): keyof typeof MaterialCommunityIcons.glyphMap => {
  switch (action) {
    case 'Campaigns': return 'account-group';
    case 'Statistics': return 'chart-line';
    case 'Wallet': return 'wallet';
    case 'Affpulse': return 'lightning-bolt';
    case 'Settings': return 'cog';
    default: return 'circle';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    width: '48%',
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsTitle: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
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
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
  campaignsSection: {
    marginBottom: 24,
  },
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
    borderRadius: 4,
  },
  recentActivitySection: {
    marginBottom: 24,
  },
  activityList: {
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
  },
  activityInfo: {
    flex: 1,
    marginRight: 16,
  },
  activityText: {
    fontSize: 14,
    fontWeight:"bold",
    color: "#000",
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
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
  },
});

export default HomeScreen;
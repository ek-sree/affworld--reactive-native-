import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerContentComponentProps } from '@react-navigation/drawer';
import { AntDesign, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WalletScreen from '../screens/WalletScreen';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { DrawerParamList } from '../types/types';
import AffPlusScreen from '../screens/AffPlusScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import { useUserDetails } from '../context/UserDetailsContext';

const Drawer = createDrawerNavigator<DrawerParamList>();

interface CustomDrawerContentProps extends DrawerContentComponentProps {
  logout: () => void;
}

const CustomDrawerContent: React.FC<CustomDrawerContentProps> = (props) => {
  const { logout } = props;
  const { userEmail } = useAuth();
  const {userDetailsData} = useUserDetails()

  const handleProfilePress = () => {
    props.navigation.navigate('Profile');
    props.navigation.closeDrawer();
  };

  return (
    <View style={styles.drawerContainer}>
      <LinearGradient
        colors={['#2563eb', '#1d4ed8']}
        style={styles.drawerHeader}
      >
        <TouchableOpacity 
          style={styles.profileSection}
          onPress={handleProfilePress}
          activeOpacity={0.8}
        >
          <View style={styles.avatarContainer}>
            {userDetailsData?.profile_pic ? (
                <Image 
                source={{ uri: userDetailsData.profile_pic }}
                style={styles.profileImage}
                />
                            ) : (
            <MaterialCommunityIcons name="account" size={32} color="#fff" />
                )}
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userEmail} numberOfLines={1}>
              {userDetailsData?.name}
            </Text>
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>{userDetailsData?.email}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </LinearGradient>

      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
        <View style={styles.menuContainer}>
          <Text style={styles.menuHeader}>MAIN MENU</Text>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.helpButton}>
          <View style={styles.helpContent}>
            <Feather name="help-circle" size={20} color="#64748b" />
            <Text style={styles.helpText}>Help & Support</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={logout}
        >
          <LinearGradient
            colors={['#fee2e2', '#fecaca']}
            style={styles.logoutGradient}
          >
            <View style={styles.logoutContent}>
              <MaterialCommunityIcons name="logout" size={22} color="#ef4444" />
              <Text style={styles.logoutText}>Logout</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const DrawerNavigator = () => {
  const { logout } = useAuth();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} logout={logout} />}
      initialRouteName="Home"
      screenOptions={{
        header: ({ navigation, route }) => (
          <Header 
            title={route.name} 
            navigation={navigation}
          />
        ),
        drawerStyle: {
          backgroundColor: '#fff',
          width: '85%',
          borderTopRightRadius: 24,
          borderBottomRightRadius: 24,
          overflow: 'hidden',
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          position: 'absolute',
        },
        drawerPosition: 'left',
        overlayColor: 'rgba(0, 0, 0, 0.6)',
        drawerActiveBackgroundColor: '#3b82f6',
        drawerActiveTintColor: '#fff',
        drawerInactiveTintColor: '#1e293b',
        drawerItemStyle: {
          borderRadius: 12,
          marginHorizontal: 8,
          marginVertical: 4,
          paddingLeft: 4,
        },
        drawerLabelStyle: {
          fontSize: 15,
          fontWeight: '600',
          marginLeft: -16,
        },
      }}
    >
      <Drawer.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          drawerIcon: ({ color }) => (
            <View style={[styles.iconContainer, { backgroundColor: color === '#fff' ? 'rgba(255,255,255,0.2)' : '#f1f5f9' }]}>
              <MaterialCommunityIcons name="home" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Drawer.Screen 
        name="Wallet" 
        component={WalletScreen}
        options={{
          drawerIcon: ({ color }) => (
            <View style={[styles.iconContainer, { backgroundColor: color === '#fff' ? 'rgba(255,255,255,0.2)' : '#f1f5f9' }]}>
              <MaterialCommunityIcons name="wallet" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Drawer.Screen 
        name="AffPlus" 
        component={AffPlusScreen}
        options={{
          drawerIcon: ({ color }) => (
            <View style={[styles.iconContainer, { backgroundColor: color === '#fff' ? 'rgba(255,255,255,0.2)' : '#f1f5f9' }]}>
              <AntDesign name="addfile" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Drawer.Screen 
        name="Statistics" 
        component={StatisticsScreen}
        options={{
          drawerIcon: ({ color }) => (
            <View style={[styles.iconContainer, { backgroundColor: color === '#fff' ? 'rgba(255,255,255,0.2)' : '#f1f5f9' }]}>
              <AntDesign name="areachart" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Drawer.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          drawerItemStyle: { display: 'none' }, 
        }}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  profileImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  drawerHeader: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 24,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userEmail: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    color: '#e0f2fe',
    fontSize: 13,
    fontWeight: '500',
  },
  scrollContent: {
    paddingTop: 12,
  },
  menuContainer: {
    flex: 1,
  },
  menuHeader: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 16,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  iconContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginRight:20
  },
  bottomSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  helpButton: {
    padding: 12,
    marginBottom: 12,
  },
  helpContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  logoutButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  logoutGradient: {
    padding: 12,
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '600',
    color: '#ef4444',
  },
});

export default DrawerNavigator;
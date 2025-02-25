import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Dimensions } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerContentComponentProps } from '@react-navigation/drawer';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons, Feather, MaterialIcons, Foundation } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WalletScreen from '../screens/WalletScreen';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { DrawerParamList } from '../types/types';
import AffPlusScreen from '../screens/AffPlusScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import OfferScreen from '../screens/OfferScreen';
import ConversionsScreen from '../screens/ConversionsScreen';
import { useUserDetails } from '../context/UserDetailsContext';
import OfferDetailsScreen from '../components/OfferDetails';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';

const Drawer = createDrawerNavigator<DrawerParamList>();

// Define stack param list for offer screens
type OfferStackParamList = {
  OfferList: undefined;
  OfferDetails: { name: string };
};

const OfferStack = createStackNavigator<OfferStackParamList>();

// Component props types
interface MenuItemsProps extends DrawerContentComponentProps {
  fadeAnim: Animated.Value;
}

interface CustomDrawerItemProps {
  label: string;
  icon: (props: { color: string; size: number; focused: boolean }) => React.ReactNode;
  focused: boolean;
  onPress: () => void;
}

const OfferStackNavigator: React.FC = () => {
  return (
    <OfferStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      <OfferStack.Screen name="OfferList" component={OfferScreen} />
      <OfferStack.Screen 
        name="OfferDetails" 
        component={OfferDetailsScreen as React.ComponentType<any>}
      />
    </OfferStack.Navigator>
  );
};

interface CustomDrawerContentProps extends DrawerContentComponentProps {
  logout: () => void;
}

const CustomDrawerContent: React.FC<CustomDrawerContentProps> = (props) => {
  const { logout } = props;
  const { userEmail } = useAuth();
  const { userDetailsData } = useUserDetails();
  const insets = useSafeAreaInsets();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleProfilePress = () => {
    props.navigation.navigate('Profile');
    props.navigation.closeDrawer();
  };

  return (
    <View style={[styles.drawerContainer, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#2563eb', '#1d4ed8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.drawerHeader}
      >
        <Animated.View 
          style={{ 
            opacity: fadeAnim,
            transform: [{ translateY }],
          }}
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
              <Text style={styles.userName} numberOfLines={1}>
                {userDetailsData?.name || 'User Name'}
              </Text>
              <View style={styles.statusContainer}>
                <View style={styles.statusIndicator} />
                <Text style={styles.statusText}>{userDetailsData?.email || userEmail}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      <DrawerContentScrollView 
        {...props} 
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={true}
      >
        <MenuItems {...props} fadeAnim={fadeAnim} />
      </DrawerContentScrollView>

      <Animated.View 
        style={[
          styles.bottomSection,
          {
            opacity: fadeAnim,
            transform: [{ 
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [10, 0],
              }) 
            }],
          }
        ]}
      >
        <TouchableOpacity style={styles.helpButton}>
          <View style={styles.helpContent}>
            <View style={styles.helpIconContainer}>
              <Feather name="help-circle" size={20} color="#3b82f6" />
            </View>
            <Text style={styles.helpText}>Help & Support</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={logout}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#fee2e2', '#fecaca']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoutGradient}
          >
            <View style={styles.logoutContent}>
              <MaterialCommunityIcons name="logout" size={22} color="#ef4444" />
              <Text style={styles.logoutText}>Logout</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const MenuItems: React.FC<MenuItemsProps> = ({ fadeAnim, ...props }) => {
  const [itemAnims] = React.useState(
    Array(7).fill(0).map((_, i) => new Animated.Value(0))
  );
  
  React.useEffect(() => {
    const animations = itemAnims.map((anim, i) => {
      return Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        delay: 300 + (i * 100),
        useNativeDriver: true,
      });
    });
    
    Animated.stagger(50, animations).start();
  }, []);

  return (
    <View style={styles.menuContainer}>
      <Animated.Text 
        style={[
          styles.menuHeader,
          {
            opacity: fadeAnim,
            transform: [{ 
              translateX: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0] 
              })
            }]
          }
        ]}
      >
        MAIN MENU
      </Animated.Text>
      
      <View style={{ marginTop: 8 }}>
        {props.state.routes.map((route, index) => {
          if (route.name === 'Profile') return null; 
          
          const { options } = props.descriptors[route.key];
          const label = options.drawerLabel !== undefined 
            ? options.drawerLabel 
            : options.title !== undefined
              ? options.title
              : route.name;
          
          const isFocused = props.state.index === index;
          
          return (
            <Animated.View 
              key={route.key}
              style={{
                opacity: itemAnims[index],
                transform: [{ 
                  translateX: itemAnims[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [-30, 0] 
                  })
                }]
              }}
            >
              <TouchableOpacity
                style={[
                  styles.drawerItem,
                  isFocused ? styles.drawerItemActive : null
                ]}
                onPress={() => {
                  props.navigation.navigate(route.name);
                }}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.iconContainer, 
                  { backgroundColor: isFocused ? 'rgba(255,255,255,0.2)' : '#f1f5f9' }
                ]}>
                  {options.drawerIcon && options.drawerIcon({ 
                    color: isFocused ? '#fff' : '#1e293b',
                    size: 22,
                    focused: isFocused
                  })}
                </View>
                <Text style={[
                  styles.drawerLabel,
                  { color: isFocused ? '#fff' : '#1e293b' }
                ]}>
                  {typeof label === 'string' ? label : route.name}
                </Text>
                
                {isFocused && (
                  <View style={styles.activeIndicator} />
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
};

const CustomDrawerItem: React.FC<CustomDrawerItemProps> = ({ label, icon, focused, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.drawerItem, focused ? styles.drawerItemActive : null]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: focused ? 'rgba(255,255,255,0.2)' : '#f1f5f9' }]}>
        {icon({ color: focused ? '#fff' : '#1e293b', size: 22, focused })}
      </View>
      <Text style={[styles.drawerLabel, { color: focused ? '#fff' : '#1e293b' }]}>
        {label}
      </Text>
      
      {focused && (
        <View style={styles.activeIndicator} />
      )}
    </TouchableOpacity>
  );
};

const DrawerNavigator: React.FC = () => {
  const { logout } = useAuth();
  const { width } = Dimensions.get('window');

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
          width: width * 0.85,
          borderTopRightRadius: 24,
          borderBottomRightRadius: 24,
          overflow: 'hidden',
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 8, height: 0 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
        },
        drawerType: 'slide',
        overlayColor: 'rgba(0, 0, 0, 0.7)',
        swipeEdgeWidth: 80,
        swipeMinDistance: 10,
        drawerActiveBackgroundColor: '#3b82f6',
        drawerActiveTintColor: '#fff',
        drawerInactiveTintColor: '#1e293b',
        drawerItemStyle: {
          display: 'none', 
        },
      }}
    >
      <Drawer.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          drawerIcon: ({ color }) => (
            <MaterialCommunityIcons name="home" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Wallet" 
        component={WalletScreen}
        options={{
          drawerIcon: ({ color }) => (
            <MaterialCommunityIcons name="wallet" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="AffPlus" 
        component={AffPlusScreen}
        options={{
          drawerIcon: ({ color }) => (
            <MaterialCommunityIcons name="pulse" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Statistics" 
        component={StatisticsScreen}
        options={{
          drawerIcon: ({ color }) => (
            <MaterialCommunityIcons name="chart-bell-curve" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Offer" 
        component={OfferStackNavigator}
        options={{
          drawerIcon: ({ color }) => (
            <MaterialIcons name="local-offer" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Conversions" 
        component={ConversionsScreen}
        options={{
          drawerIcon: ({ color }) => (
            <Foundation name="loop" size={22} color={color} />
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
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  drawerHeader: {
    padding: 20,
    paddingTop: 24,
    paddingBottom: 28,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ade80',
    marginRight: 6,
  },
  statusText: {
    color: '#e0f2fe',
    fontSize: 13,
    fontWeight: '500',
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  menuHeader: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 16,
    marginBottom: 12,
    letterSpacing: 1,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginVertical: 4,
    marginHorizontal: 8,
    padding: 12,
    paddingLeft: 8,
    position: 'relative',
  },
  drawerItemActive: {
    backgroundColor: '#3b82f6',
  },
  iconContainer: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  drawerLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    right: 12,
    width: 4,
    height: 16,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  bottomSection: {
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  helpButton: {
    padding: 12,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  helpContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  helpText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  logoutButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutGradient: {
    padding: 14,
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '700',
    color: '#ef4444',
  },
});

export default DrawerNavigator;
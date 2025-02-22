import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserDetails } from '../context/UserDetailsContext';

interface HeaderProps {
  title: string;
  notificationCount?: number;
  navigation: any;
}

const Header: React.FC<HeaderProps> = ({ title, notificationCount = 0, navigation }) => {
  const { userDetailsData } = useUserDetails();
  const bellRotation = new Animated.Value(0);

  useEffect(() => {
    if (notificationCount > 0) {
      Animated.sequence([
        Animated.timing(bellRotation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(bellRotation, {
          toValue: -1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(bellRotation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [notificationCount]);

  const bellRotationInterpolate = bellRotation.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-20deg', '0deg', '20deg'],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#ffffff', '#f8fafc']}
        style={styles.gradientContainer}
      >
        <View style={styles.header}>
          <View style={styles.leftSection}>
            <TouchableOpacity 
              onPress={() => navigation.openDrawer()} 
              style={styles.avatarButton}
            >
              <LinearGradient
                colors={['#3b82f6', '#2563eb']}
                style={styles.avatarContainer}
              >
                {userDetailsData?.profile_pic ? (
                  <Image 
                    source={{ uri: userDetailsData.profile_pic }}
                    style={styles.profileImage}
                  />
                ) : (
                  <MaterialCommunityIcons name="account" size={24} color="#ffffff" />
                )}
              </LinearGradient>
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.welcomeText}>
                <Feather name="sun" size={14} color="#fbbf24" /> Welcome back
              </Text>
              {userDetailsData?.name && (
                <Text style={styles.userName}>{userDetailsData.name}</Text>
              )}
            </View>
          </View>

          <TouchableOpacity style={styles.notificationContainer}>
            <LinearGradient
              colors={['#f0f9ff', '#e0f2fe']}
              style={styles.notificationIconContainer}
            >
              <Animated.View
                style={{
                  transform: [{ rotate: bellRotationInterpolate }],
                }}
              >
                <MaterialCommunityIcons name="bell-outline" size={24} color="#2563eb" />
              </Animated.View>
              {notificationCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationText}>{notificationCount}</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
      <View style={styles.separator} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#ffffff',
  },
  gradientContainer: {
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarButton: {
    marginRight: 12,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  profileImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  titleContainer: {
    flex: 1,
  },
  welcomeText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 4, 
  },
  userName: {
    color: 'rgba(32, 31, 31, 0.7)', 
    fontSize: 16,     
    fontWeight: '700', 
    letterSpacing: 0.2,
    paddingLeft:15
  },
  notificationContainer: {
    padding: 4,
  },
  notificationIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  separator: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 16,
  },
});

export default Header;
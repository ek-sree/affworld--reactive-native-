import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserDetails } from '../context/UserDetailsContext';

interface HeaderProps {
  title: string;
  notificationCount?: number;
  navigation: any;
}

const Header: React.FC<HeaderProps> = ({ title, notificationCount = 0, navigation }) => {
  const { userDetailsData,cacheBuster } = useUserDetails();
  const bellRotation = useRef(new Animated.Value(0)).current;
  const bellScale = useRef(new Animated.Value(1)).current;
  const avatarScale = useRef(new Animated.Value(1)).current;


  useEffect(() => {
    if (notificationCount > 0) {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(bellRotation, {
            toValue: 0.5,
            duration: 150,
            easing: Easing.bounce,
            useNativeDriver: true,
          }),
          Animated.timing(bellScale, {
            toValue: 1.2,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(bellRotation, {
            toValue: -0.5,
            duration: 150,
            easing: Easing.bounce,
            useNativeDriver: true,
          }),
          Animated.timing(bellScale, {
            toValue: 1.1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(bellRotation, {
            toValue: 0.3,
            duration: 150,
            easing: Easing.bounce,
            useNativeDriver: true,
          }),
          Animated.timing(bellScale, {
            toValue: 1.15,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(bellRotation, {
            toValue: 0,
            duration: 150,
            easing: Easing.bounce,
            useNativeDriver: true,
          }),
          Animated.timing(bellScale, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [notificationCount]);

  const handleAvatarPress = () => {
    Animated.sequence([
      Animated.timing(avatarScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(avatarScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    
    navigation.openDrawer();
  };

  const bellRotationInterpolate = bellRotation.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-30deg', '0deg', '30deg'],
  });

  type FeatherIconName = keyof typeof Feather.glyphMap;
  const getGreeting = (): { text: string; icon: FeatherIconName } => {
    const hours = new Date().getHours();
    if (hours < 12) return { text: 'Good morning', icon: 'sunrise' };
    if (hours < 18) return { text: 'Good afternoon', icon: 'sun' };
    return { text: 'Good evening', icon: 'moon' };
  };
  

  const greeting = getGreeting();

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#ffffff', '#f5f8ff']}
        start={[0, 0]}
        end={[1, 1]}
        style={styles.gradientContainer}
      >
        <View style={styles.header}>
          <View style={styles.leftSection}>
            <Animated.View style={[
              styles.avatarButtonContainer,
              { transform: [{ scale: avatarScale }] },
            ]}>
              <TouchableOpacity 
                onPress={handleAvatarPress} 
                style={styles.avatarButton}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#4f46e5', '#3b82f6']}
                  start={[0, 0]}
                  end={[1, 1]}
                  style={styles.avatarContainer}
                >
                 {userDetailsData?.profile_pic ? (
                    <Image
                      source={{ uri: `${userDetailsData.profile_pic}?t=${cacheBuster}` }}
                      style={styles.profileImage}
                    />
                  ) : (
                    <MaterialCommunityIcons name="account" size={24} color="#ffffff" />
                  )}
                  <View style={styles.avatarRing} />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.titleContainer}>
              <Text style={styles.welcomeText}>
                <Feather name={greeting.icon} size={14} color="#fbbf24" /> {greeting.text}
              </Text>
              {userDetailsData?.name && (
                <Text numberOfLines={1} style={styles.userName}>
                  {userDetailsData.name}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.rightSection}>
            <TouchableOpacity 
              style={styles.notificationContainer}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#f5f9ff', '#e6effd']}
                style={styles.buttonContainer}
              >
                <Animated.View
                  style={{
                    transform: [
                      { rotate: bellRotationInterpolate },
                      { scale: bellScale }
                    ],
                  }}
                >
                  <MaterialCommunityIcons name="bell-outline" size={20} color="#3b82f6" />
                </Animated.View>
              </LinearGradient>
              {notificationCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationText}>
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
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
    paddingVertical: 12,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarButtonContainer: {
    marginRight: 14,
  },
  avatarButton: {
    borderRadius: 24,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  avatarRing: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  titleContainer: {
    flex: 1,
  },
  welcomeText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 3,
  },
  userName: {
    color: '#1e293b',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  searchButton: {
    marginRight: 10,
  },
  buttonContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(203, 213, 225, 0.7)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  notificationText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(226, 232, 240, 0.8)',
  },
});

export default Header;
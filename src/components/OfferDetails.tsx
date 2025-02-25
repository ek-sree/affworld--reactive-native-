import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Image, Animated, Platform } from 'react-native';
import { AntDesign, Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { StackScreenProps } from '@react-navigation/stack';
import { DrawerParamList } from '../types/types'; 
import { OfferDetails } from '../interface/IOfferDetails';

type OfferDetailsScreenProps = StackScreenProps<DrawerParamList, 'OfferDetails'>;

const OfferDetailsScreen: React.FC<OfferDetailsScreenProps> = ({ navigation, route }) => {
  const { name } = route.params;
  const [offerDetails, setOfferDetails] = useState<OfferDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(400)).current;

  async function getOfferDetails() {
    try {
      setLoading(true);
      const response = await axios.get(`https://admin-api.affworld.io/campaign/by-name/${name}`);
      if (response.status === 200) {
        setOfferDetails(response.data);
        animateContent();
      }
    } catch (error) {
      console.error("Error fetching offer details:", error);
    } finally {
      setLoading(false);
    }
  }

  const animateContent = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 30,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    if (name) {
      getOfferDetails();
    }
  }, [name]);

  const renderStatusBadge = (status?: string) => {
    return (
      <LinearGradient
        colors={['#FF5733', '#FFC300']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.statusBadge}
      >
        <Text style={styles.statusText}>{status || 'N/A'}</Text>
      </LinearGradient>
    );
  };

  const renderTrafficSourcesSection = () => {
    const trafficSources = [
      { source: "Cashback", allowed: offerDetails?.cashback },
      { source: "Popup/ClickUnder", allowed: offerDetails?.popunder_clickunder },
      { source: "Behavioral Retargeting", allowed: offerDetails?.behavioural_retargeting },
      { source: "SEM", allowed: offerDetails?.sem },
      { source: "SMS", allowed: offerDetails?.sms },
      { source: "Email", allowed: offerDetails?.email },
      { source: "Brand Bidding", allowed: offerDetails?.brand_bidding },
      { source: "Social Media (ads)", allowed: offerDetails?.social_media_ads },
      { source: "Incentive", allowed: offerDetails?.incentive },
      { source: "Toolbar", allowed: offerDetails?.toolbar },
      { source: "Adult", allowed: offerDetails?.adult },
      { source: "Youtube", allowed: offerDetails?.youtube },
    ];

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Traffic Sources</Text>
        <View style={styles.trafficSourcesGrid}>
          {trafficSources.map((item, index) => (
            <View key={index} style={styles.trafficSourceItem}>
              {item.allowed ? (
                <MaterialIcons name="check-circle" size={20} color="#10B981" />
              ) : (
                <MaterialIcons name="cancel" size={20} color="#EF4444" />
              )}
              <Text style={styles.trafficSourceText}>{item.source}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderPayoutTable = () => {
    if (!offerDetails?.payouts) return null;

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Payout Structure</Text>
        <View style={styles.payoutTable}>
          {Object.entries(offerDetails.payouts).map(([key, value]) => (
            value > 0 && (
              <View key={key} style={styles.payoutRow}>
                <Text style={styles.payoutType}>{key}</Text>
                <View style={styles.payoutAmountContainer}>
                  <Text style={styles.payoutAmount}>₹{value}</Text>
                </View>
              </View>
            )
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <MaterialIcons name="payment" size={48} color="#4299E1" />
            <Text style={styles.loadingText}>Loading offer details...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#4299E1', '#3182CE']}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <AntDesign name="arrowleft" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.photoContainer}>
            <View style={[
              styles.photoPlaceholder,
              offerDetails?.image_url && { backgroundColor: 'transparent' }
            ]}>
              {offerDetails?.image_url ? (
                <Image 
                  source={{ uri: offerDetails.image_url }}
                  style={styles.offerImage}
                />
              ) : (
                <Ionicons name="image-outline" size={40} color="#FFFFFF" />
              )}
            </View>
          </View>
          <Text style={styles.headerTitle}>{offerDetails?.name || name}</Text>
          {renderStatusBadge(offerDetails?.status)}
        </View>
      </LinearGradient>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View 
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <View style={styles.quickInfo}>
            <View style={styles.infoCard}>
              <MaterialIcons name="attach-money" size={24} color="#4299E1" />
              <Text style={styles.infoValue}>
                ₹{offerDetails?.payouts?.Deposit || '0'}
              </Text>
              <Text style={styles.infoLabel}>Per Action</Text>
            </View>
            <View style={styles.infoCard}>
              <MaterialIcons name="category" size={24} color="#4299E1" />
              <Text style={styles.infoValue}>
                {offerDetails?.category || 'N/A'}
              </Text>
              <Text style={styles.infoLabel}>Category</Text>
            </View>
            <View style={styles.infoCard}>
              <MaterialIcons name="public" size={24} color="#4299E1" />
              <Text style={styles.infoValue}>
                {offerDetails?.country || 'Global'}
              </Text>
              <Text style={styles.infoLabel}>Region</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.joinButton}>
            <LinearGradient
              colors={['#4299E1', '#3182CE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.joinButtonText}>Join Affiliate Program</Text>
              <AntDesign name="arrowright" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Program Details</Text>
            <Text style={styles.description}>
              {offerDetails?.description || 'No description available'}
            </Text>
          </View>

          {renderPayoutTable()}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Campaign Information</Text>
            <View style={styles.infoGrid}>
              {[
                { label: "Campaign Type", value: offerDetails?.type || "Public" },
                { label: "Campaign Model", value: offerDetails?.Model || "CPL" },
                { label: "Validation Time", value: offerDetails?.validation_time || "NET 30" },
                { label: "Payment Frequency", value: offerDetails?.payment_frequency || "NET 30" },
                { label: "Country", value: offerDetails?.country || "India" },
              ].map((item, index) => (
                <View key={index} style={styles.infoRow}>
                  <Text style={styles.infoGridLabel}>{item.label}</Text>
                  <Text style={styles.infoGridValue}>{item.value}</Text>
                </View>
              ))}
            </View>
          </View>

          {renderTrafficSourcesSection()}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Terms & Conditions</Text>
            <Text style={styles.description}>
              {offerDetails?.conversion_flows || 'Please contact support for detailed terms and conditions.'}
            </Text>
          </View>

          <View style={[styles.card, styles.lastCard]}>
            <Text style={styles.cardTitle}>Additional Benefits</Text>
            <View style={styles.benefitsList}>
              {[
                "24/7 Campaign Monitoring",
                "Realtime Analytics",
                "Auto-updating Banners",
                "API Access",
                "Dedicated Support",
              ].map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <Feather name="check-circle" size={20} color="#10B981" />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.card, styles.card2]}>
            <Text style={styles.cardTitle}>Advantages of using Affworld Tech</Text>
            <Text style={styles.description}>
              This affiliate program is a part of the INRDeals affiliate network. After signing up for Spartan Poker Campaign via INRDeals you won't have to sign up for any other network anymore. No more applying for programs or searching for the best Payouts as INRDeals offers fully managed Affiliate Marketing services that yield maximum returns with fastest payments all on a single platform. Our technology works across sites, apps, and social networks so you can focus on your business, earn more, and avoid the hassle of managing countless affiliate programs.{' '}
              <Text style={styles.linkText} onPress={() => {/* Add your link handler here */}}>
                Still not convinced? Click here
              </Text>{' '}
              to Check the list of benefits you can get as an INRDeals Publisher!
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 30,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 40,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  photoContainer: {
    alignItems: 'center',
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  offerImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  scrollContent: {
    padding: 20,
  },
  quickInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginTop: 8,
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: '#718096',
  },
  joinButton: {
    marginBottom: 24,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lastCard: {
    marginBottom: 0,
  },
  card2: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 15,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 22,
  },
  infoGrid: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  infoGridLabel: {
    fontSize: 14,
    color: '#64748B',
    flex: 1,
  },
  infoGridValue: {
    fontSize: 14,
    color: '#2D3748',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  trafficSourcesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  trafficSourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '47%',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
  },
  trafficSourceText: {
    fontSize: 14,
    color: '#4A5568',
    flex: 1,
  },
  payoutTable: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    overflow: 'hidden',
  },
  payoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  payoutType: {
    fontSize: 14,
    color: '#4A5568',
  },
  payoutAmountContainer: {
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  payoutAmount: {
    fontSize: 14,
    color: '#3182CE',
    fontWeight: '600',
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#4A5568',
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#4A5568',
    fontWeight: '500',
  },
  linkText: {
    color: '#4299E1',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
});

export default OfferDetailsScreen;
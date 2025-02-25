import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Animated,
  Easing,
  Dimensions
} from 'react-native';
import ConversionsStatusModal from '../components/ConversionsStatusModal';
import { LinearGradient } from 'expo-linear-gradient';

interface ConversionItem {
  campaign_id: string;
  name: string;
  count: number;
}

interface ConversionsData {
  id: string;
  campaign_id: string;
  campaign: string;
  counts: number;
}

const { width } = Dimensions.get('window');

const ConversionsScreen = () => {
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedConversion, setSelectedConversion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  const rowAnimations = useRef<Animated.Value[]>([]);
  
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  async function getConversationsData() {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.get('https://affiliate-api.affworld.io/api/analytics/clicks', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        const campaigns = response.data.map((item: ConversionItem, index: number) => ({
          id: (index + 1).toString(),
          campaign: item.name,
          counts: item.count,
          campaign_id: item.campaign_id
        }));
        
        rowAnimations.current = campaigns.map(() => new Animated.Value(0));
        
        setData(campaigns);
        
        const total = response.data.reduce((sum: number, item: ConversionItem) => sum + item.count, 0);
        setTotalCount(total);
        
        startAnimations();
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }
  
  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();
    
    rowAnimations.current.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        delay: i * 100, 
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5))
      }).start();
    });
  };
  
  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true
        })
      ).start();
    }
  }, [loading]);

  useEffect(() => {
    getConversationsData();
  }, []);

  const renderItem = ({ item, index }: { item: ConversionsData; index: number }) => {
    // Get the animation for this row
    const rowAnim = rowAnimations.current[index] || new Animated.Value(1);
    
    return (
      <Animated.View 
        style={[
          styles.row,
          {
            opacity: rowAnim,
            transform: [
              { translateX: rowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [width, 0]
                })
              }
            ]
          }
        ]}
      >
        <View style={styles.numberCell}>
          <Text style={styles.cell}>{item.id}</Text>
        </View>
        <View style={styles.campaignCell}>
          <Text style={styles.cell} numberOfLines={1} ellipsizeMode="tail">{item.campaign}</Text>
        </View>
        <View style={styles.countsCell}>
          <Text style={styles.cell}>{item.counts}</Text>
        </View>
        <View style={styles.conversionCell}>
          <TouchableOpacity 
            onPress={() => {
              setIsModalOpen(true); 
              setSelectedConversion(item.campaign_id);
            }}
            style={{ transform: [{ scale: 1 }] }}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#4CD964', '#34BE4B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.statusContainer}
            >
              <Text style={styles.statusText}>Status</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const TableHeader = () => (
    <Animated.View 
      style={[
        styles.headerRow,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.numberCell}>
        <Text style={styles.headerCell}>No.</Text>
      </View>
      <View style={styles.campaignCell}>
        <Text style={styles.headerCell}>Campaign</Text>
      </View>
      <View style={styles.countsCell}>
        <Text style={styles.headerCell}>Counts</Text>
      </View>
      <View style={styles.conversionCell}>
        <Text style={styles.headerCell}>Conversions</Text>
      </View>
    </Animated.View>
  );

  const LoadingIndicator = () => (
    <View style={styles.loadingContainer}>
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <ActivityIndicator size="large" color="#4CD964" />
      </Animated.View>
      <Text style={styles.loadingText}>Loading data...</Text>
    </View>
  );

  return (
    <LinearGradient
      colors={['#f9f9f9', '#ffffff']}
      style={styles.container}
    >
      <Animated.Text 
        style={[
          styles.title,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        Clicks and Conversions!
      </Animated.Text>
      
      {loading ? (
        <LoadingIndicator />
      ) : (
        <>
          <Animated.Text 
            style={[
              styles.totalCount,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: pulseAnim },
                  { translateY: slideAnim }
                ]
              }
            ]}
          >
            Total Count: {totalCount}
          </Animated.Text>
          
          <Animated.View 
            style={[
              styles.tableContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <TableHeader />
            <FlatList
              data={data}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              scrollEnabled={true}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            />
          </Animated.View>
        </>
      )}
      
      <ConversionsStatusModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        campaign_id={selectedConversion || ''}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  totalCount: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '600',
    color: '#4CD964',
  },
  tableContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    padding: 14,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  headerCell: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 16,
  },
  cell: {
    color: '#555',
    fontSize: 15,
  },
  numberCell: {
    width: '15%',
    paddingHorizontal: 8,
  },
  campaignCell: {
    width: '35%',
    paddingHorizontal: 8,
  },
  countsCell: {
    width: '25%',
    paddingHorizontal: 8,
  },
  conversionCell: {
    width: '30%',
    paddingHorizontal: 8,
    alignItems: 'flex-start',
  },
  statusContainer: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#4CD964',
  },
  listContent: {
    paddingBottom: 12,
  },
});

export default ConversionsScreen;
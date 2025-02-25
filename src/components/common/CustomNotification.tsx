import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CustomNotificationProps {
  visible: boolean;
  message: string;
  description?: string;
  onClose: () => void;
}

const CustomNotification: React.FC<CustomNotificationProps> = ({ 
  visible, 
  message, 
  description, 
  onClose 
}) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, 2000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <View style={styles.notificationContainer}>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationMessage}>{message}</Text>
        {description && (
          <Text style={styles.notificationDescription}>{description}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  notificationContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  notificationContent: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    minWidth: 200,
    maxWidth: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  notificationMessage: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  notificationDescription: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default CustomNotification;
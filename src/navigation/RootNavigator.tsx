import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
<<<<<<< HEAD
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import AuthNavigator from "./AuthNavigator";
import { RootStackParamList } from "../types/types";
import DrawerNavigator from "./DrawerNavigation";
=======
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "../context/AuthContext";
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WalletScreen from '../screens/WalletScreen';
import AuthNavigator from "./AuthNavigator";
import { RootStackParamList } from "../types/types";
>>>>>>> afe560583af16468ca5aaaf1dc2e1c1d8e271caf

const RootStack = createStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
<<<<<<< HEAD
      <View style={styles.loadingContainer}>
=======
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
>>>>>>> afe560583af16468ca5aaaf1dc2e1c1d8e271caf
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <RootStack.Navigator
<<<<<<< HEAD
          screenOptions={{
            headerShown: false
          }}
        >
          <RootStack.Screen 
            name="DrawerHome" 
            component={DrawerNavigator}
          />
=======
          initialRouteName="Home" screenOptions={{headerStyle: {backgroundColor: '#2563EB'},
            headerTintColor: '#fff',
            headerTitleStyle: {fontWeight: 'bold',}}}>
          <RootStack.Screen name="Home" component={HomeScreen} options={{title: 'Dashboard'}}/>
          <RootStack.Screen name="Profile" component={ProfileScreen}options={{title: 'My Profile'}}/>
          <RootStack.Screen name="Wallet" component={WalletScreen} options={{title: 'My Wallet'}}/>
>>>>>>> afe560583af16468ca5aaaf1dc2e1c1d8e271caf
        </RootStack.Navigator>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

<<<<<<< HEAD
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  }
});

=======
>>>>>>> afe560583af16468ca5aaaf1dc2e1c1d8e271caf
export default RootNavigator;
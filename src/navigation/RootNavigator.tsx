import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "../context/AuthContext";
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WalletScreen from '../screens/WalletScreen';
import AuthNavigator from "./AuthNavigator";
import { RootStackParamList } from "../types/types";

const RootStack = createStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <RootStack.Navigator
          initialRouteName="Home" screenOptions={{headerStyle: {backgroundColor: '#2563EB'},
            headerTintColor: '#fff',
            headerTitleStyle: {fontWeight: 'bold',}}}>
          <RootStack.Screen name="Home" component={HomeScreen} options={{title: 'Dashboard'}}/>
          <RootStack.Screen name="Profile" component={ProfileScreen}options={{title: 'My Profile'}}/>
          <RootStack.Screen name="Wallet" component={WalletScreen} options={{title: 'My Wallet'}}/>
        </RootStack.Navigator>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

export default RootNavigator;
import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Image, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import { ParamListBase } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { API } from '../constant/api';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

type LoginScreenNavigationProp = StackNavigationProp<ParamListBase, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setErrorMessage(''); 
  
    if (!username || !password) {
      setErrorMessage('Username and password are required');
      return;
    }
  
    try {
      const response = await axios.post(
        `${API}/api/login`,
        new URLSearchParams({
          grant_type: 'password',
          username,
          password,
          scope: '',
          client_id: '',
          client_secret: '',
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );  
      const token = response.data.access_token;
      await login(token, username);
  
      Alert.alert('Welcome Back!', 'Login successful');
    } catch (error: unknown) {  
      console.log("Error in request:", error);
  
      if (axios.isAxiosError(error)) {
        if (error.response) {
          if (error.response.status === 403) {
            const errorMessage = error.response.data.detail || 'Incorrect username or password';
            setErrorMessage(errorMessage);
          } else if (error.response.status === 422) {
            const errorDetail = error.response.data.detail?.[0]?.msg || 'Invalid credentials';
            setErrorMessage(errorDetail);
          } else {
            setErrorMessage('Something went wrong. Please try again');
          }
        }
      } else {
        setErrorMessage('Connection error. Please check your internet');
      }
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? "padding" : "height"} style={styles.mainContainer}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.topSection}>
            <Animated.Image entering={FadeInDown.delay(200).duration(500)}
              style={styles.imageStyle} 
              source={require('../../assets/images/Loginlogo.webp')} 
              resizeMode="contain"
            />
            <Animated.Text entering={FadeInDown.delay(200).duration(500)} style={styles.welcomeText}>Welcome Back!</Animated.Text>
            <Animated.Text entering={FadeInDown.delay(200).duration(500)} style={styles.subtitleText}>Sign in to continue</Animated.Text>
          </View>

          <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.formSection}>
            <View style={styles.inputContainer}>
              <View style={styles.iconContainer}>
                <Icon name="user" size={20} style={styles.icon} />
              </View>
              <TextInput 
                placeholder="Username" 
                value={username} 
                onChangeText={setUsername} 
                style={styles.input}
                autoCapitalize="none"
                placeholderTextColor="#9EA0A4"
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.iconContainer}>
                <Icon name="lock" size={20} style={styles.icon} />
              </View>
              <TextInput 
                placeholder="Password" 
                value={password} 
                onChangeText={setPassword} 
                secureTextEntry={!showPassword}
                style={styles.input}
                autoCapitalize="none"
                placeholderTextColor="#9EA0A4"
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)} 
                style={styles.eyeIcon}
              >
                <Icon 
                  name={showPassword ? "eye" : "eye-slash"} 
                  size={20} 
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>

            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Icon name="exclamation-circle" size={16} color="#FF4B55" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Sign In</Text>
              <Icon name="arrow-right" size={18} color="#FFF" style={styles.buttonIcon} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.SignupLink} onPress={() => navigation.navigate("Signup")}>
              <Text style={styles.SignupLinkText}>Don't have an account?</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
  },
  container: { 
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  topSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  formSection: {
    marginTop: 40,
    width: '100%', 
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 24,
  },
  subtitleText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
  },
  inputContainer: { 
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    padding: 16,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  icon: { 
    color: '#6B7280',
    width: 20,
  },
  input: { 
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  eyeIcon: {
    padding: 16,
  },
  button: { 
    flexDirection: 'row',
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: '#4F46E5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonText: { 
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: { 
    color: '#FF4B55',
    marginLeft: 8,
    fontSize: 14,
  },
  imageStyle: {
    width: width * 0.6,
    height: 120,
  },
  SignupLink: {
    alignItems: 'center',
    marginTop: 16,
  },
  SignupLinkText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LoginScreen;
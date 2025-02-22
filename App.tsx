import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { UserDetailsProvider } from './src/context/UserDetailsContext';

export default function App() {
  return (
    <AuthProvider>
      <UserDetailsProvider>
        <RootNavigator/>
      </UserDetailsProvider>
    </AuthProvider>
  )
}



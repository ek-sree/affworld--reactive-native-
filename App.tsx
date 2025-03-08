import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';
<<<<<<< HEAD
import { UserDetailsProvider } from './src/context/UserDetailsContext';
=======
>>>>>>> afe560583af16468ca5aaaf1dc2e1c1d8e271caf

export default function App() {
  return (
    <AuthProvider>
<<<<<<< HEAD
      <UserDetailsProvider>
        <RootNavigator/>
      </UserDetailsProvider>
=======
    <RootNavigator/>
>>>>>>> afe560583af16468ca5aaaf1dc2e1c1d8e271caf
    </AuthProvider>
  )
}



import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import GameScreen from './src/screens/GameScreen';
import HomeScreen from './src/screens/HomeScreen';
import LevelScreen from './src/screens/LevelScreen';
import VictoryScreen from './src/screens/VictoryScreen';
import { GameProvider } from './src/context/GameContext';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GameProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Level" component={LevelScreen} />
            <Stack.Screen name="Game" component={GameScreen} />
            <Stack.Screen name="Victory" component={VictoryScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GameProvider>
  );
}

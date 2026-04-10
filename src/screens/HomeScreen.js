import * as Font from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Dimensions, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { useGame } from '../context/GameContext';

const { width, height } = Dimensions.get('window');

const Particle = ({ i }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const startX = Math.random() * width;
  const size = Math.random() * 5 + 3;
  const duration = 15000 + Math.random() * 10000;
  const delay = Math.random() * 10000;

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 0 }), // Start at bottom
        withTiming(-1, { duration, easing: Easing.linear })
      ),
      -1,
      false
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 2000 }),
        withTiming(0, { duration: duration - 2000 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value * height }],
    opacity: opacity.value,
    left: startX,
    bottom: 0,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        animatedStyle,
        { width: size, height: size, borderRadius: size / 2 }
      ]}
    />
  );
};

export default function HomeScreen({ navigation }) {
  const { playBgMusic } = useGame();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const floatValue = useSharedValue(0);
  const glowValue = useSharedValue(0.5);

  useEffect(() => {
    // Basic font loading setup
    async function loadFonts() {
      await Font.loadAsync({
        'Inter-Bold': { uri: 'https://rsms.me/inter/font-files/Inter-Bold.woff2' }, // Just an example, normally local
      });
      setFontsLoaded(true);
    }
    loadFonts();

    floatValue.value = withRepeat(
      withSequence(
        withTiming(15, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    glowValue.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0.5, { duration: 1500 })
      ),
      -1,
      true
    );

    playBgMusic();
  }, []);

  const heroStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatValue.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowValue.value,
    transform: [{ scale: interpolate(glowValue.value, [0.5, 1], [1, 1.1]) }],
  }));

  const handlePlay = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://cdn.freesound.org/previews/273/273151_4486188-lq.mp3' } // Sweet pop/chime sound
      );
      await sound.playAsync();
    } catch (e) {
      console.log('Error playing sound');
    }
    navigation.navigate('Level');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Deep Background Gradient */}
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#0f172a']}
        style={StyleSheet.absoluteFill}
      />

      {/* Animated Particles */}
      {[...Array(25)].map((_, i) => (
        <Particle key={i} i={i} />
      ))}

      <SafeAreaView style={styles.safeArea}>
        {/* Title Section */}
        <View style={styles.titleContainer}>
          <View>
            <Text style={[styles.titleText, styles.titleShadowCrayon]}>CRAYON</Text>
            <Text style={[styles.titleText, styles.crayonText]}>CRAYON</Text>
          </View>
          <View style={{ marginTop: -15 }}>
            <Text style={[styles.titleText, styles.titleShadowCrush]}>CRUSH</Text>
            <Text style={[styles.titleText, styles.crushText]}>CRUSH</Text>
          </View>
        </View>

        {/* Hero Section */}
        <Animated.View style={[styles.heroContainer, heroStyle]}>
          <Animated.View style={[styles.haloEffect, glowStyle]} />
          <Image
            source={require('../../assets/hero.png')}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Play Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            activeOpacity={0.8} 
            style={styles.playButtonWrapper}
            onPress={handlePlay}
          >
            <LinearGradient
              colors={['#4ade80', '#166534']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.playButton}
            >
              <Text style={styles.playButtonText}>PLAY</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Navigation Bar */}
        <View style={styles.navBarContainer}>
          <LinearGradient
            colors={['#1e1b4b', '#0f172a']}
            style={styles.navBar}
          >
            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
              <View style={styles.activeNavCircle}>
                <Ionicons name="home" size={28} color="white" />
              </View>
              <Text style={styles.navTextActive}>LOBBY</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Level')}>
              <Ionicons name="map" size={24} color="#94a3b8" />
              <Text style={styles.navText}>MAP</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem}>
              <Ionicons name="trophy" size={24} color="#94a3b8" />
              <Text style={styles.navText}>VIP</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  particle: {
    position: 'absolute',
    backgroundColor: '#fde047',
  },
  titleContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 72,
    fontWeight: '900',
    textAlign: 'center',
    includeFontPadding: false,
  },
  titleShadowCrayon: {
    position: 'absolute',
    top: 5,
    color: '#9a3412', // Dark orange/brown
    width: '100%',
    textAlign: 'center',
  },
  titleShadowCrush: {
    position: 'absolute',
    top: 5,
    color: '#064e3b', // Dark green/blue
    width: '100%',
    textAlign: 'center',
  },
  crayonText: {
    color: '#fbbf24', // Brighter Gold
  },
  crushText: {
    color: '#06b6d4', // Cyan
  },
  heroContainer: {
    width: width * 0.85,
    height: width * 0.85,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  haloEffect: {
    position: 'absolute',
    width: '90%',
    height: '90%',
    borderRadius: 999,
    borderWidth: 8,
    borderColor: '#fbbf24',
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 40,
  },
  playButtonWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 12,
  },
  playButton: {
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#166534',
  },
  playButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 2,
  },
  navBarContainer: {
    width: '94%',
    height: 95,
    marginBottom: 5,
  },
  navBar: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 48,
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeNavCircle: {
    backgroundColor: '#f97316',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    borderWidth: 2,
    borderColor: '#ffedd5',
  },
  navText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 4,
  },
  navTextActive: {
    color: '#f97316',
    fontSize: 11,
    fontWeight: '900',
  },
});

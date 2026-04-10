import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming, withSequence, withDelay } from 'react-native-reanimated';
import { useGame } from '../context/GameContext';

const { width, height } = Dimensions.get('window');

const Confetti = ({ i }) => {
  const translateY = useSharedValue(-50);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);

  const startX = Math.random() * width;
  const size = Math.random() * 10 + 5;
  const duration = 2000 + Math.random() * 2000;
  const colors = ['#f43f5e', '#eab308', '#22c55e', '#3b82f6', '#a855f7'];
  const color = colors[i % colors.length];

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(height + 100, { duration, easing: Easing.linear }),
      -1,
      false
    );
    rotation.value = withRepeat(
      withTiming(360, { duration: 1500, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { rotate: `${rotation.value}deg` }],
    opacity: opacity.value,
    left: startX,
  }));

  return (
    <Animated.View
      style={[
        styles.confetti,
        animatedStyle,
        { width: size, height: size * 2, backgroundColor: color }
      ]}
    />
  );
};

export default function VictoryScreen({ route, navigation }) {
  const { playBgMusic } = useGame();
  const { colorUnlocked } = route.params || { colorUnlocked: '#eab308' };

  useEffect(() => {
    playBgMusic();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f172a', '#1e293b', '#0f172a']} style={StyleSheet.absoluteFill} />

      {/* Confetti Setup */}
      {[...Array(40)].map((_, i) => (
        <Confetti key={i} i={i} />
      ))}

      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        
        <View style={styles.mainContent}>
          <View style={styles.card}>
            
            {/* Stars Row */}
            <View style={styles.starsRow}>
              <Ionicons name="star" size={24} color="#fef08a" />
              <Ionicons name="star" size={32} color="#fef08a" style={{ marginHorizontal: 10, marginTop: -15 }} />
              <Ionicons name="star" size={24} color="#fef08a" />
            </View>

            <Text style={styles.titleText}>AWESOME!</Text>

            <View style={styles.rewardBox}>
              {/* Fallback to simple Crayon render since no image provided yet */}
              <View style={[styles.miniCrayon, { backgroundColor: colorUnlocked }]} />
              <View style={styles.newUnlockTag}>
                <Text style={styles.newUnlockText}>NEW UNLOCK</Text>
              </View>
            </View>

            <Text style={styles.rewardSubtitle}>REWARD UNLOCKED</Text>
            <Text style={styles.rewardItem}>ROYAL GOLD CRAYON</Text>

            <TouchableOpacity 
              activeOpacity={0.8}
              style={styles.nextBtnWrapper}
              onPress={() => navigation.navigate('Level')}
            >
              <LinearGradient colors={['#22c55e', '#16a34a']} style={styles.nextBtn}>
                <Text style={styles.nextBtnText}>NEXT LEVEL </Text>
                <Ionicons name="chevron-forward" size={18} color="white" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.replayBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="reload" size={16} color="#c4b5fd" />
              <Text style={styles.replayText}> REPLAY</Text>
            </TouchableOpacity>

          </View>
        </View>

        {/* Bottom Nav (VIP Highlighted) */}
        <View style={styles.navBarContainer}>
          <LinearGradient colors={['#1e1b4b', '#0f172a']} style={styles.navBar}>
            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
              <Ionicons name="home-outline" size={24} color="#94a3b8" />
              <Text style={styles.navText}>LOBBY</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Level')}>
              <Ionicons name="map-outline" size={24} color="#94a3b8" />
              <Text style={styles.navText}>MAP</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem}>
              <View style={styles.activeNavCircle}>
                <Ionicons name="trophy" size={24} color="white" />
              </View>
              <Text style={styles.navTextActive}>VIP</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, alignItems: 'center' },
  confetti: { position: 'absolute', top: -50 },
  mainContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '85%',
    backgroundColor: 'rgba(30, 27, 75, 0.7)',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#4c1d95',
    padding: 30,
    alignItems: 'center',
    shadowColor: '#fcd34d',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#fbbf24',
    fontStyle: 'italic',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    marginBottom: 30,
  },
  rewardBox: {
    width: 140,
    height: 140,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4c1d95',
    marginBottom: 30,
  },
  miniCrayon: {
    width: 30,
    height: 80,
    borderRadius: 5,
  },
  newUnlockTag: {
    position: 'absolute',
    bottom: -15,
    backgroundColor: '#3b0764',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fef08a',
  },
  newUnlockText: {
    color: '#fef08a',
    fontSize: 10,
    fontWeight: '900',
  },
  rewardSubtitle: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },
  rewardItem: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 5,
    marginBottom: 30,
  },
  nextBtnWrapper: {
    width: '100%',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    marginBottom: 20,
  },
  nextBtn: {
    height: 55,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
  },
  replayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  replayText: {
    color: '#c4b5fd',
    fontSize: 12,
    fontWeight: '800',
  },
  navBarContainer: {
    width: '94%',
    height: 80,
    marginBottom: 5,
  },
  navBar: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 40,
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'space-around',
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
    marginBottom: 5,
    borderWidth: 3,
    borderColor: '#ffedd5',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
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

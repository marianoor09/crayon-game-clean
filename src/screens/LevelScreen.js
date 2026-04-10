import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../context/GameContext';

export default function LevelScreen({ navigation }) {
  const { currentLevel, playBgMusic } = useGame();

  useEffect(() => {
    playBgMusic();
  }, []);

  // Create an array of 24 levels
  const levels = Array.from({ length: 24 }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f172a', '#1e293b', '#0f172a']} style={StyleSheet.absoluteFill} />

      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={['#2e1065', '#1e1b4b']}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#fef08a" />
            </TouchableOpacity>

            <View style={styles.levelContainer}>
              <Text style={styles.levelTitle}>LEVEL SELECTION</Text>
              <Text style={styles.levelSub}>120 CRAYONS TO UNLOCK</Text>
            </View>

            <View >

            </View>
          </LinearGradient>
        </View>

        {/* Title Area */}
        <View style={styles.titleArea}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="trophy" size={24} color="#fef08a" style={{ marginRight: 10 }} />
            <Text style={styles.mainTitle}>LEVELS</Text>
            <Ionicons name="trophy" size={24} color="#fef08a" style={{ marginLeft: 10 }} />
          </View>
          <Text style={styles.subtitle}>CHOOSE YOUR CHALLENGE</Text>
        </View>

        {/* Level List */}
        <ScrollView style={styles.levelsList} contentContainerStyle={styles.levelsListContent}>
          {levels.map((level) => {
            const isUnlocked = level <= currentLevel;
            const isActive = level === currentLevel;

            if (isUnlocked) {
              return (
                <TouchableOpacity
                  key={level}
                  style={[styles.levelCard, isActive && styles.activeLevelCard]}
                  onPress={() => navigation.navigate('Game', { targetLevel: level })}
                >
                  <Text style={styles.levelCardText}>{level}</Text>
                  <View style={styles.starsRow}>
                    <Ionicons name="star" size={12} color="#fef08a" />
                    <Ionicons name="star" size={16} color="#fef08a" style={{ marginHorizontal: 4 }} />
                    <Ionicons name="star" size={12} color="#fef08a" />
                  </View>
                </TouchableOpacity>
              );
            }

            // Locked Level
            return (
              <View key={level} style={styles.lockedCard}>
                <Text style={[styles.levelCardText, { opacity: 0.4 }]}>{level}</Text>
                <View style={StyleSheet.absoluteFillObject}>
                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="lock-closed" size={28} color="#fef08a" opacity={0.6} />
                  </View>
                </View>
              </View>
            );
          })}


        </ScrollView>

        {/* Bottom Nav (MAP Highlighted) */}
        <View style={styles.navBarContainer}>
          <LinearGradient colors={['#1e1b4b', '#0f172a']} style={styles.navBar}>
            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
              <Ionicons name="home-outline" size={24} color="#94a3b8" />
              <Text style={styles.navText}>LOBBY</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Level')}>
              <View style={styles.activeNavCircle}>
                <Ionicons name="map" size={28} color="white" />
              </View>
              <Text style={styles.navTextActive}>MAP</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem}>
              <Ionicons name="trophy-outline" size={24} color="#94a3b8" />
              <Text style={styles.navText}>VIP</Text>
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
  header: {
    width: '90%',
    height: 60,
    marginTop: 10,
    shadowColor: '#fef08a',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  headerGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 30,
    paddingHorizontal: 15,
    borderWidth: 2,
    borderColor: '#fef08a',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3b0764',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelContainer: { alignItems: 'center' },
  levelTitle: {
    color: '#fef08a',
    fontSize: 20,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: 1,
  },
  levelSub: {
    color: '#c4b5fd',
    fontSize: 10,
    fontWeight: '700',
    marginTop: -2,
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b0764',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  coinText: { color: '#fef08a', fontWeight: '800', marginRight: 5 },
  titleArea: {
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 32,
    color: 'white',
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: 2,
  },
  subtitle: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 5,
  },
  levelsList: {
    flex: 1,
    width: '100%',
  },
  levelsListContent: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  levelCard: {
    width: 120,
    height: 120,
    backgroundColor: '#172554', // Dark blue background for unlocked
    borderRadius: 25,
    marginVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  activeLevelCard: {
    borderWidth: 4,
    borderColor: '#f59e0b', // Glowing orange
    backgroundColor: '#1e3a8a',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  levelCardText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fef08a',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 5,
  },
  lockedCard: {
    width: 120,
    height: 120,
    backgroundColor: '#0f172a',
    borderRadius: 25,
    marginVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
  },
  vipCard: {
    width: '90%',
    height: 100,
    marginTop: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  vipGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  vipTitle: {
    color: '#fef08a',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 5,
  },
  vipSub: {
    color: '#94a3b8',
    fontSize: 12,
  },
  chestGlow: {
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  navBarContainer: {
    width: '94%',
    height: 80,
    marginBottom: 5,
    marginTop: 10,
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

import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, runOnJS } from 'react-native-reanimated';
import MaskedView from '@react-native-masked-view/masked-view';
import { Canvas, Path, Group, Skia, Rect } from '@shopify/react-native-skia';

const { width, height } = Dimensions.get('window');
const WRAPPER_WIDTH = 62;
const WRAPPER_HEIGHT = height * 0.65 - 80; // approximate wrapper height

export default function GameScreen({ navigation }) {
  const [unwrapped, setUnwrapped] = useState(false);
  const path = useSharedValue(Skia.Path.Make());

  const checkUnwrapped = () => {
    // A simplified heuristic: if user plays around for a while, mark it as unwrapped.
    // Real complete calculation might involve checking path bounds.
    setUnwrapped(true);
  };

  const pan = Gesture.Pan()
    .onBegin((e) => {
      if (!unwrapped) {
        const newPath = path.value.copy();
        newPath.moveTo(e.x, e.y);
        newPath.lineTo(e.x, e.y); // just to start the dot
        path.value = newPath;
      }
    })
    .onUpdate((e) => {
      if (!unwrapped) {
        const newPath = path.value.copy();
        newPath.lineTo(e.x, e.y);
        path.value = newPath;
      }
    })
    .onEnd(() => {
      if (!unwrapped) {
        runOnJS(checkUnwrapped)();
      }
    });

  const WrapperElement = (
    <LinearGradient
      colors={['#fffbeb', '#fef3c7', '#fcd34d']}
      style={styles.wrapperBg}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <View style={styles.wrapperLine} />
      <Ionicons name="color-palette" size={28} color="#000" style={{ marginTop: 15 }} />
      <Text style={styles.wrapperText}>BLUE</Text>
      <Ionicons name="sparkles" size={28} color="#000" style={{ marginBottom: 15 }} />
      <View style={styles.wrapperLine} />
    </LinearGradient>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LinearGradient colors={['#0f172a', '#1e293b', '#0f172a']} style={styles.container}>
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
                <Ionicons name="arrow-back" size={24} color="#fca5a5" />
              </TouchableOpacity>
              
              <View style={styles.levelContainer}>
                <Text style={styles.levelTitle}>LEVEL 1</Text>
                <Text style={styles.levelSub}>2/5 CRAYON COMPLETED</Text>
              </View>
              
              <View style={styles.coinBadge}>
                <Text style={styles.coinText}>120</Text>
                <MaterialCommunityIcons name="currency-usd-circle" size={20} color="#fef08a" />
              </View>
            </LinearGradient>
          </View>

          <View style={styles.mainContent}>
            {/* Left Playing Area */}
            <View style={styles.playArea}>
              
              {/* Crayon Composition */}
              <View style={styles.crayonContainer}>
                {/* The Stick (Blue) */}
                <View style={styles.crayonTop} />
                <View style={styles.crayonBody} />
                <View style={styles.crayonBottom} />

                {/* The Scratchable Wrapper */}
                <View style={styles.wrapperPositioner}>
                  <GestureDetector gesture={pan}>
                    <MaskedView
                      style={styles.maskedContainer}
                      maskElement={
                        <Canvas style={{ flex: 1 }}>
                          <Group layer={true}>
                            <Rect x={0} y={0} width={WRAPPER_WIDTH} height={500} color="black" />
                            <Path
                              path={path}
                              color="transparent"
                              style="stroke"
                              strokeWidth={35}
                              strokeCap="round"
                              strokeJoin="round"
                              blendMode="clear"
                            />
                          </Group>
                        </Canvas>
                      }
                    >
                      {WrapperElement}
                    </MaskedView>
                  </GestureDetector>
                </View>
              </View>

              {/* Instructions */}
              <View style={styles.instructionPill}>
                <Text style={styles.instructionText}>
                  {unwrapped ? 'UNWRAPPED!' : 'SCRATCH TO\nUNWRAP!'}
                </Text>
              </View>
            </View>

            {/* Right Progress Sidebar */}
            <View style={styles.progressSidebar}>
              <Text style={styles.progressTitle}>PROGRESS</Text>
              
              <View style={styles.progressList}>
                {/* Completed 1 */}
                <View style={[styles.progressItem, { backgroundColor: '#be123c' }]}>
                  <Ionicons name="checkmark-circle" size={20} color="#fecdd3" style={styles.progressIcon} />
                </View>
                {/* Completed 2 */}
                <View style={[styles.progressItem, { backgroundColor: '#ea580c' }]}>
                  <Ionicons name="checkmark-circle" size={20} color="#ffedd5" style={styles.progressIcon} />
                </View>
                {/* Current (Blue) */}
                <View style={styles.progressCurrentRing}>
                  <View style={[styles.progressItem, { backgroundColor: '#06b6d4', height: 45 }]} />
                </View>
                {/* Locked 1 */}
                <View style={[styles.progressItem, { backgroundColor: '#475569' }]}>
                  <Ionicons name="lock-closed" size={16} color="#64748b" style={styles.progressIcon} />
                </View>
                {/* Locked 2 */}
                <View style={[styles.progressItem, { backgroundColor: '#475569' }]}>
                  <Ionicons name="lock-closed" size={16} color="#64748b" style={styles.progressIcon} />
                </View>
              </View>
            </View>
          </View>

          {/* Bottom Nav */}
          <View style={styles.navBarContainer}>
            <LinearGradient colors={['#1e1b4b', '#0f172a']} style={styles.navBar}>
              <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
                <Ionicons name="home-outline" size={24} color="#94a3b8" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.navItem}>
                <View style={styles.activeNavCircle}>
                  <Ionicons name="pencil" size={28} color="white" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.navItem}>
                <Ionicons name="shapes-outline" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </LinearGradient>
          </View>

        </SafeAreaView>
      </LinearGradient>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
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
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    marginTop: 20,
    marginBottom: 10,
  },
  playArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressSidebar: {
    width: 90,
    backgroundColor: '#1e1b4b',
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
    paddingVertical: 20,
    alignItems: 'center',
    borderLeftWidth: 2,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#fef08a',
  },
  progressTitle: {
    color: '#fef08a',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 20,
    letterSpacing: 1,
  },
  progressList: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  progressItem: {
    width: 25,
    height: 35,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressIcon: { position: 'absolute' },
  progressCurrentRing: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#06b6d4',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  crayonContainer: {
    width: 80,
    height: '65%',
    alignItems: 'center',
    transform: [{ rotate: '-8deg' }],
  },
  crayonTop: {
    width: 60,
    height: 60,
    backgroundColor: '#22d3ee',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  crayonBody: {
    width: 60,
    flex: 1,
    backgroundColor: '#06b6d4',
  },
  crayonBottom: {
    width: 60,
    height: 20,
    backgroundColor: '#0891b2',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  wrapperPositioner: {
    position: 'absolute',
    top: 50,
    bottom: 30,
    width: WRAPPER_WIDTH,
  },
  maskedContainer: {
    flex: 1,
  },
  wrapperBg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  wrapperLine: {
    width: '80%',
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  wrapperText: {
    color: '#000',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
    transform: [{ rotate: '90deg' }],
    marginVertical: 35,
  },
  instructionPill: {
    backgroundColor: '#2e1065',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    marginTop: 40,
  },
  instructionText: {
    color: '#fef08a',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 22,
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
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#ffedd5',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
});

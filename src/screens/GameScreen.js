import { Ionicons } from '@expo/vector-icons';
import { Canvas, Circle, Group, Mask, Path, Rect, Skia, Text as SkiaText, useFont } from '@shopify/react-native-skia';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../context/GameContext';

const { width, height } = Dimensions.get('window');
const WRAPPER_WIDTH = 62;
const TOTAL_CRAYON_HEIGHT = height * 0.50;
const WRAPPER_HEIGHT = TOTAL_CRAYON_HEIGHT - 80; // 40 (top) + 40 (bottom)

const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);

const TopStar = ({ index, activeIndex, unwrapped }) => {
  const isUnlocked = index < activeIndex;
  const isJustUnwrapped = index === activeIndex && unwrapped;
  const isActive = isUnlocked || isJustUnwrapped;

  const scale = useSharedValue(isActive ? 1 : 0.6);
  const opacity = useSharedValue(isActive ? 1 : 0.3);

  useEffect(() => {
    if (isJustUnwrapped) {
      scale.value = withSequence(withTiming(1.8, { duration: 250 }), withSpring(1));
      opacity.value = withTiming(1, { duration: 200 });
    } else if (isUnlocked) {
      scale.value = 1;
      opacity.value = 1;
    } else {
      scale.value = 0.6;
      opacity.value = 0.3;
    }
  }, [isUnlocked, isJustUnwrapped]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <AnimatedIcon
      name="star"
      size={18}
      color="#fef08a"
      style={[{ marginHorizontal: 2 }, style]}
    />
  );
};

export default function GameScreen({ navigation, route }) {
  const { targetLevel } = route.params || { targetLevel: 1 };
  const { unlockedCrayons, currentLevel, crayonsInCurrentLevel, unlockNextCrayon, getCrayonColorData, playBgMusic, pauseBgMusic } = useGame();

  // Local state for the specific crayon within the selected level
  const [currentCrayonIdx, setCurrentCrayonIdx] = useState(() => {
    return targetLevel < currentLevel ? 0 : crayonsInCurrentLevel;
  });

  const font = useFont(Platform.select({ android: 'Roboto', ios: 'Arial' }), 24);
  const smallFont = useFont(Platform.select({ android: 'Roboto', ios: 'Arial' }), 12);

  const [unwrapped, setUnwrapped] = useState(false);
  const isUnwrapped = useSharedValue(false);
  const scratchedRegions = useSharedValue(0);
  const scratchScore = useSharedValue(0);
  const [scratchSound, setScratchSound] = useState(null);
  const [successSound, setSuccessSound] = useState(null);
  const path = useSharedValue(Skia.Path.Make());
  const lastScratchTime = useRef(0);
  const currentGlobalIdx = (targetLevel - 1) * 5 + currentCrayonIdx;
  const activeColorData = getCrayonColorData(currentGlobalIdx);
  const activeColor = activeColorData.core;

  useEffect(() => {
    async function initSound() {
      const { sound: sq } = await Audio.Sound.createAsync(
        require('../../assets/wrapper.mp3'),
        { isLooping: true }
      );
      const { sound: win } = await Audio.Sound.createAsync(
        require('../../assets/sparkling.wav')
      );
      setScratchSound(sq);
      setSuccessSound(win);
    }
    initSound();

    pauseBgMusic();

    return () => {
      scratchSound?.unloadAsync();
      successSound?.unloadAsync();
      playBgMusic();
    };
  }, []);

  const triggerHaptic = () => {
    const now = Date.now();
    if (now - lastScratchTime.current > 150) {
      lastScratchTime.current = now;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const playScratchFeedback = async () => {
    if (scratchSound) {
      const status = await scratchSound.getStatusAsync();
      if (!status.isPlaying && !isUnwrapped.value) {
        await scratchSound.playAsync();
      }
    }
  };

  const stopScratchFeedback = async () => {
    if (scratchSound) {
      await scratchSound.pauseAsync();
    }
  };

  const playSuccessFeedback = async () => {
    if (scratchSound) {
      await scratchSound.stopAsync();
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (successSound) {
      await successSound.playFromPositionAsync(0);
    }
  };

  const checkUnwrapped = () => {
    setUnwrapped((prev) => {
      if (!prev) {
        isUnwrapped.value = true;
        playSuccessFeedback();

        setTimeout(() => {
          // If we are playing the current 'latest' crayon, advance global progress
          if (currentGlobalIdx === unlockedCrayons) {
            unlockNextCrayon();
          }

          const nextLocalIdx = currentCrayonIdx + 1;

          if (nextLocalIdx === 5) {
            navigation.replace('Victory', { colorUnlocked: activeColor });
          } else {
            // Reset canvas for next crayon color automatically!
            setCurrentCrayonIdx(nextLocalIdx);
            isUnwrapped.value = false;
            scratchedRegions.value = 0;
            scratchScore.value = 0;
            setUnwrapped(false);
            path.value = Skia.Path.Make();
          }
        }, 2000);
      }
      return true;
    });
  };

  const pan = Gesture.Pan()
    .onBegin((e) => {
      if (!isUnwrapped.value) {
        runOnJS(playScratchFeedback)();
        const newPath = path.value.copy();
        newPath.moveTo(e.x, e.y);
        newPath.lineTo(e.x, e.y); // just to start the dot
        path.value = newPath;
      }
    })
    .onUpdate((e) => {
      if (!isUnwrapped.value) {
        runOnJS(triggerHaptic)();
        const newPath = path.value.copy();
        newPath.lineTo(e.x, e.y);
        path.value = newPath;

        scratchScore.value += 1;

        // Calculate which region (0-19) the finger is in
        const regionIndex = Math.floor((e.y / WRAPPER_HEIGHT) * 20);
        if (regionIndex >= 0 && regionIndex < 20) {
          scratchedRegions.value = scratchedRegions.value | (1 << regionIndex);
        }

        // Count set bits
        let bits = scratchedRegions.value;
        let count = 0;
        while (bits > 0) {
          if (bits & 1) count++;
          bits >>= 1;
        }

        if (count >= 12 && scratchScore.value > 120) {
          console.log(`[Scratch] Win Triggered! Regions: ${count}, Score: ${scratchScore.value}`);
          runOnJS(checkUnwrapped)();
        } else {
          // Log progress occasionally to avoid spamming too much
          if (scratchScore.value % 50 === 0) {
            console.log(`[Scratch] Progress - Regions: ${count}, Score: ${scratchScore.value}`);
          }
        }
      }
    })
    .onEnd(() => {
      if (!isUnwrapped.value) {
        runOnJS(stopScratchFeedback)();
      }
    })
    .onFinalize(() => {
      runOnJS(stopScratchFeedback)();
    });



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
                <Text style={styles.levelTitle}>LEVEL {targetLevel}</Text>
                <Text style={styles.levelSub}>{currentCrayonIdx}/5 CRAYON COMPLETED</Text>
              </View>

              <View style={styles.starsBadge}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <TopStar
                    key={i}
                    index={i}
                    activeIndex={currentCrayonIdx}
                    unwrapped={unwrapped}
                  />
                ))}
              </View>
            </LinearGradient>
          </View>

          <View style={styles.mainContent}>
            {/* Left Playing Area */}
            <View style={styles.playArea}>

              {/* Crayon Composition */}
              <View style={styles.crayonContainer}>
                {/* Dynamic Stick (Uses Context Colors) */}
                <View style={[styles.crayonTop, { backgroundColor: activeColorData.top }]} />
                <View style={[styles.crayonBody, { backgroundColor: activeColorData.core }]} />
                <View style={[styles.crayonBottom, { backgroundColor: activeColorData.bottom }]} />

                {/* The Scratchable Wrapper (Pure Skia Implementation) */}
                <View style={[styles.wrapperPositioner, { height: WRAPPER_HEIGHT }]}>
                  <GestureDetector gesture={pan} key={`crayon-${currentCrayonIdx}`}>
                    <Canvas style={styles.maskCanvas}>
                      <Mask
                        mode="alpha"
                        mask={
                          <Group>
                            <Rect x={0} y={0} width={WRAPPER_WIDTH} height={WRAPPER_HEIGHT} color="white" />
                            <Path
                              path={path}
                              color="black"
                              style="stroke"
                              strokeWidth={85}
                              strokeCap="round"
                              strokeJoin="round"
                              blendMode="clear"
                            />
                          </Group>
                        }
                      >
                        {/* Sticker Background (Light Cream/White) */}
                        <Rect x={0} y={0} width={WRAPPER_WIDTH} height={WRAPPER_HEIGHT} color={activeColorData.wrapperColors[0]} />

                        {/* Palette Icon Section */}
                        <Group transform={[{ translate: [WRAPPER_WIDTH / 2, 65] }]}>
                          <Circle cx={0} cy={0} r={12} color="#0f172a" />
                          <Circle cx={-4} cy={-3} r={2.5} color={activeColorData.core} />
                          <Circle cx={4} cy={-3} r={2.5} color={activeColorData.top} />
                          <Circle cx={0} cy={4} r={2.5} color={activeColorData.bottom} />
                        </Group>

                        {/* Top Divider Line (Below Palette) */}
                        <Rect x={10} y={100} width={WRAPPER_WIDTH - 20} height={1.5} color="rgba(15,23,42,0.15)" />

                        {/* Color Name (Vertical & Centered) */}
                        {font && activeColorData.name && (
                          <Group transform={[{ translate: [WRAPPER_WIDTH / 2 + 8, WRAPPER_HEIGHT / 2] }, { rotate: Math.PI / 2 }]}>
                            <SkiaText
                              text={activeColorData.name}
                              x={-(font.measureText(activeColorData.name).width / 2)}
                              y={0}
                              font={font}
                              color="#0f172a"
                            />
                          </Group>
                        )}

                        {/* Bottom Divider Line (Above Sparkles) */}
                        <Rect x={10} y={WRAPPER_HEIGHT - 100} width={WRAPPER_WIDTH - 20} height={1.5} color="rgba(15,23,42,0.15)" />

                        {/* Sparkle Icon Section */}
                        <Group transform={[{ translate: [WRAPPER_WIDTH / 2, WRAPPER_HEIGHT - 65] }]}>
                          <Circle cx={0} cy={0} r={10} color="#0f172a" />
                          <Path
                            path="M0-12 L2-2 L12 0 L2 2 L0 12 L-2 2 L-12 0 L-2-2 Z"
                            color="white"
                            transform={[{ scale: 0.5 }]}
                          />
                          <Circle cx={6} cy={6} r={3.5} color="#0f172a" />
                          <Circle cx={6} cy={6} r={1.5} color="white" />
                        </Group>
                      </Mask>
                    </Canvas>
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
                {[0, 1, 2, 3, 4].map((idx) => {
                  const targetSlotGlobalIdx = (targetLevel - 1) * 5 + idx;
                  const targetData = getCrayonColorData(targetSlotGlobalIdx);

                  if (idx < currentCrayonIdx) {
                    // Completed in this session
                    return (
                      <View key={idx} style={[styles.progressItem, { backgroundColor: targetData.core }]}>
                        <Ionicons name="checkmark-circle" size={20} color="rgba(255,255,255,0.8)" style={styles.progressIcon} />
                      </View>
                    );
                  } else if (idx === currentCrayonIdx) {
                    // Current Active
                    return (
                      <View key={idx} style={[styles.progressCurrentRing, { borderColor: activeColor }]}>
                        <View style={[styles.progressItem, { backgroundColor: activeColor, height: 45 }]} />
                      </View>
                    );
                  } else {
                    // Future in this level
                    return (
                      <View key={idx} style={[styles.progressItem, { backgroundColor: targetData.core }]}>
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12 }]} />
                        {targetSlotGlobalIdx > unlockedCrayons && (
                          <Ionicons name="lock-closed" size={16} color="rgba(255,255,255,0.7)" style={styles.progressIcon} />
                        )}
                      </View>
                    );
                  }
                })}
              </View>
            </View>
          </View>

          {/* Bottom Nav */}
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
  starsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b0764',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#7e22ce',
  },
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
    height: TOTAL_CRAYON_HEIGHT,
    alignItems: 'center',
    transform: [{ rotate: '-8deg' }],
  },
  crayonTop: {
    width: 60,
    height: 40,
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
    height: 40,
    backgroundColor: '#0891b2',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  wrapperPositioner: {
    position: 'absolute',
    top: 40,
    bottom: 40,
    width: WRAPPER_WIDTH,
    zIndex: 10,
    elevation: 10,
  },
  maskedContainer: {
    flex: 1,
    width: WRAPPER_WIDTH,
  },
  maskElementContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  maskCanvas: {
    flex: 1,
  },
  stickerWrapper: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 5,
    overflow: 'hidden',
  },
  wrapperBg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  wrapperTopDecor: {
    width: '100%',
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  wrapperBottomDecor: {
    width: '100%',
    height: 15,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderTopWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  stickerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapperText: {
    color: '#1e293b',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 4,
    transform: [{ rotate: '90deg' }],
    marginVertical: 45,
    opacity: 0.8,
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
  navText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 4,
  },
});

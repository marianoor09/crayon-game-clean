import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';

const GameContext = createContext();

function hslToHex(h, s, l) {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export const GameProvider = ({ children }) => {
  const [unlockedCrayons, setUnlockedCrayons] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const bgMusicRef = useRef(null);

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const stored = await AsyncStorage.getItem('@unlockedCrayons');
        if (stored !== null) setUnlockedCrayons(parseInt(stored, 10));
      } catch (e) {
        console.warn('Error reading from local storage', e);
      }
      setIsLoaded(true);
    };

    const initMusic = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/game-background.mp3'),
          { isLooping: true, volume: 0.3 }
        );
        bgMusicRef.current = sound;
        await sound.playAsync();
      } catch (e) {
        console.warn('Failed to load background music', e);
      }
    };

    loadStoredData();
    initMusic();

    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.unloadAsync();
      }
    };
  }, []);

  const playBgMusic = async () => {
    if (bgMusicRef.current) {
      const status = await bgMusicRef.current.getStatusAsync();
      if (!status.isPlaying) await bgMusicRef.current.playAsync();
    }
  };

  const pauseBgMusic = async () => {
    if (bgMusicRef.current) {
      await bgMusicRef.current.pauseAsync();
    }
  };

  const currentLevel = Math.floor(unlockedCrayons / 5) + 1;
  const crayonsInCurrentLevel = unlockedCrayons % 5;

  const unlockNextCrayon = async () => {
    const nextVal = Math.min(unlockedCrayons + 1, 120);
    setUnlockedCrayons(nextVal);
    try {
      await AsyncStorage.setItem('@unlockedCrayons', nextVal.toString());
    } catch (e) {}
  };

  const getCrayonColorData = (index) => {
    const hue = Math.floor((index * 137.5) % 360);
    
    return {
      core: hslToHex(hue, 90, 45),
      top: hslToHex(hue, 90, 55),
      bottom: hslToHex(hue, 90, 30),
      wrapperColors: [
        hslToHex(hue, 45, 95),
        hslToHex(hue, 55, 85),
        hslToHex(hue, 60, 75)
      ]
    };
  };

  const resetProgress = async () => {
    setUnlockedCrayons(0);
    await AsyncStorage.removeItem('@unlockedCrayons');
  };

  if (!isLoaded) return null;

  return (
    <GameContext.Provider
      value={{
        unlockedCrayons,
        currentLevel,
        crayonsInCurrentLevel,
        unlockNextCrayon,
        getCrayonColorData,
        resetProgress,
        playBgMusic,
        pauseBgMusic
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);

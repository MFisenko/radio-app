import { useEffect, useState } from 'react';
import { View, StyleSheet, Button, Text } from 'react-native';
import {
  useAudioPlayer,
  useAudioPlayerStatus,
  setAudioModeAsync,
} from 'expo-audio';

const audioSource =
  'https://radio.dc.beltelecom.by/radiusfm/radiusfm.stream/playlist.m3u8';

export default function App() {
  const [error, setError] = useState<string | null>(null);

  const player = useAudioPlayer(audioSource);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    async function setup() {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          interruptionMode: 'doNotMix',
        });
      } catch (err) {
        setError(`Audio setup failed: ${String(err)}`);
      }
    }

    setup();

    return () => {
      try {
        player.setActiveForLockScreen(false);
        player.pause();
      } catch {}
    };
  }, [player]);

  const activateControls = () => {
    player.setActiveForLockScreen(
      true,
      {
        title: 'Radius FM',
        artist: 'Live Radio',
        albumTitle: 'Radio Stream',
      },
      {
        showSeekBackward: false,
        showSeekForward: false,
      }
    );
  };

  const handlePlay = () => {
    try {
      setError(null);
      activateControls();
      player.play();
    } catch (err) {
      setError(`Play failed: ${String(err)}`);
    }
  };

  const handlePause = () => {
    try {
      setError(null);
      player.pause();
    } catch (err) {
      setError(`Pause failed: ${String(err)}`);
    }
  };

  const handleStop = () => {
    try {
      setError(null);
      player.pause();
      player.setActiveForLockScreen(false);
    } catch (err) {
      setError(`Stop failed: ${String(err)}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Radio Player</Text>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <Text style={styles.status}>
          {status.playing ? 'Playing' : 'Paused'}
        </Text>
      )}

      <View style={styles.button}>
        <Button title="Play" onPress={handlePlay} />
      </View>

      <View style={styles.button}>
        <Button title="Pause" onPress={handlePause} />
      </View>

      <View style={styles.button}>
        <Button title="Stop" onPress={handleStop} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 12,
  },
  status: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  error: {
    fontSize: 14,
    textAlign: 'center',
    color: 'red',
    marginBottom: 20,
  },
  button: {
    marginBottom: 12,
  },
});
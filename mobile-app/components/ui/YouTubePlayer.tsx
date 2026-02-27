import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../../context/ThemeContext';
import { SPACING, BORDER_RADIUS } from '../../constants/config';

interface YouTubePlayerProps {
  videoId: string;
  thumbnail?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onError?: (error: any) => void;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  thumbnail,
  onPlay,
  onPause,
  onError,
}) => {
  const { colors } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);

  const handlePlay = () => {
    setIsPlaying(true);
    setShowPlayer(true);
    onPlay?.();
  };

  const handlePause = () => {
    setIsPlaying(false);
    onPause?.();
  };

  const handleError = (error: any) => {
    console.error('YouTube Player Error:', error);
    onError?.(error);
  };

  const getYouTubeEmbedUrl = (id: string) => {
    return `https://www.youtube.com/embed/${id}?autoplay=1&playsinline=1&rel=0&showinfo=0&modestbranding=1`;
  };

  if (!showPlayer) {
    return (
      <TouchableOpacity
        style={[styles.thumbnailContainer, { backgroundColor: colors.surface }]}
        onPress={handlePlay}
        activeOpacity={0.8}
      >
        <View style={styles.playButton}>
          <Text style={styles.playButtonText}>▶</Text>
        </View>
        <Text style={[styles.thumbnailText, { color: colors.textSecondary }]}>
          Tap to play YouTube video
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <WebView
        style={styles.webview}
        source={{ uri: getYouTubeEmbedUrl(videoId) }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        onError={handleError}
        onMessage={(event) => {
          const data = event.nativeEvent.data;
          if (data === 'ended') {
            handlePause();
          }
        }}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    marginVertical: SPACING.sm,
  },
  thumbnailContainer: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.sm,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  playButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  thumbnailText: {
    fontSize: 14,
  },
  webview: {
    height: 200,
  },
});

export default YouTubePlayer;
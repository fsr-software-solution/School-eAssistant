import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { useTheme } from '../../context/ThemeContext';
import { SPACING, BORDER_RADIUS } from '../../constants/config';

interface YouTubePlayerProps {
  videoId: string;
  height?: number;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  height = 250,
}) => {
  const { colors } = useTheme();
  const [playing, setPlaying] = useState(false);

  const onStateChange = useCallback((state: string) => {
    if (state === 'ended') {
      setPlaying(false);
    }
  }, []);

  return (
    <View style={[styles.container, { height, backgroundColor: colors.surface }]}>
      <YoutubePlayer
        height={height}
        play={playing}
        videoId={videoId}
        onChangeState={onStateChange}
        webViewStyle={{
          borderRadius: BORDER_RADIUS.md,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    marginVertical: SPACING.sm,
    width: '100%',
  },
});

export default YouTubePlayer;
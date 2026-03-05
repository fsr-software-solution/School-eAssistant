import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Text } from 'react-native';
import ImageView from 'react-native-image-viewing';
import { useTheme } from '../../context/ThemeContext';
import { SPACING, BORDER_RADIUS } from '../../constants/config';

interface ImageViewerProps {
  imageUrl: string;
  thumbnail?: string;
  title?: string;
  description?: string;
  onOpen?: () => void;
  onClose?: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  imageUrl,
  thumbnail,
  title,
  description,
  onOpen,
  onClose,
}) => {
  const { colors } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  const handleOpen = () => {
    setIsVisible(true);
    onOpen?.();
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.container, { backgroundColor: colors.surface }]}
        onPress={handleOpen}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: thumbnail || imageUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {title || 'View Image'}
          </Text>
          {description && (
            <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
              {description}
            </Text>
          )}
          <Text style={[styles.actionText, { color: colors.primary }]}>
            Tap to view full image
          </Text>
        </View>
      </TouchableOpacity>

      <ImageView
        images={[{ uri: imageUrl }]}
        imageIndex={0}
        visible={isVisible}
        onRequestClose={handleClose}
        presentationStyle="overFullScreen"
        animationType="fade"
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.md,
    flexDirection: 'row',
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: 12,
    marginBottom: SPACING.xs,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default ImageViewer;
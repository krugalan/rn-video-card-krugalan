import { memo, useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { usePlaybackProgress } from '../../hooks/usePlaybackProgress';
import { VideoPlayerCardProps } from '../../types';
import { styles } from './styles';

/**
 * VideoPlayerCard — displays a "now playing" card for a video stream.
 *
 * Features:
 * - Animated progress bar on mount (Reanimated, runs on UI thread)
 * - Tap to expand/collapse with smooth height animation
 * - Collapsed: channel name, program title, progress bar
 * - Expanded: adds description, time remaining, channel logo placeholder
 *
 * @param props - {@link VideoPlayerCardProps}
 *
 * @example
 * ```tsx
 * <VideoPlayerCard
 *   channelName="ESPN"
 *   channelInitials="ES"
 *   channelColor="#e94560"
 *   programTitle="NBA Finals Game 7"
 *   programDescription="Live coverage of the decisive game."
 *   durationMinutes={120}
 *   elapsedMinutes={45}
 * />
 * ```
 */
function VideoPlayerCard({
  channelName,
  channelInitials,
  channelColor,
  programTitle,
  programDescription,
  durationMinutes,
  elapsedMinutes,
}: VideoPlayerCardProps) {
  const [isExpanded, setExpanded] = useState(false);

  const { progressPercent, timeRemainingLabel } = usePlaybackProgress({
    durationMinutes,
    elapsedMinutes,
  });

  // Reanimated shared values — run on UI thread, no JS bridge overhead
  const progressWidth = useSharedValue(0);
  const expandHeight = useSharedValue(0);

  // Animate progress bar on mount
  useEffect(() => {
    progressWidth.value = withTiming(progressPercent, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [progressPercent, progressWidth]);

  const toggleExpand = useCallback(() => {
    const toValue = isExpanded ? 0 : 1;
    expandHeight.value = withTiming(toValue, {
      duration: 300,
      easing: Easing.inOut(Easing.ease),
    });
    setExpanded((prev) => !prev);
  }, [isExpanded, expandHeight]);

  const progressAnimStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const expandAnimStyle = useAnimatedStyle(() => {
    const height = expandHeight.value * 120;
    const opacity = expandHeight.value;
    return { height, opacity };
  });

  return (
    <Pressable
      onPress={toggleExpand}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${channelName}, ${programTitle}`}
      accessibilityHint={
        isExpanded ? 'Tap to collapse' : 'Tap to expand details'
      }
      accessibilityState={{ expanded: isExpanded }}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      {/* Collapsed: channel name + program title + progress bar */}
      <View style={styles.collapsedContent}>
        <Text style={styles.channelName}>{channelName}</Text>
        <Text style={styles.programTitle} numberOfLines={1}>
          {programTitle}
        </Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <Animated.View style={[styles.progressBarFill, progressAnimStyle]} />
          </View>
        </View>
      </View>

      {/* Expanded: logo placeholder, description, time remaining */}
      <Animated.View style={[styles.expandableContent, expandAnimStyle]}>
        <View style={styles.expandedInner}>
          <View style={styles.headerRow}>
            <View style={[styles.logoContainer, { backgroundColor: channelColor }]}>
              <Text style={styles.logoPlaceholder}>{channelInitials}</Text>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.timeLabel}>{timeRemainingLabel}</Text>
            </View>
          </View>
          <Text style={styles.description} numberOfLines={2}>
            {programDescription}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

export default memo(VideoPlayerCard);

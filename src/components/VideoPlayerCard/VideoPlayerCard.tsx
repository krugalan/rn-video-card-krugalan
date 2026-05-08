import { memo, useCallback, useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { usePlaybackProgress } from "../../hooks/usePlaybackProgress";
import { VideoPlayerCardProps } from "../../types";
import { styles } from "./styles";

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

  const progressWidth = useSharedValue(0);
  const expandHeight = useSharedValue(0);

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
        isExpanded ? "Tap to collapse" : "Tap to expand details"
      }
      accessibilityState={{ expanded: isExpanded }}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.collapsedContent}>
        <Text style={styles.channelName}>{channelName}</Text>
        <Text style={styles.programTitle} numberOfLines={1}>
          {programTitle}
        </Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <Animated.View
              style={[styles.progressBarFill, progressAnimStyle]}
            />
          </View>
        </View>
      </View>

      <Animated.View style={[styles.expandableContent, expandAnimStyle]}>
        <View style={styles.expandedInner}>
          <View style={styles.headerRow}>
            <View
              style={[styles.logoContainer, { backgroundColor: channelColor }]}
            >
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

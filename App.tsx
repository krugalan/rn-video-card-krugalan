import { useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import {
  FlatList,
  StyleSheet,
  View,
  type ListRenderItemInfo,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { VideoPlayerCard } from "./src/components/VideoPlayerCard";
import type { ChannelItem } from "./src/types";
import CHANNELS from "./src/data/channels.json";

const channelData: ChannelItem[] = CHANNELS;

export default function App() {
  const keyExtractor = useCallback((item: ChannelItem) => item.id, []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ChannelItem>) => {
      const elapsedMinutes = Date.now() / 60000 - (item?.startingTime || 1020);
      return (
        <VideoPlayerCard
          channelName={item.channelName}
          channelInitials={item.channelInitials}
          channelColor={item.channelColor}
          programTitle={item.programTitle}
          programDescription={item.programDescription}
          durationMinutes={item.durationMinutes}
          elapsedMinutes={elapsedMinutes}
        />
      );
    },
    [],
  );

  return (
    <SafeAreaProvider>
      <View style={appStyles.container}>
        <SafeAreaView edges={["top"]} />
        <StatusBar style="light" />
        <FlatList
          data={channelData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          windowSize={5}
          maxToRenderPerBatch={4}
          initialNumToRender={8}
          removeClippedSubviews
          contentContainerStyle={appStyles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaProvider>
  );
}

const APP_BG = "#0a0a1a";

const appStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_BG,
  },
  listContent: {
    paddingVertical: 8,
  },
});

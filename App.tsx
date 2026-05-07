/**
 * ============================================================================
 * APP — FEED DE VIDEO PLAYER CARDS CON FLATLIST OPTIMIZADO
 * ============================================================================
 *
 * Renderiza una lista de VideoPlayerCards usando FlatList con optimizaciones
 * de nivel producción, preparada para reemplazar el JSON por una API.
 *
 * OPTIMIZACIONES APLICADAS:
 * 1. keyExtractor como useCallback → identidad estable para reciclaje
 * 2. renderItem como useCallback → referencia estable, evita re-render masivo
 * 3. React.memo en VideoPlayerCard → evita re-renders innecesarios de items
 * 4. windowSize → control del buffer de virtualización
 * 5. maxToRenderPerBatch → items por batch para no bloquear JS thread
 * 6. initialNumToRender → render inicial rápido (TTI bajo)
 * 7. removeClippedSubviews → libera Views nativas fuera del viewport
 *
 * NO SE APLICA getItemLayout porque la altura de cada card es DINÁMICA
 * (expand/collapse cambia la altura). getItemLayout requiere altura fija.
 * Este es un tradeoff consciente: perdemos scroll-to-index instantáneo
 * pero ganamos la animación de expand/collapse.
 *
 * ============================================================================
 */

import { useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import { FlatList, StyleSheet, View, type ListRenderItemInfo } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { VideoPlayerCard } from "./src/components/VideoPlayerCard";
import type { ChannelItem } from "./src/types";
import CHANNELS from "./src/data/channels.json";

/**
 * Data source tipado. Hoy es un JSON estático, mañana será el response
 * de una API. El contrato ChannelItem garantiza type safety en ambos casos.
 */
const channelData: ChannelItem[] = CHANNELS;

export default function App() {
  // ===========================================================================
  // OPTIMIZACIÓN 1: keyExtractor — identidad estable para reciclaje
  // ===========================================================================
  /**
   * FlatList usa la key para reciclar celdas. Sin keyExtractor, usa el index,
   * que rompe el reciclaje si los datos se reordenan (futuro: sort, filter).
   * useCallback mantiene la referencia estable entre renders.
   */
  const keyExtractor = useCallback((item: ChannelItem) => item.id, []);

  // ===========================================================================
  // OPTIMIZACIÓN 2: renderItem — referencia estable
  // ===========================================================================
  /**
   * Si renderItem cambia de referencia, FlatList RE-RENDERIZA TODOS los items
   * visibles, incluso si React.memo está en VideoPlayerCard.
   *
   * Sin useCallback: FeedScreen re-renders → nuevo renderItem → FlatList
   * llama renderItem para los ~6 items visibles → costo innecesario.
   *
   * Con useCallback: misma referencia → FlatList no re-renderiza ningún item.
   */
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ChannelItem>) => (
      <VideoPlayerCard
        channelName={item.channelName}
        channelInitials={item.channelInitials}
        channelColor={item.channelColor}
        programTitle={item.programTitle}
        programDescription={item.programDescription}
        durationMinutes={item.durationMinutes}
        elapsedMinutes={item.elapsedMinutes}
      />
    ),
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
          /**
           * ===============================================================
           * OPTIMIZACIÓN 3: windowSize — tamaño de la ventana de renderizado
           * ===============================================================
           *
           * Controla cuántas "pantallas" de items FlatList mantiene montados
           * arriba y abajo del viewport.
           *
           * Default: 21 (10 arriba + viewport + 10 abajo) → demasiados items.
           * Nuestro valor: 5 (2 arriba + viewport + 2 abajo).
           *
           * Con cards de ~100px colapsadas en pantalla de ~700px (~7 visibles),
           * esto monta ~35 items. Suficiente para scroll fluido sin desperdiciar
           * memoria.
           */
          windowSize={5}
          /**
           * ===============================================================
           * OPTIMIZACIÓN 4: maxToRenderPerBatch — items por batch
           * ===============================================================
           *
           * Al scrollear, FlatList monta items nuevos en "batches".
           * - Batch grande (10): bloquea JS ~50ms → dropped frames
           * - Batch chico (3): bloquea JS ~15ms → fluido
           *
           * 4 es el balance: suficiente para llenar el buffer sin jank.
           */
          maxToRenderPerBatch={4}
          /**
           * ===============================================================
           * OPTIMIZACIÓN 5: initialNumToRender — primer render rápido
           * ===============================================================
           *
           * Items renderizados SINCRÓNICAMENTE en el mount inicial.
           * Un valor alto aumenta el Time to Interactive (TTI).
           *
           * 8 llena la pantalla visible (~7 items) + 1 de buffer.
           * El usuario ve contenido inmediatamente sin items en blanco.
           */
          initialNumToRender={8}
          /**
           * ===============================================================
           * OPTIMIZACIÓN 6: removeClippedSubviews — liberar Views nativas
           * ===============================================================
           *
           * Cuando un item sale del viewport, React lo desmonta, pero la View
           * nativa puede quedar en memoria como "zombie".
           * removeClippedSubviews le dice al sistema nativo que también libere
           * la View nativa. Estable en RN 0.81+.
           */
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

import { StyleSheet } from 'react-native';

const COLORS = {
  background: '#1a1a2e',
  cardBg: '#16213e',
  accent: '#e94560',
  textPrimary: '#ffffff',
  textSecondary: '#a8a8b3',
  progressBg: '#2a2a4a',
  pressed: '#0f3460',
};

export const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  cardPressed: {
    backgroundColor: COLORS.pressed,
  },
  collapsedContent: {
    padding: 16,
  },
  channelName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  programTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: COLORS.progressBg,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 4,
    backgroundColor: COLORS.accent,
    borderRadius: 2,
  },
  expandableContent: {
    overflow: 'hidden',
  },
  expandedInner: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoPlaceholder: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerText: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
});

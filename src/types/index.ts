/**
 * Shape of a channel item from the data source (JSON / future API).
 * Includes `id` for stable FlatList key extraction.
 */
export interface ChannelItem {
  /** Unique identifier for FlatList keyExtractor */
  id: string;
  /** Name of the channel (e.g. "ESPN") */
  channelName: string;
  /** Initials to display inside the channel logo placeholder (e.g. "ES") */
  channelInitials: string;
  /** Background color for the channel logo placeholder (e.g. "#e94560") */
  channelColor: string;
  /** Title of the current program */
  programTitle: string;
  /** Description text — rendered with 2-line ellipsis when expanded */
  programDescription: string;
  /** Total duration of the program in minutes */
  durationMinutes: number;
  /** Elapsed time in minutes */
  elapsedMinutes: number;
  /** Starting time of the program in milliseconds */
  startingTime?: number;
}

/**
 * Props for the VideoPlayerCard component.
 * All data is passed via props — no hardcoded content.
 */
export interface VideoPlayerCardProps {
  /** Name of the channel (e.g. "ESPN") */
  channelName: string;
  /** Initials to display inside the channel logo placeholder (e.g. "ES") */
  channelInitials: string;
  /** Background color for the channel logo placeholder (e.g. "#e94560") */
  channelColor: string;
  /** Title of the current program */
  programTitle: string;
  /** Description text — rendered with 2-line ellipsis when expanded */
  programDescription: string;
  /** Total duration of the program in minutes */
  durationMinutes: number;
  /** Elapsed time in minutes */
  elapsedMinutes: number;
}

/**
 * Input for the usePlaybackProgress hook.
 */
export interface PlaybackProgressInput {
  durationMinutes: number;
  elapsedMinutes: number;
}

/**
 * Output from the usePlaybackProgress hook.
 */
export interface PlaybackProgressOutput {
  /** Progress percentage clamped between 0 and 100 */
  progressPercent: number;
  /** Human-readable remaining time (e.g. "1h 30m remaining") */
  timeRemainingLabel: string;
}

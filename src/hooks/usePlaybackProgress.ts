import { PlaybackProgressInput, PlaybackProgressOutput } from '../types';

/**
 * Calculates playback progress percentage and a human-readable remaining time label.
 *
 * @param input - durationMinutes and elapsedMinutes
 * @returns progressPercent (0-100) and timeRemainingLabel (e.g. "1h 30m remaining")
 *
 * @example
 * ```ts
 * const { progressPercent, timeRemainingLabel } = usePlaybackProgress({
 *   durationMinutes: 90,
 *   elapsedMinutes: 30,
 * });
 * // progressPercent === 33.33...
 * // timeRemainingLabel === "1h 0m remaining"
 * ```
 */
export function usePlaybackProgress({
  durationMinutes,
  elapsedMinutes,
}: PlaybackProgressInput): PlaybackProgressOutput {
  if (durationMinutes <= 0) {
    return { progressPercent: 0, timeRemainingLabel: '0m remaining' };
  }

  const progress = Math.min(
    Math.max((elapsedMinutes / durationMinutes) * 100, 0),
    100
  );

  const remaining = Math.max(durationMinutes - elapsedMinutes, 0);
  const hours = Math.floor(remaining / 60);
  const minutes = Math.round(remaining % 60);

  const timeRemainingLabel =
    hours > 0
      ? `${hours}h ${minutes}m remaining`
      : `${minutes}m remaining`;

  return { progressPercent: progress, timeRemainingLabel };
}

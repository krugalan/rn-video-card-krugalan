import { usePlaybackProgress } from '../usePlaybackProgress';

describe('usePlaybackProgress', () => {
  it('returns 0% progress when elapsedMinutes is 0', () => {
    const result = usePlaybackProgress({ durationMinutes: 90, elapsedMinutes: 0 });
    expect(result.progressPercent).toBe(0);
    expect(result.timeRemainingLabel).toBe('1h 30m remaining');
  });

  it('returns 100% progress when elapsed equals duration', () => {
    const result = usePlaybackProgress({ durationMinutes: 60, elapsedMinutes: 60 });
    expect(result.progressPercent).toBe(100);
    expect(result.timeRemainingLabel).toBe('0m remaining');
  });

  it('formats time with hours when remaining > 60 minutes', () => {
    const result = usePlaybackProgress({ durationMinutes: 120, elapsedMinutes: 10 });
    expect(result.timeRemainingLabel).toBe('1h 50m remaining');
  });

  it('formats time without hours when remaining < 60 minutes', () => {
    const result = usePlaybackProgress({ durationMinutes: 45, elapsedMinutes: 10 });
    expect(result.timeRemainingLabel).toBe('35m remaining');
  });

  it('handles zero duration without dividing by zero', () => {
    const result = usePlaybackProgress({ durationMinutes: 0, elapsedMinutes: 0 });
    expect(result.progressPercent).toBe(0);
    expect(result.timeRemainingLabel).toBe('0m remaining');
  });

  it('clamps progress to 100 when elapsed exceeds duration', () => {
    const result = usePlaybackProgress({ durationMinutes: 30, elapsedMinutes: 45 });
    expect(result.progressPercent).toBe(100);
    expect(result.timeRemainingLabel).toBe('0m remaining');
  });
});

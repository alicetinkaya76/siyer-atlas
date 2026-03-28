import { create } from 'zustand';
import { TIMELINE_START, TIMELINE_END } from '@/config/constants';

interface TimelineState {
  currentYear: number;
  rangeStart: number;
  rangeEnd: number;
  playing: boolean;
  speed: 1 | 2 | 4;
  hoveredEventId: string | null;

  setCurrentYear: (year: number) => void;
  setRange: (start: number, end: number) => void;
  setPlaying: (playing: boolean) => void;
  togglePlaying: () => void;
  setSpeed: (speed: 1 | 2 | 4) => void;
  setHoveredEventId: (id: string | null) => void;
  stepForward: () => void;
  stepBackward: () => void;
  resetTimeline: () => void;
}

export const useTimelineStore = create<TimelineState>()((set, get) => ({
  currentYear: TIMELINE_START,
  rangeStart: TIMELINE_START,
  rangeEnd: TIMELINE_END,
  playing: false,
  speed: 1,
  hoveredEventId: null,

  setCurrentYear: (year) => set({ currentYear: Math.max(get().rangeStart, Math.min(get().rangeEnd, year)) }),
  setRange: (start, end) => set({ rangeStart: start, rangeEnd: end }),
  setPlaying: (playing) => set({ playing }),
  togglePlaying: () => set((s) => ({ playing: !s.playing })),
  setSpeed: (speed) => set({ speed }),
  setHoveredEventId: (id) => set({ hoveredEventId: id }),
  stepForward: () => set((s) => ({ currentYear: Math.min(s.rangeEnd, s.currentYear + 1) })),
  stepBackward: () => set((s) => ({ currentYear: Math.max(s.rangeStart, s.currentYear - 1) })),
  resetTimeline: () =>
    set({ currentYear: TIMELINE_START, rangeStart: TIMELINE_START, rangeEnd: TIMELINE_END, playing: false, speed: 1 }),
}));

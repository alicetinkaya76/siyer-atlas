import { create } from 'zustand';

interface AudioState {
  currentEpisodeId: string | null;
  playing: boolean;
  progress: number;
  duration: number;
  volume: number;
  muted: boolean;

  setCurrentEpisode: (id: string | null) => void;
  setPlaying: (playing: boolean) => void;
  togglePlaying: () => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  stop: () => void;
}

export const useAudioStore = create<AudioState>()((set) => ({
  currentEpisodeId: null,
  playing: false,
  progress: 0,
  duration: 0,
  volume: 0.8,
  muted: false,

  setCurrentEpisode: (id) => set({ currentEpisodeId: id, progress: 0, playing: !!id }),
  setPlaying: (playing) => set({ playing }),
  togglePlaying: () => set((s) => ({ playing: !s.playing })),
  setProgress: (progress) => set({ progress }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume, muted: volume === 0 }),
  toggleMute: () => set((s) => ({ muted: !s.muted })),
  stop: () => set({ currentEpisodeId: null, playing: false, progress: 0 }),
}));

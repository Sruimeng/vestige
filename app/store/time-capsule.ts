/**
 * Time Capsule Zustand Store
 * 管理时间胶囊状态（兼容 Future Fossils）
 */

import { create } from 'zustand';

import type { SystemState, CapsuleData } from '@/types/time-capsule';

interface TimeCapsuleStore {
  // 状态
  currentYear: number;
  systemState: SystemState;
  capsuleData: CapsuleData | null;
  error: string | null;
  progress: number; // 0-100，用于 CONSTRUCTING 状态

  // 动作
  setYear: (year: number) => void;
  setSystemState: (state: SystemState) => void;
  setCapsuleData: (data: CapsuleData | null) => void;
  setError: (error: string | null) => void;
  setProgress: (progress: number) => void;
  reset: () => void;
}

const initialState = {
  currentYear: 2026,
  systemState: 'IDLE' as SystemState,
  capsuleData: null,
  error: null,
  progress: 0,
};

export const useTimeCapsuleStore = create<TimeCapsuleStore>((set) => ({
  ...initialState,

  setYear: (year) => set({ currentYear: year }),

  setSystemState: (state) => set({ systemState: state }),

  setCapsuleData: (data) => set({ capsuleData: data }),

  setError: (error) => set({ error }),

  setProgress: (progress) => set({ progress }),

  reset: () => set(initialState),
}));

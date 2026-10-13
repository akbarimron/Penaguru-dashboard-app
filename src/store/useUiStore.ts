import { create } from 'zustand';

export type ToastTone = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  tone: ToastTone;
  message: string;
}

export interface ConfirmRequest {
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
  resolve: (ok: boolean) => void;
}

interface UiState {
  toast: Toast | null;
  showToast: (message: string, tone?: ToastTone) => void;
  hideToast: () => void;
  confirmRequest: ConfirmRequest | null;
  confirm: (req: Omit<ConfirmRequest, 'resolve'>) => Promise<boolean>;
  closeConfirm: (ok: boolean) => void;
}

// Alert.alert tidak berfungsi di web (react-native-web), jadi umpan balik
// memakai toast dan dialog sendiri yang jalan di semua platform.
export const useUiStore = create<UiState>((set, get) => ({
  toast: null,
  showToast: (message, tone = 'success') => set({ toast: { id: Date.now(), tone, message } }),
  hideToast: () => set({ toast: null }),
  confirmRequest: null,
  confirm: (req) =>
    new Promise<boolean>((resolve) => {
      set({ confirmRequest: { ...req, resolve } });
    }),
  closeConfirm: (ok) => {
    get().confirmRequest?.resolve(ok);
    set({ confirmRequest: null });
  },
}));

export const toast = (message: string, tone?: ToastTone) => useUiStore.getState().showToast(message, tone);
export const confirmDialog = (req: Omit<ConfirmRequest, 'resolve'>) => useUiStore.getState().confirm(req);

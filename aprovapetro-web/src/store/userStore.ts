import { create } from 'zustand';

interface UserState {
  user: any | null;
  setUser: (user: any) => void;
  updateUser: (data: any) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
  updateUser: (data) => set((state) => {
    if (!state.user) return state;
    const updatedUser = { ...state.user, ...data };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return { user: updatedUser };
  }),
  logout: () => {
    localStorage.removeItem('user');
    set({ user: null });
  }
}));

import { create } from 'zustand';

interface UserState {
  user: any | null;
  dashboardData: any | null;
  missaoData: any | null;
  simuladosData: any | null;
  acervoData: any | null;
  setUser: (user: any) => void;
  updateUser: (data: any) => void;
  setDashboardData: (data: any) => void;
  setMissaoData: (data: any) => void;
  setSimuladosData: (data: any) => void;
  setAcervoData: (data: any) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  dashboardData: null,
  missaoData: null,
  simuladosData: null,
  acervoData: null,
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
  setDashboardData: (data) => set({ dashboardData: data }),
  setMissaoData: (data) => set({ missaoData: data }),
  setSimuladosData: (data) => set({ simuladosData: data }),
  setAcervoData: (data) => set({ acervoData: data }),
  logout: () => {
    localStorage.removeItem('user');
    set({ user: null, dashboardData: null, missaoData: null, simuladosData: null, acervoData: null });
  }
}));

import { create } from 'zustand';
import api from '../api/axios';

const useAuthStore = create((set, get) => ({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,

    register: async (data) => {
        set({ loading: true, error: null });
        try {
            const res = await api.post('/auth/register', data);
            const { token, user, organization } = res.data.data;
            localStorage.setItem('token', token);
            set({ user, token, isAuthenticated: true, loading: false });
            return { user, organization };
        } catch (err) {
            set({ error: err.response?.data?.message || 'Registration failed', loading: false });
            throw err;
        }
    },

    login: async (data) => {
        set({ loading: true, error: null });
        try {
            const res = await api.post('/auth/login', data);
            const { token, user } = res.data.data;
            localStorage.setItem('token', token);
            set({ user, token, isAuthenticated: true, loading: false });
            return user;
        } catch (err) {
            set({ error: err.response?.data?.message || 'Login failed', loading: false });
            throw err;
        }
    },

    fetchProfile: async () => {
        try {
            const res = await api.get('/auth/me');
            set({ user: res.data.data.user, isAuthenticated: true });
        } catch {
            set({ user: null, isAuthenticated: false });
            localStorage.removeItem('token');
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
    },

    clearError: () => set({ error: null }),
}));

export default useAuthStore;

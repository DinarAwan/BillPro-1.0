import { create } from 'zustand';
import api from '../api/axios';

const useInvoiceStore = create((set, get) => ({
    invoices: [],
    currentInvoice: null,
    pagination: null,
    stats: null,
    loading: false,

    fetchInvoices: async (orgId, params = {}) => {
        set({ loading: true });
        try {
            const res = await api.get(`/organizations/${orgId}/invoices`, { params });
            set({
                invoices: res.data.data,
                pagination: res.data.pagination,
                loading: false,
            });
        } catch {
            set({ loading: false });
        }
    },

    fetchInvoice: async (orgId, invoiceId) => {
        set({ loading: true });
        try {
            const res = await api.get(`/organizations/${orgId}/invoices/${invoiceId}`);
            set({ currentInvoice: res.data.data.invoice, loading: false });
            return res.data.data.invoice;
        } catch {
            set({ loading: false });
        }
    },

    createInvoice: async (orgId, data) => {
        const res = await api.post(`/organizations/${orgId}/invoices`, data);
        return res.data.data.invoice;
    },

    updateInvoice: async (orgId, invoiceId, data) => {
        const res = await api.put(`/organizations/${orgId}/invoices/${invoiceId}`, data);
        return res.data.data.invoice;
    },

    updateStatus: async (orgId, invoiceId, status) => {
        const res = await api.patch(`/organizations/${orgId}/invoices/${invoiceId}/status`, { status });
        return res.data.data.invoice;
    },

    deleteInvoice: async (orgId, invoiceId) => {
        await api.delete(`/organizations/${orgId}/invoices/${invoiceId}`);
    },

    fetchStats: async (orgId) => {
        try {
            const res = await api.get(`/organizations/${orgId}/invoices/dashboard`);
            set({ stats: res.data.data.stats });
        } catch { /* ignore */ }
    },
}));

export default useInvoiceStore;

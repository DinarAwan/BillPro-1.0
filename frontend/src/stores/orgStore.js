import { create } from 'zustand';
import api from '../api/axios';

const useOrgStore = create((set, get) => ({
    organizations: [],
    currentOrg: null,
    members: [],
    loading: false,

    fetchOrganizations: async () => {
        set({ loading: true });
        try {
            const res = await api.get('/organizations');
            const orgs = res.data.data.organizations;
            set({ organizations: orgs, loading: false });
            if (!get().currentOrg && orgs.length > 0) {
                set({ currentOrg: orgs[0] });
            }
            return orgs;
        } catch {
            set({ loading: false });
        }
    },

    setCurrentOrg: (org) => set({ currentOrg: org }),

    fetchMembers: async (orgId) => {
        try {
            const res = await api.get(`/organizations/${orgId}/members`);
            set({ members: res.data.data.members });
        } catch { /* ignore */ }
    },

    addMember: async (orgId, data) => {
        const res = await api.post(`/organizations/${orgId}/members`, data);
        await get().fetchMembers(orgId);
        return res.data;
    },

    removeMember: async (orgId, userId) => {
        await api.delete(`/organizations/${orgId}/members/${userId}`);
        await get().fetchMembers(orgId);
    },
}));

export default useOrgStore;

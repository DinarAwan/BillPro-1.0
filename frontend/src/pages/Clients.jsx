import { useEffect, useState } from 'react';
import { Plus, Search, Users, Trash2, Edit2, X } from 'lucide-react';
import useOrgStore from '../stores/orgStore';
import api from '../api/axios';

export default function Clients() {
    const { currentOrg } = useOrgStore();
    const [clients, setClients] = useState([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editClient, setEditClient] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });

    const fetchClients = async () => {
        if (!currentOrg?.id) return;
        try {
            const res = await api.get(`/organizations/${currentOrg.id}/clients`, { params: { search } });
            setClients(res.data.data || []);
        } catch { /* ignore */ }
    };

    useEffect(() => { fetchClients(); }, [currentOrg?.id, search]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editClient) {
                await api.put(`/organizations/${currentOrg.id}/clients/${editClient.id}`, form);
            } else {
                await api.post(`/organizations/${currentOrg.id}/clients`, form);
            }
            setShowModal(false);
            setEditClient(null);
            setForm({ name: '', email: '', phone: '', address: '' });
            fetchClients();
        } catch { /* ignore */ }
    };

    const handleEdit = (c) => {
        setEditClient(c);
        setForm({ name: c.name, email: c.email || '', phone: c.phone || '', address: c.address || '' });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Hapus klien ini?')) return;
        await api.delete(`/organizations/${currentOrg.id}/clients/${id}`);
        fetchClients();
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)' }}>Klien</h1>
                    <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 4 }}>Kelola data klien bisnis Anda</p>
                </div>
                <button onClick={() => { setEditClient(null); setForm({ name: '', email: '', phone: '', address: '' }); setShowModal(true); }} className="btn-primary">
                    <Plus size={16} /> Tambah Klien
                </button>
            </div>

            {/* Search */}
            <div className="glass-card" style={{ padding: 16, marginBottom: 16 }}>
                <div style={{ position: 'relative', maxWidth: 320 }}>
                    <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
                    <input type="text" placeholder="Cari klien..." value={search} onChange={(e) => setSearch(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 13, outline: 'none', color: 'var(--color-text-primary)' }} />
                </div>
            </div>

            {/* Client Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {clients.map(c => (
                    <div key={c.id} className="glass-card" style={{ padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 10,
                                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', fontSize: 14, fontWeight: 600
                                }}>{c.name?.charAt(0)}</div>
                                <div>
                                    <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>{c.name}</p>
                                    {c.email && <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{c.email}</p>}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 4 }}>
                                <button onClick={() => handleEdit(c)} style={{ padding: 6, borderRadius: 6, border: 'none', background: 'var(--color-bg-main)', cursor: 'pointer' }}>
                                    <Edit2 size={14} style={{ color: 'var(--color-text-secondary)' }} />
                                </button>
                                <button onClick={() => handleDelete(c.id)} style={{ padding: 6, borderRadius: 6, border: 'none', background: 'var(--color-bg-main)', cursor: 'pointer' }}>
                                    <Trash2 size={14} style={{ color: 'var(--color-danger)' }} />
                                </button>
                            </div>
                        </div>
                        {(c.phone || c.address) && (
                            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--color-border-light)' }}>
                                {c.phone && <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>📞 {c.phone}</p>}
                                {c.address && <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>📍 {c.address}</p>}
                            </div>
                        )}
                    </div>
                ))}
                {clients.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', padding: 40, textAlign: 'center', color: 'var(--color-text-light)' }}>
                        <Users size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                        <p>Belum ada klien</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                    <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: 16, padding: 28, width: '100%', maxWidth: 420, boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }}>{editClient ? 'Edit Klien' : 'Tambah Klien'}</h2>
                            <button type="button" onClick={() => setShowModal(false)} style={{ padding: 4, borderRadius: 6, border: 'none', background: 'var(--color-bg-main)', cursor: 'pointer' }}>
                                <X size={16} style={{ color: 'var(--color-text-secondary)' }} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {[{ k: 'name', l: 'Nama', t: 'text', r: true }, { k: 'email', l: 'Email', t: 'email' }, { k: 'phone', l: 'Telepon', t: 'text' }, { k: 'address', l: 'Alamat', t: 'text' }].map(({ k, l, t, r }) => (
                                <div key={k}>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6 }}>{l}</label>
                                    <input type={t} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                                        className="input-field" required={r} />
                                </div>
                            ))}
                        </div>
                        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 20 }}>
                            {editClient ? 'Simpan Perubahan' : 'Tambah Klien'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

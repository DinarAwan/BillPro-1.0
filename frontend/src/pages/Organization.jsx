import { useEffect, useState } from 'react';
import { Building2, Users, Plus, Trash2, X, AlertCircle } from 'lucide-react';
import useOrgStore from '../stores/orgStore';

export default function Organization() {
    const { currentOrg, members, fetchMembers, addMember, removeMember } = useOrgStore();
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ email: '', role: 'STAFF' });
    const [error, setError] = useState('');

    useEffect(() => {
        if (currentOrg?.id) fetchMembers(currentOrg.id);
    }, [currentOrg?.id]);

    const handleAdd = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await addMember(currentOrg.id, form);
            setShowAdd(false);
            setForm({ email: '', role: 'STAFF' });
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menambahkan member');
        }
    };

    const handleRemove = async (userId) => {
        if (!confirm('Hapus member ini?')) return;
        await removeMember(currentOrg.id, userId);
    };

    const roleColors = { OWNER: '#6366f1', ADMIN: '#0891b2', STAFF: '#64748b' };
    const roleLabels = { OWNER: 'Pemilik', ADMIN: 'Admin', STAFF: 'Staff' };

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)' }}>Organisasi</h1>
                <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 4 }}>Kelola tim dan pengaturan organisasi</p>
            </div>

            {/* Org Info */}
            <div className="glass-card" style={{ padding: 24, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                    width: 56, height: 56, borderRadius: 14,
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: 20, fontWeight: 700
                }}>{currentOrg?.name?.charAt(0) || 'O'}</div>
                <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }}>{currentOrg?.name}</h2>
                    <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>ID: {currentOrg?.id?.slice(0, 8)}...</p>
                </div>
            </div>

            {/* Members */}
            <div className="glass-card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Users size={18} /> Anggota Tim ({members.length})
                    </h3>
                    <button onClick={() => setShowAdd(true)} className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
                        <Plus size={14} /> Undang
                    </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {members.map(m => (
                        <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 10, border: '1px solid var(--color-border-light)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: '50%',
                                    background: `${roleColors[m.role]}15`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: roleColors[m.role], fontSize: 13, fontWeight: 600
                                }}>{m.user?.fullName?.charAt(0) || '?'}</div>
                                <div>
                                    <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{m.user?.fullName}</p>
                                    <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{m.user?.email}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{
                                    padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                                    background: `${roleColors[m.role]}12`, color: roleColors[m.role]
                                }}>{roleLabels[m.role]}</span>
                                {m.role !== 'OWNER' && (
                                    <button onClick={() => handleRemove(m.user.id)}
                                        style={{ padding: 6, borderRadius: 6, border: 'none', background: '#fef2f2', cursor: 'pointer' }}>
                                        <Trash2 size={14} style={{ color: 'var(--color-danger)' }} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Modal */}
            {showAdd && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                    <form onSubmit={handleAdd} style={{ background: 'white', borderRadius: 16, padding: 28, width: '100%', maxWidth: 400, boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }}>Undang Anggota</h2>
                            <button type="button" onClick={() => { setShowAdd(false); setError(''); }}
                                style={{ padding: 4, borderRadius: 6, border: 'none', background: 'var(--color-bg-main)', cursor: 'pointer' }}>
                                <X size={16} style={{ color: 'var(--color-text-secondary)' }} />
                            </button>
                        </div>
                        {error && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, borderRadius: 10, background: '#fef2f2', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
                                <AlertCircle size={14} />{error}
                            </div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6 }}>Email</label>
                                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="input-field" placeholder="email@contoh.com" required />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6 }}>Role</label>
                                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                                    className="input-field">
                                    <option value="ADMIN">Admin</option>
                                    <option value="STAFF">Staff</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 20 }}>Kirim Undangan</button>
                    </form>
                </div>
            )}
        </div>
    );
}

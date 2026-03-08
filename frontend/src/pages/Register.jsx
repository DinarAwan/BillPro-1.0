import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, ArrowRight } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import logo from '../assets/BillPro.logo.png';

export default function Register() {
    const navigate = useNavigate();
    const { register } = useAuthStore();
    const [form, setForm] = useState({ fullName: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(form);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registrasi gagal');
        }
        setLoading(false);
    };

    return (
        <div className="auth-layout" style={{
            minHeight: '100vh', display: 'flex',
            background: 'linear-gradient(135deg, #0c4a6e 0%, #0e7490 40%, #0891b2 70%, #22d3ee 100%)'
        }}>
            {/* Left - Branding */}
            <div className="auth-branding" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 60px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
                    <img src={logo} alt="BillPro" style={{ width: 52, height: 52, borderRadius: 14, objectFit: 'contain' }} />
                    <h1 style={{ fontSize: 32, fontWeight: 800, color: 'white' }}>BillPro</h1>
                </div>
                <h2 style={{ fontSize: 28, fontWeight: 700, color: 'white', lineHeight: 1.4, marginBottom: 16 }}>
                    Kelola Bisnis Anda<br />Lebih Profesional
                </h2>
                <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, maxWidth: 400 }}>
                    Daftar gratis dan mulai buat invoice profesional dalam hitungan menit.
                </p>
                <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
                    {['Gratis', 'Tanpa Kartu Kredit', 'Instant'].map(f => (
                        <div key={f} style={{ padding: '6px 14px', borderRadius: 20, background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: 12, fontWeight: 500 }}>{f}</div>
                    ))}
                </div>
            </div>

            {/* Right - Form */}
            <div className="auth-form" style={{ width: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
                <div className="auth-card" style={{
                    width: '100%', background: 'white', borderRadius: 20, padding: 40,
                    boxShadow: '0 25px 50px rgba(0,0,0,0.15)'
                }}>
                    <div style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Buat Akun</h2>
                        <p style={{ fontSize: 14, color: '#64748b' }}>Mulai kelola invoice bisnis Anda</p>
                    </div>

                    {error && (
                        <div style={{ padding: '12px 16px', borderRadius: 10, background: '#fef2f2', color: '#dc2626', fontSize: 13, marginBottom: 20, border: '1px solid #fecaca' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6 }}>Nama Lengkap</label>
                            <div style={{ position: 'relative' }}>
                                <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                    className="input-field" style={{ paddingLeft: 40 }}
                                    placeholder="Nama lengkap Anda" required />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6 }}>Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="input-field" style={{ paddingLeft: 40 }}
                                    placeholder="nama@email.com" required />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6 }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="input-field" style={{ paddingLeft: 40 }}
                                    placeholder="Min. 6 karakter" required />
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary"
                            style={{ width: '100%', padding: '12px', marginTop: 8 }}>
                            {loading ? 'Memproses...' : <>Daftar <ArrowRight size={16} /></>}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#64748b' }}>
                        Sudah punya akun?{' '}
                        <Link to="/login" style={{ color: '#0891b2', fontWeight: 600, textDecoration: 'none' }}>Masuk</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

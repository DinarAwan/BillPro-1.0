import { useEffect } from 'react';
import { TrendingUp, FileText, AlertTriangle, Clock, DollarSign, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useOrgStore from '../stores/orgStore';
import useInvoiceStore from '../stores/invoiceStore';
import { formatCurrency } from '../utils/formatters';

export default function Dashboard() {
    const { currentOrg } = useOrgStore();
    const { stats, fetchStats } = useInvoiceStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (currentOrg?.id) fetchStats(currentOrg.id);
    }, [currentOrg?.id]);

    const statCards = [
        { label: 'Total Invoice', value: stats?.totalInvoices || 0, icon: FileText, color: '#0891b2', bg: '#ecfeff' },
        { label: 'Invoice Lunas', value: stats?.paidInvoices || 0, icon: TrendingUp, color: '#10b981', bg: '#ecfdf5', sub: `${formatCurrency(stats?.totalRevenue || 0)} total` },
        { label: 'Jatuh Tempo', value: stats?.overdueInvoices || 0, icon: AlertTriangle, color: '#ef4444', bg: '#fef2f2' },
        { label: 'Draft', value: stats?.draftInvoices || 0, icon: Clock, color: '#64748b', bg: '#f8fafc' },
        { label: 'Pendapatan Bulan Ini', value: formatCurrency(stats?.monthlyRevenue || 0), icon: DollarSign, color: '#6366f1', bg: '#eef2ff', isText: true },
        { label: 'Organisasi', value: currentOrg?.name || '-', icon: Building2, color: '#0e7490', bg: '#ecfeff', isText: true },
    ];

    const quickActions = [
        { label: 'Buat Invoice Baru', desc: 'Buat tagihan untuk klien Anda', action: () => navigate('/invoices/new'), color: '#0891b2' },
        { label: 'Tambah Klien', desc: 'Simpan data klien baru', action: () => navigate('/clients'), color: '#10b981' },
        { label: 'Lihat Pembayaran', desc: 'Pantau semua pembayaran masuk', action: () => navigate('/payments'), color: '#6366f1' },
    ];

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)' }}>Dashboard</h1>
                <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 4 }}>Selamat datang kembali! Berikut ringkasan bisnis Anda.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid-responsive-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                {statCards.map(({ label, value, icon: Icon, color, bg, sub, isText }) => (
                    <div key={label} className="glass-card" style={{ padding: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 8 }}>{label}</p>
                                <p style={{ fontSize: isText ? 15 : 28, fontWeight: 700, color: 'var(--color-text-primary)', wordBreak: 'break-word' }}>{value}</p>
                                {sub && <p style={{ fontSize: 12, color, marginTop: 4 }}>{sub}</p>}
                            </div>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Icon size={20} style={{ color }} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 12 }}>Aksi Cepat</h2>
                <div className="grid-responsive-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                    {quickActions.map(({ label, desc, action, color }) => (
                        <div key={label} className="glass-card" style={{ padding: 20, cursor: 'pointer' }} onClick={action}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, marginBottom: 12 }} />
                            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>{label}</p>
                            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

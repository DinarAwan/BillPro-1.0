import { useEffect, useState } from 'react';
import { Check, Crown, Zap, Building2 } from 'lucide-react';
import useOrgStore from '../stores/orgStore';
import api from '../api/axios';

const plans = [
    {
        name: 'Free', price: 'Gratis', icon: Zap, color: '#64748b',
        features: ['20 Invoice/bulan', '3 Anggota Tim', 'Cetak PDF', 'Dashboard'],
    },
    {
        name: 'Pro', price: 'Rp 199.000', period: '/bulan', icon: Crown, color: '#0891b2', popular: true,
        features: ['Invoice Unlimited', '5 Anggota Tim', 'Cetak PDF', 'Laporan Lengkap', 'Priority Support'],
    },
    {
        name: 'Business', price: 'Rp 499.000', period: '/bulan', icon: Building2, color: '#6366f1',
        features: ['Semua fitur Pro', 'Anggota Unlimited', 'API Access', 'Custom Branding', 'Dedicated Support'],
    },
];

export default function Subscription() {
    const { currentOrg } = useOrgStore();
    const [current, setCurrent] = useState(null);
    const [usage, setUsage] = useState({});

    useEffect(() => {
        if (currentOrg?.id) {
            api.get(`/organizations/${currentOrg.id}/subscription`).then(r => setCurrent(r.data.data?.subscription)).catch(() => { });
            api.get(`/organizations/${currentOrg.id}/subscription/usage`).then(r => setUsage(r.data.data || {})).catch(() => { });
        }
    }, [currentOrg?.id]);

    const handleUpgrade = async (plan) => {
        try {
            await api.put(`/organizations/${currentOrg.id}/subscription`, { plan });
            const r = await api.get(`/organizations/${currentOrg.id}/subscription`);
            setCurrent(r.data.data?.subscription);
            alert(`Berhasil upgrade ke ${plan}!`);
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal upgrade');
        }
    };

    const invoiceUsage = usage.invoiceCount || 0;
    const invoiceLimit = current?.invoiceLimit === -1 ? '∞' : (current?.invoiceLimit || 20);
    const usagePercent = current?.invoiceLimit === -1 ? 5 : Math.round((invoiceUsage / (current?.invoiceLimit || 20)) * 100);

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)' }}>Langganan</h1>
                <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 4 }}>Kelola paket langganan bisnis Anda</p>
            </div>

            {/* Usage */}
            <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Paket saat ini</p>
                        <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-primary)' }}>{current?.plan || 'FREE'}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Penggunaan Invoice</p>
                        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>{invoiceUsage} / {invoiceLimit}</p>
                    </div>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: 'var(--color-bg-main)', overflow: 'hidden' }}>
                    <div style={{
                        height: '100%', borderRadius: 4, width: `${Math.min(usagePercent, 100)}%`,
                        background: usagePercent > 80 ? 'var(--color-danger)' : 'var(--color-primary)',
                        transition: 'width 0.5s ease'
                    }} />
                </div>
            </div>

            {/* Plans */}
            <div className="grid-responsive-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                {plans.map(plan => {
                    const isCurrent = current?.plan === plan.name.toUpperCase();
                    return (
                        <div key={plan.name} className="glass-card" style={{
                            padding: 28, position: 'relative',
                            border: plan.popular ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                        }}>
                            {plan.popular && (
                                <div style={{
                                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                                    padding: '4px 16px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                                    background: 'var(--color-primary)', color: 'white'
                                }}>Populer</div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${plan.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <plan.icon size={20} style={{ color: plan.color }} />
                                </div>
                                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }}>{plan.name}</h3>
                            </div>
                            <div style={{ marginBottom: 20 }}>
                                <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text-primary)' }}>{plan.price}</span>
                                {plan.period && <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>{plan.period}</span>}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                                {plan.features.map(f => (
                                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-text-secondary)' }}>
                                        <Check size={14} style={{ color: 'var(--color-success)', flexShrink: 0 }} /> {f}
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => !isCurrent && handleUpgrade(plan.name.toUpperCase())}
                                disabled={isCurrent} style={{
                                    width: '100%', padding: '10px', borderRadius: 10, border: 'none', cursor: isCurrent ? 'default' : 'pointer',
                                    fontSize: 14, fontWeight: 600,
                                    background: isCurrent ? 'var(--color-bg-main)' : `linear-gradient(135deg, ${plan.color}, ${plan.color}dd)`,
                                    color: isCurrent ? 'var(--color-text-secondary)' : 'white',
                                }}>
                                {isCurrent ? 'Paket Saat Ini' : 'Pilih Paket'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

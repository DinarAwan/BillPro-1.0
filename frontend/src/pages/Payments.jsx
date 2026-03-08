import { useEffect, useState } from 'react';
import { DollarSign, CreditCard, Calendar } from 'lucide-react';
import useOrgStore from '../stores/orgStore';
import useInvoiceStore from '../stores/invoiceStore';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function Payments() {
    const { currentOrg } = useOrgStore();
    const { invoices, fetchInvoices, stats, fetchStats } = useInvoiceStore();

    useEffect(() => {
        if (currentOrg?.id) {
            fetchInvoices(currentOrg.id, { status: 'PAID' });
            fetchStats(currentOrg.id);
        }
    }, [currentOrg?.id]);

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)' }}>Pembayaran</h1>
                <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 4 }}>Pantau semua pembayaran yang masuk</p>
            </div>

            {/* Summary */}
            <div className="grid-responsive-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div className="glass-card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <DollarSign size={22} style={{ color: '#10b981' }} />
                        </div>
                        <div>
                            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Total Pendapatan</p>
                            <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)' }}>{formatCurrency(stats?.totalRevenue || 0)}</p>
                        </div>
                    </div>
                </div>
                <div className="glass-card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CreditCard size={22} style={{ color: '#6366f1' }} />
                        </div>
                        <div>
                            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Pendapatan Bulan Ini</p>
                            <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)' }}>{formatCurrency(stats?.monthlyRevenue || 0)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Paid Invoices */}
            <div className="glass-card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>Invoice Lunas</h3>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                            {['Invoice', 'Klien', 'Tanggal Bayar', 'Total'].map(h => (
                                <th key={h} style={{ textAlign: 'left', padding: '12px 20px', fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', background: '#f8fafc' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {invoices?.map(inv => (
                            <tr key={inv.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                                <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 600, fontFamily: 'monospace', color: 'var(--color-primary)' }}>{inv.invoiceNumber}</td>
                                <td style={{ padding: '14px 20px', fontSize: 14, color: 'var(--color-text-primary)' }}>{inv.client?.name}</td>
                                <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--color-text-secondary)' }}>{formatDate(inv.updatedAt)}</td>
                                <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 600, color: '#10b981' }}>{formatCurrency(inv.total)}</td>
                            </tr>
                        ))}
                        {!invoices?.length && (
                            <tr>
                                <td colSpan={4} style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-light)' }}>Belum ada pembayaran</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, Eye } from 'lucide-react';
import useOrgStore from '../stores/orgStore';
import useInvoiceStore from '../stores/invoiceStore';
import { formatCurrency, formatDate, getStatusColor } from '../utils/formatters';

const statusFilters = ['ALL', 'DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELED'];

export default function Invoices() {
    const navigate = useNavigate();
    const { currentOrg } = useOrgStore();
    const { invoices, fetchInvoices } = useInvoiceStore();
    const [status, setStatus] = useState('ALL');
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (currentOrg?.id) fetchInvoices(currentOrg.id, { status: status === 'ALL' ? '' : status, search });
    }, [currentOrg?.id, status, search]);

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)' }}>Invoice</h1>
                    <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 4 }}>Kelola semua tagihan bisnis Anda</p>
                </div>
                <button onClick={() => navigate('/invoices/new')} className="btn-primary">
                    <Plus size={16} /> Buat Invoice
                </button>
            </div>

            {/* Filters */}
            <div className="glass-card" style={{ padding: 16, marginBottom: 16 }}>
                <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {statusFilters.map(s => (
                            <button key={s} onClick={() => setStatus(s)} style={{
                                padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                                fontSize: 13, fontWeight: 500,
                                background: status === s ? 'var(--color-primary)' : 'var(--color-bg-main)',
                                color: status === s ? 'white' : 'var(--color-text-secondary)',
                                transition: 'all 0.2s'
                            }}>{s === 'ALL' ? 'Semua' : s}</button>
                        ))}
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
                        <input type="text" placeholder="Cari invoice..." value={search} onChange={(e) => setSearch(e.target.value)}
                            style={{ padding: '6px 12px 6px 32px', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 13, outline: 'none', background: 'var(--color-bg-main)', color: 'var(--color-text-primary)', width: '100%', minWidth: 150 }} />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="glass-card table-responsive" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                            {['No. Invoice', 'Klien', 'Tanggal', 'Jatuh Tempo', 'Total', 'Status', ''].map(h => (
                                <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, background: '#f8fafc', whiteSpace: 'nowrap' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {invoices?.length > 0 ? invoices.map(inv => (
                            <tr key={inv.id} style={{ borderBottom: '1px solid var(--color-border-light)', cursor: 'pointer' }}
                                onClick={() => navigate(`/invoices/${inv.id}`)}
                                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                                <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, fontFamily: 'monospace', color: 'var(--color-primary)', whiteSpace: 'nowrap' }}>{inv.invoiceNumber}</td>
                                <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>{inv.client?.name}</td>
                                <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>{formatDate(inv.issueDate)}</td>
                                <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>{formatDate(inv.dueDate)}</td>
                                <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>{formatCurrency(inv.total)}</td>
                                <td style={{ padding: '14px 16px' }}>
                                    <span className={`${getStatusColor(inv.status)}`} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>{inv.status}</span>
                                </td>
                                <td style={{ padding: '14px 16px' }}>
                                    <Eye size={16} style={{ color: 'var(--color-text-light)' }} />
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-light)' }}>
                                    <FileText size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                                    <p>Belum ada invoice</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

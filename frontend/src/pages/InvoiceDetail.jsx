import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Send, CheckCircle, XCircle, Clock, Printer } from 'lucide-react';
import useOrgStore from '../stores/orgStore';
import useInvoiceStore from '../stores/invoiceStore';
import { formatCurrency, formatDate, formatDateTime, getStatusColor } from '../utils/formatters';
import api from '../api/axios';

export default function InvoiceDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentOrg } = useOrgStore();
    const { currentInvoice: invoice, fetchInvoice, updateStatus, deleteInvoice } = useInvoiceStore();
    const [paymentForm, setPaymentForm] = useState({ amount: '', paymentDate: new Date().toISOString().split('T')[0], method: 'TRANSFER', referenceNumber: '' });
    const [showPayment, setShowPayment] = useState(false);

    useEffect(() => {
        if (currentOrg?.id) fetchInvoice(currentOrg.id, id);
    }, [currentOrg?.id, id]);

    const handleStatusChange = async (newStatus) => {
        try {
            await updateStatus(currentOrg.id, id, newStatus);
            await fetchInvoice(currentOrg.id, id);
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal mengubah status');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Hapus invoice ini?')) return;
        await deleteInvoice(currentOrg.id, id);
        navigate('/invoices');
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/organizations/${currentOrg.id}/invoices/${id}/payments`, {
                ...paymentForm, amount: Number(paymentForm.amount),
            });
            setShowPayment(false);
            setPaymentForm({ amount: '', paymentDate: new Date().toISOString().split('T')[0], method: 'TRANSFER', referenceNumber: '' });
            fetchInvoice(currentOrg.id, id);
        } catch { /* ignore */ }
    };

    if (!invoice) return <div style={{ padding: 80, textAlign: 'center', color: 'var(--color-text-light)' }}>Loading...</div>;

    const totalPaid = invoice.payments?.reduce((s, p) => s + p.amount, 0) || 0;
    const remaining = invoice.total - totalPaid;

    const statusActions = {
        DRAFT: [{ label: 'Kirim', status: 'SENT', icon: Send, color: '#0891b2' }],
        SENT: [{ label: 'Tandai Lunas', status: 'PAID', icon: CheckCircle, color: '#10b981' }, { label: 'Batalkan', status: 'CANCELED', icon: XCircle, color: '#ef4444' }],
        OVERDUE: [{ label: 'Tandai Lunas', status: 'PAID', icon: CheckCircle, color: '#10b981' }, { label: 'Batalkan', status: 'CANCELED', icon: XCircle, color: '#ef4444' }],
        CANCELED: [{ label: 'Buka Lagi', status: 'DRAFT', icon: Clock, color: '#6366f1' }],
    };

    return (
        <div>
            <button onClick={() => navigate('/invoices')} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, color: 'var(--color-text-secondary)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
                <ArrowLeft size={16} /> Kembali ke Invoice
            </button>

            {/* Header */}
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: 'monospace', color: 'var(--color-text-primary)' }}>{invoice.invoiceNumber}</h1>
                        <span className={`${getStatusColor(invoice.status)}`} style={{ padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{invoice.status}</span>
                    </div>
                    <p style={{ marginTop: 4, fontSize: 13, color: 'var(--color-text-secondary)' }}>Dibuat {formatDateTime(invoice.createdAt)}</p>
                </div>
                <div className="action-buttons" style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative', zIndex: 10, flexWrap: 'wrap' }}>
                    {statusActions[invoice.status]?.map(({ label, status, icon: Icon, color }) => (
                        <button key={status} onClick={() => handleStatusChange(status)}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, border: `1px solid ${color}30`, background: `${color}08`, color, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                            <Icon size={16} /> {label}
                        </button>
                    ))}
                    {invoice.status === 'DRAFT' && (
                        <button onClick={() => navigate(`/invoices/${id}/edit`)} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-border)', background: 'white', cursor: 'pointer' }}>
                            <Edit2 size={16} style={{ color: 'var(--color-text-secondary)' }} />
                        </button>
                    )}
                    <button onClick={() => navigate(`/invoices/${id}/print`)} className="btn-primary" style={{ padding: '10px 18px', fontSize: 13 }}>
                        <Printer size={16} /> Cetak PDF
                    </button>
                    <button onClick={handleDelete} style={{ padding: 10, borderRadius: 8, border: '1px solid #fecaca', background: '#fef2f2', cursor: 'pointer' }}>
                        <Trash2 size={16} style={{ color: 'var(--color-danger)' }} />
                    </button>
                </div>
            </div>

            <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
                {/* Main */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Client & Dates */}
                    <div className="glass-card grid-responsive-3" style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
                        <div>
                            <p style={{ fontSize: 12, color: 'var(--color-text-light)', marginBottom: 4 }}>Klien</p>
                            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>{invoice.client?.name}</p>
                            {invoice.client?.email && <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{invoice.client.email}</p>}
                        </div>
                        <div>
                            <p style={{ fontSize: 12, color: 'var(--color-text-light)', marginBottom: 4 }}>Tanggal Invoice</p>
                            <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)' }}>{formatDate(invoice.issueDate)}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: 12, color: 'var(--color-text-light)', marginBottom: 4 }}>Jatuh Tempo</p>
                            <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)' }}>{formatDate(invoice.dueDate)}</p>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="glass-card table-responsive" style={{ overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    {['Deskripsi', 'Qty', 'Harga Satuan', 'Total'].map(h => (
                                        <th key={h} style={{ textAlign: 'left', padding: '12px 20px', fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', background: '#f8fafc', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.items?.map(item => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                                        <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{item.description}</td>
                                        <td style={{ padding: '14px 20px', fontSize: 14, color: 'var(--color-text-secondary)' }}>{item.quantity}</td>
                                        <td style={{ padding: '14px 20px', fontSize: 14, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>{formatCurrency(item.unitPrice)}</td>
                                        <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>{formatCurrency(item.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--color-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                                <span>Subtotal</span><span>{formatCurrency(invoice.subtotal)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                                <span>Pajak ({invoice.tax}%)</span><span>{formatCurrency(invoice.subtotal * invoice.tax / 100)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)', paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
                                <span>Total</span><span style={{ color: 'var(--color-primary)' }}>{formatCurrency(invoice.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Payment Summary */}
                    <div className="glass-card" style={{ padding: 20 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 12 }}>Ringkasan Pembayaran</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--color-text-secondary)' }}><span>Total</span><span>{formatCurrency(invoice.total)}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--color-success)' }}><span>Dibayar</span><span>{formatCurrency(totalPaid)}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, color: remaining > 0 ? 'var(--color-warning)' : 'var(--color-success)' }}>
                                <span>Sisa</span><span>{formatCurrency(remaining)}</span>
                            </div>
                        </div>
                        {['SENT', 'OVERDUE'].includes(invoice.status) && (
                            <button onClick={() => setShowPayment(!showPayment)} className="btn-primary" style={{ width: '100%', marginTop: 16, fontSize: 13 }}>
                                + Catat Pembayaran
                            </button>
                        )}
                    </div>

                    {showPayment && (
                        <form onSubmit={handlePayment} className="glass-card animate-fade-in" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>Pembayaran Baru</h3>
                            <input type="number" placeholder="Jumlah" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} className="input-field" required />
                            <input type="date" value={paymentForm.paymentDate} onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })} className="input-field" required />
                            <select value={paymentForm.method} onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })} className="input-field">
                                <option value="TRANSFER">Transfer</option>
                                <option value="CASH">Tunai</option>
                                <option value="EWALLET">E-Wallet</option>
                            </select>
                            <input type="text" placeholder="No. Referensi (opsional)" value={paymentForm.referenceNumber} onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })} className="input-field" />
                            <button type="submit" className="btn-primary" style={{ fontSize: 13 }}>Simpan Pembayaran</button>
                        </form>
                    )}

                    {invoice.payments?.length > 0 && (
                        <div className="glass-card" style={{ padding: 20 }}>
                            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 12 }}>Riwayat Pembayaran</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {invoice.payments.map(p => (
                                    <div key={p.id} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-border-light)' }}>
                                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-success)' }}>{formatCurrency(p.amount)}</p>
                                        <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{p.method} • {formatDate(p.paymentDate)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {invoice.logs?.length > 0 && (
                        <div className="glass-card" style={{ padding: 20 }}>
                            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 12 }}>Log Aktivitas</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {invoice.logs.map(log => (
                                    <div key={log.id} style={{ display: 'flex', gap: 10 }}>
                                        <div style={{ width: 6, height: 6, borderRadius: '50%', marginTop: 6, flexShrink: 0, background: 'var(--color-primary)' }} />
                                        <div>
                                            <p style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>{log.description || log.action}</p>
                                            <p style={{ fontSize: 11, color: 'var(--color-text-light)' }}>{log.createdBy?.fullName} • {formatDateTime(log.createdAt)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

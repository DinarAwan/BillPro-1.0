import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import useOrgStore from '../stores/orgStore';
import useInvoiceStore from '../stores/invoiceStore';
import { formatCurrency, formatDate } from '../utils/formatters';
import logo from '../assets/BillPro.logo.png';

export default function PrintInvoice() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentOrg } = useOrgStore();
    const { currentInvoice: invoice, fetchInvoice } = useInvoiceStore();
    const printRef = useRef();

    useEffect(() => {
        if (currentOrg?.id) fetchInvoice(currentOrg.id, id);
    }, [currentOrg?.id, id]);

    const handlePrint = () => {
        window.print();
    };

    if (!invoice) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading...</div>;

    const taxAmount = (invoice.subtotal || 0) * (invoice.tax || 0) / 100;

    return (
        <>
            {/* Controls — hidden when printing */}
            <div className="print-hide" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <button onClick={() => navigate(`/invoices/${id}`)}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-secondary)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
                        <ArrowLeft size={16} /> Kembali ke Detail Invoice
                    </button>
                    <button onClick={handlePrint}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer',
                            background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white',
                            fontSize: 14, fontWeight: 600
                        }}>
                        <Printer size={16} /> Cetak / Simpan PDF
                    </button>
                </div>
            </div>

            {/* Printable Invoice */}
            <div ref={printRef} className="print-area" style={{
                background: 'white', color: '#1a1a1a', maxWidth: 800, margin: '0 auto',
                padding: 48, borderRadius: 12, fontFamily: "'Inter', sans-serif",
                boxShadow: '0 4px 24px rgba(0,0,0,0.3)'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                            <img src={logo} alt="BillPro" style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'contain' }} />
                            <div>
                                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1a1a1a' }}>
                                    {currentOrg?.name || 'BillPro'}
                                </h1>
                                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Invoice Management System</p>
                            </div>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#6366f1', letterSpacing: -1 }}>INVOICE</h2>
                        <p style={{ margin: '4px 0 0', fontSize: 16, fontWeight: 600, fontFamily: 'monospace', color: '#334155' }}>
                            {invoice.invoiceNumber}
                        </p>
                        <div style={{
                            display: 'inline-block', marginTop: 6, padding: '3px 12px', borderRadius: 20,
                            fontSize: 11, fontWeight: 600, letterSpacing: 0.5,
                            background: invoice.status === 'PAID' ? '#dcfce7' : invoice.status === 'SENT' ? '#dbeafe' : invoice.status === 'OVERDUE' ? '#fee2e2' : '#f1f5f9',
                            color: invoice.status === 'PAID' ? '#166534' : invoice.status === 'SENT' ? '#1e40af' : invoice.status === 'OVERDUE' ? '#991b1b' : '#475569',
                        }}>{invoice.status}</div>
                    </div>
                </div>

                {/* Divider */}
                <div style={{ height: 3, background: 'linear-gradient(90deg, #6366f1, #06b6d4)', borderRadius: 2, marginBottom: 32 }} />

                {/* Client & Dates */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 36 }}>
                    <div>
                        <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Tagihan Kepada</p>
                        <p style={{ margin: '6px 0 0', fontSize: 16, fontWeight: 600, color: '#1a1a1a' }}>{invoice.client?.name}</p>
                        {invoice.client?.email && <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748b' }}>{invoice.client.email}</p>}
                        {invoice.client?.phone && <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748b' }}>{invoice.client.phone}</p>}
                        {invoice.client?.address && <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748b' }}>{invoice.client.address}</p>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ marginBottom: 12 }}>
                            <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Tanggal Invoice</p>
                            <p style={{ margin: '4px 0 0', fontSize: 14, fontWeight: 500, color: '#1a1a1a' }}>{formatDate(invoice.issueDate)}</p>
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Jatuh Tempo</p>
                            <p style={{ margin: '4px 0 0', fontSize: 14, fontWeight: 500, color: '#ef4444' }}>{formatDate(invoice.dueDate)}</p>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
                    <thead>
                        <tr style={{ background: '#f8fafc' }}>
                            <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '2px solid #e2e8f0' }}>Deskripsi</th>
                            <th style={{ textAlign: 'center', padding: '10px 14px', fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '2px solid #e2e8f0' }}>Qty</th>
                            <th style={{ textAlign: 'right', padding: '10px 14px', fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '2px solid #e2e8f0' }}>Harga Satuan</th>
                            <th style={{ textAlign: 'right', padding: '10px 14px', fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '2px solid #e2e8f0' }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items?.map((item, idx) => (
                            <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '12px 14px', fontSize: 14, color: '#1a1a1a', fontWeight: 500 }}>{item.description}</td>
                                <td style={{ padding: '12px 14px', fontSize: 14, color: '#64748b', textAlign: 'center' }}>{item.quantity}</td>
                                <td style={{ padding: '12px 14px', fontSize: 14, color: '#64748b', textAlign: 'right' }}>{formatCurrency(item.unitPrice)}</td>
                                <td style={{ padding: '12px 14px', fontSize: 14, color: '#1a1a1a', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.total)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 36 }}>
                    <div style={{ width: 280 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14, color: '#64748b' }}>
                            <span>Subtotal</span>
                            <span>{formatCurrency(invoice.subtotal)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14, color: '#64748b' }}>
                            <span>Pajak ({invoice.tax || 0}%)</span>
                            <span>{formatCurrency(taxAmount)}</span>
                        </div>
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', padding: '12px 16px', marginTop: 8,
                            background: 'linear-gradient(135deg, #6366f1, #4f46e5)', borderRadius: 8,
                            fontSize: 18, fontWeight: 700, color: 'white'
                        }}>
                            <span>TOTAL</span>
                            <span>{formatCurrency(invoice.total)}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Info */}
                <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32,
                    padding: 20, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0'
                }}>
                    <div>
                        <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                            Informasi Pembayaran
                        </p>
                        <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>Bank BCA</p>
                        <p style={{ margin: '0 0 2px', fontSize: 13, color: '#64748b' }}>No. Rekening: <strong style={{ color: '#1a1a1a' }}>1234567890</strong></p>
                        <p style={{ margin: '0 0 2px', fontSize: 13, color: '#64748b' }}>Atas Nama: <strong style={{ color: '#1a1a1a' }}>{currentOrg?.name || 'BillPro'}</strong></p>
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                            Catatan
                        </p>
                        <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
                            {invoice.notes || 'Terima kasih atas kepercayaan Anda. Mohon lakukan pembayaran sebelum tanggal jatuh tempo.'}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ textAlign: 'center', paddingTop: 20, borderTop: '1px solid #e2e8f0' }}>
                    <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>
                        Invoice dibuat oleh <strong style={{ color: '#6366f1' }}>BillPro</strong> — Simple Invoicing for Growing Businesses
                    </p>
                </div>
            </div>
        </>
    );
}

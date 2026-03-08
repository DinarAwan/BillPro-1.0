import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import useOrgStore from '../stores/orgStore';
import useInvoiceStore from '../stores/invoiceStore';
import api from '../api/axios';

export default function InvoiceForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentOrg } = useOrgStore();
    const { createInvoice, updateInvoice, fetchInvoice, currentInvoice } = useInvoiceStore();
    const [clients, setClients] = useState([]);
    const [form, setForm] = useState({
        clientId: '', issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        tax: 11, notes: '',
        items: [{ description: '', quantity: 1, unitPrice: 0 }],
    });

    useEffect(() => {
        if (currentOrg?.id) api.get(`/organizations/${currentOrg.id}/clients`).then(r => setClients(r.data.data || [])).catch(() => { });
    }, [currentOrg?.id]);

    useEffect(() => {
        if (id && currentOrg?.id) fetchInvoice(currentOrg.id, id);
    }, [id, currentOrg?.id]);

    useEffect(() => {
        if (id && currentInvoice) {
            setForm({
                clientId: currentInvoice.clientId || '', issueDate: currentInvoice.issueDate?.split('T')[0] || '',
                dueDate: currentInvoice.dueDate?.split('T')[0] || '', tax: currentInvoice.tax || 11,
                notes: currentInvoice.notes || '',
                items: currentInvoice.items?.map(i => ({ description: i.description, quantity: i.quantity, unitPrice: i.unitPrice })) || [{ description: '', quantity: 1, unitPrice: 0 }],
            });
        }
    }, [id, currentInvoice]);

    const addItem = () => setForm({ ...form, items: [...form.items, { description: '', quantity: 1, unitPrice: 0 }] });
    const removeItem = (idx) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
    const updateItem = (idx, field, value) => {
        const items = [...form.items];
        items[idx][field] = field === 'quantity' || field === 'unitPrice' ? Number(value) : value;
        setForm({ ...form, items });
    };

    const subtotal = form.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    const taxAmount = subtotal * form.tax / 100;
    const total = subtotal + taxAmount;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (id) await updateInvoice(currentOrg.id, id, form);
            else await createInvoice(currentOrg.id, form);
            navigate('/invoices');
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal menyimpan invoice');
        }
    };

    const formatRp = (n) => `Rp ${n.toLocaleString('id-ID')}`;

    return (
        <div>
            <button onClick={() => navigate('/invoices')} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, color: 'var(--color-text-secondary)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
                <ArrowLeft size={16} /> Kembali ke Invoice
            </button>

            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)' }}>{id ? 'Edit Invoice' : 'Buat Invoice Baru'}</h1>
                <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 4 }}>Isi detail tagihan untuk klien Anda</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
                    {/* Left - Form */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {/* Client & Dates */}
                        <div className="glass-card" style={{ padding: 24 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 16 }}>Detail Invoice</h3>
                            <div className="grid-responsive-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6 }}>Klien</label>
                                    <select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} className="input-field" required>
                                        <option value="">Pilih klien</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6 }}>Tanggal Invoice</label>
                                    <input type="date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} className="input-field" required />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6 }}>Jatuh Tempo</label>
                                    <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="input-field" required />
                                </div>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="glass-card table-responsive" style={{ padding: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>Item Tagihan</h3>
                                <button type="button" onClick={addItem} style={{
                                    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, border: 'none',
                                    background: 'var(--color-bg-main)', color: 'var(--color-primary)', fontSize: 13, fontWeight: 500, cursor: 'pointer'
                                }}><Plus size={14} /> Tambah</button>
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                                        {['Deskripsi', 'Qty', 'Harga Satuan', 'Total', ''].map(h => (
                                            <th key={h} style={{ textAlign: 'left', padding: '8px 0', fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {form.items.map((item, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                                            <td style={{ padding: '8px 4px 8px 0' }}>
                                                <input value={item.description} onChange={(e) => updateItem(idx, 'description', e.target.value)}
                                                    className="input-field" placeholder="Nama layanan" required />
                                            </td>
                                            <td style={{ padding: '8px 4px', width: 70 }}>
                                                <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                                                    className="input-field" style={{ textAlign: 'center' }} required />
                                            </td>
                                            <td style={{ padding: '8px 4px', width: 140 }}>
                                                <input type="number" min="0" value={item.unitPrice} onChange={(e) => updateItem(idx, 'unitPrice', e.target.value)}
                                                    className="input-field" required />
                                            </td>
                                            <td style={{ padding: '8px 4px', width: 120, fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>
                                                {formatRp(item.quantity * item.unitPrice)}
                                            </td>
                                            <td style={{ padding: '8px 0 8px 4px', width: 40 }}>
                                                {form.items.length > 1 && (
                                                    <button type="button" onClick={() => removeItem(idx)} style={{ padding: 6, borderRadius: 6, border: 'none', background: '#fef2f2', cursor: 'pointer' }}>
                                                        <Trash2 size={14} style={{ color: 'var(--color-danger)' }} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Notes */}
                        <div className="glass-card" style={{ padding: 24 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6 }}>Catatan (opsional)</label>
                            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                className="input-field" rows={3} placeholder="Catatan untuk klien..." style={{ resize: 'vertical' }} />
                        </div>
                    </div>

                    {/* Right - Summary */}
                    <div>
                        <div className="glass-card" style={{ padding: 24, position: 'sticky', top: 80 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 16 }}>Ringkasan</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--color-text-secondary)' }}>
                                    <span>Subtotal</span><span>{formatRp(subtotal)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, color: 'var(--color-text-secondary)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span>Pajak</span>
                                        <input type="number" value={form.tax} onChange={(e) => setForm({ ...form, tax: Number(e.target.value) })}
                                            style={{ width: 50, padding: '2px 6px', borderRadius: 4, border: '1px solid var(--color-border)', fontSize: 13, textAlign: 'center', outline: 'none' }} />
                                        <span>%</span>
                                    </div>
                                    <span>{formatRp(taxAmount)}</span>
                                </div>
                                <div style={{ height: 1, background: 'var(--color-border)', margin: '8px 0' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                                    <span>Total</span><span style={{ color: 'var(--color-primary)' }}>{formatRp(total)}</span>
                                </div>
                            </div>
                            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 24 }}>
                                <Save size={16} /> {id ? 'Simpan Perubahan' : 'Buat Invoice'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

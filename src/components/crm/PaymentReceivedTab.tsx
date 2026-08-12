'use client';

import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { PaymentMode } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Trash2, X } from 'lucide-react';
import ModalPortal from '@/components/ui/ModalPortal';

const paymentModes: PaymentMode[] = ['Cash','UPI','Bank Transfer','Cheque'];

export default function PaymentReceivedTab({ projectId }: { projectId: string }) {
  const { getProjectPaymentsReceived, addPaymentReceived, deletePaymentReceived, getProject } = useData();
  const payments = getProjectPaymentsReceived(projectId);
  const project = getProject(projectId);
  const [showCreate, setShowCreate] = useState(false);

  const totalReceived = payments.reduce((s, p) => s + (p.amountReceived || 0), 0);
  const contractValue = project?.projectContractValue || 0;
  const outstanding = contractValue - totalReceived;

  const categoryTotals: Record<string, number> = {};
  let grandTotal = 0;
  payments.forEach(p => {
    categoryTotals[p.paymentMode] = (categoryTotals[p.paymentMode] || 0) + (p.amountReceived || 0);
    grandTotal += (p.amountReceived || 0);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: '#0F1C2E' }}>Payment Received ({payments.length})</h3>
        </div>
        <button className="btn-gold text-sm" onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" /> Record Payment
        </button>
      </div>

      {Object.keys(categoryTotals).length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
          <h4 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: '#C9A84C' }}>Totals By Payment Mode</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {paymentModes.map(cat => {
              const val = categoryTotals[cat];
              if (!val) return null;
              return (
                <div key={cat} className="flex justify-between p-3 rounded-lg" style={{ background: '#F8FAFC' }}>
                  <span className="text-xs font-medium text-gray-600">{cat}</span>
                  <span className="text-xs font-bold text-green-600">{formatCurrency(val)}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 flex flex-col sm:flex-row justify-between font-semibold gap-2" style={{ borderTop: '2px solid #C9A84C' }}>
            <div className="flex justify-between sm:w-1/3">
              <span className="text-sm" style={{ color: '#0F1C2E' }}>Total Received</span>
              <span className="text-sm text-green-600">{formatCurrency(totalReceived)}</span>
            </div>
            <div className="flex justify-between sm:w-1/3">
              <span className="text-sm" style={{ color: '#0F1C2E' }}>Outstanding</span>
              <span className="text-sm text-red-500">{formatCurrency(outstanding)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Table & Mobile Cards */}
      <div className="bg-white rounded-xl shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="crm-table">
            <thead>
              <tr><th>Date</th><th>Amount</th><th>Mode</th><th>Reference</th><th>Remarks</th><th></th></tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No payments received yet.</td></tr>
              ) : (
                payments.map(p => (
                  <tr key={p.id}>
                    <td className="text-xs text-gray-500">{formatDate(p.paymentDate)}</td>
                    <td className="font-semibold text-green-600">{formatCurrency(p.amountReceived)}</td>
                    <td>{p.paymentMode}</td>
                    <td className="text-xs">{p.referenceNumber || '—'}</td>
                    <td className="text-xs text-gray-500 max-w-[200px] truncate">{p.remarks || '—'}</td>
                    <td>
                      <button onClick={() => { if (confirm('Delete?')) deletePaymentReceived(p.id); }} className="p-1 rounded hover:bg-red-50">
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y" style={{ borderColor: '#E2E8F0' }}>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No payments received yet.</div>
          ) : (
            payments.map(p => (
              <div key={p.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-green-600">{formatCurrency(p.amountReceived)}</h4>
                    <span className="text-[12px] font-medium text-gray-500">{formatDate(p.paymentDate)}</span>
                  </div>
                  <button onClick={() => { if (confirm('Delete?')) deletePaymentReceived(p.id); }} className="p-1.5 rounded bg-red-50 text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                  <div>
                    <span className="text-xs text-gray-400 block mb-0.5">Mode</span>
                    <span className="font-medium text-gray-900">{p.paymentMode}</span>
                  </div>
                  {p.referenceNumber && (
                    <div>
                      <span className="text-xs text-gray-400 block mb-0.5">Reference</span>
                      <span className="text-gray-800">{p.referenceNumber}</span>
                    </div>
                  )}
                </div>
                
                {p.remarks && (
                  <div className="pt-2 mt-2 border-t border-dashed border-gray-200 text-xs">
                    <span className="text-gray-400 block mb-0.5">Remarks</span>
                    <span className="text-gray-700">{p.remarks}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {showCreate && (
        <ModalPortal>
          <div className="modal-overlay" onClick={() => setShowCreate(false)}>
            <div className="modal-content max-w-xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold" style={{ color: '#0F1C2E', fontFamily: "'Playfair Display', serif" }}>Record Payment Received</h2>
                <button onClick={() => setShowCreate(false)} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <ReceivedForm projectId={projectId} onSubmit={p => { addPaymentReceived(p); setShowCreate(false); }} onCancel={() => setShowCreate(false)} />
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}

function ReceivedForm({ projectId, onSubmit, onCancel }: {
  projectId: string;
  onSubmit: (p: Parameters<ReturnType<typeof useData>['addPaymentReceived']>[0]) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    paymentDate: '', amountReceived: '',
    paymentMode: 'Cash' as PaymentMode, referenceNumber: '',
    remarks: '', attachment: '',
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={e => {
      e.preventDefault();
      onSubmit({ projectId, ...form, amountReceived: form.amountReceived ? Number(form.amountReceived) : null });
    }} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1" style={{ color: '#0F1C2E' }}>Payment Date *</label><input type="date" className="crm-input" value={form.paymentDate} onChange={e => set('paymentDate', e.target.value)} required /></div>
        <div><label className="block text-sm font-medium mb-1" style={{ color: '#0F1C2E' }}>Amount (₹) *</label><input type="number" className="crm-input" value={form.amountReceived} onChange={e => set('amountReceived', e.target.value)} required /></div>
        <div><label className="block text-sm font-medium mb-1" style={{ color: '#0F1C2E' }}>Payment Mode</label>
          <select className="crm-select" value={form.paymentMode} onChange={e => set('paymentMode', e.target.value)}>{paymentModes.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
        <div><label className="block text-sm font-medium mb-1" style={{ color: '#0F1C2E' }}>Reference Number</label><input className="crm-input" value={form.referenceNumber} onChange={e => set('referenceNumber', e.target.value)} /></div>
        <div className="sm:col-span-2"><label className="block text-sm font-medium mb-1" style={{ color: '#0F1C2E' }}>Attachment</label><input type="file" className="crm-input text-xs" onChange={e => set('attachment', e.target.files?.[0]?.name || '')} /></div>
      </div>
      <div><label className="block text-sm font-medium mb-1" style={{ color: '#0F1C2E' }}>Remarks</label><textarea className="crm-textarea" value={form.remarks} onChange={e => set('remarks', e.target.value)} rows={2} /></div>
      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
        <button type="submit" className="btn-gold">Record Payment</button>
      </div>
    </form>
  );
}

'use client';

import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { OneTimeExpenseType, PaymentMode } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Trash2, X } from 'lucide-react';
import ModalPortal from '@/components/ui/ModalPortal';

const expenseTypes: OneTimeExpenseType[] = ['Government Work','Plan Approval','Architecture Plan','Borewell','Borewell Motor','Water Connection','Electric Meter','Meter Cable','Road Cutting'];
const paymentModes: PaymentMode[] = ['Cash','UPI','Bank Transfer','Cheque'];

export default function OneTimePaymentsTab({ projectId }: { projectId: string }) {
  const { getProjectOneTimePayments, addOneTimePayment, deleteOneTimePayment } = useData();
  const payments = getProjectOneTimePayments(projectId);
  const [showCreate, setShowCreate] = useState(false);

  const categoryTotals: Record<string, number> = {};
  let grandTotal = 0;
  payments.forEach(p => {
    categoryTotals[p.expenseType] = (categoryTotals[p.expenseType] || 0) + (p.amount || 0);
    grandTotal += (p.amount || 0);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: '#0F1C2E' }}>One-Time Payments ({payments.length})</h3>
        </div>
        <button className="btn-gold text-sm" onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      {Object.keys(categoryTotals).length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
          <h4 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: '#C9A84C' }}>Category Totals</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {expenseTypes.map(cat => {
              const val = categoryTotals[cat];
              if (!val) return null;
              return (
                <div key={cat} className="flex justify-between p-3 rounded-lg" style={{ background: '#F8FAFC' }}>
                  <span className="text-xs font-medium text-gray-600">{cat}</span>
                  <span className="text-xs font-bold" style={{ color: '#0F1C2E' }}>{formatCurrency(val)}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 flex justify-between font-semibold" style={{ borderTop: '2px solid #C9A84C' }}>
            <span className="text-sm" style={{ color: '#0F1C2E' }}>Grand Total</span>
            <span className="text-sm" style={{ color: '#C9A84C' }}>{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      )}

      {/* Table & Mobile Cards */}
      <div className="bg-white rounded-xl shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="crm-table">
            <thead>
              <tr><th>Expense Type</th><th>Date</th><th>Amount</th><th>Vendor</th><th>Mode</th><th>Remarks</th><th></th></tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">No expenses recorded.</td></tr>
              ) : (
                payments.map(p => (
                  <tr key={p.id}>
                    <td className="font-medium" style={{ color: '#0F1C2E' }}>{p.expenseType}</td>
                    <td className="text-xs text-gray-500">{formatDate(p.date)}</td>
                    <td className="font-semibold" style={{ color: '#C9A84C' }}>{formatCurrency(p.amount)}</td>
                    <td>{p.vendorName || '—'}</td>
                    <td>{p.paymentMode}</td>
                    <td className="text-xs text-gray-500 max-w-[200px] truncate">{p.remarks || '—'}</td>
                    <td>
                      <button onClick={() => { if (confirm('Delete?')) deleteOneTimePayment(p.id); }} className="p-1 rounded hover:bg-red-50">
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
            <div className="text-center py-8 text-gray-400 text-sm">No expenses recorded.</div>
          ) : (
            payments.map(p => (
              <div key={p.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold" style={{ color: '#0F1C2E' }}>{p.expenseType}</h4>
                    <span className="text-[12px] font-medium text-gray-500">{formatDate(p.date)}</span>
                  </div>
                  <button onClick={() => { if (confirm('Delete?')) deleteOneTimePayment(p.id); }} className="p-1.5 rounded bg-red-50 text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                  <div>
                    <span className="text-xs text-gray-400 block mb-0.5">Amount</span>
                    <span className="font-bold" style={{ color: '#C9A84C' }}>{formatCurrency(p.amount)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block mb-0.5">Mode</span>
                    <span className="font-medium text-gray-900">{p.paymentMode}</span>
                  </div>
                </div>
                
                {(p.vendorName || p.remarks) && (
                  <div className="pt-2 mt-2 border-t border-dashed border-gray-200 text-xs space-y-2">
                    {p.vendorName && (
                      <div>
                        <span className="text-gray-400 block mb-0.5">Vendor Name</span>
                        <span className="text-gray-700">{p.vendorName}</span>
                      </div>
                    )}
                    {p.remarks && (
                      <div>
                        <span className="text-gray-400 block mb-0.5">Remarks</span>
                        <span className="text-gray-700">{p.remarks}</span>
                      </div>
                    )}
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
                <h2 className="text-xl font-bold" style={{ color: '#0F1C2E', fontFamily: "'Playfair Display', serif" }}>Add One-Time Expense</h2>
                <button onClick={() => setShowCreate(false)} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <OneTimeForm projectId={projectId} onSubmit={p => { addOneTimePayment(p); setShowCreate(false); }} onCancel={() => setShowCreate(false)} />
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}

function OneTimeForm({ projectId, onSubmit, onCancel }: {
  projectId: string;
  onSubmit: (p: Parameters<ReturnType<typeof useData>['addOneTimePayment']>[0]) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    expenseType: 'Government Work' as OneTimeExpenseType,
    date: '', amount: '', vendorName: '',
    paymentMode: 'Cash' as PaymentMode, remarks: '', attachment: '',
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={e => {
      e.preventDefault();
      onSubmit({ projectId, ...form, amount: form.amount ? Number(form.amount) : null });
    }} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1" style={{ color: '#0F1C2E' }}>Expense Type</label>
          <select className="crm-select" value={form.expenseType} onChange={e => set('expenseType', e.target.value)}>{expenseTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
        <div><label className="block text-sm font-medium mb-1" style={{ color: '#0F1C2E' }}>Date</label><input type="date" className="crm-input" value={form.date} onChange={e => set('date', e.target.value)} /></div>
        <div><label className="block text-sm font-medium mb-1" style={{ color: '#0F1C2E' }}>Amount (₹) *</label><input type="number" className="crm-input" value={form.amount} onChange={e => set('amount', e.target.value)} required /></div>
        <div><label className="block text-sm font-medium mb-1" style={{ color: '#0F1C2E' }}>Vendor Name</label><input className="crm-input" value={form.vendorName} onChange={e => set('vendorName', e.target.value)} /></div>
        <div><label className="block text-sm font-medium mb-1" style={{ color: '#0F1C2E' }}>Payment Mode</label>
          <select className="crm-select" value={form.paymentMode} onChange={e => set('paymentMode', e.target.value)}>{paymentModes.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
        <div><label className="block text-sm font-medium mb-1" style={{ color: '#0F1C2E' }}>Attachment</label><input type="file" className="crm-input text-xs" onChange={e => set('attachment', e.target.files?.[0]?.name || '')} /></div>
      </div>
      <div><label className="block text-sm font-medium mb-1" style={{ color: '#0F1C2E' }}>Remarks</label><textarea className="crm-textarea" value={form.remarks} onChange={e => set('remarks', e.target.value)} rows={2} /></div>
      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
        <button type="submit" className="btn-gold">Add Expense</button>
      </div>
    </form>
  );
}

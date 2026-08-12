'use client';

import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Trash2, X, Package } from 'lucide-react';
import ModalPortal from '@/components/ui/ModalPortal';

export default function OtherMaterialsTab({ projectId }: { projectId: string }) {
  const { getProjectOtherMaterials, addOtherMaterial, deleteOtherMaterial } = useData();
  const materials = getProjectOtherMaterials(projectId);
  const [showCreate, setShowCreate] = useState(false);

  const categoryTotals: Record<string, number> = {};
  let grandTotal = 0;
  materials.forEach(m => {
    categoryTotals[m.materialName] = (categoryTotals[m.materialName] || 0) + (m.amount || 0);
    grandTotal += (m.amount || 0);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: '#0F1C2E' }}>Other Materials ({materials.length})</h3>
        </div>
        <button className="btn-gold text-sm" onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" /> Add Other Material
        </button>
      </div>

      {Object.keys(categoryTotals).length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
          <h4 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: '#C9A84C' }}>Material Totals</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.keys(categoryTotals).map(cat => {
              const val = categoryTotals[cat];
              return (
                <div key={cat} className="flex justify-between p-3 rounded-lg" style={{ background: '#F8FAFC' }}>
                  <span className="text-xs font-medium text-gray-600 truncate mr-2" title={cat}>{cat}</span>
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
              <tr>
                <th>Material Name</th>
                <th>Date</th>
                <th>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {materials.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400">No other materials recorded yet.</td></tr>
              ) : (
                materials.map(m => (
                  <tr key={m.id}>
                    <td className="font-medium" style={{ color: '#0F1C2E' }}>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        {m.materialName}
                      </div>
                    </td>
                    <td className="text-xs text-gray-500">{formatDate(m.date)}</td>
                    <td className="font-semibold" style={{ color: '#0F1C2E' }}>{formatCurrency(m.amount)}</td>
                    <td>
                      <button onClick={() => { if (confirm('Delete?')) deleteOtherMaterial(m.id); }} className="p-1 rounded hover:bg-red-50">
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
          {materials.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No other materials recorded yet.</div>
          ) : (
            materials.map(m => (
              <div key={m.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold" style={{ color: '#0F1C2E' }}>{m.materialName}</h4>
                      <span className="text-[12px] font-medium text-gray-500">{formatDate(m.date)}</span>
                    </div>
                  </div>
                  <button onClick={() => { if (confirm('Delete?')) deleteOtherMaterial(m.id); }} className="p-1.5 rounded bg-red-50 text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="pt-2 border-t border-dashed border-gray-200">
                  <span className="text-xs text-gray-400 block mb-1">Amount</span>
                  <span className="font-bold" style={{ color: '#0F1C2E' }}>{formatCurrency(m.amount)}</span>
                </div>
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
                <h2 className="text-xl font-bold" style={{ color: '#0F1C2E', fontFamily: "'Playfair Display', serif" }}>Add Other Material</h2>
                <button onClick={() => setShowCreate(false)} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <MaterialForm
                projectId={projectId}
                onSubmit={p => { addOtherMaterial(p); setShowCreate(false); }}
                onCancel={() => setShowCreate(false)}
              />
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}

function MaterialForm({ projectId, onSubmit, onCancel }: {
  projectId: string;
  onSubmit: (p: Parameters<ReturnType<typeof useData>['addOtherMaterial']>[0]) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    materialName: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={e => {
      e.preventDefault();
      onSubmit({ projectId, ...form, amount: form.amount ? Number(form.amount) : null });
    }} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: '#0F1C2E' }}>Material Name *</label>
          <input className="crm-input" value={form.materialName} onChange={e => set('materialName', e.target.value)} required placeholder="e.g. Nails, Threads..." />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: '#0F1C2E' }}>Date</label>
          <input type="date" className="crm-input" value={form.date} onChange={e => set('date', e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: '#0F1C2E' }}>Amount (₹) *</label>
          <input type="number" className="crm-input" value={form.amount} onChange={e => set('amount', e.target.value)} required />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
        <button type="submit" className="btn-gold">Add Material</button>
      </div>
    </form>
  );
}

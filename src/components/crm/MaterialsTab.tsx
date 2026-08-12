'use client';

import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { MaterialCategory, MaterialUnit } from '@/lib/types';
import { materialCategoryOptions, materialNamesByCategory } from '@/data/materialOptions';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Trash2, X } from 'lucide-react';
import ModalPortal from '@/components/ui/ModalPortal';

const units: MaterialUnit[] = ['Kg','Ton','Bag','Load','Piece','Sq.ft','Box','Litre'];

export default function MaterialsTab({ projectId }: { projectId: string }) {
  const { getProjectMaterials, addMaterial, deleteMaterial } = useData();
  const materials = getProjectMaterials(projectId);
  const [showCreate, setShowCreate] = useState(false);

  // Category rollups
  const categoryTotals: Record<string, number> = {};
  let grandTotal = 0;
  materials.forEach(m => {
    categoryTotals[m.materialCategory] = (categoryTotals[m.materialCategory] || 0) + m.totalAmount;
    grandTotal += m.totalAmount;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold" style={{ color: '#0F1C2E' }}>Materials ({materials.length})</h3>
        <button className="btn-gold text-sm" onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" /> Add Material
        </button>
      </div>

      {/* Category Rollups */}
      {Object.keys(categoryTotals).length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
          <h4 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: '#C9A84C' }}>Category Totals</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {materialCategoryOptions.map(cat => {
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
              <tr>
                <th>Category</th>
                <th>Material</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Rate</th>
                <th>Total</th>
                <th>Date</th>
                <th>Vendor</th>
                <th>Invoice</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {materials.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-8 text-gray-400">No materials added yet.</td></tr>
              ) : (
                materials.map(m => (
                  <tr key={m.id}>
                    <td className="text-xs">{m.materialCategory}</td>
                    <td className="font-medium" style={{ color: '#0F1C2E' }}>{m.materialName}</td>
                    <td>{m.quantity}</td>
                    <td>{m.unit}</td>
                    <td>{formatCurrency(m.rate)}</td>
                    <td className="font-semibold" style={{ color: '#C9A84C' }}>{formatCurrency(m.totalAmount)}</td>
                    <td className="text-xs text-gray-500">{formatDate(m.purchaseDate)}</td>
                    <td className="text-xs">{m.vendorName || '—'}</td>
                    <td className="text-xs">{m.invoiceNumber || '—'}</td>
                    <td>
                      <button onClick={() => { if (confirm('Delete?')) deleteMaterial(m.id); }} className="p-1 rounded hover:bg-red-50">
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
            <div className="text-center py-8 text-gray-400 text-sm">No materials added yet.</div>
          ) : (
            materials.map(m => (
              <div key={m.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold" style={{ color: '#0F1C2E' }}>{m.materialName}</h4>
                    <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">{m.materialCategory}</span>
                  </div>
                  <button onClick={() => { if (confirm('Delete?')) deleteMaterial(m.id); }} className="p-1.5 rounded bg-red-50 text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                  <div>
                    <span className="text-xs text-gray-400 block mb-0.5">Quantity</span>
                    <span className="font-medium text-gray-900">{m.quantity} {m.unit}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block mb-0.5">Rate</span>
                    <span className="font-medium text-gray-900">{formatCurrency(m.rate)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block mb-0.5">Total Amount</span>
                    <span className="font-bold" style={{ color: '#C9A84C' }}>{formatCurrency(m.totalAmount)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block mb-0.5">Date</span>
                    <span className="text-gray-800">{formatDate(m.purchaseDate)}</span>
                  </div>
                </div>
                
                {(m.vendorName || m.invoiceNumber) && (
                  <div className="pt-2 mt-2 border-t border-dashed border-gray-200 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-400 block mb-0.5">Vendor</span>
                      <span className="text-gray-700">{m.vendorName || '—'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-0.5">Invoice</span>
                      <span className="text-gray-700">{m.invoiceNumber || '—'}</span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {showCreate && (
        <CreateMaterialModal
          projectId={projectId}
          onClose={() => setShowCreate(false)}
          onCreate={m => { addMaterial(m); setShowCreate(false); }}
        />
      )}
    </div>
  );
}

function CreateMaterialModal({
  projectId, onClose, onCreate,
}: {
  projectId: string;
  onClose: () => void;
  onCreate: (m: Parameters<ReturnType<typeof useData>['addMaterial']>[0]) => void;
}) {
  const [form, setForm] = useState({
    materialCategory: 'Construction Materials' as MaterialCategory,
    materialName: '',
    quantity: '',
    unit: 'Kg' as MaterialUnit,
    rate: '',
    purchaseDate: '',
    vendorName: '',
    invoiceNumber: '',
    billAttachment: '',
    remarks: '',
  });

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));
  const nameOptions = materialNamesByCategory[form.materialCategory] || [];

  return (
    <ModalPortal>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content max-w-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold" style={{ color: '#0F1C2E', fontFamily: "'Playfair Display', serif" }}>Add Material</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-400" /></button>
          </div>
          <form onSubmit={e => {
            e.preventDefault();
            onCreate({
              projectId,
              materialCategory: form.materialCategory,
              materialName: form.materialName,
              quantity: form.quantity ? Number(form.quantity) : null,
              unit: form.unit,
              rate: form.rate ? Number(form.rate) : null,
              purchaseDate: form.purchaseDate,
              vendorName: form.vendorName,
              invoiceNumber: form.invoiceNumber,
              billAttachment: form.billAttachment,
              remarks: form.remarks,
            });
          }} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#0F1C2E' }}>Category *</label>
                <select className="crm-select" value={form.materialCategory} onChange={e => { set('materialCategory', e.target.value); set('materialName', ''); }}>
                  {materialCategoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#0F1C2E' }}>Material Name *</label>
                <select className="crm-select" value={form.materialName} onChange={e => set('materialName', e.target.value)} required>
                  <option value="">— Select —</option>
                  {nameOptions.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-medium mb-1" style={{ color: '#0F1C2E' }}>Quantity *</label><input type="number" className="crm-input" value={form.quantity} onChange={e => set('quantity', e.target.value)} required /></div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#0F1C2E' }}>Unit</label>
                <select className="crm-select" value={form.unit} onChange={e => set('unit', e.target.value)}>
                  {units.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-medium mb-1" style={{ color: '#0F1C2E' }}>Rate (₹) *</label><input type="number" className="crm-input" value={form.rate} onChange={e => set('rate', e.target.value)} required /></div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#64748B' }}>Total Amount</label>
                <div className="crm-input bg-gray-50 font-semibold" style={{ color: '#C9A84C' }}>
                  {formatCurrency((Number(form.quantity) || 0) * (Number(form.rate) || 0))}
                </div>
              </div>
              <div><label className="block text-sm font-medium mb-1" style={{ color: '#0F1C2E' }}>Purchase Date</label><input type="date" className="crm-input" value={form.purchaseDate} onChange={e => set('purchaseDate', e.target.value)} /></div>
              <div><label className="block text-sm font-medium mb-1" style={{ color: '#0F1C2E' }}>Vendor Name</label><input className="crm-input" value={form.vendorName} onChange={e => set('vendorName', e.target.value)} /></div>
              <div><label className="block text-sm font-medium mb-1" style={{ color: '#0F1C2E' }}>Invoice Number</label><input className="crm-input" value={form.invoiceNumber} onChange={e => set('invoiceNumber', e.target.value)} /></div>
              <div><label className="block text-sm font-medium mb-1" style={{ color: '#0F1C2E' }}>Bill Attachment</label><input type="file" className="crm-input text-xs" onChange={e => set('billAttachment', e.target.files?.[0]?.name || '')} /></div>
            </div>
            <div><label className="block text-sm font-medium mb-1" style={{ color: '#0F1C2E' }}>Remarks</label><textarea className="crm-textarea" value={form.remarks} onChange={e => set('remarks', e.target.value)} rows={2} /></div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
              <button type="submit" className="btn-gold">Add Material</button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
}

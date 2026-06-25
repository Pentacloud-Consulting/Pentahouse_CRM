'use client';

import { useState, useMemo, useRef } from 'react';
import { useData } from '@/contexts/DataContext';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Plus, Trash2, X, FileText, Printer, Check, Pencil } from 'lucide-react';
import ModalPortal from '@/components/ui/ModalPortal';
import { QuotationLineItem } from '@/lib/types';
import { useReactToPrint } from 'react-to-print';
import QuotationPrintLayout, { DEFAULT_DESCRIPTIONS } from './QuotationPrintLayout';

const CATEGORIES = ['Kitchen', 'Bed Room 1', 'Bed Room 2', 'Bed Room 3', 'Dining Cabinet', 'TV Unit', 'Wood Paneling', 'Shoe Rack', 'POP', 'Storage', 'Wash Basin', 'Bathroom Vanity', 'Foyer'];
const FLOORS = ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor', '5th Floor'];

const PREDEFINED_SUB_CATEGORIES: Record<string, string[]> = {
  'Kitchen': ['Below Counter', 'Over Head', 'Kitchen Loft', 'Tandem Box'],
  'Bed Room 1': ['Wardrobe', 'Wardrobe Loft', 'Dressing Table', 'Bed - With Storage', 'Bed - Without Storage', 'Bed - Side Drawer 1', 'Bed - Side Drawer 2', 'Study', 'Sitting'],
  'Bed Room 2': ['Wardrobe', 'Wardrobe Loft', 'Dressing Table', 'Bed - With Storage', 'Bed - Without Storage', 'Bed - Side Drawer 1', 'Bed - Side Drawer 2', 'Study', 'Sitting'],
  'Bed Room 3': ['Wardrobe', 'Wardrobe Loft', 'Dressing Table', 'Bed - With Storage', 'Bed - Without Storage', 'Bed - Side Drawer 1', 'Bed - Side Drawer 2', 'Study', 'Sitting'],
};

export default function InteriorMaterialsTab({ projectId }: { projectId: string }) {
  const { getProjectQuotations, deleteQuotation, getProject, getAccount } = useData();
  const quotations = getProjectQuotations(projectId);

  const project = getProject(projectId);
  const account = project?.accountId ? getAccount(project.accountId) : null;

  const [showBuilder, setShowBuilder] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<any>(null);
  const [selectedQuoteForPrint, setSelectedQuoteForPrint] = useState<any>(null);

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: printRef });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold" style={{ color: '#0F1C2E' }}>Saved Quotations ({quotations.length})</h3>
        <button className="btn-gold text-sm" onClick={() => { setEditingQuotation(null); setShowBuilder(true); }}>
          <Plus className="w-4 h-4" /> Create New Quotation
        </button>
      </div>

      {/* Quotations List */}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
        <div className="overflow-x-auto">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Quote No.</th>
                <th>Date</th>
                <th>Client</th>
                <th>Items</th>
                <th>Grand Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotations.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No saved quotations found. Click "Create New Quotation" to build one.</td></tr>
              ) : (
                quotations.map(q => (
                  <tr key={q.id} className="group">
                    <td className="font-semibold text-blue-600">{q.quotationNumber}</td>
                    <td>{formatDate(q.quotationDate)}</td>
                    <td>{q.clientName || '—'}</td>
                    <td>{q.items.length} items</td>
                    <td className="font-bold" style={{ color: '#C9A84C' }}>{formatCurrency(q.grandTotal)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingQuotation(q);
                            setShowBuilder(true);
                          }}
                          className="px-3 py-1.5 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-semibold flex items-center gap-1.5"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedQuoteForPrint(q);
                            setTimeout(() => handlePrint(), 100);
                          }}
                          className="px-3 py-1.5 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-semibold flex items-center gap-1.5"
                        >
                          <Printer className="w-3.5 h-3.5" /> Print PDF
                        </button>
                        <button onClick={() => { if (confirm('Delete this quotation?')) deleteQuotation(q.id); }} className="p-1.5 rounded hover:bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quotation Builder Modal */}
      {showBuilder && (
        <QuotationBuilder
          projectId={projectId}
          project={project}
          account={account}
          initialQuotation={editingQuotation}
          onClose={() => setShowBuilder(false)}
        />
      )}

      {/* Hidden Print Layout */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        {selectedQuoteForPrint && (
          <QuotationPrintLayout
            ref={printRef}
            items={selectedQuoteForPrint.items}
            projectName={selectedQuoteForPrint.projectName}
            projectLocation={selectedQuoteForPrint.projectLocation}
            clientName={selectedQuoteForPrint.clientName}
            quotationNumber={selectedQuoteForPrint.quotationNumber}
            quotationDate={selectedQuoteForPrint.quotationDate}
          />
        )}
      </div>
    </div>
  );
}

function QuotationBuilder({ projectId, project, account, initialQuotation, onClose }: { projectId: string, project: any, account: any, initialQuotation?: any, onClose: () => void }) {
  const { addQuotation, updateQuotation, data } = useData();
  const [items, setItems] = useState<QuotationLineItem[]>(initialQuotation?.items || []);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: printRef });

  const clientName = account?.clientName || project?.projectName || 'Client';
  const nextNumber = `QT-${String((data.quotations?.length || 0) + 1).padStart(4, '0')}`;

  const [quoteMeta, setQuoteMeta] = useState({
    quotationNumber: initialQuotation?.quotationNumber || nextNumber,
    quotationDate: initialQuotation?.quotationDate || new Date().toISOString().split('T')[0],
  });

  const grandTotal = useMemo(() => items.reduce((s, i) => s + i.totalAmount, 0), [items]);

  const handleSaveAndPrint = () => {
    if (items.length === 0) {
      alert("Please add at least one item.");
      return;
    }

    // Save to DB
    const payload = {
      projectId,
      quotationNumber: quoteMeta.quotationNumber,
      clientName,
      projectName: project?.projectName || '',
      projectLocation: project?.projectLocation || '',
      items,
      grandTotal,
      quotationDate: quoteMeta.quotationDate,
    };

    if (initialQuotation) {
      updateQuotation(initialQuotation.id, payload);
    } else {
      addQuotation(payload);
    }

    // Print
    handlePrint();

    // Close builder
    onClose();
  };

  return (
    <ModalPortal>
      <div className="modal-overlay p-4 sm:p-6" onClick={onClose}>
        <div className="modal-content w-full max-w-7xl h-[95vh] flex flex-col" onClick={e => e.stopPropagation()}>

          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div>
              <h2 className="text-xl font-bold" style={{ color: '#0F1C2E', fontFamily: "'Playfair Display', serif" }}>Quotation Builder</h2>
              <p className="text-sm text-gray-500">Add items to build the quotation, then generate the PDF.</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-400" /></button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-6">

            {/* Meta Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-5 rounded-xl border border-gray-200">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Date</label>
                <input type="date" className="crm-input bg-white" value={quoteMeta.quotationDate} onChange={e => setQuoteMeta({ ...quoteMeta, quotationDate: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Client</label>
                <div className="crm-input bg-gray-100 text-gray-600 font-medium">{clientName}</div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Project</label>
                <div className="crm-input bg-gray-100 text-gray-600 font-medium truncate">{project?.projectName}</div>
              </div>
            </div>

            {/* Items List */}
            <div className="border rounded-xl overflow-hidden">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Sub-category / Description</th>
                    <th>Measurement</th>
                    <th>Area</th>
                    <th>Cost/Sq.ft</th>
                    <th>Total</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-6 text-gray-400">No items added to this quotation yet.</td></tr>
                  ) : (
                    items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="font-semibold">
                          <div>{it.category}</div>
                          <div className="text-xs text-gray-500 font-normal">{it.floor}</div>
                        </td>
                        <td>
                          <div className="font-medium text-gray-900">{it.subCategory || '—'}</div>
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2" title={it.notes}>{it.notes}</div>
                        </td>
                        <td>{it.measurement}</td>
                        <td>{it.area.toFixed(2)}</td>
                        <td>{formatCurrency(it.costPerSqft)}</td>
                        <td className="font-bold text-gray-900">{formatCurrency(it.totalAmount)}</td>
                        <td>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingItemIndex(idx);
                                setShowItemForm(true);
                              }}
                              className="p-1.5 rounded hover:bg-gray-100 text-gray-500"
                              title="Edit Item"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="p-1.5 rounded hover:bg-red-50 text-red-500" title="Delete Item">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Add/Edit Item Form */}
            {showItemForm ? (
              <div className="bg-yellow-50/30 p-5 md:p-6 rounded-xl border border-yellow-200 shadow-sm">
                <ItemForm
                  key={editingItemIndex ?? 'new'}
                  initialItem={editingItemIndex !== null ? items[editingItemIndex] : undefined}
                  onSave={(item) => {
                    if (editingItemIndex !== null) {
                      const newItems = [...items];
                      newItems[editingItemIndex] = item;
                      setItems(newItems);
                    } else {
                      setItems([...items, item]);
                    }
                    setShowItemForm(false);
                    setEditingItemIndex(null);
                  }}
                  onCancel={() => {
                    setShowItemForm(false);
                    setEditingItemIndex(null);
                  }}
                />
              </div>
            ) : (
              <button
                onClick={() => { setEditingItemIndex(null); setShowItemForm(true); }}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-gray-400 hover:text-gray-700 font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Line Item to Quotation
              </button>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t mt-4 flex-shrink-0">
            <div className="text-lg">
              <span className="text-gray-500 font-medium mr-2">Grand Total:</span>
              <span className="font-bold" style={{ color: '#C9A84C' }}>{formatCurrency(grandTotal)}</span>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
              <button
                onClick={handleSaveAndPrint}
                disabled={items.length === 0}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-all ${items.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'hover:opacity-90'}`}
                style={items.length > 0 ? { background: '#1a2332' } : {}}
              >
                <Check className="w-4 h-4" /> Save & Generate PDF
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Hidden Print Layout for Current Builder State */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <QuotationPrintLayout
          ref={printRef}
          items={items}
          projectName={project?.projectName || ''}
          projectLocation={project?.projectLocation || ''}
          clientName={clientName}
          quotationNumber={quoteMeta.quotationNumber}
          quotationDate={quoteMeta.quotationDate}
        />
      </div>

    </ModalPortal>
  );
}

function ItemForm({ initialItem, onSave, onCancel }: { initialItem?: QuotationLineItem; onSave: (item: QuotationLineItem) => void; onCancel: () => void; }) {
  const [form, setForm] = useState({
    floor: initialItem?.floor || FLOORS[0],
    category: initialItem?.category || CATEGORIES[0],
    subCategory: initialItem?.subCategory || '',
    measurement: initialItem?.measurement || '',
    area: initialItem ? String(initialItem.area) : '',
    costPerSqft: initialItem ? String(initialItem.costPerSqft) : '',
    notes: initialItem?.notes || '',
  });

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubCategoryChange = (subCat: string) => {
    set('subCategory', subCat);
    if (!form.notes && DEFAULT_DESCRIPTIONS[subCat]) {
      set('notes', DEFAULT_DESCRIPTIONS[subCat]);
    }
  };

  const handleCategoryChange = (cat: string) => {
    set('category', cat);
    set('subCategory', '');
    if (!PREDEFINED_SUB_CATEGORIES[cat] && DEFAULT_DESCRIPTIONS[cat]) {
      set('notes', DEFAULT_DESCRIPTIONS[cat]);
    } else {
      set('notes', '');
    }
  };

  const subCategoryOptions = PREDEFINED_SUB_CATEGORIES[form.category] || null;

  const handleMeasurementChange = (val: string) => {
    set('measurement', val);
    const parts = val.toLowerCase().split('x');
    if (parts.length === 2) {
      const w = parseFloat(parts[0]);
      const h = parseFloat(parts[1]);
      if (!isNaN(w) && !isNaN(h)) {
        set('area', String(w * h));
      }
    }
  };

  const parsedArea = Number(form.area) || 0;
  const totalAmount = parsedArea * (Number(form.costPerSqft) || 0);

  const handleSubmit = () => {
    if (parsedArea <= 0 || !form.costPerSqft) {
      alert("Please enter a valid Area and Cost.");
      return;
    }
    onSave({
      ...form,
      costPerSqft: Number(form.costPerSqft),
      area: parsedArea,
      totalAmount
    });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <div>
          <label className="block text-xs font-semibold mb-1 text-gray-700">Floor *</label>
          <select className="crm-input bg-white" value={form.floor} onChange={e => set('floor', e.target.value)}>
            {FLOORS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1 text-gray-700">Category *</label>
          <select className="crm-input bg-white" value={form.category} onChange={e => handleCategoryChange(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1 text-gray-700">Sub-category</label>
          {subCategoryOptions ? (
            <select className="crm-input bg-white" value={form.subCategory} onChange={e => handleSubCategoryChange(e.target.value)}>
              <option value="">Select Sub-category...</option>
              {subCategoryOptions.map(sc => <option key={sc} value={sc}>{sc}</option>)}
            </select>
          ) : (
            <input type="text" className="crm-input bg-white" value={form.subCategory} onChange={e => set('subCategory', e.target.value)} placeholder="Enter sub-category..." />
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1 text-gray-700">Measurement (W x H)</label>
          <input
            type="text"
            className="crm-input bg-white"
            value={form.measurement} onChange={e => handleMeasurementChange(e.target.value)}
            placeholder="e.g. 6.8x7"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1 text-gray-700">Area (Sq.ft) *</label>
          <input
            type="number" step="0.01"
            className="crm-input bg-white"
            value={form.area} onChange={e => set('area', e.target.value)}
            placeholder="e.g. 47.6"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1 text-gray-700">Cost per Sq.ft *</label>
          <input type="number" step="0.01" className="crm-input bg-white" value={form.costPerSqft} onChange={e => set('costPerSqft', e.target.value)} placeholder="e.g. 1500" />
        </div>

        <div className="md:col-span-2 xl:col-span-4">
          <label className="block text-xs font-semibold mb-1 text-gray-700">Description (appears in PDF)</label>
          <textarea className="crm-input bg-white" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Auto-filled based on category. Edit as needed..." rows={2} />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
        <button type="button" onClick={handleSubmit} className="btn-gold text-sm px-6 py-2">
          {initialItem ? 'Update Item' : 'Add to Quotation'}
        </button>
      </div>
    </div>
  );
}

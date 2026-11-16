'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useData } from '@/contexts/DataContext';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Plus, Trash2, X, Check, Pencil, Eye, Download, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import ModalPortal from '@/components/ui/ModalPortal';
import { QuotationLineItem, Quotation, Project, Account } from '@/lib/types';
import QuotationPrintLayout, { DEFAULT_DESCRIPTIONS } from './QuotationPrintLayout';

const CATEGORIES = ['Kitchen', 'Bed Room 1', 'Bed Room 2', 'Bed Room 3', 'Dining Cabinet', 'TV Unit', 'Wood Paneling', 'Shoe Rack', 'POP', 'Storage', 'Wash Basin', 'Bathroom Vanity', 'Foyer', 'Dressing'];
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
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [selectedQuoteForPrint, setSelectedQuoteForPrint] = useState<Quotation | null>(null);
  const [viewingQuotation, setViewingQuotation] = useState<Quotation | null>(null);

  const printRef = useRef<HTMLDivElement>(null);
  const handleDownload = async (qNumber: string) => {
    if (!printRef.current) return;
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin: 0.5,
        filename: `Quotation_${qNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await html2pdf().set(opt as any).from(printRef.current).save();
    } catch (error) {
      console.error('PDF generation error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold" style={{ color: '#0F1C2E' }}>Saved Quotations ({quotations.length})</h3>
        <button className="btn-gold text-sm" onClick={() => { setEditingQuotation(null); setShowBuilder(true); }}>
          <Plus className="w-4 h-4" /> Create New Quotation
        </button>
      </div>

      {/* Quotations List */}
      <div className="bg-white rounded-xl shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
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
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No saved quotations found. Click &quot;Create New Quotation&quot; to build one.</td></tr>
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
                          onClick={() => setViewingQuotation(q)}
                          className="px-3 py-1.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                        <button
                          onClick={() => {
                            setSelectedQuoteForPrint(q);
                            setTimeout(() => handleDownload(q.quotationNumber), 100);
                          }}
                          className="px-3 py-1.5 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-semibold flex items-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" /> Download
                        </button>
                        <button onClick={() => { if (confirm('Delete this quotation?')) deleteQuotation(q.id); }} className="p-1.5 rounded hover:bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
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

        {/* Mobile Cards */}
        <div className="md:hidden divide-y" style={{ borderColor: '#E2E8F0' }}>
          {quotations.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No saved quotations found.</div>
          ) : (
            quotations.map(q => (
              <div key={q.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-blue-600">{q.quotationNumber}</h4>
                    <span className="text-[12px] font-medium text-gray-500">{formatDate(q.quotationDate)}</span>
                  </div>
                  <button onClick={() => { if (confirm('Delete this quotation?')) deleteQuotation(q.id); }} className="p-1.5 rounded bg-red-50 text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                  <div>
                    <span className="text-xs text-gray-400 block mb-0.5">Client</span>
                    <span className="font-medium text-gray-900">{q.clientName || '—'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block mb-0.5">Grand Total</span>
                    <span className="font-bold" style={{ color: '#C9A84C' }}>{formatCurrency(q.grandTotal)}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-gray-400 block mb-0.5">Items</span>
                    <span className="font-medium text-gray-700">{q.items.length} items included</span>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2 border-t border-dashed border-gray-200">
                  <button
                    onClick={() => {
                      setEditingQuotation(q);
                      setShowBuilder(true);
                    }}
                    className="flex-1 py-2 rounded bg-gray-50 text-gray-700 border border-gray-200 text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedQuoteForPrint(q);
                      setTimeout(() => handleDownload(q.quotationNumber), 100);
                    }}
                    className="flex-1 py-2 rounded bg-gray-50 text-gray-700 border border-gray-200 text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              </div>
            ))
          )}
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

      {/* View Quotation Modal */}
      {viewingQuotation && (
        <ModalPortal>
          <div className="modal-overlay p-4 sm:p-6" onClick={() => setViewingQuotation(null)}>
            <div className="modal-content w-full max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-gray-50" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 flex-shrink-0 z-10">
                <h3 className="font-bold text-gray-900">View Quotation: {viewingQuotation.quotationNumber}</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedQuoteForPrint(viewingQuotation);
                      setTimeout(() => handleDownload(viewingQuotation.quotationNumber), 100);
                    }}
                    className="btn-gold px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                  <button onClick={() => setViewingQuotation(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center">
                <div className="bg-white shadow-sm border border-gray-200" style={{ transformOrigin: 'top center', transform: 'scale(0.95)' }}>
                  <QuotationPrintLayout
                    items={viewingQuotation.items}
                    projectName={viewingQuotation.projectName}
                    projectLocation={viewingQuotation.projectLocation}
                    clientName={viewingQuotation.clientName}
                    quotationNumber={viewingQuotation.quotationNumber}
                    quotationDate={viewingQuotation.quotationDate}
                  />
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
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

function QuotationBuilder({ projectId, project, account, initialQuotation, onClose }: { projectId: string, project: Project | undefined, account: Account | null | undefined, initialQuotation?: Quotation | null, onClose: () => void }) {
  const { addQuotation, updateQuotation, data } = useData();
  const [items, setItems] = useState<QuotationLineItem[]>(initialQuotation?.items || []);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

  // Drag & drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `${index}`);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    // optional reset on leave
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    const updated = Array.from(items);
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, moved);
    setItems(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= items.length) return;
    const updated = Array.from(items);
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setItems(updated);
  };

  const moveSection = (sectionKey: string, direction: 'up' | 'down') => {
    const secKeys: string[] = [];
    items.forEach(it => {
      const k = `${it.floor} - ${it.category}`;
      if (!secKeys.includes(k)) secKeys.push(k);
    });

    const secIdx = secKeys.indexOf(sectionKey);
    if (secIdx === -1) return;
    const targetSecIdx = direction === 'up' ? secIdx - 1 : secIdx + 1;
    if (targetSecIdx < 0 || targetSecIdx >= secKeys.length) return;

    const newSecKeys = Array.from(secKeys);
    const [movedKey] = newSecKeys.splice(secIdx, 1);
    newSecKeys.splice(targetSecIdx, 0, movedKey);

    const grouped: Record<string, QuotationLineItem[]> = {};
    items.forEach(it => {
      const k = `${it.floor} - ${it.category}`;
      if (!grouped[k]) grouped[k] = [];
      grouped[k].push(it);
    });

    const newItems: QuotationLineItem[] = [];
    newSecKeys.forEach(k => {
      if (grouped[k]) {
        newItems.push(...grouped[k]);
      }
    });

    setItems(newItems);
  };

  const printRef = useRef<HTMLDivElement>(null);

  const handleDownload = async (qNumber: string) => {
    if (!printRef.current) return;
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin: 0.5,
        filename: `Quotation_${qNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await html2pdf().set(opt as any).from(printRef.current).save();
    } catch (error) {
      console.error('PDF generation error:', error);
    }
  };

  const clientName = account?.clientName || project?.projectName || 'Client';
  const nextNumber = `QT-${String((data.quotations?.length || 0) + 1).padStart(4, '0')}`;

  const [quoteMeta, setQuoteMeta] = useState({
    quotationNumber: initialQuotation?.quotationNumber || nextNumber,
    quotationDate: initialQuotation?.quotationDate || new Date().toISOString().split('T')[0],
  });

  const grandTotal = useMemo(() => items.reduce((s, i) => s + i.totalAmount, 0), [items]);

  const handleSaveAndPrint = async () => {
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

    // Download PDF directly
    await handleDownload(quoteMeta.quotationNumber);

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
            <div className="border rounded-xl">
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="crm-table rounded-xl overflow-hidden">
                  <thead>
                    <tr>
                      <th className="w-12 text-center" title="Drag to reorder">#</th>
                      <th>Category</th>
                      <th>Sub-category / Description</th>
                      <th>Measurement</th>
                      <th>Area</th>
                      <th>Cost/Sq.ft</th>
                      <th>Total</th>
                      <th className="w-28 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr><td colSpan={8} className="text-center py-6 text-gray-400">No items added to this quotation yet.</td></tr>
                    ) : (
                      items.map((it, idx) => {
                        const sectionKey = `${it.floor} - ${it.category}`;
                        const isFirstInSection = idx === 0 || `${items[idx - 1].floor} - ${items[idx - 1].category}` !== sectionKey;
                        const sectionItems = items.filter(x => `${x.floor} - ${x.category}` === sectionKey);
                        const sectionSubtotal = sectionItems.reduce((acc, x) => acc + x.totalAmount, 0);
                        const uniqueSecKeys = Array.from(new Set(items.map(x => `${x.floor} - ${x.category}`)));
                        const secIndex = uniqueSecKeys.indexOf(sectionKey);

                        return (
                          <React.Fragment key={idx}>
                            {isFirstInSection && (
                              <tr className="bg-slate-100/90 border-t border-b border-slate-200">
                                <td colSpan={8} className="py-2 px-3">
                                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 tracking-wide">
                                    <div className="flex items-center gap-2">
                                      <span className="w-2 h-2 rounded-full bg-[#C9A84C]" />
                                      <span className="uppercase text-[11px] font-extrabold tracking-wider text-slate-900">
                                        Section {secIndex + 1}: {it.floor} — {it.category}
                                      </span>
                                      <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                                        {sectionItems.length} {sectionItems.length === 1 ? 'item' : 'items'}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 font-medium text-slate-600 text-[11px]">
                                      <span>Subtotal: <strong className="text-slate-900 font-bold">{formatCurrency(sectionSubtotal)}</strong></span>
                                      {uniqueSecKeys.length > 1 && (
                                        <div className="flex items-center gap-1 ml-2">
                                          <button
                                            type="button"
                                            disabled={secIndex === 0}
                                            onClick={() => moveSection(sectionKey, 'up')}
                                            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 disabled:opacity-30 disabled:hover:bg-white flex items-center gap-0.5 transition-colors cursor-pointer"
                                            title="Move entire section up"
                                          >
                                            <ChevronUp className="w-3 h-3" /> Section Up
                                          </button>
                                          <button
                                            type="button"
                                            disabled={secIndex === uniqueSecKeys.length - 1}
                                            onClick={() => moveSection(sectionKey, 'down')}
                                            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 disabled:opacity-30 disabled:hover:bg-white flex items-center gap-0.5 transition-colors cursor-pointer"
                                            title="Move entire section down"
                                          >
                                            <ChevronDown className="w-3 h-3" /> Section Down
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}

                            <tr
                              draggable
                              onDragStart={(e) => handleDragStart(e, idx)}
                              onDragOver={(e) => handleDragOver(e, idx)}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDrop(e, idx)}
                              onDragEnd={handleDragEnd}
                              className={`transition-colors select-none ${
                                draggedIndex === idx ? 'opacity-30 bg-amber-50' : 'hover:bg-slate-50/70'
                              } ${
                                dragOverIndex === idx && draggedIndex !== idx
                                  ? 'border-t-2 border-[#C9A84C] bg-amber-50/50'
                                  : ''
                              }`}
                            >
                              <td className="text-center cursor-grab active:cursor-grabbing" title="Drag to reorder row">
                                <div className="flex items-center justify-center text-gray-400 hover:text-[#C9A84C] transition-colors py-1">
                                  <GripVertical className="w-4 h-4" />
                                </div>
                              </td>
                              <td className="font-semibold">
                                <div>{it.category}</div>
                                <div className="text-xs text-gray-500 font-normal">{it.floor}</div>
                              </td>
                              <td>
                                <div className="font-medium text-gray-900">{it.subCategory || '—'}</div>
                                <div className="text-xs text-gray-500 mt-1 line-clamp-2" title={it.notes}>{it.notes}</div>
                              </td>
                              <td>{it.measurement || '—'}</td>
                              <td>{it.area.toFixed(2)}</td>
                              <td>{formatCurrency(it.costPerSqft)}</td>
                              <td className="font-bold text-gray-900">{formatCurrency(it.totalAmount)}</td>
                              <td>
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => moveItem(idx, idx - 1)}
                                    className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer"
                                    title="Move row up"
                                  >
                                    <ChevronUp className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === items.length - 1}
                                    onClick={() => moveItem(idx, idx + 1)}
                                    className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer"
                                    title="Move row down"
                                  >
                                    <ChevronDown className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingItemIndex(editingItemIndex === idx ? null : idx);
                                      setShowItemForm(false);
                                    }}
                                    className={`p-1.5 rounded transition-colors cursor-pointer ${
                                      editingItemIndex === idx
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'hover:bg-gray-100 text-gray-500 hover:text-blue-600'
                                    }`}
                                    title={editingItemIndex === idx ? 'Close Edit Form' : 'Edit Item'}
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (editingItemIndex === idx) setEditingItemIndex(null);
                                      setItems(items.filter((_, i) => i !== idx));
                                    }}
                                    className="p-1.5 rounded hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                                    title="Delete Item"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {/* Inline Edit Form directly below the edited row */}
                            {editingItemIndex === idx && (
                              <tr className="bg-yellow-50/40 border-b-2 border-yellow-300">
                                <td colSpan={8} className="p-4 sm:p-5">
                                  <div className="bg-white p-5 rounded-xl border border-yellow-200 shadow-sm">
                                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
                                      <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                                        <Pencil className="w-3.5 h-3.5 text-amber-600" /> Editing Item #{idx + 1}: {it.floor} — {it.category} {it.subCategory ? `(${it.subCategory})` : ''}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => setEditingItemIndex(null)}
                                        className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
                                        title="Cancel Edit"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                    <ItemForm
                                      initialItem={items[idx]}
                                      onSave={(item) => {
                                        const newItems = [...items];
                                        newItems[idx] = item;
                                        setItems(newItems);
                                        setEditingItemIndex(null);
                                      }}
                                      onCancel={() => setEditingItemIndex(null)}
                                    />
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y rounded-xl overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
                {items.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 text-sm bg-white">No items added yet.</div>
                ) : (
                  items.map((it, idx) => (
                    <div key={idx}>
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDrop={(e) => handleDrop(e, idx)}
                        onDragEnd={handleDragEnd}
                        className={`p-4 space-y-3 bg-white transition-all ${
                          draggedIndex === idx ? 'opacity-30 bg-amber-50' : ''
                        } ${
                          dragOverIndex === idx && draggedIndex !== idx ? 'border-t-2 border-[#C9A84C]' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-[#C9A84C]">
                              <GripVertical className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{it.category}</h4>
                              <span className="text-[12px] font-medium text-gray-500">{it.floor}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => moveItem(idx, idx - 1)}
                              className="p-1.5 rounded bg-gray-50 text-gray-600 disabled:opacity-20 cursor-pointer"
                              title="Move Up"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === items.length - 1}
                              onClick={() => moveItem(idx, idx + 1)}
                              className="p-1.5 rounded bg-gray-50 text-gray-600 disabled:opacity-20 cursor-pointer"
                              title="Move Down"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingItemIndex(editingItemIndex === idx ? null : idx);
                                setShowItemForm(false);
                              }}
                              className={`p-1.5 rounded cursor-pointer ${
                                editingItemIndex === idx ? 'bg-amber-100 text-amber-700' : 'bg-gray-50 text-gray-600'
                              }`}
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (editingItemIndex === idx) setEditingItemIndex(null);
                                setItems(items.filter((_, i) => i !== idx));
                              }}
                              className="p-1.5 rounded bg-red-50 text-red-500 cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="text-sm">
                          <div className="font-medium text-gray-800">{it.subCategory || '—'}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{it.notes}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs pt-2 border-t border-dashed">
                          <div>
                            <span className="text-gray-400 block mb-0.5">Measurement</span>
                            <span className="font-medium text-gray-800">{it.measurement || '—'}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block mb-0.5">Area</span>
                            <span className="font-medium text-gray-800">{it.area.toFixed(2)} Sq.ft</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block mb-0.5">Cost/Sq.ft</span>
                            <span className="font-medium text-gray-800">{formatCurrency(it.costPerSqft)}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block mb-0.5">Total</span>
                            <span className="font-bold text-gray-900">{formatCurrency(it.totalAmount)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Mobile Inline Edit Form */}
                      {editingItemIndex === idx && (
                        <div className="p-4 bg-yellow-50/50 border-t border-b-2 border-yellow-300">
                          <div className="flex items-center justify-between pb-2 mb-3 border-b border-yellow-200">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                              <Pencil className="w-3.5 h-3.5 text-amber-600" /> Editing Item #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => setEditingItemIndex(null)}
                              className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <ItemForm
                            initialItem={items[idx]}
                            onSave={(item) => {
                              const newItems = [...items];
                              newItems[idx] = item;
                              setItems(newItems);
                              setEditingItemIndex(null);
                            }}
                            onCancel={() => setEditingItemIndex(null)}
                          />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Add New Item Form at bottom (only for creating new items) */}
            {showItemForm && editingItemIndex === null ? (
              <div className="bg-yellow-50/30 p-5 md:p-6 rounded-xl border border-yellow-200 shadow-sm">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-yellow-200/60">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-amber-600" /> Add New Line Item
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowItemForm(false)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <ItemForm
                  onSave={(item) => {
                    setItems([...items, item]);
                    setShowItemForm(false);
                  }}
                  onCancel={() => setShowItemForm(false)}
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setEditingItemIndex(null);
                  setShowItemForm(true);
                }}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-gray-400 hover:text-gray-700 font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
  const subCategoryOptions = PREDEFINED_SUB_CATEGORIES[initialItem?.category || CATEGORIES[0]] || null;
  const isInitialOthers = initialItem?.subCategory
    ? subCategoryOptions ? !subCategoryOptions.includes(initialItem.subCategory) : false
    : false;

  const [form, setForm] = useState({
    floor: initialItem?.floor || FLOORS[0],
    category: initialItem?.category || CATEGORIES[0],
    subCategory: isInitialOthers ? '' : (initialItem?.subCategory || ''),
    customSubCategory: isInitialOthers ? (initialItem?.subCategory || '') : '',
    isOthers: isInitialOthers,
    measurement: initialItem?.measurement || '',
    area: initialItem ? String(initialItem.area) : '',
    costPerSqft: initialItem ? String(initialItem.costPerSqft) : '',
    notes: initialItem?.notes || '',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubCategoryChange = (subCat: string) => {
    if (subCat === '__others__') {
      setForm(f => ({ ...f, subCategory: '', customSubCategory: '', isOthers: true }));
    } else {
      setForm(f => ({ ...f, subCategory: subCat, customSubCategory: '', isOthers: false }));
      if (!form.notes && DEFAULT_DESCRIPTIONS[subCat]) {
        set('notes', DEFAULT_DESCRIPTIONS[subCat]);
      }
    }
  };

  const handleCategoryChange = (cat: string) => {
    set('category', cat);
    setForm(f => ({ ...f, category: cat, subCategory: '', customSubCategory: '', isOthers: false }));
    if (!PREDEFINED_SUB_CATEGORIES[cat] && DEFAULT_DESCRIPTIONS[cat]) {
      set('notes', DEFAULT_DESCRIPTIONS[cat]);
    } else {
      set('notes', '');
    }
  };

  const currentSubCategoryOptions = PREDEFINED_SUB_CATEGORIES[form.category] || null;

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
    const resolvedSubCategory = form.isOthers ? form.customSubCategory : form.subCategory;
    onSave({
      floor: form.floor,
      category: form.category,
      subCategory: resolvedSubCategory,
      measurement: form.measurement,
      notes: form.notes,
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
          {currentSubCategoryOptions ? (
            <>
              <select
                className="crm-input bg-white"
                value={form.isOthers ? '__others__' : form.subCategory}
                onChange={e => handleSubCategoryChange(e.target.value)}
              >
                <option value="">Select...</option>
                {currentSubCategoryOptions.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                <option value="__others__">Others</option>
              </select>
              {form.isOthers && (
                <input
                  type="text"
                  className="crm-input bg-white mt-2"
                  value={form.customSubCategory}
                  onChange={e => set('customSubCategory', e.target.value)}
                  placeholder="Type custom sub-category..."
                  autoFocus
                />
              )}
            </>
          ) : (
            <input
              type="text"
              className="crm-input bg-white"
              value={form.subCategory}
              onChange={e => handleSubCategoryChange(e.target.value)}
              placeholder="Type sub-category..."
            />
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

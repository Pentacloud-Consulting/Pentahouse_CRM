'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useData } from '@/contexts/DataContext';
import { Lead, LeadSource, LeadStatus } from '@/lib/types';
import { formatCurrency, formatDate, getStatusColor, truncate } from '@/lib/utils';
import { Plus, Search, Filter, Eye, Trash2, X, Users } from 'lucide-react';
import ModalPortal from '@/components/ui/ModalPortal';

const leadSources: LeadSource[] = ['Referral', 'Walk-in', 'Social Media', 'Website', 'Other'];
const leadStatuses: LeadStatus[] = ['New', 'Contacted', 'Follow Up', 'Site Visit Scheduled', 'Proposal Sent', 'Qualified', 'Lost'];

export default function LeadsPage() {
  const { data, addLead, deleteLead } = useData();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [showCreate, setShowCreate] = useState(false);

  const filtered = data.leads.filter(l => {
    const matchSearch =
      l.leadName.toLowerCase().includes(search.toLowerCase()) ||
      l.mobile.includes(search) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      l.city.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <>
    <div className="animate-fade-in max-w-7xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-[28px] sm:text-[32px] font-bold tracking-tight text-[#0F1C2E]">
            Leads
          </h2>
          <p className="text-gray-500 mt-1 text-[14px] sm:text-[15px]">{data.leads.length} total leads</p>
        </div>
        <button className="bg-[#C9A84C] hover:bg-[#b5953e] text-white rounded-lg shadow-md hover:shadow-lg transition-all font-semibold flex items-center px-4 py-2 sm:px-5 sm:py-2.5" onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 sm:mr-2" /> 
          <span className="hidden sm:inline">Add Lead</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            className="w-full pl-10 pr-4 py-2.5 sm:py-2 bg-white border border-gray-200 rounded-lg text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-colors shadow-sm"
            placeholder="Search by name, mobile, email, city…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="relative w-full sm:w-56">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <select
            className="w-full pl-10 pr-8 py-2.5 sm:py-2 bg-white border border-gray-200 rounded-lg text-[15px] text-gray-900 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-colors shadow-sm appearance-none"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            {[...leadStatuses, 'Converted'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Desktop Table ── */}
      <div className="hidden md:block bg-white rounded-xl overflow-hidden shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
        <div className="overflow-x-auto">
          <table className="crm-table w-full">
            <thead>
              <tr>
                <th>Lead Name</th>
                <th>Mobile</th>
                <th>Email</th>
                <th>City</th>
                <th>Source</th>
                <th>Budget</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16">
                    <div className="flex flex-col items-center">
                      <Users className="w-12 h-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-semibold text-[#0F1C2E] mb-2">No leads found</h3>
                      <p className="text-gray-500 mb-6">Create your first lead to get started.</p>
                      <button className="bg-[#C9A84C] hover:bg-[#b5953e] text-white rounded-lg shadow-md hover:shadow-lg transition-all font-semibold flex items-center px-6 py-2" onClick={() => setShowCreate(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Add Lead
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(lead => (
                  <tr key={lead.id}>
                    <td className="font-medium" style={{ color: '#0F1C2E' }}>{lead.leadName}</td>
                    <td>{lead.mobile}</td>
                    <td className="text-gray-500">{truncate(lead.email, 25)}</td>
                    <td>{lead.city || '-'}</td>
                    <td>{lead.leadSource}</td>
                    <td>{lead.budget ? formatCurrency(lead.budget) : '-'}</td>
                    <td>
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="text-gray-500 text-xs">{formatDate(lead.createdAt)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/crm/leads/${lead.id}`}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4 text-gray-500" />
                        </Link>
                        <button
                          onClick={() => { if (confirm('Delete this lead?')) deleteLead(lead.id); }}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
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

      {/* ── Mobile Responsive Cards ── */}
      <div className="md:hidden space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm flex flex-col items-center" style={{ border: '1px solid rgba(0,0,0,0.04)' }}>
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-[18px] font-semibold text-[#0F1C2E] mb-2">No leads yet</h3>
            <p className="text-gray-500 text-[14px] mb-6">Create your first lead to start managing your sales pipeline.</p>
            <button className="bg-[#C9A84C] hover:bg-[#b5953e] text-white rounded-lg shadow-md hover:shadow-lg transition-all font-semibold flex items-center px-6 py-3 w-full justify-center" onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Lead
            </button>
          </div>
        ) : (
          filtered.map(lead => (
            <div key={lead.id} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm transition-all" style={{ border: '1px solid rgba(0,0,0,0.04)' }}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold text-[15px]">{lead.leadName.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-[#0F1C2E] text-[16px]">{lead.leadName}</div>
                    <div className="text-[13px] text-gray-500 mt-0.5">{lead.mobile}</div>
                  </div>
                </div>
                <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${getStatusColor(lead.status)}`}>
                  {lead.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-4 text-[13px]">
                {lead.email && (
                  <div className="col-span-2">
                    <span className="text-gray-400 block mb-0.5 text-[11px] uppercase tracking-wider font-semibold">Email</span>
                    <span className="text-gray-700">{lead.email}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-400 block mb-0.5 text-[11px] uppercase tracking-wider font-semibold">City</span>
                  <span className="text-gray-700">{lead.city || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5 text-[11px] uppercase tracking-wider font-semibold">Source</span>
                  <span className="text-gray-700">{lead.leadSource}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5 text-[11px] uppercase tracking-wider font-semibold">Budget</span>
                  <span className="text-gray-700 font-medium">{lead.budget ? formatCurrency(lead.budget) : '-'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5 text-[11px] uppercase tracking-wider font-semibold">Created</span>
                  <span className="text-gray-700">{formatDate(lead.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
                <Link
                  href={`/crm/leads/${lead.id}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gray-50 text-[#0F1C2E] text-[13px] font-semibold hover:bg-gray-100 transition-colors"
                >
                  <Eye className="w-4 h-4" /> View Details
                </Link>
                <button
                  onClick={() => { if (confirm('Delete this lead?')) deleteLead(lead.id); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-50 text-red-600 text-[13px] font-semibold hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>

    {/* Create Modal */}
    {showCreate && (
      <CreateLeadModal
        onClose={() => setShowCreate(false)}
        onCreate={(lead) => { addLead(lead); setShowCreate(false); }}
      />
    )}
    </>
  );
}

// ── Create Lead Modal ──
function CreateLeadModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => void;
}) {
  const [form, setForm] = useState({
    leadName: '',
    mobile: '',
    alternateMobile: '',
    email: '',
    address: '',
    city: '',
    requirementType: '',
    plotArea: '',
    budget: '',
    leadSource: 'Website' as LeadSource,
    status: 'New' as LeadStatus,
    notes: '',
  });

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      ...form,
      plotArea: form.plotArea ? Number(form.plotArea) : null,
      budget: form.budget ? Number(form.budget) : null,
    });
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold tracking-tight" style={{ color: '#0F1C2E' }}>
              Create New Lead
            </h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Lead Name *</label>
                <input className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-colors" value={form.leadName} onChange={e => set('leadName', e.target.value)} required />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Mobile Number *</label>
                <input className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-colors" value={form.mobile} onChange={e => set('mobile', e.target.value)} required />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Alternate Mobile</label>
                <input className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-colors" value={form.alternateMobile} onChange={e => set('alternateMobile', e.target.value)} />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Email</label>
                <input type="email" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-colors" value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">City</label>
                <input className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-colors" value={form.city} onChange={e => set('city', e.target.value)} />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Requirement Type</label>
                <input className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-colors" value={form.requirementType} onChange={e => set('requirementType', e.target.value)} />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Plot Area (sq.ft)</label>
                <input type="number" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-colors" value={form.plotArea} onChange={e => set('plotArea', e.target.value)} />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Budget (₹)</label>
                <input type="number" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-colors" value={form.budget} onChange={e => set('budget', e.target.value)} />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Lead Source</label>
                <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-colors appearance-none" value={form.leadSource} onChange={e => set('leadSource', e.target.value)}>
                  {leadSources.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Status</label>
                <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-colors appearance-none" value={form.status} onChange={e => set('status', e.target.value)}>
                  {leadStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Address</label>
              <textarea className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-colors" value={form.address} onChange={e => set('address', e.target.value)} rows={2} />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Notes</label>
              <textarea className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-colors" value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg text-[14px] font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
                Cancel
              </button>
              <button type="submit" className="bg-[#C9A84C] hover:bg-[#b5953e] text-white rounded-lg shadow-md hover:shadow-lg transition-all px-6 py-2.5 text-[14px] font-semibold">
                Create Lead
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
}

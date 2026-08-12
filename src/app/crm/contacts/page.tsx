'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useData } from '@/contexts/DataContext';
import { Contact } from '@/lib/types';
import { formatDate, truncate } from '@/lib/utils';
import { Plus, Search, Eye, Trash2, X, Contact2 } from 'lucide-react';
import ModalPortal from '@/components/ui/ModalPortal';

export default function ContactsPage() {
  const { data, addContact, deleteContact } = useData();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const filtered = data.contacts.filter(c => {
    const s = search.toLowerCase();
    return (
      c.contactName.toLowerCase().includes(s) ||
      c.mobile.includes(s) ||
      c.email.toLowerCase().includes(s)
    );
  });

  return (
    <>
    <div className="animate-fade-in max-w-7xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-[28px] sm:text-[32px] font-bold tracking-tight text-[#0F1C2E]">
            Contacts
          </h2>
          <p className="text-gray-500 mt-1 text-[14px] sm:text-[15px]">{data.contacts.length} total contacts</p>
        </div>
        <button className="bg-[#C9A84C] hover:bg-[#b5953e] text-white rounded-lg shadow-md hover:shadow-lg transition-all font-semibold flex items-center px-4 py-2 sm:px-5 sm:py-2.5" onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 sm:mr-2" /> 
          <span className="hidden sm:inline">Add Contact</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="mb-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            className="w-full pl-10 pr-4 py-2.5 sm:py-2 bg-white border border-gray-200 rounded-lg text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-colors shadow-sm"
            placeholder="Search by name, mobile, email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Desktop Table ── */}
      <div className="hidden md:block bg-white rounded-xl overflow-hidden shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
        <div className="overflow-x-auto">
          <table className="crm-table w-full">
            <thead>
              <tr>
                <th>Contact Name</th>
                <th>Mobile</th>
                <th>Email</th>
                <th>Designation</th>
                <th>Account</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center">
                      <Contact2 className="w-12 h-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-semibold text-[#0F1C2E] mb-2">No contacts found</h3>
                      <p className="text-gray-500 mb-6">Create your first contact to get started.</p>
                      <button className="bg-[#C9A84C] hover:bg-[#b5953e] text-white rounded-lg shadow-md hover:shadow-lg transition-all font-semibold flex items-center px-6 py-2" onClick={() => setShowCreate(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Add Contact
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(contact => {
                  const acct = contact.linkedAccountId
                    ? data.accounts.find(a => a.id === contact.linkedAccountId)
                    : null;
                  return (
                    <tr key={contact.id}>
                      <td className="font-medium" style={{ color: '#0F1C2E' }}>{contact.contactName}</td>
                      <td>{contact.mobile}</td>
                      <td className="text-gray-500">{truncate(contact.email, 25)}</td>
                      <td>{contact.designation || '-'}</td>
                      <td>
                        {acct ? (
                          <Link href={`/crm/accounts/${acct.id}`} className="text-sm font-medium hover:underline" style={{ color: '#C9A84C' }}>
                            {acct.clientName}
                          </Link>
                        ) : '-'}
                      </td>
                      <td className="text-gray-500 text-xs">{formatDate(contact.createdAt)}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Link href={`/crm/contacts/${contact.id}`} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="View">
                            <Eye className="w-4 h-4 text-gray-500" />
                          </Link>
                          <button
                            onClick={() => { if (confirm('Delete?')) deleteContact(contact.id); }}
                            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
              <Contact2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-[18px] font-semibold text-[#0F1C2E] mb-2">No contacts yet</h3>
            <p className="text-gray-500 text-[14px] mb-6">Create your first contact to start managing your network.</p>
            <button className="bg-[#C9A84C] hover:bg-[#b5953e] text-white rounded-lg shadow-md hover:shadow-lg transition-all font-semibold flex items-center px-6 py-3 w-full justify-center" onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Contact
            </button>
          </div>
        ) : (
          filtered.map(contact => {
            const acct = contact.linkedAccountId
              ? data.accounts.find(a => a.id === contact.linkedAccountId)
              : null;
            return (
              <div key={contact.id} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm transition-all" style={{ border: '1px solid rgba(0,0,0,0.04)' }}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold text-[15px]">{contact.contactName.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-[#0F1C2E] text-[16px]">{contact.contactName}</div>
                      <div className="text-[13px] text-gray-500 mt-0.5">{contact.mobile}</div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-4 text-[13px]">
                  {contact.email && (
                    <div className="col-span-2">
                      <span className="text-gray-400 block mb-0.5 text-[11px] uppercase tracking-wider font-semibold">Email</span>
                      <span className="text-gray-700">{contact.email}</span>
                    </div>
                  )}
                  <div className="col-span-2">
                    <span className="text-gray-400 block mb-0.5 text-[11px] uppercase tracking-wider font-semibold">Designation</span>
                    <span className="text-gray-700">{contact.designation || '-'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400 block mb-0.5 text-[11px] uppercase tracking-wider font-semibold">Linked Account</span>
                    {acct ? (
                      <Link href={`/crm/accounts/${acct.id}`} className="font-medium hover:underline" style={{ color: '#C9A84C' }}>
                        {acct.clientName}
                      </Link>
                    ) : '-'}
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400 block mb-0.5 text-[11px] uppercase tracking-wider font-semibold">Created</span>
                    <span className="text-gray-700">{formatDate(contact.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
                  <Link
                    href={`/crm/contacts/${contact.id}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gray-50 text-[#0F1C2E] text-[13px] font-semibold hover:bg-gray-100 transition-colors"
                  >
                    <Eye className="w-4 h-4" /> View Details
                  </Link>
                  <button
                    onClick={() => { if (confirm('Delete?')) deleteContact(contact.id); }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-50 text-red-600 text-[13px] font-semibold hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>

    {/* Create Modal */}
    {showCreate && (
      <CreateContactModal
        accounts={data.accounts}
        onClose={() => setShowCreate(false)}
        onCreate={c => { addContact(c); setShowCreate(false); }}
      />
    )}
    </>
  );
}

function CreateContactModal({
  accounts,
  onClose,
  onCreate,
}: {
  accounts: { id: string; clientName: string }[];
  onClose: () => void;
  onCreate: (c: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => void;
}) {
  const [form, setForm] = useState({
    contactName: '', mobile: '', email: '', designation: '', address: '',
    linkedAccountId: null as string | null,
    convertedFromLeadId: null as string | null,
  });
  const set = (key: string, val: string | null) => setForm(f => ({ ...f, [key]: val }));

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold tracking-tight" style={{ color: '#0F1C2E' }}>
              Create Contact
            </h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <form onSubmit={e => { e.preventDefault(); onCreate(form); }} className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div><label className="block text-[13px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Contact Name *</label><input className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-colors" value={form.contactName} onChange={e => set('contactName', e.target.value)} required /></div>
              <div><label className="block text-[13px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Mobile *</label><input className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-colors" value={form.mobile} onChange={e => set('mobile', e.target.value)} required /></div>
              <div><label className="block text-[13px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Email</label><input type="email" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-colors" value={form.email} onChange={e => set('email', e.target.value)} /></div>
              <div><label className="block text-[13px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Designation</label><input className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-colors" value={form.designation} onChange={e => set('designation', e.target.value)} /></div>
              <div className="sm:col-span-2">
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Linked Account</label>
                <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-colors appearance-none" value={form.linkedAccountId || ''} onChange={e => set('linkedAccountId', e.target.value || null)}>
                  <option value="">— None —</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.clientName}</option>)}
                </select>
              </div>
            </div>
            <div><label className="block text-[13px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Address</label><textarea className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-colors" value={form.address} onChange={e => set('address', e.target.value)} rows={2} /></div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg text-[14px] font-semibold text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
              <button type="submit" className="bg-[#C9A84C] hover:bg-[#b5953e] text-white rounded-lg shadow-md hover:shadow-lg transition-all px-6 py-2.5 text-[14px] font-semibold">Create Contact</button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
}

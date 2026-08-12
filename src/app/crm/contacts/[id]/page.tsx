'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useData } from '@/contexts/DataContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowLeft, Save } from 'lucide-react';

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getContact, updateContact, getAccount, getLead, data } = useData();
  const contact = getContact(params.id as string);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>((contact as unknown as Record<string, unknown>) || {});

  if (!contact) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Contact not found.</p>
        <Link href="/crm/contacts" className="text-blue-500 hover:underline mt-2 inline-block">← Back</Link>
      </div>
    );
  }

  const account = contact.linkedAccountId ? getAccount(contact.linkedAccountId) : null;
  const lead = contact.convertedFromLeadId ? getLead(contact.convertedFromLeadId) : null;

  const set = (key: string, val: string | null) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = () => {
    updateContact(contact.id, form as Partial<typeof contact>);
    setEditing(false);
  };

  return (
    <div className="animate-fade-in max-w-4xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-6">
        <div className="flex items-start gap-3 w-full sm:w-auto flex-1">
          <button onClick={() => router.push('/crm/contacts')} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 flex-shrink-0 mt-0.5 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <h2 className="text-[24px] sm:text-[28px] font-bold tracking-tight text-[#0F1C2E]">
              {contact.contactName}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className="text-[12px] text-gray-400 font-medium">Created {formatDate(contact.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {!editing ? (
            <button onClick={() => { setForm(contact as unknown as Record<string, unknown>); setEditing(true); }} className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-[14px] font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors border shadow-sm flex items-center justify-center" style={{ borderColor: '#E2E8F0' }}>
              Edit
            </button>
          ) : (
            <>
              <button onClick={() => setEditing(false)} className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-[14px] font-semibold text-gray-600 hover:bg-gray-100 flex items-center justify-center">
                Cancel
              </button>
              <button onClick={handleSave} className="flex-1 sm:flex-none bg-[#C9A84C] hover:bg-[#b5953e] text-white rounded-lg shadow-md hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2 px-4 py-2.5">
                <Save className="w-4 h-4" /> Save
              </button>
            </>
          )}
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6" style={{ border: '1px solid #E2E8F0' }}>
        <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: '#C9A84C' }}>Contact Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { label: 'Contact Name', key: 'contactName' },
            { label: 'Mobile', key: 'mobile' },
            { label: 'Email', key: 'email' },
            { label: 'Designation', key: 'designation' },
          ].map(f => (
            <div key={f.key}>
              <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#64748B' }}>{f.label}</div>
              {editing ? (
                <input className="crm-input" value={(form[f.key] as string) || ''} onChange={e => set(f.key, e.target.value)} />
              ) : (
                <div className="text-sm font-medium" style={{ color: '#0F1C2E' }}>{(contact as unknown as Record<string, unknown>)[f.key] as string || '—'}</div>
              )}
            </div>
          ))}
          <div className="sm:col-span-2">
            <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#64748B' }}>Linked Account</div>
            {editing ? (
              <select className="crm-select" value={(form.linkedAccountId as string) || ''} onChange={e => set('linkedAccountId', e.target.value || null)}>
                <option value="">— None —</option>
                {data.accounts.map(a => <option key={a.id} value={a.id}>{a.clientName}</option>)}
              </select>
            ) : (
              account ? (
                <Link href={`/crm/accounts/${account.id}`} className="text-sm font-medium hover:underline" style={{ color: '#C9A84C' }}>
                  {account.clientName}
                </Link>
              ) : (
                <div className="text-sm text-gray-400">—</div>
              )
            )}
          </div>
        </div>
        <div className="mt-5">
          <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#64748B' }}>Address</div>
          {editing ? (
            <textarea className="crm-textarea" value={(form.address as string) || ''} onChange={e => set('address', e.target.value)} rows={2} />
          ) : (
            <div className="text-sm" style={{ color: '#0F1C2E' }}>{contact.address || '—'}</div>
          )}
        </div>
      </div>

      {/* Lookup: Linked Account */}
      {account && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm mb-6" style={{ border: '1px solid rgba(0,0,0,0.04)' }}>
          <h3 className="text-[12px] font-bold mb-4 uppercase tracking-wider" style={{ color: '#C9A84C' }}>
            Linked Account Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">Client Name</span>
              <span className="text-[14px] font-medium text-gray-900">{account.clientName}</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">Mobile</span>
              <span className="text-[14px] font-medium text-gray-900">{account.mobile || '—'}</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">Email</span>
              <span className="text-[14px] font-medium text-gray-900">{account.email || '—'}</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">City</span>
              <span className="text-[14px] font-medium text-gray-900">{account.city || '—'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Lookup: Converted From Lead */}
      {lead && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm" style={{ border: '1px solid rgba(0,0,0,0.04)' }}>
          <h3 className="text-[12px] font-bold mb-4 uppercase tracking-wider" style={{ color: '#C9A84C' }}>
            Converted From Lead
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">Lead Name</span>
              <span className="text-[14px] font-medium text-gray-900">{lead.leadName}</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">Mobile</span>
              <span className="text-[14px] font-medium text-gray-900">{lead.mobile || '—'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

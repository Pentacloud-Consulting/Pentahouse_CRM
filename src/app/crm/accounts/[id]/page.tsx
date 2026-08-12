'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useData } from '@/contexts/DataContext';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { ArrowLeft, Save, ExternalLink } from 'lucide-react';

export default function AccountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getAccount, updateAccount, getLead, getAccountProjects, getAccountContacts } = useData();
  const account = getAccount(params.id as string);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>((account as unknown as Record<string, unknown>) || {});

  if (!account) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Account not found.</p>
        <Link href="/crm/accounts" className="text-blue-500 hover:underline mt-2 inline-block">← Back</Link>
      </div>
    );
  }

  const lead = account.convertedFromLeadId ? getLead(account.convertedFromLeadId) : null;
  const projects = getAccountProjects(account.id);
  const contacts = getAccountContacts(account.id);

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = () => {
    updateAccount(account.id, form as Partial<typeof account>);
    setEditing(false);
  };

  return (
    <div className="animate-fade-in max-w-4xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-6">
        <div className="flex items-start gap-3 w-full sm:w-auto flex-1">
          <button onClick={() => router.push('/crm/accounts')} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 flex-shrink-0 mt-0.5 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <h2 className="text-[24px] sm:text-[28px] font-bold tracking-tight text-[#0F1C2E]">
              {account.clientName}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className="text-[12px] text-gray-400 font-medium">Created {formatDate(account.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {!editing ? (
            <button onClick={() => { setForm(account as unknown as Record<string, unknown>); setEditing(true); }} className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-[14px] font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors border shadow-sm flex items-center justify-center" style={{ borderColor: '#E2E8F0' }}>
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

      {/* Account Info */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6" style={{ border: '1px solid #E2E8F0' }}>
        <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: '#C9A84C' }}>Account Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { label: 'Client Name', key: 'clientName' },
            { label: 'Mobile', key: 'mobile' },
            { label: 'Alternate Mobile', key: 'alternateMobile' },
            { label: 'Email', key: 'email' },
            { label: 'City', key: 'city' },
            { label: 'State', key: 'state' },
            { label: 'GST Number', key: 'gstNumber' },
            { label: 'PAN Number', key: 'panNumber' },
            { label: 'Aadhaar Number', key: 'aadhaarNumber' },
          ].map(f => (
            <div key={f.key}>
              <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#64748B' }}>{f.label}</div>
              {editing ? (
                <input className="crm-input" value={(form[f.key] as string) || ''} onChange={e => set(f.key, e.target.value)} />
              ) : (
                <div className="text-sm font-medium" style={{ color: '#0F1C2E' }}>{(account as unknown as Record<string, unknown>)[f.key] as string || '—'}</div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-5">
          <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#64748B' }}>Address</div>
          {editing ? (
            <textarea className="crm-textarea" value={(form.address as string) || ''} onChange={e => set('address', e.target.value)} rows={2} />
          ) : (
            <div className="text-sm" style={{ color: '#0F1C2E' }}>{account.address || '—'}</div>
          )}
        </div>
        <div className="mt-5">
          <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#64748B' }}>Notes</div>
          {editing ? (
            <textarea className="crm-textarea" value={(form.notes as string) || ''} onChange={e => set('notes', e.target.value)} rows={2} />
          ) : (
            <div className="text-sm" style={{ color: '#0F1C2E' }}>{account.notes || '—'}</div>
          )}
        </div>
      </div>

      {/* Lookup: Converted From Lead */}
      {lead && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm mb-6" style={{ border: '1px solid rgba(0,0,0,0.04)' }}>
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
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">Lead Source</span>
              <span className="text-[14px] font-medium text-gray-900">{lead.leadSource || '—'}</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">Budget</span>
              <span className="text-[14px] font-medium text-gray-900">{formatCurrency(lead.budget)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Related Projects */}
      {projects.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6" style={{ border: '1px solid #E2E8F0' }}>
          <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: '#C9A84C' }}>
            Linked Projects ({projects.length})
          </h3>
          <div className="space-y-2">
            {projects.map(p => (
              <Link
                key={p.id}
                href={`/crm/projects/${p.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                style={{ border: '1px solid #E2E8F0' }}
              >
                <div>
                  <span className="text-sm font-semibold" style={{ color: '#0F1C2E' }}>{p.projectId}</span>
                  <span className="text-sm text-gray-500 ml-2">{p.projectName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(p.status)}`}>
                    {p.status}
                  </span>
                  <ExternalLink className="w-4 h-4 text-gray-300" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Related Contacts */}
      {contacts.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
          <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: '#C9A84C' }}>
            Linked Contacts ({contacts.length})
          </h3>
          <div className="space-y-2">
            {contacts.map(c => (
              <Link
                key={c.id}
                href={`/crm/contacts/${c.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                style={{ border: '1px solid #E2E8F0' }}
              >
                <div>
                  <span className="text-sm font-semibold" style={{ color: '#0F1C2E' }}>{c.contactName}</span>
                  <span className="text-sm text-gray-500 ml-2">{c.mobile}</span>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-300" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

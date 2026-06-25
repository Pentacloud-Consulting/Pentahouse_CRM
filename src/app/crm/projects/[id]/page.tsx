'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useData } from '@/contexts/DataContext';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { ArrowLeft, Save } from 'lucide-react';
import { ProjectType, ProjectStatus } from '@/lib/types';
import MaterialsTab from '@/components/crm/MaterialsTab';
import PaymentDeliveredTab from '@/components/crm/PaymentDeliveredTab';
import OneTimePaymentsTab from '@/components/crm/OneTimePaymentsTab';
import PaymentReceivedTab from '@/components/crm/PaymentReceivedTab';
import FinancialSummaryTab from '@/components/crm/FinancialSummaryTab';
import ProjectDocumentsTab from '@/components/crm/ProjectDocumentsTab';
import OtherMaterialsTab from '@/components/crm/OtherMaterialsTab';
import InteriorMaterialsTab from '@/components/crm/InteriorMaterialsTab';

const projectTypes: ProjectType[] = ['Residential','Commercial','Villa','Apartment','Renovation','Construction'];
const projectStatuses: ProjectStatus[] = ['Planning','Foundation','Construction','Interior','Completed','On Hold'];
const TABS = ['Project Details','Materials','Payment Delivered','One-Time Payments','Payment Received', 'Project Documents', 'Other Materials', 'Interior Quotation', 'Financial Summary'];

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getProject, updateProject, getAccount, getContact, getLead, data } = useData();
  const project = getProject(params.id as string);
  const [activeTab, setActiveTab] = useState(0);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>((project as unknown as Record<string, unknown>) || {});

  if (!project) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Project not found.</p>
        <Link href="/crm/projects" className="text-blue-500 hover:underline mt-2 inline-block">← Back</Link>
      </div>
    );
  }

  const account = project.accountId ? getAccount(project.accountId) : null;
  const contact = project.contactId ? getContact(project.contactId) : null;
  const lead = project.convertedFromLeadId ? getLead(project.convertedFromLeadId) : null;

  const set = (key: string, val: string | boolean | null) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = () => {
    updateProject(project.id, {
      projectName: form.projectName as string,
      projectLocation: form.projectLocation as string,
      projectType: form.projectType as ProjectType,
      totalSiteArea: form.totalSiteArea ? Number(form.totalSiteArea) : null,
      builtUpArea: form.builtUpArea ? Number(form.builtUpArea) : null,
      numberOfFloors: form.numberOfFloors ? Number(form.numberOfFloors) : null,
      startDate: form.startDate as string,
      endDate: form.endDate as string,
      projectContractValue: form.projectContractValue ? Number(form.projectContractValue) : null,
      status: form.status as ProjectStatus,
      isActive: form.isActive !== false,
      accountId: (form.accountId as string) || null,
      contactId: (form.contactId as string) || null,
    });
    setEditing(false);
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6">
        <button onClick={() => router.push('/crm/projects')} className="p-2 rounded-lg hover:bg-gray-100 self-start">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-xs sm:text-sm font-mono font-semibold px-2 py-0.5 rounded" style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C' }}>
              {project.projectId}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold truncate" style={{ color: '#0F1C2E', fontFamily: "'Playfair Display', serif" }}>
              {project.projectName}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(project.status)}`}>{project.status}</span>
            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${project.isActive !== false ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
              {project.isActive !== false ? 'Active' : 'Inactive'}
            </span>
            <span className="text-xs text-gray-400">Created {formatDate(project.createdAt)}</span>
          </div>
        </div>
        {activeTab === 0 && !editing && (
          <button onClick={() => { setForm(project as unknown as Record<string, unknown>); setEditing(true); }} className="self-start sm:self-center px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 border" style={{ borderColor: '#E2E8F0' }}>Edit</button>
        )}
        {activeTab === 0 && editing && (
          <div className="flex gap-3 self-start sm:self-center">
            <button onClick={() => setEditing(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
            <button onClick={handleSave} className="btn-gold"><Save className="w-4 h-4" /> Save</button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 sm:flex sm:gap-0 border-b-0 sm:border-b mb-6 gap-2 sm:-mx-0 sm:px-0" style={{ borderColor: '#E2E8F0' }}>
        {TABS.map((tab, i) => (
          <button 
            key={tab} 
            className={`tab-btn flex items-center justify-center text-center ${activeTab === i ? 'active' : ''}`} 
            onClick={() => setActiveTab(i)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 0 && (
        <div className="space-y-6">
          {/* Project Details */}
          <div className="bg-white rounded-xl p-6 shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: '#C9A84C' }}>Project Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <Field label="Project Name" value={editing ? undefined : project.projectName}>
                {editing && <input className="crm-input" value={(form.projectName as string)||''} onChange={e => set('projectName', e.target.value)} />}
              </Field>
              <Field label="Project Type" value={editing ? undefined : project.projectType}>
                {editing && <select className="crm-select" value={(form.projectType as string)||''} onChange={e => set('projectType', e.target.value)}>{projectTypes.map(t => <option key={t} value={t}>{t}</option>)}</select>}
              </Field>
              <Field label="Status" value={editing ? undefined : project.status}>
                {editing && <select className="crm-select" value={(form.status as string)||''} onChange={e => set('status', e.target.value)}>{projectStatuses.map(s => <option key={s} value={s}>{s}</option>)}</select>}
              </Field>
              <Field label="Active Status" value={editing ? undefined : (project.isActive !== false ? 'Active' : 'Inactive')}>
                {editing && (
                  <select className="crm-select" value={(form.isActive !== false).toString()} onChange={e => set('isActive', e.target.value === 'true' ? true : false)}>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                )}
              </Field>
              <Field label="Account" value={editing ? undefined : (account?.clientName || '—')}>
                {editing && <select className="crm-select" value={(form.accountId as string)||''} onChange={e => set('accountId', e.target.value||null)}><option value="">— None —</option>{data.accounts.map(a => <option key={a.id} value={a.id}>{a.clientName}</option>)}</select>}
              </Field>
              <Field label="Contact" value={editing ? undefined : (contact?.contactName || '—')}>
                {editing && <select className="crm-select" value={(form.contactId as string)||''} onChange={e => set('contactId', e.target.value||null)}><option value="">— None —</option>{data.contacts.map(c => <option key={c.id} value={c.id}>{c.contactName}</option>)}</select>}
              </Field>
              <Field label="Total Site Area" value={editing ? undefined : (project.totalSiteArea ? `${project.totalSiteArea} sq.ft` : '—')}>
                {editing && <input type="number" className="crm-input" value={(form.totalSiteArea as string)||''} onChange={e => set('totalSiteArea', e.target.value)} />}
              </Field>
              <Field label="Built Up Area" value={editing ? undefined : (project.builtUpArea ? `${project.builtUpArea} sq.ft` : '—')}>
                {editing && <input type="number" className="crm-input" value={(form.builtUpArea as string)||''} onChange={e => set('builtUpArea', e.target.value)} />}
              </Field>
              <Field label="Floors" value={editing ? undefined : (project.numberOfFloors?.toString() || '—')}>
                {editing && <input type="number" className="crm-input" value={(form.numberOfFloors as string)||''} onChange={e => set('numberOfFloors', e.target.value)} />}
              </Field>
              <Field label="Contract Value" value={editing ? undefined : formatCurrency(project.projectContractValue)}>
                {editing && <input type="number" className="crm-input" value={(form.projectContractValue as string)||''} onChange={e => set('projectContractValue', e.target.value)} />}
              </Field>
              <Field label="Start Date" value={editing ? undefined : formatDate(project.startDate)}>
                {editing && <input type="date" className="crm-input" value={(form.startDate as string)||''} onChange={e => set('startDate', e.target.value)} />}
              </Field>
              <Field label="End Date" value={editing ? undefined : formatDate(project.endDate)}>
                {editing && <input type="date" className="crm-input" value={(form.endDate as string)||''} onChange={e => set('endDate', e.target.value)} />}
              </Field>
            </div>
            <div className="mt-5">
              <Field label="Project Location" value={editing ? undefined : (project.projectLocation || '—')}>
                {editing && <textarea className="crm-textarea" value={(form.projectLocation as string)||''} onChange={e => set('projectLocation', e.target.value)} rows={2} />}
              </Field>
            </div>
          </div>

          {/* Lookup Displays */}
          {account && (
            <div className="bg-white rounded-xl p-6 shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
              <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: '#C9A84C' }}>Account Details (Lookup)</h3>
              <div className="lookup-display">
                <div className="lookup-row">
                  <div className="lookup-item"><span>Client Name</span><span>{account.clientName}</span></div>
                  <div className="lookup-item"><span>Mobile</span><span>{account.mobile}</span></div>
                  <div className="lookup-item"><span>Email</span><span>{account.email}</span></div>
                  <div className="lookup-item"><span>City</span><span>{account.city}</span></div>
                  <div className="lookup-item"><span>GST</span><span>{account.gstNumber || '—'}</span></div>
                </div>
              </div>
            </div>
          )}
          {contact && (
            <div className="bg-white rounded-xl p-6 shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
              <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: '#C9A84C' }}>Contact Details (Lookup)</h3>
              <div className="lookup-display">
                <div className="lookup-row">
                  <div className="lookup-item"><span>Contact Name</span><span>{contact.contactName}</span></div>
                  <div className="lookup-item"><span>Mobile</span><span>{contact.mobile}</span></div>
                  <div className="lookup-item"><span>Email</span><span>{contact.email}</span></div>
                </div>
              </div>
            </div>
          )}
          {lead && (
            <div className="bg-white rounded-xl p-6 shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
              <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: '#C9A84C' }}>Converted From Lead (Lookup)</h3>
              <div className="lookup-display">
                <div className="lookup-row">
                  <div className="lookup-item"><span>Lead Name</span><span>{lead.leadName}</span></div>
                  <div className="lookup-item"><span>Budget</span><span>{formatCurrency(lead.budget)}</span></div>
                  <div className="lookup-item"><span>Plot Area</span><span>{lead.plotArea ? `${lead.plotArea} sq.ft` : '—'}</span></div>
                  <div className="lookup-item"><span>Requirement</span><span>{lead.requirementType || '—'}</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {activeTab === 1 && <MaterialsTab projectId={project.id} />}
      {activeTab === 2 && <PaymentDeliveredTab projectId={project.id} />}
      {activeTab === 3 && <OneTimePaymentsTab projectId={project.id} />}
      {activeTab === 4 && <PaymentReceivedTab projectId={project.id} />}
      {activeTab === 5 && <ProjectDocumentsTab projectId={project.id} />}
      {activeTab === 6 && <OtherMaterialsTab projectId={project.id} />}
      {activeTab === 7 && <InteriorMaterialsTab projectId={project.id} />}
      {activeTab === 8 && <FinancialSummaryTab projectId={project.id} />}
    </div>
  );
}

function Field({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#64748B' }}>{label}</div>
      {children || <div className="text-sm font-medium" style={{ color: '#0F1C2E' }}>{value || '—'}</div>}
    </div>
  );
}

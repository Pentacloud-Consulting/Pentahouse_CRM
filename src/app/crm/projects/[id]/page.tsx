'use client';

import { useState, useRef, useEffect } from 'react';
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
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showRightFade, setShowRightFade] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowRightFade(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll();
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeElement = scrollContainerRef.current.children[activeTab] as HTMLElement;
      if (activeElement) {
        const container = scrollContainerRef.current;
        const scrollLeft = activeElement.offsetLeft - (container.clientWidth / 2) + (activeElement.clientWidth / 2);
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }
  }, [activeTab]);

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-6">
        <div className="flex items-start gap-3 w-full sm:w-auto flex-1 min-w-0">
          <button onClick={() => router.push('/crm/projects')} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 flex-shrink-0 mt-0.5 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div className="min-w-0 w-full">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded tracking-wide uppercase" style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C' }}>
                {project.projectId}
              </span>
              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${project.isActive !== false ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                {project.isActive !== false ? 'Active' : 'Inactive'}
              </span>
            </div>
            <h2 className="text-[24px] sm:text-[28px] font-bold tracking-tight text-[#0F1C2E] truncate w-full" title={project.projectName}>
              {project.projectName}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${getStatusColor(project.status)}`}>{project.status}</span>
              <span className="text-[12px] text-gray-400 font-medium hidden sm:inline">Created {formatDate(project.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
          {activeTab === 0 && !editing && (
            <button onClick={() => { setForm(project as unknown as Record<string, unknown>); setEditing(true); }} className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-[14px] font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors border shadow-sm flex items-center justify-center" style={{ borderColor: '#E2E8F0' }}>
              Edit
            </button>
          )}
          {activeTab === 0 && editing && (
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

      {/* Mobile Tab Select */}
      <div className="block sm:hidden mb-6">
        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Select Section</label>
        <select 
          className="crm-select bg-white w-full shadow-sm text-sm font-semibold text-gray-800"
          value={activeTab}
          onChange={(e) => setActiveTab(Number(e.target.value))}
          style={{ borderColor: '#E2E8F0' }}
        >
          {TABS.map((tab, i) => (
            <option key={tab} value={i}>{tab}</option>
          ))}
        </select>
      </div>

      {/* Desktop Tabs */}
      <div className="hidden sm:block relative mb-6">
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto hide-scrollbar border-b gap-6 w-full" 
          style={{ borderColor: '#E2E8F0', WebkitOverflowScrolling: 'touch' }}
        >
          {TABS.map((tab, i) => (
            <button 
              key={tab} 
              className={`shrink-0 flex items-center justify-center whitespace-nowrap px-1 py-3 text-[14px] font-semibold transition-colors border-b-2
                ${activeTab === i 
                  ? 'text-[#C9A84C] border-[#C9A84C]' 
                  : 'text-gray-600 border-transparent bg-transparent hover:text-gray-900 hover:border-gray-300'
                }`} 
              onClick={() => setActiveTab(i)}
            >
              {tab}
            </button>
          ))}
        </div>
        {/* Subtle right gradient to indicate more scrollable area (only if tabs overflow on desktop/tablet) */}
        {showRightFade && (
          <div className="absolute top-0 right-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        )}
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
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm" style={{ border: '1px solid rgba(0,0,0,0.04)' }}>
              <h3 className="text-[12px] font-bold mb-4 uppercase tracking-wider" style={{ color: '#C9A84C' }}>Account Details (Lookup)</h3>
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
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">GST</span>
                  <span className="text-[14px] font-medium text-gray-900">{account.gstNumber || '—'}</span>
                </div>
              </div>
            </div>
          )}
          {contact && (
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm mt-5" style={{ border: '1px solid rgba(0,0,0,0.04)' }}>
              <h3 className="text-[12px] font-bold mb-4 uppercase tracking-wider" style={{ color: '#C9A84C' }}>Contact Details (Lookup)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">Contact Name</span>
                  <span className="text-[14px] font-medium text-gray-900">{contact.contactName}</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">Mobile</span>
                  <span className="text-[14px] font-medium text-gray-900">{contact.mobile || '—'}</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">Email</span>
                  <span className="text-[14px] font-medium text-gray-900">{contact.email || '—'}</span>
                </div>
              </div>
            </div>
          )}
          {lead && (
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm mt-5" style={{ border: '1px solid rgba(0,0,0,0.04)' }}>
              <h3 className="text-[12px] font-bold mb-4 uppercase tracking-wider" style={{ color: '#C9A84C' }}>Converted From Lead (Lookup)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">Lead Name</span>
                  <span className="text-[14px] font-medium text-gray-900">{lead.leadName}</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">Budget</span>
                  <span className="text-[14px] font-medium text-gray-900">{formatCurrency(lead.budget)}</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">Plot Area</span>
                  <span className="text-[14px] font-medium text-gray-900">{lead.plotArea ? `${lead.plotArea} sq.ft` : '—'}</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">Requirement</span>
                  <span className="text-[14px] font-medium text-gray-900">{lead.requirementType || '—'}</span>
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

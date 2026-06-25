'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useData } from '@/contexts/DataContext';
import { Project, ProjectType, ProjectStatus } from '@/lib/types';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { Plus, Search, Filter, Eye, Trash2, X } from 'lucide-react';
import ModalPortal from '@/components/ui/ModalPortal';

const projectTypes: ProjectType[] = ['Residential', 'Commercial', 'Villa', 'Apartment', 'Renovation', 'Construction'];
const projectStatuses: ProjectStatus[] = ['Planning', 'Foundation', 'Construction', 'Interior', 'Completed', 'On Hold'];

export default function ProjectsPage() {
  const { data, addProject, deleteProject } = useData();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterIsActive, setFilterIsActive] = useState('All');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('filter') === 'Active') setFilterIsActive('Active');
    }
  }, []);

  const filtered = data.projects.filter(p => {
    const s = search.toLowerCase();
    const matchSearch =
      p.projectName.toLowerCase().includes(s) ||
      p.projectId.toLowerCase().includes(s) ||
      p.projectLocation.toLowerCase().includes(s);
    const matchStatus = filterStatus === 'All' || p.status === filterStatus;
    const matchActive = filterIsActive === 'All' 
      ? true 
      : filterIsActive === 'Active' ? p.isActive !== false : p.isActive === false;
    return matchSearch && matchStatus && matchActive;
  });

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold" style={{ color: '#0F1C2E', fontFamily: "'Playfair Display', serif" }}>
            Projects
          </h2>
          <p className="text-gray-500 mt-1">{data.projects.length} total projects</p>
        </div>
        <button className="btn-gold" onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="crm-input pl-10" placeholder="Search by name, ID, location…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select className="crm-select pl-10 w-full sm:w-48" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="All">All Statuses</option>
            {projectStatuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="relative">
          <select className="crm-select w-full sm:w-48" value={filterIsActive} onChange={e => setFilterIsActive(e.target.value)}>
            <option value="All">All (Active & Inactive)</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl overflow-hidden shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
        <div className="overflow-x-auto">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Project ID</th>
                <th>Project Name</th>
                <th>Client</th>
                <th>Type</th>
                <th>Contract Value</th>
                <th>Status</th>
                <th>Active</th>
                <th>Start Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">No projects found.</td></tr>
              ) : (
                filtered.map(project => {
                  const acct = project.accountId ? data.accounts.find(a => a.id === project.accountId) : null;
                  return (
                    <tr key={project.id}>
                      <td className="font-mono text-xs font-semibold" style={{ color: '#C9A84C' }}>{project.projectId}</td>
                      <td className="font-medium" style={{ color: '#0F1C2E' }}>{project.projectName}</td>
                      <td>
                        {acct ? (
                          <Link href={`/crm/accounts/${acct.id}`} className="text-sm hover:underline" style={{ color: '#C9A84C' }}>
                            {acct.clientName}
                          </Link>
                        ) : '—'}
                      </td>
                      <td>{project.projectType}</td>
                      <td>{formatCurrency(project.projectContractValue)}</td>
                      <td>
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </td>
                      <td>
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${project.isActive !== false ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                          {project.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="text-gray-500 text-xs">{formatDate(project.startDate)}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Link href={`/crm/projects/${project.id}`} className="p-1.5 rounded-lg hover:bg-gray-100"><Eye className="w-4 h-4 text-gray-500" /></Link>
                          <button onClick={() => { if (confirm('Delete project and all child records?')) deleteProject(project.id); }} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-400" /></button>
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

      {showCreate && (
        <CreateProjectModal
          accounts={data.accounts}
          contacts={data.contacts}
          onClose={() => setShowCreate(false)}
          onCreate={p => { addProject(p); setShowCreate(false); }}
        />
      )}
    </div>
  );
}

function CreateProjectModal({
  accounts,
  contacts,
  onClose,
  onCreate,
}: {
  accounts: { id: string; clientName: string }[];
  contacts: { id: string; contactName: string }[];
  onClose: () => void;
  onCreate: (p: Omit<Project, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>) => void;
}) {
  const [form, setForm] = useState({
    projectName: '',
    accountId: null as string | null,
    contactId: null as string | null,
    convertedFromLeadId: null as string | null,
    projectLocation: '',
    projectType: 'Residential' as ProjectType,
    totalSiteArea: '',
    builtUpArea: '',
    numberOfFloors: '',
    startDate: '',
    endDate: '',
    projectContractValue: '',
    status: 'Planning' as ProjectStatus,
  });
  const set = (key: string, val: string | null) => setForm(f => ({ ...f, [key]: val }));

  return (
    <ModalPortal>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content max-w-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold" style={{ color: '#0F1C2E', fontFamily: "'Playfair Display', serif" }}>Create Project</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-400" /></button>
          </div>
          <form
            onSubmit={e => {
              e.preventDefault();
              onCreate({
                ...form,
                isActive: true,
                totalSiteArea: form.totalSiteArea ? Number(form.totalSiteArea) : null,
                builtUpArea: form.builtUpArea ? Number(form.builtUpArea) : null,
                numberOfFloors: form.numberOfFloors ? Number(form.numberOfFloors) : null,
                projectContractValue: form.projectContractValue ? Number(form.projectContractValue) : null,
              });
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1" style={{ color: '#0F1C2E' }}>Project Name *</label><input className="crm-input" value={form.projectName} onChange={e => set('projectName', e.target.value)} required /></div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#0F1C2E' }}>Project Type</label>
                <select className="crm-select" value={form.projectType} onChange={e => set('projectType', e.target.value)}>
                  {projectTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#0F1C2E' }}>Account</label>
                <select className="crm-select" value={form.accountId || ''} onChange={e => set('accountId', e.target.value || null)}>
                  <option value="">— None —</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.clientName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#0F1C2E' }}>Contact</label>
                <select className="crm-select" value={form.contactId || ''} onChange={e => set('contactId', e.target.value || null)}>
                  <option value="">— None —</option>
                  {contacts.map(c => <option key={c.id} value={c.id}>{c.contactName}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-medium mb-1" style={{ color: '#0F1C2E' }}>Total Site Area (sq.ft)</label><input type="number" className="crm-input" value={form.totalSiteArea} onChange={e => set('totalSiteArea', e.target.value)} /></div>
              <div><label className="block text-sm font-medium mb-1" style={{ color: '#0F1C2E' }}>Built Up Area (sq.ft)</label><input type="number" className="crm-input" value={form.builtUpArea} onChange={e => set('builtUpArea', e.target.value)} /></div>
              <div><label className="block text-sm font-medium mb-1" style={{ color: '#0F1C2E' }}>Number of Floors</label><input type="number" className="crm-input" value={form.numberOfFloors} onChange={e => set('numberOfFloors', e.target.value)} /></div>
              <div><label className="block text-sm font-medium mb-1" style={{ color: '#0F1C2E' }}>Contract Value (₹)</label><input type="number" className="crm-input" value={form.projectContractValue} onChange={e => set('projectContractValue', e.target.value)} /></div>
              <div><label className="block text-sm font-medium mb-1" style={{ color: '#0F1C2E' }}>Start Date</label><input type="date" className="crm-input" value={form.startDate} onChange={e => set('startDate', e.target.value)} /></div>
              <div><label className="block text-sm font-medium mb-1" style={{ color: '#0F1C2E' }}>End Date</label><input type="date" className="crm-input" value={form.endDate} onChange={e => set('endDate', e.target.value)} /></div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#0F1C2E' }}>Status</label>
                <select className="crm-select" value={form.status} onChange={e => set('status', e.target.value)}>
                  {projectStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div><label className="block text-sm font-medium mb-1" style={{ color: '#0F1C2E' }}>Project Location</label><textarea className="crm-textarea" value={form.projectLocation} onChange={e => set('projectLocation', e.target.value)} rows={2} /></div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
              <button type="submit" className="btn-gold">Create Project</button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useData } from '@/contexts/DataContext';
import { Project, ProjectType, ProjectStatus } from '@/lib/types';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { Plus, Search, Filter, Eye, Trash2, X, HardHat } from 'lucide-react';
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
    <>
    <div className="animate-fade-in max-w-7xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-[28px] sm:text-[32px] font-bold tracking-tight text-[#0F1C2E]">
            Projects
          </h2>
          <p className="text-gray-500 mt-1 text-[14px] sm:text-[15px]">{data.projects.length} total projects</p>
        </div>
        <button className="bg-[#C9A84C] hover:bg-[#b5953e] text-white rounded-lg shadow-md hover:shadow-lg transition-all font-semibold flex items-center px-4 py-2 sm:px-5 sm:py-2.5" onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 sm:mr-2" /> 
          <span className="hidden sm:inline">Add Project</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input className="w-full pl-10 pr-4 py-2.5 sm:py-2 bg-white border border-gray-200 rounded-lg text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-colors shadow-sm" placeholder="Search by name, ID, location…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="relative w-full sm:w-48">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <select className="w-full pl-10 pr-4 py-2.5 sm:py-2 bg-white border border-gray-200 rounded-lg text-[14px] font-medium text-gray-700 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-colors shadow-sm appearance-none" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="All">All Statuses</option>
            {projectStatuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="relative w-full sm:w-48">
          <select className="w-full px-4 py-2.5 sm:py-2 bg-white border border-gray-200 rounded-lg text-[14px] font-medium text-gray-700 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-colors shadow-sm appearance-none" value={filterIsActive} onChange={e => setFilterIsActive(e.target.value)}>
            <option value="All">All (Active & Inactive)</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* ── Desktop Table ── */}
      <div className="hidden md:block bg-white rounded-xl overflow-hidden shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
        <div className="overflow-x-auto">
          <table className="crm-table w-full">
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
                <tr>
                  <td colSpan={9} className="text-center py-16">
                    <div className="flex flex-col items-center">
                      <HardHat className="w-12 h-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-semibold text-[#0F1C2E] mb-2">No projects found</h3>
                      <p className="text-gray-500 mb-6">Create your first project to get started.</p>
                      <button className="bg-[#C9A84C] hover:bg-[#b5953e] text-white rounded-lg shadow-md hover:shadow-lg transition-all font-semibold flex items-center px-6 py-2" onClick={() => setShowCreate(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Add Project
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(project => {
                  const acct = project.accountId ? data.accounts.find(a => a.id === project.accountId) : null;
                  return (
                    <tr key={project.id}>
                      <td className="font-mono text-xs font-semibold" style={{ color: '#C9A84C' }}>{project.projectId}</td>
                      <td className="font-medium" style={{ color: '#0F1C2E' }}>{project.projectName}</td>
                      <td>
                        {acct ? (
                          <Link href={`/crm/accounts/${acct.id}`} className="text-sm font-medium hover:underline" style={{ color: '#C9A84C' }}>
                            {acct.clientName}
                          </Link>
                        ) : '-'}
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
                          <Link href={`/crm/projects/${project.id}`} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="View"><Eye className="w-4 h-4 text-gray-500" /></Link>
                          <button onClick={() => { if (confirm('Delete project and all child records?')) deleteProject(project.id); }} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Delete"><Trash2 className="w-4 h-4 text-red-400" /></button>
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
              <HardHat className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-[18px] font-semibold text-[#0F1C2E] mb-2">No projects found</h3>
            <p className="text-gray-500 text-[14px] mb-6">Create your first project to start tracking work.</p>
            <button className="bg-[#C9A84C] hover:bg-[#b5953e] text-white rounded-lg shadow-md hover:shadow-lg transition-all font-semibold flex items-center px-6 py-3 w-full justify-center" onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Project
            </button>
          </div>
        ) : (
          filtered.map(project => {
            const acct = project.accountId ? data.accounts.find(a => a.id === project.accountId) : null;
            return (
              <div key={project.id} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm transition-all" style={{ border: '1px solid rgba(0,0,0,0.04)' }}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="font-semibold text-[#0F1C2E] text-[16px] leading-tight mb-1">{project.projectName}</div>
                    <div className="font-mono text-xs font-semibold" style={{ color: '#C9A84C' }}>{project.projectId}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${project.isActive !== false ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                      {project.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-4 text-[13px]">
                  <div className="col-span-2">
                    <span className="text-gray-400 block mb-0.5 text-[11px] uppercase tracking-wider font-semibold">Client</span>
                    {acct ? (
                      <Link href={`/crm/accounts/${acct.id}`} className="font-medium hover:underline" style={{ color: '#C9A84C' }}>
                        {acct.clientName}
                      </Link>
                    ) : '-'}
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5 text-[11px] uppercase tracking-wider font-semibold">Project Type</span>
                    <span className="text-gray-700">{project.projectType}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5 text-[11px] uppercase tracking-wider font-semibold">Contract Value</span>
                    <span className="text-gray-700 font-medium">{formatCurrency(project.projectContractValue)}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400 block mb-0.5 text-[11px] uppercase tracking-wider font-semibold">Start Date</span>
                    <span className="text-gray-700">{formatDate(project.startDate)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
                  <Link
                    href={`/crm/projects/${project.id}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gray-50 text-[#0F1C2E] text-[13px] font-semibold hover:bg-gray-100 transition-colors"
                  >
                    <Eye className="w-4 h-4" /> View Details
                  </Link>
                  <button
                    onClick={() => { if (confirm('Delete project and all child records?')) deleteProject(project.id); }}
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
      <CreateProjectModal
        accounts={data.accounts}
        contacts={data.contacts}
        onClose={() => setShowCreate(false)}
        onCreate={p => { addProject(p); setShowCreate(false); }}
      />
    )}
    </>
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
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold tracking-tight" style={{ color: '#0F1C2E' }}>
              Create Project
            </h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
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
            className="p-6 space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div><label className="block text-[13px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Project Name *</label><input className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-colors" value={form.projectName} onChange={e => set('projectName', e.target.value)} required /></div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Project Type</label>
                <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-colors appearance-none" value={form.projectType} onChange={e => set('projectType', e.target.value)}>
                  {projectTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Account</label>
                <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-colors appearance-none" value={form.accountId || ''} onChange={e => set('accountId', e.target.value || null)}>
                  <option value="">— None —</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.clientName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Contact</label>
                <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-colors appearance-none" value={form.contactId || ''} onChange={e => set('contactId', e.target.value || null)}>
                  <option value="">— None —</option>
                  {contacts.map(c => <option key={c.id} value={c.id}>{c.contactName}</option>)}
                </select>
              </div>
              <div><label className="block text-[13px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Total Site Area (sq.ft)</label><input type="number" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-colors" value={form.totalSiteArea} onChange={e => set('totalSiteArea', e.target.value)} /></div>
              <div><label className="block text-[13px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Built Up Area (sq.ft)</label><input type="number" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-colors" value={form.builtUpArea} onChange={e => set('builtUpArea', e.target.value)} /></div>
              <div><label className="block text-[13px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Number of Floors</label><input type="number" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-colors" value={form.numberOfFloors} onChange={e => set('numberOfFloors', e.target.value)} /></div>
              <div><label className="block text-[13px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Contract Value (₹)</label><input type="number" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-colors" value={form.projectContractValue} onChange={e => set('projectContractValue', e.target.value)} /></div>
              <div><label className="block text-[13px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Start Date</label><input type="date" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-colors" value={form.startDate} onChange={e => set('startDate', e.target.value)} /></div>
              <div><label className="block text-[13px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">End Date</label><input type="date" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-colors" value={form.endDate} onChange={e => set('endDate', e.target.value)} /></div>
              <div className="sm:col-span-2">
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Status</label>
                <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-colors appearance-none" value={form.status} onChange={e => set('status', e.target.value)}>
                  {projectStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div><label className="block text-[13px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Project Location</label><textarea className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-colors" value={form.projectLocation} onChange={e => set('projectLocation', e.target.value)} rows={2} /></div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg text-[14px] font-semibold text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
              <button type="submit" className="bg-[#C9A84C] hover:bg-[#b5953e] text-white rounded-lg shadow-md hover:shadow-lg transition-all px-6 py-2.5 text-[14px] font-semibold">Create Project</button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
}

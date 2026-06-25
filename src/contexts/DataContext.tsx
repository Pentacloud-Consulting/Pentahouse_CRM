'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CRMData, Lead, Account, Contact, Project,
  Material, PaymentDelivered, OneTimePayment, PaymentReceived, ProjectDocument, OtherMaterial,
  InteriorMaterial, FinancialSummary, MaterialCategory, Quotation,
} from '@/lib/types';
import { generateId, generateProjectId, nowISO } from '@/lib/utils';

// ── Default empty store ──
const defaultData: CRMData = {
  leads: [],
  accounts: [],
  contacts: [],
  projects: [],
  materials: [],
  paymentsDelivered: [],
  oneTimePayments: [],
  paymentsReceived: [],
  projectDocuments: [],
  otherMaterials: [],
  interiorMaterials: [],
  quotations: [],
  projectCounter: 1,
};

const STORAGE_KEY = 'pentahouse_crm_data';

// ── Context type ──
interface DataContextType {
  data: CRMData;
  // Leads
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => Lead;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  getLead: (id: string) => Lead | undefined;
  convertLead: (id: string) => { account: Account; contact: Contact; project: Project } | null;
  // Accounts
  addAccount: (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => Account;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  getAccount: (id: string) => Account | undefined;
  // Contacts
  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => Contact;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  getContact: (id: string) => Contact | undefined;
  // Projects
  addProject: (project: Omit<Project, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProject: (id: string) => Project | undefined;
  // Materials
  addMaterial: (mat: Omit<Material, 'id' | 'totalAmount' | 'createdAt'>) => Material;
  updateMaterial: (id: string, updates: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;
  getProjectMaterials: (projectId: string) => Material[];
  // Payment Delivered
  addPaymentDelivered: (p: Omit<PaymentDelivered, 'id' | 'createdAt'>) => PaymentDelivered;
  updatePaymentDelivered: (id: string, updates: Partial<PaymentDelivered>) => void;
  deletePaymentDelivered: (id: string) => void;
  getProjectPaymentsDelivered: (projectId: string) => PaymentDelivered[];
  // One-Time Payments
  addOneTimePayment: (p: Omit<OneTimePayment, 'id' | 'createdAt'>) => OneTimePayment;
  updateOneTimePayment: (id: string, updates: Partial<OneTimePayment>) => void;
  deleteOneTimePayment: (id: string) => void;
  getProjectOneTimePayments: (projectId: string) => OneTimePayment[];
  // Payment Received
  addPaymentReceived: (p: Omit<PaymentReceived, 'id' | 'createdAt'>) => PaymentReceived;
  updatePaymentReceived: (id: string, updates: Partial<PaymentReceived>) => void;
  deletePaymentReceived: (id: string) => void;
  getProjectPaymentsReceived: (projectId: string) => PaymentReceived[];
  // Project Documents
  addProjectDocument: (p: Omit<ProjectDocument, 'id' | 'createdAt'>) => ProjectDocument;
  updateProjectDocument: (id: string, updates: Partial<ProjectDocument>) => void;
  deleteProjectDocument: (id: string) => void;
  getProjectDocuments: (projectId: string) => ProjectDocument[];
  // Other Materials
  addOtherMaterial: (p: Omit<OtherMaterial, 'id' | 'createdAt'>) => OtherMaterial;
  updateOtherMaterial: (id: string, updates: Partial<OtherMaterial>) => void;
  deleteOtherMaterial: (id: string) => void;
  getProjectOtherMaterials: (projectId: string) => OtherMaterial[];
  // Interior Materials
  addInteriorMaterial: (im: Omit<InteriorMaterial, 'id' | 'createdAt' | 'totalAmount'>) => InteriorMaterial;
  updateInteriorMaterial: (id: string, updates: Partial<InteriorMaterial>) => void;
  deleteInteriorMaterial: (id: string) => void;
  getProjectInteriorMaterials: (projectId: string) => InteriorMaterial[];
  // Quotations
  addQuotation: (q: Omit<Quotation, 'id' | 'createdAt'>) => Quotation;
  updateQuotation: (id: string, updates: Partial<Quotation>) => void;
  deleteQuotation: (id: string) => void;
  getProjectQuotations: (projectId: string) => Quotation[];
  // Computed
  getProjectFinancialSummary: (projectId: string) => FinancialSummary;
  getAccountProjects: (accountId: string) => Project[];
  getAccountContacts: (accountId: string) => Contact[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<CRMData>(defaultData);
  const [mounted, setMounted] = useState(false);

  const syncAction = async (action: string, id?: string, payload?: any) => {
    try {
      const res = await fetch('/api/crm/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, id, payload })
      });
      if (!res.ok) console.error('Sync failed:', action, id);
    } catch (e) {
      console.error('Sync error:', action, e);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/crm');
        if (res.ok) {
          const dbData = await res.json();
          setData({ ...defaultData, ...dbData });
        }
      } catch (err) {
        console.error('Failed to load DB data', err);
      } finally {
        setMounted(true);
      }
    };
    loadData();
  }, []);

  const update = useCallback((updater: (prev: CRMData) => CRMData) => {
    setData(prev => updater(prev));
  }, []);

  const addLead = useCallback((lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Lead => {
    const newLead: Lead = {
      ...lead,
      id: generateId(),
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    update(prev => ({ ...prev, leads: [...prev.leads, newLead] }));
    syncAction('addLead', undefined, newLead);
    return newLead;
  }, [update]);

  const updateLead = useCallback((id: string, updates: Partial<Lead>) => {
    update(prev => ({
      ...prev,
      leads: prev.leads.map(l => l.id === id ? { ...l, ...updates, updatedAt: nowISO() } : l),
    }));
    syncAction('updateLead', id, updates);
  }, [update]);

  const deleteLead = useCallback((id: string) => {
    update(prev => ({ ...prev, leads: prev.leads.filter(l => l.id !== id) }));
    syncAction('deleteLead', id);
  }, [update]);

  const getLead = useCallback((id: string) => data.leads.find(l => l.id === id), [data.leads]);

  const convertLead = useCallback((id: string) => {
    const lead = data.leads.find(l => l.id === id);
    if (!lead || lead.status !== 'Qualified') return null;

    const now = nowISO();
    const accountId = generateId();
    const contactId = generateId();
    const projectId = generateId();
    const projSeq = data.projectCounter;

    const account: Account = {
      id: accountId,
      clientName: lead.leadName,
      mobile: lead.mobile,
      alternateMobile: lead.alternateMobile,
      email: lead.email,
      address: lead.address,
      city: lead.city,
      state: '',
      gstNumber: '',
      panNumber: '',
      aadhaarNumber: '',
      notes: '',
      convertedFromLeadId: lead.id,
      createdAt: now,
      updatedAt: now,
    };

    const contact: Contact = {
      id: contactId,
      contactName: lead.leadName,
      mobile: lead.mobile,
      email: lead.email,
      designation: '',
      address: lead.address,
      linkedAccountId: accountId,
      convertedFromLeadId: lead.id,
      createdAt: now,
      updatedAt: now,
    };

    const project: Project = {
      id: projectId,
      projectId: generateProjectId(projSeq),
      projectName: lead.leadName,
      accountId: accountId,
      contactId: contactId,
      convertedFromLeadId: lead.id,
      projectLocation: lead.address,
      projectType: 'Residential',
      totalSiteArea: lead.plotArea,
      builtUpArea: null,
      numberOfFloors: null,
      startDate: '',
      endDate: '',
      projectContractValue: lead.budget,
      status: 'Planning',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    update(prev => ({
      ...prev,
      leads: prev.leads.map(l => l.id === id ? { ...l, status: 'Converted' as const, updatedAt: now } : l),
      accounts: [...prev.accounts, account],
      contacts: [...prev.contacts, contact],
      projects: [...prev.projects, project],
      projectCounter: prev.projectCounter + 1,
    }));

    syncAction('addAccount', undefined, account);
    syncAction('addContact', undefined, contact);
    syncAction('addProject', undefined, project);
    syncAction('updateLead', id, { status: 'Converted', updatedAt: now });

    return { account, contact, project };
  }, [data.leads, data.projectCounter, update]);

  const addAccount = useCallback((account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Account => {
    const newAccount: Account = { ...account, id: generateId(), createdAt: nowISO(), updatedAt: nowISO() };
    update(prev => ({ ...prev, accounts: [...prev.accounts, newAccount] }));
    syncAction('addAccount', undefined, newAccount);
    return newAccount;
  }, [update]);

  const updateAccount = useCallback((id: string, updates: Partial<Account>) => {
    update(prev => ({
      ...prev,
      accounts: prev.accounts.map(a => a.id === id ? { ...a, ...updates, updatedAt: nowISO() } : a),
    }));
    syncAction('updateAccount', id, updates);
  }, [update]);

  const deleteAccount = useCallback((id: string) => {
    update(prev => ({ ...prev, accounts: prev.accounts.filter(a => a.id !== id) }));
    syncAction('deleteAccount', id);
  }, [update]);

  const getAccount = useCallback((id: string) => data.accounts.find(a => a.id === id), [data.accounts]);

  const getAccountProjects = useCallback((accountId: string) =>
    data.projects.filter(p => p.accountId === accountId), [data.projects]);

  const getAccountContacts = useCallback((accountId: string) =>
    data.contacts.filter(c => c.linkedAccountId === accountId), [data.contacts]);

  const addContact = useCallback((contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Contact => {
    const newContact: Contact = { ...contact, id: generateId(), createdAt: nowISO(), updatedAt: nowISO() };
    update(prev => ({ ...prev, contacts: [...prev.contacts, newContact] }));
    syncAction('addContact', undefined, newContact);
    return newContact;
  }, [update]);

  const updateContact = useCallback((id: string, updates: Partial<Contact>) => {
    update(prev => ({
      ...prev,
      contacts: prev.contacts.map(c => c.id === id ? { ...c, ...updates, updatedAt: nowISO() } : c),
    }));
    syncAction('updateContact', id, updates);
  }, [update]);

  const deleteContact = useCallback((id: string) => {
    update(prev => ({ ...prev, contacts: prev.contacts.filter(c => c.id !== id) }));
    syncAction('deleteContact', id);
  }, [update]);

  const getContact = useCallback((id: string) => data.contacts.find(c => c.id === id), [data.contacts]);

  const addProject = useCallback((project: Omit<Project, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>): Project => {
    const newProject: Project = {
      ...project,
      isActive: project.isActive ?? true,
      id: generateId(),
      projectId: generateProjectId(data.projectCounter),
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    update(prev => ({
      ...prev,
      projects: [...prev.projects, newProject],
      projectCounter: prev.projectCounter + 1,
    }));
    syncAction('addProject', undefined, newProject);
    return newProject;
  }, [data.projectCounter, update]);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    update(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, ...updates, updatedAt: nowISO() } : p),
    }));
    syncAction('updateProject', id, updates);
  }, [update]);

  const deleteProject = useCallback((id: string) => {
    update(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id),
      materials: prev.materials.filter(m => m.projectId !== id),
      paymentsDelivered: prev.paymentsDelivered.filter(p => p.projectId !== id),
      oneTimePayments: prev.oneTimePayments.filter(p => p.projectId !== id),
      paymentsReceived: prev.paymentsReceived.filter(p => p.projectId !== id),
      projectDocuments: prev.projectDocuments.filter(p => p.projectId !== id),
      otherMaterials: prev.otherMaterials.filter(p => p.projectId !== id),
      interiorMaterials: prev.interiorMaterials.filter(p => p.projectId !== id),
    }));
    syncAction('deleteProject', id);
  }, [update]);

  const getProject = useCallback((id: string) => data.projects.find(p => p.id === id), [data.projects]);

  const addMaterial = useCallback((mat: Omit<Material, 'id' | 'totalAmount' | 'createdAt'>): Material => {
    const totalAmount = (mat.quantity || 0) * (mat.rate || 0);
    const newMat: Material = { ...mat, id: generateId(), totalAmount, createdAt: nowISO() };
    update(prev => ({ ...prev, materials: [...prev.materials, newMat] }));
    syncAction('addMaterial', undefined, newMat);
    return newMat;
  }, [update]);

  const updateMaterial = useCallback((id: string, updates: Partial<Material>) => {
    update(prev => ({
      ...prev,
      materials: prev.materials.map(m => {
        if (m.id !== id) return m;
        const updated = { ...m, ...updates };
        updated.totalAmount = (updated.quantity || 0) * (updated.rate || 0);
        return updated;
      }),
    }));
    syncAction('updateMaterial', id, updates);
  }, [update]);

  const deleteMaterial = useCallback((id: string) => {
    update(prev => ({ ...prev, materials: prev.materials.filter(m => m.id !== id) }));
    syncAction('deleteMaterial', id);
  }, [update]);

  const getProjectMaterials = useCallback((projectId: string) =>
    data.materials.filter(m => m.projectId === projectId), [data.materials]);

  const addPaymentDelivered = useCallback((p: Omit<PaymentDelivered, 'id' | 'createdAt'>): PaymentDelivered => {
    const newP: PaymentDelivered = { ...p, id: generateId(), createdAt: nowISO() };
    update(prev => ({ ...prev, paymentsDelivered: [...prev.paymentsDelivered, newP] }));
    syncAction('addPaymentDelivered', undefined, newP);
    return newP;
  }, [update]);

  const updatePaymentDelivered = useCallback((id: string, updates: Partial<PaymentDelivered>) => {
    update(prev => ({
      ...prev,
      paymentsDelivered: prev.paymentsDelivered.map(p => p.id === id ? { ...p, ...updates } : p),
    }));
    syncAction('updatePaymentDelivered', id, updates);
  }, [update]);

  const deletePaymentDelivered = useCallback((id: string) => {
    update(prev => ({ ...prev, paymentsDelivered: prev.paymentsDelivered.filter(p => p.id !== id) }));
    syncAction('deletePaymentDelivered', id);
  }, [update]);

  const getProjectPaymentsDelivered = useCallback((projectId: string) =>
    data.paymentsDelivered.filter(p => p.projectId === projectId), [data.paymentsDelivered]);

  const addOneTimePayment = useCallback((p: Omit<OneTimePayment, 'id' | 'createdAt'>): OneTimePayment => {
    const newP: OneTimePayment = { ...p, id: generateId(), createdAt: nowISO() };
    update(prev => ({ ...prev, oneTimePayments: [...prev.oneTimePayments, newP] }));
    syncAction('addOneTimePayment', undefined, newP);
    return newP;
  }, [update]);

  const updateOneTimePayment = useCallback((id: string, updates: Partial<OneTimePayment>) => {
    update(prev => ({
      ...prev,
      oneTimePayments: prev.oneTimePayments.map(p => p.id === id ? { ...p, ...updates } : p),
    }));
    syncAction('updateOneTimePayment', id, updates);
  }, [update]);

  const deleteOneTimePayment = useCallback((id: string) => {
    update(prev => ({ ...prev, oneTimePayments: prev.oneTimePayments.filter(p => p.id !== id) }));
    syncAction('deleteOneTimePayment', id);
  }, [update]);

  const getProjectOneTimePayments = useCallback((projectId: string) =>
    data.oneTimePayments.filter(p => p.projectId === projectId), [data.oneTimePayments]);

  const addPaymentReceived = useCallback((p: Omit<PaymentReceived, 'id' | 'createdAt'>): PaymentReceived => {
    const newP: PaymentReceived = { ...p, id: generateId(), createdAt: nowISO() };
    update(prev => ({ ...prev, paymentsReceived: [...prev.paymentsReceived, newP] }));
    syncAction('addPaymentReceived', undefined, newP);
    return newP;
  }, [update]);

  const updatePaymentReceived = useCallback((id: string, updates: Partial<PaymentReceived>) => {
    update(prev => ({
      ...prev,
      paymentsReceived: prev.paymentsReceived.map(p => p.id === id ? { ...p, ...updates } : p),
    }));
    syncAction('updatePaymentReceived', id, updates);
  }, [update]);

  const deletePaymentReceived = useCallback((id: string) => {
    update(prev => ({ ...prev, paymentsReceived: prev.paymentsReceived.filter(p => p.id !== id) }));
    syncAction('deletePaymentReceived', id);
  }, [update]);

  const getProjectPaymentsReceived = useCallback((projectId: string) =>
    data.paymentsReceived.filter(p => p.projectId === projectId), [data.paymentsReceived]);

  const addProjectDocument = useCallback((p: Omit<ProjectDocument, 'id' | 'createdAt'>): ProjectDocument => {
    const newDoc: ProjectDocument = { ...p, id: generateId(), createdAt: nowISO() };
    update(prev => ({ ...prev, projectDocuments: [...prev.projectDocuments, newDoc] }));
    syncAction('addProjectDocument', undefined, newDoc);
    return newDoc;
  }, [update]);

  const updateProjectDocument = useCallback((id: string, updates: Partial<ProjectDocument>) => {
    update(prev => ({
      ...prev,
      projectDocuments: prev.projectDocuments.map(p => p.id === id ? { ...p, ...updates } : p),
    }));
    syncAction('updateProjectDocument', id, updates);
  }, [update]);

  const deleteProjectDocument = useCallback((id: string) => {
    update(prev => ({ ...prev, projectDocuments: prev.projectDocuments.filter(p => p.id !== id) }));
    syncAction('deleteProjectDocument', id);
  }, [update]);

  const getProjectDocuments = useCallback((projectId: string) =>
    data.projectDocuments.filter(p => p.projectId === projectId), [data.projectDocuments]);

  const addOtherMaterial = useCallback((p: Omit<OtherMaterial, 'id' | 'createdAt'>): OtherMaterial => {
    const newMat: OtherMaterial = { ...p, id: generateId(), createdAt: nowISO() };
    update(prev => ({ ...prev, otherMaterials: [...prev.otherMaterials, newMat] }));
    syncAction('addOtherMaterial', undefined, newMat);
    return newMat;
  }, [update]);

  const updateOtherMaterial = useCallback((id: string, updates: Partial<OtherMaterial>) => {
    update(prev => ({
      ...prev,
      otherMaterials: prev.otherMaterials.map(p => p.id === id ? { ...p, ...updates } : p),
    }));
    syncAction('updateOtherMaterial', id, updates);
  }, [update]);

  const deleteOtherMaterial = useCallback((id: string) => {
    update(prev => ({ ...prev, otherMaterials: prev.otherMaterials.filter(p => p.id !== id) }));
    syncAction('deleteOtherMaterial', id);
  }, [update]);

  const getProjectOtherMaterials = useCallback((projectId: string) =>
    data.otherMaterials.filter(p => p.projectId === projectId), [data.otherMaterials]);

  const addInteriorMaterial = useCallback((im: Omit<InteriorMaterial, 'id' | 'createdAt' | 'totalAmount'>): InteriorMaterial => {
    const totalAmount = im.area * im.costPerSqft;
    const newIm: InteriorMaterial = { ...im, totalAmount, id: generateId(), createdAt: nowISO() };
    update(prev => ({ ...prev, interiorMaterials: [...prev.interiorMaterials, newIm] }));
    syncAction('addInteriorMaterial', undefined, newIm);
    return newIm;
  }, [update]);

  const updateInteriorMaterial = useCallback((id: string, updates: Partial<InteriorMaterial>) => {
    update(prev => ({
      ...prev,
      interiorMaterials: prev.interiorMaterials.map(im => {
        if (im.id !== id) return im;
        const updated = { ...im, ...updates };
        updated.totalAmount = updated.area * updated.costPerSqft;
        return updated;
      }),
    }));
    syncAction('updateInteriorMaterial', id, updates);
  }, [update]);

  const deleteInteriorMaterial = useCallback((id: string) => {
    update(prev => ({ ...prev, interiorMaterials: prev.interiorMaterials.filter(im => im.id !== id) }));
    syncAction('deleteInteriorMaterial', id);
  }, [update]);

  const getProjectInteriorMaterials = useCallback((projectId: string) =>
    data.interiorMaterials.filter(im => im.projectId === projectId), [data.interiorMaterials]);

  const addQuotation = useCallback((q: Omit<Quotation, 'id' | 'createdAt'>): Quotation => {
    const newQ: Quotation = { ...q, id: generateId(), createdAt: nowISO() };
    update(prev => ({ ...prev, quotations: [...prev.quotations, newQ] }));
    syncAction('addQuotation', undefined, newQ);
    return newQ;
  }, [update]);

  const deleteQuotation = useCallback((id: string) => {
    update(prev => ({ ...prev, quotations: prev.quotations.filter(q => q.id !== id) }));
    syncAction('deleteQuotation', id);
  }, [update]);

  const updateQuotation = useCallback((id: string, updates: Partial<Quotation>) => {
    update(prev => ({
      ...prev,
      quotations: prev.quotations.map(q => q.id === id ? { ...q, ...updates } : q),
    }));
    syncAction('updateQuotation', id, updates);
  }, [update]);

  const getProjectQuotations = useCallback((projectId: string) =>
    data.quotations.filter(q => q.projectId === projectId), [data.quotations]);

  const getProjectFinancialSummary = useCallback((projectId: string): FinancialSummary => {
    const project = data.projects.find(p => p.id === projectId);
    const mats = data.materials.filter(m => m.projectId === projectId);
    const labour = data.paymentsDelivered.filter(p => p.projectId === projectId);
    const oneTime = data.oneTimePayments.filter(p => p.projectId === projectId);
    const received = data.paymentsReceived.filter(p => p.projectId === projectId);
    const otherMats = data.otherMaterials.filter(p => p.projectId === projectId);
    const interiorMats = data.interiorMaterials.filter(im => im.projectId === projectId);
    const projectQuotations = data.quotations.filter(q => q.projectId === projectId);

    const totalMaterialsCost = mats.reduce((s, m) => s + (m.totalAmount || 0), 0);
    const totalLabourCost = labour.reduce((s, p) => s + (p.amount || 0), 0);
    const totalOneTimeExpenses = oneTime.reduce((s, p) => s + (p.amount || 0), 0);
    const totalOtherMaterialsCost = otherMats.reduce((s, p) => s + (p.amount || 0), 0);
    
    // Sum legacy interior materials + new quotations
    const legacyInteriorCost = interiorMats.reduce((s, im) => s + (im.totalAmount || 0), 0);
    const quotationsCost = projectQuotations.reduce((s, q) => s + (q.grandTotal || 0), 0);
    const totalInteriorMaterialsCost = legacyInteriorCost + quotationsCost;
    
    const totalProjectCost = totalMaterialsCost + totalLabourCost + totalOneTimeExpenses + totalOtherMaterialsCost + totalInteriorMaterialsCost;
    
    const totalAmountReceived = received.reduce((s, p) => s + (p.amountReceived || 0), 0);
    const contractValue = project?.projectContractValue || 0;
    const outstandingAmount = contractValue - totalAmountReceived;
    const profitLoss = totalAmountReceived - totalProjectCost;

    const materialsByCategory: Record<string, number> = {};
    mats.forEach(m => {
      const cat = m.materialCategory;
      materialsByCategory[cat] = (materialsByCategory[cat] || 0) + (m.totalAmount || 0);
    });

    return {
      projectContractValue: contractValue,
      totalMaterialsCost,
      totalLabourCost,
      totalOneTimeExpenses,
      totalOtherMaterialsCost,
      totalInteriorMaterialsCost,
      totalProjectCost,
      totalAmountReceived,
      outstandingAmount,
      profitLoss,
      materialsByCategory,
    };
  }, [data]);

  if (!mounted) return null;

  return (
    <DataContext.Provider
      value={{
        data,
        addLead, updateLead, deleteLead, getLead, convertLead,
        addAccount, updateAccount, deleteAccount, getAccount,
        addContact, updateContact, deleteContact, getContact,
        addProject, updateProject, deleteProject, getProject,
        addMaterial, updateMaterial, deleteMaterial, getProjectMaterials,
        addPaymentDelivered, updatePaymentDelivered, deletePaymentDelivered, getProjectPaymentsDelivered,
        addOneTimePayment, updateOneTimePayment, deleteOneTimePayment, getProjectOneTimePayments,
        addPaymentReceived, updatePaymentReceived, deletePaymentReceived, getProjectPaymentsReceived,
        addProjectDocument, updateProjectDocument, deleteProjectDocument, getProjectDocuments,
        addOtherMaterial, updateOtherMaterial, deleteOtherMaterial, getProjectOtherMaterials,
        addInteriorMaterial, updateInteriorMaterial, deleteInteriorMaterial, getProjectInteriorMaterials,
        addQuotation, updateQuotation, deleteQuotation, getProjectQuotations,
        getProjectFinancialSummary, getAccountProjects, getAccountContacts,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be inside DataProvider');
  return ctx;
}

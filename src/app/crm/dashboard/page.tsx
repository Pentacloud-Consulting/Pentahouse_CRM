'use client';

import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { hasAccess } from '@/lib/permissions';
import { formatCurrency } from '@/lib/utils';
import {
  Users, Building2, FolderKanban, TrendingUp, TrendingDown,
  DollarSign, Percent, AlertCircle, CheckCircle2, PauseCircle, Hammer
} from 'lucide-react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#0F1C2E', '#C9A84C', '#2563EB', '#DC2626', '#059669', '#7C3AED', '#EA580C', '#0891B2', '#D946EF'];

export default function DashboardPage() {
  const { data, getProjectFinancialSummary } = useData();
  const { user } = useAuth();

  if (!user) return null;

  // ── Lead stats ──
  const totalLeads = data.leads.length;
  const qualifiedLeads = data.leads.filter(l => l.status === 'Qualified' || l.status === 'Converted').length;
  const lostLeads = data.leads.filter(l => l.status === 'Lost').length;
  const conversionRate = totalLeads > 0 ? ((qualifiedLeads / totalLeads) * 100).toFixed(1) : '0';

  // ── Project stats ──
  const activeProjects = data.projects.filter(p => p.isActive !== false).length;
  const completedProjects = data.projects.filter(p => p.status === 'Completed').length;
  const onHoldProjects = data.projects.filter(p => p.status === 'On Hold').length;

  // ── Financial aggregates ──
  let totalMaterialCost = 0;
  let totalLabourCost = 0;
  let totalOneTimeCost = 0;
  let totalReceived = 0;
  let totalOutstanding = 0;
  const categoryTotals: Record<string, number> = {};

  data.projects.forEach(project => {
    const summary = getProjectFinancialSummary(project.id);
    totalMaterialCost += summary.totalMaterialsCost;
    totalLabourCost += summary.totalLabourCost;
    totalOneTimeCost += summary.totalOneTimeExpenses;
    totalReceived += summary.totalAmountReceived;
    totalOutstanding += summary.outstandingAmount;

    Object.entries(summary.materialsByCategory).forEach(([cat, val]) => {
      categoryTotals[cat] = (categoryTotals[cat] || 0) + val;
    });
  });

  const totalProfitLoss = totalReceived - (totalMaterialCost + totalLabourCost + totalOneTimeCost);

  const categoryChartData = Object.entries(categoryTotals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const leadStatusCounts: Record<string, number> = {};
  data.leads.forEach(l => {
    leadStatusCounts[l.status] = (leadStatusCounts[l.status] || 0) + 1;
  });
  const leadPieData = Object.entries(leadStatusCounts).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-8 sm:space-y-10 animate-fade-in max-w-7xl mx-auto">
      {/* ── Dashboard Hero ── */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[28px] sm:text-[32px] font-bold tracking-tight" style={{ color: '#0F1C2E' }}>
            Dashboard
          </h2>
          <div className="mt-1 sm:mt-2 text-gray-500 font-medium text-[15px] sm:text-base">
            <span className="text-gray-900 font-semibold block sm:inline">Welcome back 👋</span>
            <span className="block sm:inline sm:ml-2">Here's your business overview.</span>
          </div>
        </div>
      </div>

      {/* ── Lead Dashboard ── */}
      {hasAccess(user.role, 'leads') && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-blue-50">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-[17px] font-semibold text-[#0F1C2E] tracking-tight">Lead Overview</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard icon={Users} label="Total Leads" value={totalLeads} color="#2563EB" bgColor="#eff6ff" />
            <StatCard icon={CheckCircle2} label="Qualified" value={qualifiedLeads} color="#059669" bgColor="#ecfdf5" />
            <StatCard icon={AlertCircle} label="Lost" value={lostLeads} color="#DC2626" bgColor="#fef2f2" />
            <StatCard icon={Percent} label="Conversion Rate" value={`${conversionRate}%`} color="#D97706" bgColor="#fffbeb" />
          </div>
          {leadPieData.length > 0 && (
            <div className="mt-6 bg-white rounded-2xl p-6 transition-all" style={{ border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <h4 className="text-[14px] font-semibold mb-4" style={{ color: '#0F1C2E' }}>Lead Status Distribution</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <PieChart>
                    <Pie data={leadPieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}>
                      {leadPieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── Project Dashboard ── */}
      {hasAccess(user.role, 'projects') && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-amber-50">
              <FolderKanban className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="text-[17px] font-semibold text-[#0F1C2E] tracking-tight">Project Overview</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Link href="/crm/projects?filter=Active">
              <StatCard icon={Building2} label="Active Projects" value={activeProjects} color="#2563EB" bgColor="#eff6ff" />
            </Link>
            <Link href="/crm/projects?filter=Inactive">
              <StatCard icon={PauseCircle} label="Inactive Projects" value={data.projects.length - activeProjects} color="#D97706" bgColor="#fffbeb" />
            </Link>
            <div className="col-span-2 lg:col-span-1">
              <StatCard icon={CheckCircle2} label="Completed" value={completedProjects} color="#059669" bgColor="#ecfdf5" />
            </div>
          </div>
        </section>
      )}

      {/* ── Material Dashboard ── */}
      {hasAccess(user.role, 'materials') && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-purple-50">
              <Hammer className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="text-[17px] font-semibold text-[#0F1C2E] tracking-tight">Material Overview</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
            <StatCard icon={DollarSign} label="Total Material Cost" value={formatCurrency(totalMaterialCost)} color="#7C3AED" bgColor="#f5f3ff" />
          </div>
          {categoryChartData.length > 0 && (
            <div className="bg-white rounded-2xl p-6 transition-all" style={{ border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <h4 className="text-[14px] font-semibold mb-4" style={{ color: '#0F1C2E' }}>Category-wise Material Cost</h4>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart data={categoryChartData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value: any) => formatCurrency(Number(value) || 0)} />
                    <Bar dataKey="value" fill="#C9A84C" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── Finance Dashboard ── */}
      {hasAccess(user.role, 'financialReports') && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-emerald-50">
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-[17px] font-semibold text-[#0F1C2E] tracking-tight">Financial Overview</h3>
          </div>
          <div className="grid grid-cols-2 xl:grid-cols-5 gap-3 sm:gap-4">
            <StatCard icon={TrendingUp} label="Total Received" value={formatCurrency(totalReceived)} color="#059669" bgColor="#ecfdf5" />
            <StatCard icon={DollarSign} label="Labour Cost" value={formatCurrency(totalLabourCost)} color="#2563EB" bgColor="#eff6ff" />
            <StatCard icon={DollarSign} label="One-Time Expenses" value={formatCurrency(totalOneTimeCost)} color="#7C3AED" bgColor="#f5f3ff" />
            <StatCard icon={AlertCircle} label="Outstanding" value={formatCurrency(totalOutstanding)} color="#DC2626" bgColor="#fef2f2" />
            <div className="col-span-2 xl:col-span-1">
              <StatCard
                icon={totalProfitLoss >= 0 ? TrendingUp : TrendingDown}
                label="Profit / Loss"
                value={formatCurrency(totalProfitLoss)}
                color={totalProfitLoss >= 0 ? '#059669' : '#DC2626'}
                bgColor={totalProfitLoss >= 0 ? '#ecfdf5' : '#fef2f2'}
              />
            </div>
          </div>
        </section>
      )}

      {/* Empty state */}
      {data.leads.length === 0 && data.projects.length === 0 && (
        <div className="text-center py-16">
          <Building2 className="w-16 h-16 mx-auto mb-4" style={{ color: '#C9A84C', opacity: 0.5 }} />
          <h3 className="text-[20px] font-semibold mb-2" style={{ color: '#0F1C2E' }}>Welcome to Pentahouse CRM</h3>
          <p className="text-gray-500 text-[14px]">Start by adding your first Lead from the Leads module.</p>
        </div>
      )}
    </div>
  );
}

// ── Stat Card Component ──
function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bgColor = color + '15',
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: string | number;
  color: string;
  bgColor?: string;
}) {
  return (
    <div
      className="bg-white rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md h-full flex flex-col justify-center"
      style={{ border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}
    >
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-3 sm:mb-4" style={{ background: bgColor }}>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color }} />
      </div>
      <div className="text-[22px] sm:text-[26px] font-bold tracking-tight leading-none mb-1.5 sm:mb-2" style={{ color: '#0F1C2E' }}>
        {value}
      </div>
      <div className="text-[12px] sm:text-[13px] font-medium text-gray-500 line-clamp-1">{label}</div>
    </div>
  );
}

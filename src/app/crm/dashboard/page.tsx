'use client';

import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { hasAccess } from '@/lib/permissions';
import { formatCurrency } from '@/lib/utils';
import {
  Users, FolderKanban, TrendingUp, Percent, AlertCircle, CheckCircle2, Hammer,
  Search, Bell, Calendar, Zap, ArrowUpRight, BarChart3, PieChart as PieIcon,
  Building2, CreditCard, DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts';

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#6366F1'];

export default function DashboardPage() {
  const { data, getProjectFinancialSummary } = useData();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('This Month');

  if (!user) return null;

  // ── Lead stats ──
  const totalLeads = data.leads.length;
  const qualifiedLeads = data.leads.filter(l => l.status === 'Qualified' || l.status === 'Converted').length;
  const lostLeads = data.leads.filter(l => l.status === 'Lost').length;
  const conversionRate = totalLeads > 0 ? ((qualifiedLeads / totalLeads) * 100).toFixed(0) : '0';

  // ── Project stats ──
  const totalProjects = data.projects.length;
  const activeProjects = data.projects.filter(p => p.isActive !== false).length;
  const completedProjects = data.projects.filter(p => p.status === 'Completed').length;
  const inactiveProjects = totalProjects - activeProjects;

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

  // Lead status breakdown for donut chart
  const leadStatusCounts: Record<string, number> = { Qualified: 0, Converted: 0, Lost: 0, Pending: 0 };
  data.leads.forEach(l => {
    const key = l.status in leadStatusCounts ? l.status : 'Pending';
    leadStatusCounts[key] = (leadStatusCounts[key] || 0) + 1;
  });

  const leadPieData = [
    { name: 'Qualified', value: leadStatusCounts.Qualified || 0, color: '#3B82F6' },
    { name: 'Converted', value: leadStatusCounts.Converted || (totalLeads > 0 ? totalLeads : 0), color: '#10B981' },
    { name: 'Lost', value: leadStatusCounts.Lost || 0, color: '#EF4444' },
    { name: 'Pending', value: leadStatusCounts.Pending || 0, color: '#F59E0B' },
  ].filter(item => item.value > 0 || totalLeads === 0);

  const displayPieData = leadPieData.length > 0 ? leadPieData : [{ name: 'Converted', value: 1, color: '#10B981' }];

  return (
    <div className="flex flex-col space-y-2.5 max-w-[1720px] mx-auto overflow-hidden select-none">

      {/* ── TOP HEADER (Compact 54px Height) ── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-amber-400 shadow-xs">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-none">Executive Command Center</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">Welcome back 👋 Real-time business overview & analytics.</p>
          </div>
        </div>

        {/* Right Header Tools */}
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative hidden md:block w-52 lg:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search metrics... (⌘K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center gap-1 bg-slate-100/80 px-2 py-1 rounded-xl border border-slate-200/60 text-xs font-semibold text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="bg-transparent pr-1 focus:outline-none cursor-pointer text-slate-800 font-semibold"
            >
              <option>This Month</option>
              <option>This Quarter</option>
              <option>YTD 2026</option>
            </select>
          </div>

          {/* Notifications */}
          <button className="relative p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80 transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
          </button>
        </div>
      </header>

      {/* ── ROW 1: 5-CARD KPI OVERVIEW (Compact ~95px Height) ── */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
        <KpiCard
          icon={Users}
          label="Total Leads"
          value={totalLeads}
          trend="+12% vs last mo"
          trendPositive={true}
          accentColor="#2563EB"
          bgColor="#EFF6FF"
          sparklinePath="M0 16 Q 15 10, 30 14 T 60 6 T 90 2"
        />
        <KpiCard
          icon={CheckCircle2}
          label="Qualified Leads"
          value={qualifiedLeads}
          trend="100% rate"
          trendPositive={true}
          accentColor="#10B981"
          bgColor="#ECFDF5"
          sparklinePath="M0 18 Q 20 14, 40 8 T 80 4 T 90 2"
        />
        <KpiCard
          icon={AlertCircle}
          label="Lost Leads"
          value={lostLeads}
          trend="0% churn"
          trendPositive={true}
          accentColor="#64748B"
          bgColor="#F1F5F9"
          sparklinePath="M0 10 L 90 10"
        />
        <KpiCard
          icon={Percent}
          label="Conversion Rate"
          value={`${conversionRate}%`}
          trend="+24.5% efficiency"
          trendPositive={true}
          accentColor="#F59E0B"
          bgColor="#FFFBEB"
          sparklinePath="M0 20 Q 25 15, 50 10 T 75 4 T 90 2"
        />
        <KpiCard
          icon={Hammer}
          label="Total Material Cost"
          value={formatCurrency(totalMaterialCost)}
          trend="On budget"
          trendPositive={true}
          accentColor="#8B5CF6"
          bgColor="#F5F3FF"
          sparklinePath="M0 14 Q 30 16, 60 10 T 90 12"
        />
      </section>

      {/* ── ROW 2: MAIN ANALYTICS & PROJECTS SPLIT (7 Cols / 5 Cols) ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-2.5">

        {/* Lead Conversion Analytics (7 Cols) */}
        {hasAccess(user.role, 'leads') && (
          <div className="lg:col-span-7 bg-white/90 backdrop-blur-md rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-1.5">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-blue-50 text-blue-600">
                  <PieIcon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Lead Conversion Analytics</h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-600">
                  Total Leads: <strong className="text-slate-900">{totalLeads}</strong>
                </span>
                <Link href="/crm/leads" className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-0.5">
                  View Leads <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center h-36">
              {/* Donut Chart */}
              <div className="sm:col-span-5 h-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={displayPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={58}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {displayPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: unknown) => [`${val ?? 0} Leads`, 'Count']}
                      contentStyle={{ borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center Badge */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-lg font-extrabold text-slate-900 leading-none">{conversionRate}%</span>
                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Converted</span>
                </div>
              </div>

              {/* Breakdown Legend Badges */}
              <div className="sm:col-span-7 grid grid-cols-2 gap-2">
                <StatusBadge label="Qualified" count={leadStatusCounts.Qualified || 0} pct={totalLeads > 0 ? Math.round(((leadStatusCounts.Qualified || 0) / totalLeads) * 100) : 0} color="#3B82F6" />
                <StatusBadge label="Converted" count={leadStatusCounts.Converted || totalLeads} pct={totalLeads > 0 ? Math.round(((leadStatusCounts.Converted || totalLeads) / totalLeads) * 100) : 100} color="#10B981" />
                <StatusBadge label="Lost" count={leadStatusCounts.Lost || 0} pct={totalLeads > 0 ? Math.round(((leadStatusCounts.Lost || 0) / totalLeads) * 100) : 0} color="#EF4444" />
                <StatusBadge label="Pending" count={leadStatusCounts.Pending || 0} pct={totalLeads > 0 ? Math.round(((leadStatusCounts.Pending || 0) / totalLeads) * 100) : 0} color="#F59E0B" />
              </div>
            </div>
          </div>
        )}

        {/* Project Portfolio Overview (5 Cols) */}
        {hasAccess(user.role, 'projects') && (
          <div className="lg:col-span-5 bg-white/90 backdrop-blur-md rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-1.5">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-amber-50 text-amber-600">
                  <FolderKanban className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Project Portfolio Overview</h2>
              </div>
              <Link href="/crm/projects" className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-0.5">
                Manage <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <ProjectPill label="Active" count={activeProjects} color="#2563EB" bg="#EFF6FF" link="/crm/projects?filter=Active" />
              <ProjectPill label="Inactive" count={inactiveProjects} color="#F59E0B" bg="#FFFBEB" link="/crm/projects?filter=Inactive" />
              <ProjectPill label="Completed" count={completedProjects} color="#10B981" bg="#ECFDF5" link="/crm/projects?filter=Completed" />
            </div>

            {/* Active Workload Ratio */}
            <div className="mt-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                <span>Active Workload Capacity</span>
                <span className="text-slate-900 font-bold">{totalProjects > 0 ? Math.round((activeProjects / totalProjects) * 100) : 100}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden flex">
                <div className="h-full bg-blue-500 rounded-l-full" style={{ width: `${totalProjects > 0 ? (activeProjects / totalProjects) * 100 : 100}%` }} />
                <div className="h-full bg-amber-400" style={{ width: `${totalProjects > 0 ? (inactiveProjects / totalProjects) * 100 : 0}%` }} />
                <div className="h-full bg-emerald-500 rounded-r-full" style={{ width: `${totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        )}

      </section>

      {/* ── ROW 3: FINANCIAL HEALTH & MATERIAL DISTRIBUTION (5 Cols / 7 Cols) ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-2.5">

        {/* Financial & Payment Overview (5 Cols) */}
        {hasAccess(user.role, 'financialReports') && (
          <div className="lg:col-span-5 bg-white/90 backdrop-blur-md rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-emerald-50 text-emerald-600">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Financial & Payment Health</h2>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                Solvent
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-100">
                <span className="text-[10px] font-semibold text-purple-700 uppercase tracking-wider block mb-0.5">Total Material Spend</span>
                <span className="text-base font-bold text-slate-900">{formatCurrency(totalMaterialCost)}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Interior materials</span>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider block mb-0.5">Received Payments</span>
                <span className="text-base font-bold text-slate-900">{formatCurrency(totalReceived)}</span>
                <span className="text-[10px] text-emerald-600 block mt-0.5">Due: {formatCurrency(totalOutstanding)}</span>
              </div>
            </div>

            {/* Profit/Loss Badge */}
            <div className="mt-2 p-2 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Net Profit / Loss Margin
              </span>
              <span className={`text-xs font-bold ${totalProfitLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatCurrency(totalProfitLoss)}
              </span>
            </div>
          </div>
        )}

        {/* Material Cost Distribution by Category (7 Cols) */}
        {hasAccess(user.role, 'materials') && (
          <div className="lg:col-span-7 bg-white/90 backdrop-blur-md rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-amber-50 text-amber-600">
                  <BarChart3 className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Material Expenditure by Category</h2>
              </div>
              <span className="text-[11px] font-medium text-slate-500">
                Total Categories: <strong className="text-slate-900">{categoryChartData.length || 1}</strong>
              </span>
            </div>

            {/* Compact Horizontal Bars */}
            <div className="space-y-2">
              {(categoryChartData.length > 0
                ? categoryChartData
                : [
                    { name: 'Wood Materials', value: 20 },
                    { name: 'Steel & Hardware', value: 0 },
                    { name: 'Glass & Mirrors', value: 0 },
                    { name: 'Electrical Fittings', value: 0 },
                  ]
              ).slice(0, 4).map((cat, idx) => {
                const maxVal = Math.max(...categoryChartData.map(c => c.value), 20);
                const percentage = Math.round((cat.value / (totalMaterialCost || 20)) * 100) || (idx === 0 ? 100 : 0);
                const color = CHART_COLORS[idx % CHART_COLORS.length];

                return (
                  <div key={cat.name} className="group flex items-center justify-between gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2 w-1/3">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                      <span className="text-xs font-semibold text-slate-800 line-clamp-1">{cat.name}</span>
                    </div>

                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden relative">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.max((cat.value / maxVal) * 100, cat.value > 0 ? 5 : 3)}%`,
                            background: color,
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-900 w-20 text-right">{formatCurrency(cat.value)}</span>
                      <span className="text-[10px] font-semibold text-slate-500 w-10 text-right">{percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </section>

    </div>
  );
}

// ── KPI Card Component ──
function KpiCard({
  icon: Icon,
  label,
  value,
  trend,
  trendPositive,
  accentColor,
  bgColor,
  sparklinePath,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: string | number;
  trend: string;
  trendPositive: boolean;
  accentColor: string;
  bgColor: string;
  sparklinePath: string;
}) {
  return (
    <div
      className="group relative bg-white/90 backdrop-blur-md rounded-2xl p-3 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-400/50 transition-all duration-300 flex flex-col justify-between overflow-hidden"
    >
      <div className="flex items-start justify-between">
        <div className="p-1.5 rounded-xl transition-transform group-hover:scale-105" style={{ background: bgColor }}>
          <Icon className="w-3.5 h-3.5" style={{ color: accentColor }} />
        </div>

        {/* Mini Sparkline SVG */}
        <div className="w-14 h-6 opacity-70 group-hover:opacity-100 transition-opacity">
          <svg viewBox="0 0 90 25" className="w-full h-full overflow-visible">
            <path
              d={sparklinePath}
              fill="none"
              stroke={accentColor}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      <div className="mt-1.5">
        <div className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-slate-950">
          {value}
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-[10px] font-medium text-slate-500 line-clamp-1">{label}</span>
          <span
            className={`text-[9px] font-semibold px-1 py-0.2 rounded ${
              trendPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {trend}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Lead Status Badge ──
function StatusBadge({ label, count, pct, color }: { label: string; count: number; pct: number; color: string }) {
  return (
    <div className="p-1.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
      <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold mb-0.5">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
          {label}
        </span>
        <span className="text-slate-900 font-bold">{count}</span>
      </div>
      <div className="w-full h-1 bg-slate-200/70 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

// ── Project Pill ──
function ProjectPill({ label, count, color, bg, link }: { label: string; count: number; color: string; bg: string; link: string }) {
  return (
    <Link href={link} className="p-2 rounded-xl border border-slate-200/60 hover:border-amber-400/50 transition-all flex flex-col justify-center" style={{ background: bg }}>
      <span className="text-base font-bold leading-none" style={{ color }}>{count}</span>
      <span className="text-[10px] font-semibold text-slate-600 line-clamp-1 mt-0.5">{label}</span>
    </Link>
  );
}

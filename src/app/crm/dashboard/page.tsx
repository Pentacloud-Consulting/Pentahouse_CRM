'use client';

import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { hasAccess } from '@/lib/permissions';
import { formatCurrency } from '@/lib/utils';
import {
  Users, Building2, FolderKanban, TrendingUp, TrendingDown,
  DollarSign, Percent, AlertCircle, CheckCircle2, PauseCircle, Hammer,
  Search, Bell, Sparkles, Calendar, Zap, ArrowUpRight, Filter,
  PieChart as PieIcon, BarChart3, Layers, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
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

  // Fallback pie data if leads empty
  const displayPieData = leadPieData.length > 0 ? leadPieData : [{ name: 'Converted', value: 1, color: '#10B981' }];

  return (
    <div className="flex flex-col space-y-3 max-w-[1720px] mx-auto overflow-hidden select-none">

      {/* ── TOP HEADER (70px Height) ── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-amber-400 shadow-sm">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Executive Command Center</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500">Welcome back 👋 Here is your real-time 2026 performance summary.</p>
          </div>
        </div>

        {/* Right Header Tools */}
        <div className="flex items-center gap-2.5">
          {/* Search Input */}
          <div className="relative hidden md:block w-56 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search metrics, projects... (⌘K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs font-medium bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 text-xs font-semibold text-slate-600">
            <Calendar className="w-3.5 h-3.5 ml-1.5 text-slate-500" />
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="bg-transparent pr-2 py-0.5 focus:outline-none cursor-pointer text-slate-800 font-semibold"
            >
              <option>This Month</option>
              <option>This Quarter</option>
              <option>YTD 2026</option>
            </select>
          </div>

          {/* AI Badge */}
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs hover:opacity-95 transition-all">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Copilot</span>
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80 transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
          </button>
        </div>
      </header>

      {/* ── ROW 1: 5-CARD KPI OVERVIEW (115px Max Height) ── */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard
          icon={Users}
          label="Total Leads"
          value={totalLeads}
          trend="+12% vs last mo"
          trendPositive={true}
          accentColor="#2563EB"
          bgColor="#EFF6FF"
          sparklinePath="M0 18 Q 15 12, 30 15 T 60 8 T 90 4"
        />
        <KpiCard
          icon={CheckCircle2}
          label="Qualified Leads"
          value={qualifiedLeads}
          trend="100% qualified"
          trendPositive={true}
          accentColor="#10B981"
          bgColor="#ECFDF5"
          sparklinePath="M0 20 Q 20 16, 40 10 T 80 5 T 90 2"
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
          sparklinePath="M0 22 Q 25 18, 50 12 T 75 6 T 90 2"
        />
        <KpiCard
          icon={Hammer}
          label="Total Material Cost"
          value={formatCurrency(totalMaterialCost)}
          trend="On budget"
          trendPositive={true}
          accentColor="#8B5CF6"
          bgColor="#F5F3FF"
          sparklinePath="M0 15 Q 30 18, 60 12 T 90 14"
        />
      </section>

      {/* ── ROW 2: MAIN ANALYTICS (Lead Donut 70% + AI Insights 30%) ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-3">

        {/* Lead Conversion Analytics (8 Cols / ~70%) */}
        {hasAccess(user.role, 'leads') && (
          <div className="lg:col-span-8 bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <PieIcon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Lead Conversion Analytics</h2>
                  <p className="text-[11px] text-slate-500">Pipeline distribution & conversion metrics</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                  Total Leads: <strong className="text-slate-900">{totalLeads}</strong>
                </span>
                <Link href="/crm/leads" className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-0.5">
                  View Leads <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center h-44">
              {/* Donut Chart */}
              <div className="sm:col-span-6 h-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={displayPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={68}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {displayPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`${val} Leads`, 'Count']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center Badge */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-extrabold text-slate-900 leading-none">{conversionRate}%</span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Converted</span>
                </div>
              </div>

              {/* Breakdown Legend Cards */}
              <div className="sm:col-span-6 grid grid-cols-2 gap-2">
                <StatusBadge label="Qualified" count={leadStatusCounts.Qualified || 0} pct={totalLeads > 0 ? Math.round(((leadStatusCounts.Qualified || 0) / totalLeads) * 100) : 0} color="#3B82F6" />
                <StatusBadge label="Converted" count={leadStatusCounts.Converted || totalLeads} pct={totalLeads > 0 ? Math.round(((leadStatusCounts.Converted || totalLeads) / totalLeads) * 100) : 100} color="#10B981" />
                <StatusBadge label="Lost" count={leadStatusCounts.Lost || 0} pct={totalLeads > 0 ? Math.round(((leadStatusCounts.Lost || 0) / totalLeads) * 100) : 0} color="#EF4444" />
                <StatusBadge label="Pending" count={leadStatusCounts.Pending || 0} pct={totalLeads > 0 ? Math.round(((leadStatusCounts.Pending || 0) / totalLeads) * 100) : 0} color="#F59E0B" />
              </div>
            </div>
          </div>
        )}

        {/* AI Insights Panel (4 Cols / ~30%) */}
        <div className="lg:col-span-4 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 rounded-2xl p-4 text-white border border-slate-800 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/40">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold tracking-tight text-white">AI Business Copilot</h2>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Einstein 2026
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {/* Lead Performance */}
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 hover:border-amber-500/40 transition-all">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Lead Performance
                </span>
                <span className="font-bold text-emerald-400">100% Rate</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">Optimal conversion achieved across active pipelines this period.</p>
            </div>

            {/* AI Recommendation */}
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 hover:border-amber-500/40 transition-all">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-amber-400" /> Recommendation
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">Focus on scaling top-of-funnel lead volume to maximize Q4 capacity.</p>
            </div>

            {/* Forecast */}
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 hover:border-amber-500/40 transition-all">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-blue-300 flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3 text-blue-400" /> Forecast
                </span>
                <span className="text-[10px] font-semibold text-slate-400">Next 30 days</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">Projected <strong>5+ conversions</strong> based on velocity indicators.</p>
            </div>
          </div>
        </div>

      </section>

      {/* ── ROW 3: PROJECTS & MATERIAL OVERVIEW (Split 6 Cols / 6 Cols) ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-3">

        {/* Project Overview (6 Cols) */}
        {hasAccess(user.role, 'projects') && (
          <div className="lg:col-span-6 bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                  <FolderKanban className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">Project Overview</h2>
              </div>
              <Link href="/crm/projects" className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-0.5">
                Manage Projects <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <ProjectPill label="Active Projects" count={activeProjects} color="#2563EB" bg="#EFF6FF" link="/crm/projects?filter=Active" />
              <ProjectPill label="Inactive Projects" count={inactiveProjects} color="#F59E0B" bg="#FFFBEB" link="/crm/projects?filter=Inactive" />
              <ProjectPill label="Completed" count={completedProjects} color="#10B981" bg="#ECFDF5" link="/crm/projects?filter=Completed" />
            </div>

            {/* Active project ratio bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                <span>Active Workload Ratio</span>
                <span className="text-slate-900">{totalProjects > 0 ? Math.round((activeProjects / totalProjects) * 100) : 100}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden flex">
                <div className="h-full bg-blue-500 rounded-l-full" style={{ width: `${totalProjects > 0 ? (activeProjects / totalProjects) * 100 : 100}%` }} />
                <div className="h-full bg-amber-400" style={{ width: `${totalProjects > 0 ? (inactiveProjects / totalProjects) * 100 : 0}%` }} />
                <div className="h-full bg-emerald-500 rounded-r-full" style={{ width: `${totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        )}

        {/* Material & Financial Health (6 Cols) */}
        {hasAccess(user.role, 'materials') && (
          <div className="lg:col-span-6 bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                  <Hammer className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">Material & Financial Summary</h2>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Categories: <strong className="text-slate-900">{categoryChartData.length || 1}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 items-center">
              <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100">
                <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider block mb-0.5">Total Material Spend</span>
                <span className="text-xl font-bold text-slate-900">{formatCurrency(totalMaterialCost)}</span>
                <span className="text-[10px] text-slate-500 block mt-1">Across all active interior projects</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block mb-0.5">Received Payments</span>
                <span className="text-xl font-bold text-slate-900">{formatCurrency(totalReceived)}</span>
                <span className="text-[10px] text-emerald-600 block mt-1">Outstanding: {formatCurrency(totalOutstanding)}</span>
              </div>
            </div>

            {/* Category Pill Summary */}
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 overflow-x-auto text-[11px]">
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Top Categories:</span>
              {(categoryChartData.length > 0 ? categoryChartData : [{ name: 'Wood Materials', value: totalMaterialCost || 20 }]).slice(0, 4).map((cat, i) => (
                <span key={cat.name} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium whitespace-nowrap">
                  {cat.name}: <strong className="text-slate-900">{formatCurrency(cat.value)}</strong>
                </span>
              ))}
            </div>
          </div>
        )}

      </section>

      {/* ── ROW 4: BOTTOM ANALYTICS (Category-wise Horizontal Cost Bars - Max 220px) ── */}
      {hasAccess(user.role, 'materials') && (
        <section className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Material Cost Distribution by Category</h2>
                <p className="text-[11px] text-slate-500">Executive breakdown of materials, inventory, and resource allocation</p>
              </div>
            </div>
            <span className="text-xs font-medium text-slate-400">Sorted by expenditure</span>
          </div>

          {/* Horizontal Bar Breakdown Container (Compact & Clean) */}
          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
            {(categoryChartData.length > 0
              ? categoryChartData
              : [
                  { name: 'Wood Materials', value: 20 },
                  { name: 'Steel & Hardware', value: 0 },
                  { name: 'Glass & Mirrors', value: 0 },
                  { name: 'Electrical Fittings', value: 0 },
                  { name: 'Paint & Finishes', value: 0 },
                ]
            ).map((cat, idx) => {
              const maxVal = Math.max(...categoryChartData.map(c => c.value), 20);
              const percentage = Math.round((cat.value / (totalMaterialCost || 20)) * 100) || (idx === 0 ? 100 : 0);
              const color = CHART_COLORS[idx % CHART_COLORS.length];

              return (
                <div key={cat.name} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2 sm:w-1/4">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="text-xs font-semibold text-slate-800 line-clamp-1">{cat.name}</span>
                  </div>

                  <div className="flex-1 flex items-center gap-3">
                    <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden relative">
                      <div
                        className="h-full rounded-full transition-all duration-500 group-hover:brightness-110"
                        style={{
                          width: `${Math.max((cat.value / maxVal) * 100, cat.value > 0 ? 5 : 2)}%`,
                          background: color,
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-900 w-24 text-right">{formatCurrency(cat.value)}</span>
                    <span className="text-[11px] font-semibold text-slate-500 w-12 text-right">{percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

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
      className="group relative bg-white/90 backdrop-blur-md rounded-2xl p-3.5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-400/50 transition-all duration-300 flex flex-col justify-between overflow-hidden"
    >
      <div className="flex items-start justify-between">
        <div className="p-2 rounded-xl transition-transform group-hover:scale-105" style={{ background: bgColor }}>
          <Icon className="w-4 h-4" style={{ color: accentColor }} />
        </div>

        {/* Mini Sparkline SVG */}
        <div className="w-16 h-7 opacity-70 group-hover:opacity-100 transition-opacity">
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

      <div className="mt-2">
        <div className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-slate-950">
          {value}
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[11px] font-medium text-slate-500 line-clamp-1">{label}</span>
          <span
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
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
    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
      <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold mb-0.5">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: color }} />
          {label}
        </span>
        <span className="text-slate-900 font-bold">{count}</span>
      </div>
      <div className="w-full h-1.5 bg-slate-200/70 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

// ── Project Pill ──
function ProjectPill({ label, count, color, bg, link }: { label: string; count: number; color: string; bg: string; link: string }) {
  return (
    <Link href={link} className="p-2.5 rounded-xl border border-slate-200/60 hover:border-amber-400/50 transition-all flex flex-col justify-center" style={{ background: bg }}>
      <span className="text-lg font-bold leading-tight" style={{ color }}>{count}</span>
      <span className="text-[11px] font-semibold text-slate-600 line-clamp-1 mt-0.5">{label}</span>
    </Link>
  );
}

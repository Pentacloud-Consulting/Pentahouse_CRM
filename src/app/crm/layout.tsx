'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { hasAccess, roleLabels } from '@/lib/permissions';
import { UserRole } from '@/lib/types';
import {
  LayoutDashboard, Users, Building2, Contact2, FolderKanban,
  LogOut, ChevronLeft, ChevronRight, Shield, Menu, X
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/crm/dashboard', icon: LayoutDashboard, module: 'dashboard' as const },
  { label: 'Leads', href: '/crm/leads', icon: Users, module: 'leads' as const },
  { label: 'Accounts', href: '/crm/accounts', icon: Building2, module: 'accounts' as const },
  { label: 'Contacts', href: '/crm/contacts', icon: Contact2, module: 'contacts' as const },
  { label: 'Projects', href: '/crm/projects', icon: FolderKanban, module: 'projects' as const },
];

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated, switchRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (!isAuthenticated || !user) return null;

  const filteredNav = navItems.filter(item => hasAccess(user.role, item.module));

  return (
    <div className="min-h-[100dvh] flex antialiased" style={{ background: '#F8FAFC', fontFamily: "'Outfit', sans-serif" }}>
      {/* ── Mobile Overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 flex flex-col transition-all duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
        style={{
          width: collapsed ? '72px' : '260px',
          background: 'linear-gradient(180deg, #0F1C2E 0%, #1A2332 100%)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b" style={{ borderColor: 'rgba(201,168,76,0.15)' }}>
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 flex-shrink-0" style={{ color: '#C9A84C' }} />
            {!collapsed && (
              <span className="text-lg font-bold text-white tracking-widest uppercase">PENTAHOUSE</span>
            )}
          </div>
          {/* Close button for mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {filteredNav.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${active ? 'active' : ''}`}
                title={item.label}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle — desktop only */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center py-3 border-t transition-colors hover:bg-white/5"
          style={{ borderColor: 'rgba(201,168,76,0.15)', color: '#94a3b8' }}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </aside>

      {/* ── Main content area ── */}
      <div
        className="flex-1 flex flex-col transition-all duration-300 w-full"
        style={{ marginLeft: 0 }}
      >
        {/* Spacer for desktop sidebar */}
        <style>{`
          @media (min-width: 1024px) {
            .main-content-wrapper {
              margin-left: ${collapsed ? '72px' : '260px'} !important;
            }
          }
        `}</style>
        <div className="main-content-wrapper flex-1 flex flex-col transition-all duration-300">
          {/* Top bar */}
          <header
            className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 lg:px-8 h-14 sm:h-16 border-b shadow-sm transition-all"
            style={{
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(12px)',
              borderColor: 'rgba(0,0,0,0.05)',
            }}
          >
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 -ml-1"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-base sm:text-lg font-semibold" style={{ color: '#0F1C2E' }}>
                {navItems.find(n => pathname === n.href || pathname.startsWith(n.href + '/'))?.label || 'CRM'}
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Role switcher */}
              <div className="relative">
                <button
                  onClick={() => setShowRoleMenu(!showRoleMenu)}
                  className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100"
                  style={{ color: '#0F1C2E' }}
                >
                  <Shield className="w-4 h-4" style={{ color: '#C9A84C' }} />
                  <span className="hidden sm:inline">{roleLabels[user.role]}</span>
                </button>
                {showRoleMenu && (
                  <div
                    className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border py-2 z-50"
                    style={{ borderColor: '#E2E8F0' }}
                  >
                    <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Switch Role
                    </div>
                    {(['admin', 'sales', 'project_manager', 'accountant'] as UserRole[]).map(role => (
                      <button
                        key={role}
                        onClick={() => { switchRole(role); setShowRoleMenu(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 ${user.role === role ? 'font-semibold' : ''}`}
                        style={{ color: user.role === role ? '#C9A84C' : '#374151' }}
                      >
                        {roleLabels[role]}
                        {user.role === role && ' ✓'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Logout */}
              <button
                onClick={() => { logout(); router.push('/'); }}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Click-away for role menu */}
      {showRoleMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setShowRoleMenu(false)} />
      )}
    </div>
  );
}

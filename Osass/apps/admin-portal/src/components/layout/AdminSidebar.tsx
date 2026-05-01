import { useState } from 'react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Layers,
  Users,
  TrendingUp,
  Briefcase,
  FileText,
  UserCheck,
  Megaphone,
  ClipboardList,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  LogOut,
  GraduationCap,
  BookOpen,
  Settings,
  Network,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  title: string;
  icon: React.ElementType;
  items: NavItem[];
}

const navigationItems: (NavItem | NavGroup)[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Organization',
    icon: Building2,
    items: [
      { title: 'Schools', href: '/schools', icon: Building2 },
      { title: 'Faculties', href: '/faculties', icon: Layers },
      { title: 'Academic Departments', href: '/departments', icon: Layers },
      { title: 'Units & Sections', href: '/units-sections', icon: Network },
    ],
  },
  {
    title: 'Academic',
    icon: GraduationCap,
    items: [
      { title: 'Academic Staff', href: '/academic-staff', icon: Users },
      { title: 'Academic Positions', href: '/academic-positions', icon: TrendingUp },
      { title: 'Service Positions', href: '/service-positions', icon: Briefcase },
      { title: 'Publication Indicators', href: '/publication-types', icon: BookOpen },
      { title: 'Committees', href: '/committees', icon: UserCheck },
    ],
  },
  {
    title: 'Non-Academic',
    icon: Briefcase,
    items: [
      { title: 'Non-Academic Staff', href: '/non-academic-staff', icon: Users },
      { title: 'Non-Academic Positions', href: '/non-academic-positions', icon: TrendingUp },
      { title: 'Knowledge Material Types', href: '/knowledge-material-types', icon: BookOpen },
      { title: 'Committees', href: '/non-academic-committees', icon: UserCheck },
    ],
  },
  {
    title: 'Administration',
    icon: Settings,
    items: [
      { title: 'Staff Updates', href: '/staff-updates', icon: Megaphone },
      { title: 'Audit Logs', href: '/audit-logs', icon: ClipboardList },
    ],
  },
];

function isNavGroup(item: NavItem | NavGroup): item is NavGroup {
  return 'items' in item;
}

export function AdminSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Organization', 'Academic', 'Non-Academic', 'Administration']);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev =>
      prev.includes(title) ? prev.filter(g => g !== title) : [...prev, title]
    );
  };

  const isActiveRoute = (href: string) => location.pathname === href;
  const isGroupActive = (items: NavItem[]) => items.some(item => isActiveRoute(item.href));

  const renderNavItem = (item: NavItem, isNested = false) => (
    <NavLink
      key={item.href}
      to={item.href}
      onClick={() => setIsMobileOpen(false)}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
        isNested ? 'ml-6' : '',
        'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
      )}
      activeClassName="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
    >
      <item.icon className="h-4 w-4 shrink-0" />
      <span>{item.title}</span>
    </NavLink>
  );

  const renderNavGroup = (group: NavGroup) => {
    const isExpanded = expandedGroups.includes(group.title);
    const isActive = isGroupActive(group.items);

    return (
      <div key={group.title} className="space-y-1">
        <button
          onClick={() => toggleGroup(group.title)}
          className={cn(
            'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
            'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground',
            isActive && 'text-sidebar-foreground'
          )}
        >
          <div className="flex items-center gap-3">
            <group.icon className="h-4 w-4 shrink-0" />
            <span>{group.title}</span>
          </div>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        {isExpanded && (
          <div className="space-y-1">
            {group.items.map(item => renderNavItem(item, true))}
          </div>
        )}
      </div>
    );
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-sidebar">
      {/* Logo/Header - UMaT Branding */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-4">
        <div className="flex items-center gap-2">
          {/* UMaT Logo Mark */}
          <div className="flex h-10 w-10 items-center justify-center rounded bg-sidebar-primary text-sidebar-primary-foreground font-bold text-lg">
            U
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-sidebar-foreground tracking-tight">UMaT</span>
            <span className="text-xs text-sidebar-muted font-medium">Administration</span>
          </div>
        </div>
        {/* Mobile close button */}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto text-sidebar-foreground lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navigationItems.map(item =>
          isNavGroup(item) ? renderNavGroup(item) : renderNavItem(item)
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent">
            <Users className="h-4 w-4 text-sidebar-foreground" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium text-sidebar-foreground">
              {user ? `${user.firstName} ${user.lastName}` : 'Admin User'}
            </span>
            <span className="truncate text-xs text-sidebar-muted">
              {user?.email || 'admin@university.edu'}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-sidebar-foreground/70 hover:text-sidebar-foreground"
            onClick={logout}
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 lg:hidden"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:relative lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

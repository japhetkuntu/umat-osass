import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  UserCircle,
  GraduationCap,
  BookOpen,
  Users,
  History,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  FileText,
  TrendingUp,
  HelpCircle,
  KeyRound
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  userName: string;
  userRank: string;
  onLogout: () => void;
}

export const Sidebar = ({ userName, userRank, onLogout }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: UserCircle, label: "Eligibility", path: "/eligibility" },
    { icon: TrendingUp, label: "Promotion Forecast", path: "/forecast" },
    {
      icon: GraduationCap,
      label: "Promotion App",
      path: "/application",
      subItems: [
        { label: "Teaching", path: "/application/teaching" },
        { label: "Publications", path: "/application/publications" },
        { label: "Service", path: "/application/service" },
      ]
    },
    { icon: History, label: "History", path: "/promotion-history" },
    { icon: FileText, label: "Promotion Letter", path: "/promotion-letter" },
    { icon: HelpCircle, label: "User Guide", path: "/guide" },
  ];

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 z-50 border-r border-sidebar-border shadow-xl flex flex-col overflow-hidden",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Sidebar Header */}
      <div className="p-6 flex items-center justify-between border-b border-sidebar-border/50">
        {!isCollapsed && (
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded bg-sidebar-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight">OSASS</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {isCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 min-h-0 px-3 py-6 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <div key={item.path} className="space-y-1">
            <button
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                isActive(item.path)
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/20"
                  : "hover:bg-sidebar-accent text-sidebar-foreground/90 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive(item.path) ? "" : "text-sidebar-foreground/80 group-hover:text-sidebar-foreground")} />
              {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}

              {isCollapsed && isActive(item.path) && (
                <div className="absolute left-0 w-1 h-6 bg-sidebar-primary rounded-r-full" />
              )}
            </button>

            {!isCollapsed && item.subItems && isActive(item.path) && (
              <div className="ml-9 space-y-1 mt-1 border-l border-sidebar-border/50 pl-4 animate-slide-up">
                {item.subItems.map((sub) => (
                  <button
                    key={sub.path}
                    onClick={() => navigate(sub.path)}
                    className={cn(
                      "w-full text-left py-1.5 text-xs transition-colors",
                      location.pathname === sub.path
                        ? "text-sidebar-primary font-bold"
                        : "text-sidebar-foreground/80 hover:text-sidebar-foreground"
                    )}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="mt-auto p-4 border-t border-sidebar-border/50 bg-sidebar/50 backdrop-blur-sm space-y-3">
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-sidebar-primary/20 border border-sidebar-primary/30 flex items-center justify-center shrink-0">
                <span className="text-sidebar-primary font-bold text-sm">
                  {userName ? userName.split(' ').map(n => n[0]).filter(Boolean).join('') : '??'}
                </span>
              </div>
              <div className="truncate min-w-0">
                <p className="text-sm font-semibold truncate text-sidebar-foreground">{userName}</p>
                <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50 font-bold">{userRank}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/settings")}
              className="w-full text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent text-xs justify-start px-3"
            >
              <Settings className="w-3.5 h-3.5 mr-2 shrink-0" />
              <span>Settings</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/change-password")}
              className="w-full text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent text-xs justify-start px-3"
            >
              <KeyRound className="w-3.5 h-3.5 mr-2 shrink-0" />
              <span>Change Password</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="w-full text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent text-xs justify-start px-3"
            >
              <LogOut className="w-3.5 h-3.5 mr-2 shrink-0" />
              <span>Logout</span>
            </Button>
          </>
        ) : (
          <>
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 border border-sidebar-primary/30 flex items-center justify-center">
                <span className="text-sidebar-primary font-bold text-xs">{userName ? userName[0] : '?'}</span>
              </div>
            </div>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => navigate("/change-password")}
              className="w-full text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              title="Change Password"
            >
              <KeyRound className="w-4 h-4" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={onLogout} 
              className="w-full text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </aside>
  );
};

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { LayoutDashboard, FolderKanban, CheckSquare, Settings, UserCircle, Users as UsersIcon, Flower2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type NavItem = {
  href: string;
  label: string;
  icon: any;
  adminOnly?: boolean;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    title: "MENU",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/projects", label: "Projects", icon: FolderKanban },
      { href: "/tasks", label: "My Tasks", icon: CheckSquare },
      { href: "/kanban", label: "Kanban", icon: LayoutDashboard },
    ]
  },
  {
    title: "MANAGEMENT",
    items: [
      { href: "/users", label: "Users", icon: UsersIcon, adminOnly: true },
    ]
  },
  {
    title: "ACCOUNT",
    items: [
      { href: "/profile", label: "My Profile", icon: UserCircle },
    ]
  }
];

interface SidebarProps {
  collapsed?: boolean;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ collapsed, mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  // Close mobile sidebar on route change
  useEffect(() => {
    if (mobileOpen && onCloseMobile) {
      onCloseMobile();
    }
  }, [pathname]);

  return (
    <>
      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-[#1a3353]/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen flex-col bg-[#1a3353] text-white shadow-2xl transition-all duration-300 lg:sticky lg:top-0 lg:z-30 ${
          collapsed ? "w-20" : "w-64"
        } ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-20 items-center border-b border-white/5 px-6">
          {(!collapsed || mobileOpen) && (
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-black/20">
                <Flower2 size={20} className="text-[#1a3353]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 leading-tight">
                  Ethara AI
                </span>
                <span className="text-sm font-extrabold text-white tracking-tight">
                  MANAGER
                </span>
              </div>
            </div>
          )}
          {collapsed && !mobileOpen && (
            <div className="mx-auto h-9 w-9 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-black/20">
               <Flower2 size={20} className="text-[#1a3353]" />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-6">
          {NAV_GROUPS.map((group, groupIdx) => {
            const visibleItems = group.items.filter(item => !item.adminOnly || isAdmin);
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.title} className={groupIdx > 0 ? "mt-6" : ""}>
                {(!collapsed || mobileOpen) && (
                  <p className="mb-2 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-white/30">
                    {group.title}
                  </p>
                )}
                <nav className="space-y-1 px-3">
                  {visibleItems.map((item) => {
                    const active =
                      item.href === "/dashboard"
                        ? pathname === "/dashboard"
                        : pathname.startsWith(item.href);

                    const Icon = item.icon;

                    return (
                      <div key={item.href} className="relative group">
                        <Link
                          title={item.label}
                          href={item.href}
                          className={`flex cursor-pointer items-center rounded-lg transition-all duration-200 ${
                            collapsed && !mobileOpen ? "justify-center px-2 py-2.5" : "gap-3 px-4 py-2.5"
                          } ${
                            active
                              ? "bg-white/10 text-white shadow-sm"
                              : "text-white/50 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <Icon className={`flex-shrink-0 transition-all duration-300 h-5 w-5 ${active ? "text-primary scale-110" : "group-hover:scale-110"}`} />
                          
                          {(!collapsed || mobileOpen) && (
                            <>
                              <span className="text-[13px] font-bold truncate">{item.label}</span>
                              {active && (
                                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.8)]" />
                              )}
                            </>
                          )}
                        </Link>
                        
                        {/* Glassmorphism Tooltip for collapsed state */}
                        {collapsed && !mobileOpen && (
                          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 pointer-events-none z-50 px-3 py-2 bg-[#1a3353]/90 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 translate-x-2 group-hover:translate-x-0 whitespace-nowrap">
                             <span className="relative z-10">{item.label}</span>
                             <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 border-[6px] border-transparent border-r-[#1a3353]/90" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </nav>
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
}

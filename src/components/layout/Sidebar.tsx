
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  Home, Users, Monitor, Calendar, Settings, 
  ChevronLeft, ChevronRight, BarChart4, Layers, Database
} from "lucide-react";
import { cn, safeUpperCase } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const companyName = useTheme().theme.companyName;
  const logoUrl = useTheme().theme.logoUrl;
  const { t } = useTranslation();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Determine role
  const role = user?.role || "public";

  // Navigation items with role protection and new labels in Spanish
  const navigationItems = [
    { name: t("navigation.home"), icon: Home, path: "/", roles: ["admin", "advisor", "user"] },
    { name: t("navigation.queue"), icon: Layers, path: "/queue", roles: ["admin"] },
    { name: t("navigation.turnero"), icon: Monitor, path: "/turnero", roles: ["public", "admin", "advisor", "user"] },
    { name: t("navigation.device"), icon: Monitor, path: "/device", roles: ["public", "admin", "advisor", "user"] },
    { name: t("navigation.advisor"), icon: Users, path: "/advisor", roles: ["advisor"] },
    { name: t("navigation.appointments"), icon: Calendar, path: "/appointments", roles: ["public", "admin", "advisor", "user"] },
    { name: t("navigation.masters"), icon: Database, path: "/masters", roles: ["admin"] },
    { name: t("navigation.reports"), icon: BarChart4, path: "/reports", roles: ["admin"] },
    { name: t("navigation.settings"), icon: Settings, path: "/settings", roles: ["admin"] },
  
  ];


  

  // Helper to determine if item should be shown
  const isItemVisible = (item) => {
    if (item.roles.includes("public")) return true;
    if (!isAuthenticated) return false;
    if (role && (item.roles.includes(role) || (role === "user" && item.roles.includes("user")))) return true;
    return false;
  };

  return (
    <aside
      className={cn(
        "bg-card border-border border rounded-[12px] px-6 py-[24px] shadow-box transition-all duration-300 ease-in-out z-30 flex flex-col min-h-[90vh]",
        collapsed ? "w-[110px]" : "w-[282px]"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center mb-6 gap-5", collapsed ? "flex-col" : "")} >
        <img
          src={logoUrl}
          className="w-[56px]"
          alt="Logo"
        />
        {!collapsed && (
          <h1 className="font-roboto-condensed font-bold text-[24px] tracking-tight overflow-hidden whitespace-nowrap transition-all duration-300">
            {safeUpperCase(role)}
          </h1>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        <ul className="space-y-1">
          {navigationItems.filter(isItemVisible).map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center px-[18px] py-[12px] rounded-[12px] transition-all duration-100 font-bold relative before:h-0 before:transition-all before:duration-300",
                    isActive
                      ? "bg-success/50 text-primary before:absolute before:w-[3px] before:left-[-24px] before:bg-primary before:h-full"
                      : "text-foreground hover:bg-success/50 hover:text-primary"
                  )
                }
              >
                <item.icon size={24} className="flex-shrink-0" />
                {!collapsed && (
                  <span className="ml-3 overflow-hidden whitespace-nowrap transition-all duration-300">
                    {item.name}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Section */} 
      <div className={cn("border-t border-border flex items-center pt-5", collapsed ? "justify-center" : "")}>
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
          {user?.name?.charAt(0)?.toUpperCase() || "A"}
        </div>
        {!collapsed && (
          <div className="ml-3 overflow-hidden whitespace-nowrap transition-all duration-300">
            <p className="text-sm font-medium">{user?.name || "Invitado"}</p>
            <p className="text-xs text-muted-foreground">{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Invitado"}</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;


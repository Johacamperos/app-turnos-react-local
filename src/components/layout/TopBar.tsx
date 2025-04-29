
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Moon, Sun, Menu, LogOut, User } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "@/store/store";
import { logout } from "@/contexts/AuthContext";
import LanguageSelector from "@/components/ui/language-selector";

const TopBar = () => {
  const { theme, updateTheme } = useTheme();
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated, user, token } = useSelector((state: RootState) => state.auth);

  const toggleTheme = () => {
    updateTheme({ isDarkMode: !theme.isDarkMode });
  };

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/login");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  // Force logout on token/user missing (security)
  useEffect(() => {
    if (isAuthenticated && (!token || !user)) {
      dispatch(logout());
      navigate("/login");
    }
  }, [isAuthenticated, token, user, dispatch, navigate]);

  return (
    <header className="sticky top-0 z-10 h-16 border-b bg-background/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Mobile Menu Button - Only visible on small screens */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        
        {/* Left side - used for search, breadcrumbs, etc. */}
        <div className="flex-1" />
        
        {/* Right side - actions */}
        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <LanguageSelector />
          
          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme.isDarkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          
          {/* Notifications */}
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          
          {/* Authentication */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-sm hidden md:inline-block">
                {user?.name || t("common.welcome")}
              </span>
              <Button variant="ghost" size="icon" onClick={handleLogout} title={t("auth.logout")}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={handleLogin} title={t("auth.login")}>
              <User className="h-5 w-5" />
            </Button>
          )}
          
          {/* Avatar (optional) */}
          {isAuthenticated && (
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-medium">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;

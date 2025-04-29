
import React, { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import Footer from "./Footer";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  
  // Check if we're on the Turnero page (public display)
  const isTurneroPage = location.pathname === "/turnero";
  
  if (isTurneroPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen overflow-hidden bg-background-primary animate-fade-in gap-5">
      <div className="flex lg:max-w-[1200px] mx-auto pt-[39px] pb-[30px] items-start gap-6"> 
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex flex-col flex-1 overflow-hidden shadow-box bg-white border rounded-[12px]">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-7xl animate-slide-up">
              {children}
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout;

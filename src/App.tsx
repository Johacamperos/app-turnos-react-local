
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Index from "./pages/Index";
import QueueManagement from "./pages/QueueManagement";
import Turnero from "./pages/Turnero";
import AdvisorConsole from "./pages/AdvisorConsole";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import Appointments from "./pages/Appointments";
import AppointmentConfirm from "./pages/AppointmentConfirm";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import "./i18n";
import { Provider } from "react-redux";
import store from "./store/store";
import { SystemProvider } from "./contexts/SystemContext";


// Import Masters routes
import Masters from "./pages/masters/Masters";
import CustomerManagement from "./pages/masters/CustomerManagement";
import OfficeManagement from "./pages/masters/OfficeManagement";
import ZoneManagement from "./pages/masters/ZoneManagement";
import PriorityManagement from "./pages/masters/PriorityManagement";
import Device from "./pages/Device";
import Reports from "./pages/Reports";

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <ThemeProvider>
          <LanguageProvider>
          <SystemProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/turnero" element={<Turnero />} />
                  <Route path="/device" element={<Device />} />
     
                  {/* Protected routes */}
                  <Route path="/" element={
                    <ProtectedRoute>
                      <MainLayout><Index /></MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/queue" element={
                    <ProtectedRoute>
                      <MainLayout><QueueManagement /></MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/advisor" element={
                    <ProtectedRoute>
                      <MainLayout><AdvisorConsole /></MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <MainLayout><Settings /></MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/appointments-private" element={
                    <ProtectedRoute>
                      <Appointments />
                    </ProtectedRoute>
                  } />

                  <Route path="/appointments" element={
                    <Appointments />
                  } />  
                  <Route path="/appointment-confirm" element={
                      <AppointmentConfirm />
                  }> 
                  </Route>
                  
                  {/* Masters routes */}
                  <Route path="/masters" element={
                    <ProtectedRoute>
                      <MainLayout><Masters /></MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/masters/customers" element={
                    <ProtectedRoute>
                      <MainLayout><CustomerManagement /></MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/masters/offices" element={
                    <ProtectedRoute>
                      <MainLayout><OfficeManagement /></MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/masters/zones" element={
                    <ProtectedRoute>
                      <MainLayout><ZoneManagement /></MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/masters/priorities" element={
                    <ProtectedRoute>
                      <MainLayout><PriorityManagement /></MainLayout>
                    </ProtectedRoute>
                  } />
                  
                  {/* Protected routes */}
                  <Route path="/" element={<ProtectedRoute><MainLayout><Index /></MainLayout></ProtectedRoute>} />
                    <Route path="/reports" element={<ProtectedRoute><MainLayout><Reports /></MainLayout></ProtectedRoute>} />
                    {/* ...other routes... */}

                </Routes>
              </BrowserRouter>
            </TooltipProvider>
            </SystemProvider>
          </LanguageProvider>
        </ThemeProvider>
      </SettingsProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;

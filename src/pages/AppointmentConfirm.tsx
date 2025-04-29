import React, { useState } from "react";
import AppointmentConfirmStart from "@/components/appointments/AppointmentConfirmStart";
import AppointmentConfirmEnd from "@/components/appointments/AppointmentConfirmEnd";
import WalkIn from "@/components/appointments/WalkIn";
import { useTheme } from "@/contexts/ThemeContext";
import { NavLink } from "react-router-dom";
import { X } from "lucide-react";
import { QueueItem } from "@/api/ApiService"; // Import QueueItem type

// Export the form data interface to be used by other components
export interface AppointmentConfirmFormData {
  firstName: string; // Keep potentially needed fields, though only document details are used now
  lastName: string;
  documentType: string;
  documentNumber: string;
  email: string;
  phone: string;
  location: string;
  department: string;
  date: Date | null;
  time: string;
}

const AppointmentConfirm = () => {
  const { theme } = useTheme();
  const companyName = theme.companyName;
  const logoUrl = useTheme().theme.logoUrl;
  const year = new Date().getFullYear();

  const [currentStep, setCurrentStep] = useState(0);
  const [showWalkIn, setShowWalkIn] = useState(false);
  const [formData, setFormData] = useState<AppointmentConfirmFormData>({
    firstName: "", // Keep initial structure, can be cleaned up if not needed
    lastName: "",
    documentType: "",
    documentNumber: "",
    email: "",
    phone: "",
    location: "",
    department: "",
    date: null,
    time: "",
  });
  const [queueData, setQueueData] = useState<QueueItem | null>(null); // State to hold queue data

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handleFormData = (data: Partial<AppointmentConfirmFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleCloseWalkIn = () => {
    setShowWalkIn(false);
  };

  // Map steps to components
  const steps = [
    {
      component: (
        <AppointmentConfirmStart
          onNext={handleNext}
          formData={formData}
          onChange={handleFormData}
          setQueueData={setQueueData} // Pass the setter function
        />
      ),
      label: "Confirmación de Cita",
    },
    {
      component: (
        <AppointmentConfirmEnd
          formData={queueData} // Pass the fetched queue data
        />
      ),
      label: "Resúmen de Cita",
    }
  ];

  if (showWalkIn) {
    return <WalkIn onBack={handleCloseWalkIn} />;
  }

  return (
    <main className="min-h-screen px-[20px] py-[80px] md:py-[90px] lg:py-[100px] bg-[#EFECEC] flex flex-col relative">
      <div className="relative h-full w-full max-w-[1200px] mx-auto">
        <NavLink to={"/"} className="flex items-center absolute right-0 -top-[40px] md:right-[104px] font-medium text-sm text-muted-foreground gap-[6px] hover:underline">
          Salir del formulario
          <X size={18}/>
        </NavLink>
        <img
          src={logoUrl}
          className="absolute -top-[70px] left-[20px] lg:left-[102px] w-[80px]"
          alt="Logo"
        />
        <div className="rounded-[12px] bg-white shadow-box-shadow overflow-hidden">
          {steps[currentStep].component}
        </div>
      </div>
      <div className="absolute bottom-0 text-[12px] mb-[30px] lg:mb-[40px] text-[#333E33] left-0 mx-auto w-full text-center">
        &copy; {year} {companyName}. Todos los derechos reservados
      </div>
    </main>
  );
};

export default AppointmentConfirm;

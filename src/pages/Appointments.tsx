import React, { useState } from "react";
import AppointmentStepper from "@/components/appointments/AppointmentStepper";
import AppointmentStart from "@/components/appointments/AppointmentStart";
import PersonalDataForm from "@/components/appointments/PersonalDataForm";
import ContactDataForm from "@/components/appointments/ContactDataForm";
import LocationSelection from "@/components/appointments/LocationSelection";
import DepartmentSelection from "@/components/appointments/DepartmentSelection";
import DateSelection from "@/components/appointments/DateSelection";
import TimeSelection from "@/components/appointments/TimeSelection";
import AppointmentConfirmation from "@/components/appointments/AppointmentConfirmation";
import WalkIn from "@/components/appointments/WalkIn";
import { useTheme } from "@/contexts/ThemeContext";
import { NavLink } from "react-router-dom";
import { X } from "lucide-react";

import ApiService, { QueueItem, Zone, ZoneOfficeInfo } from "@/api/ApiService";
import AppointmentConfirmEnd from "@/components/appointments/AppointmentConfirmEnd";

// Export the form data interface to be used by other components
export interface AppointmentFormData {
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  email: string;
  phone: string;
  office: string;
  zone: string;
  date: Date | null;
  time: string;
}

const Appointments = () => {
  const { theme } = useTheme();
  const companyName = theme.companyName;
  const logoUrl = useTheme().theme.logoUrl;
  const year = new Date().getFullYear();

  const [queue, setQueue] = useState<QueueItem>();
  const [appointmentId, setAppointmentId] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [showWalkIn, setShowWalkIn] = useState(false);
  const [formData, setFormData] = useState<AppointmentFormData>({
    firstName: "",
    lastName: "",
    documentType: "",
    documentNumber: "",
    email: "",
    phone: "",
    office: "",
    zone: "",
    date: null,
    time: "",
  });

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleStart = () => {
    setCurrentStep(1);
  };

  const handleCreate = () => {
    ApiService.createAppointment(formData).then( response => {
        setAppointmentId(response.id);
        handleNext();
    });
  };

  const handleConfirm = () => {
    ApiService.queueCreate(appointmentId).then( response => {
      setQueue(response);
      console.log(response);
      
      handleNext();
      /*setCurrentStep(0);
      setFormData({
        firstName: "",
        lastName: "",
        documentType: "",
        documentNumber: "",
        email: "",
        phone: "",
        office: "",
        zone: "",
        date: null,
        time: "",
      });
      localStorage.removeItem('appointment-office-data');*/
    });
  };

  const handleFormData = (data: Partial<AppointmentFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleOpenWalkIn = () => {
    setShowWalkIn(true);
  };

  const handleCloseWalkIn = () => {
    setCurrentStep(1);
    setShowWalkIn(false);
  };

  // Map steps to components
  const steps = [
    {
      component: (
        <AppointmentStart
          onNext={handleStart}
          onOpenWalkIn={handleOpenWalkIn}
        />
      ),
      label: "Inicio",
    },
    {
      component: (
        <PersonalDataForm
          onNext={handleNext}
          onPrev={handleBack}
          formData={formData}
          onChange={handleFormData}
        />
      ),
      label: "Datos Personales",
    },
    {
      component: (
        <ContactDataForm
          onNext={handleNext}
          onPrev={handleBack}
          formData={formData}
          onChange={handleFormData}
        />
      ),
      label: "Contacto",
    },
    {
      component: (
        <LocationSelection
          onNext={handleNext}
          onPrev={handleBack}
          selected={formData.office}
          onChange={(value) => handleFormData({ office: value })}
        />
      ),
      label: "Ubicación",
    },
    {
      component: (
        <DepartmentSelection
          onNext={handleNext}
          onPrev={handleBack}
          officeId={formData.office}
          selected={formData.zone}
          onChange={(value) => handleFormData({ zone: value })}
        />
      ),
      label: "Departamento",
    },
    {
      component: (
        <DateSelection
          onNext={handleNext}
          onPrev={handleBack}
          officeId={formData.office}          
          selected={formData.date}
          onChange={(date) => handleFormData({ date })}
        />
      ),
      label: "Fecha",
    },
    {
      component: (
        <TimeSelection
          onNext={handleNext}
          onConfirm={handleCreate}
          onPrev={handleBack}
          selected={formData.time}
          onChange={(time) => handleFormData({ time })}
          date={formData.date}
        />
      ),
      label: "Hora",
    },
    {
      component: (
        <AppointmentConfirmation onConfirm={handleConfirm} formData={formData} />
      ),
      label: "Confirmación",
    },
    {
      component: (
        <AppointmentConfirmEnd  formData={queue}  />
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

export default Appointments;

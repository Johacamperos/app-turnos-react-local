
import React from "react";
import { Check, User, Phone, MapPin, Building, Calendar, Clock, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AppointmentStepperProps {
  currentStep: number;
}

const AppointmentStepper: React.FC<AppointmentStepperProps> = ({ currentStep }) => {
  const { t } = useTranslation();
  
  const steps = [
    { name: t("appointments.steps.personalData"), icon: <User size={18} /> },
    { name: t("appointments.steps.contact"), icon: <Phone size={18} /> },
    { name: t("appointments.steps.location"), icon: <MapPin size={18} /> },
    { name: t("appointments.steps.department"), icon: <Building size={18} /> },
    { name: t("appointments.steps.date"), icon: <Calendar size={18} /> },
    { name: t("appointments.steps.time"), icon: <Clock size={18} /> },
    { name: t("appointments.steps.confirmation"), icon: <CheckCircle size={18} /> },
  ];

  return (
    <div className="hidden md:flex justify-between w-full max-w-4xl mx-auto">
      {steps.map((step, index) => (
        <div
          key={index}
          className={`flex flex-col items-center ${
            index <= currentStep ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
              index <= currentStep
                ? "bg-primary-custom text-white"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {index < currentStep ? <Check size={18} /> : step.icon}
          </div>
          <span className="text-xs">{step.name}</span>
        </div>
      ))}
    </div>
  );
};

export default AppointmentStepper;

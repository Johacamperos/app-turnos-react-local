
import { ZoneOfficeInfo } from "@/api/ApiService";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { AppointmentFormData } from "@/pages/Appointments";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Clock } from "lucide-react";
import React, { useEffect, useState } from "react";
import { isSameDay, parseISO, startOfDay } from "date-fns";

interface AppointmentConfirmationProps {
  formData: AppointmentFormData;
  onConfirm: () => void;
} 

const AppointmentConfirmation: React.FC<AppointmentConfirmationProps> = ({
  formData,
  onConfirm,
}) => {

  const { theme } = useTheme();
  const logoUrl = useTheme().theme.logoUrl;
  const { toast } = useToast();
  const [officeData, setOfficeData] = useState<ZoneOfficeInfo | null>(null);
  const isToday = formData.date
  ? isSameDay(startOfDay(new Date()), startOfDay(typeof formData.date === "string" ? parseISO(formData.date) : formData.date))
  : false;

  // Load office data from localStorage on component mount
   useEffect(() => {
     try {
       const savedOfficeData = localStorage.getItem('appointment-office-data');
       if (savedOfficeData) {
         const parsedData = JSON.parse(savedOfficeData) as ZoneOfficeInfo;
         setOfficeData(parsedData);
       }
     } catch (error) {
       console.error("Error loading office data:", error);
       toast({
         title: "Error",
         description: "No se pudieron cargar los datos de la oficina",
         variant: "destructive",
       });
     }
   }, []);
  
  return (
    <section className="pt-[43px] px-5 md:px-[70px] lg:px-[204px] pb-[58px]">
      <div className="text-center text-black flex flex-col gap-3 mb-12">
        <h2 className="text-[46px] leading-[52px] font-bold">
          ¡Tu cita ha sido agendada!
        </h2>
        <p className="text-[16px] tracking-[0.08px]">
          Hemos enviado todos los detalles a tu correo electrónico. <br />
          Por favor, recuerda confirmar tu cita hasta 15 minutos antes de la
          hora reservada. ¡Te esperamos!
        </p>
      </div>
      <div className="w-full px-[42px] py-[22px] border border-border-card rounded-[12px] shadow-card bg-card mb-[42px]">
        <div>
          <div className="grid md:grid-cols-2 md:gap-4 items-center pb-[10px] border-b border-border-card">
            <p className="text-[24px] font-semibold font-roboto-condensed">
              {formData.firstName} {formData.lastName}
            </p>
            <p className="text-sm text-muted-foreground">
              Duración de cita aproximada: 1 Hora
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 pt-[27px]">
            <div className="flex flex-col justify-between gap-3">
              <div className="flex flex-col items-start gap-[6px]">
                <div className="flex text-muted-foreground items-center gap-[6px]">
                  <Calendar className="h-5 w-5" />
                  <p className="text-sm">Fecha:</p>
                </div>
                <p className="text-[24px] leading-none font-semibold font-roboto-condensed">
                  {formData.date
                    ? format(formData.date, "d 'de' MMMM yyyy", { locale: es })
                    : "No seleccionada"}
                </p>
              </div>
              <div className="flex flex-col items-start gap-[6px]">
                <div className="flex text-muted-foreground leading-1 items-center gap-[6px]">
                  <Clock className="h-5 w-5" />
                  <p className="text-sm">Hora:</p>
                </div>
                <p className="text-[24px] leading-none font-semibold font-roboto-condensed">
                  {formData.time || "No seleccionada"}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col items-start gap-[3px]">
                <p className="text-[14px] leading-[1] text-muted-foreground">
                  Sede:
                </p>
                <p className="text-[16px] font-semibold ">
                  
                  {officeData && officeData.name && (
                    <span className="block mt-2 text-primary font-medium">
                     {officeData.name || "No seleccionada"}
                    </span>
                  )}                  
                </p>
              </div>
              <div className="flex flex-col items-start gap-[3px]">
              <div className="flex flex-col items-start gap-[3px]">
              <p className="text-[14px] leading-[1] text-muted-foreground">
                Área de atención:
              </p>
              <p className="text-[16px] font-semibold">
                {officeData?.zones ? (
                  (() => {
                    const selectedZone = officeData.zones.find(
                      (zone) => zone.id === formData.zone
                    );
                    return selectedZone ? (
                      <span className="block mt-2 text-primary font-medium">
                        {selectedZone.name}
                      </span>
                    ) : (
                      <span className="block mt-2 text-muted-foreground">No seleccionada</span>
                    );
                  })()
                ) : (
                  <span className="block mt-2 text-muted-foreground">No seleccionada</span>
                )}
              </p>
            </div>

            </div>
              <div className="flex flex-col items-start gap-[3px]">
                <p className="text-[14px] leading-[1] text-muted-foreground">
                  Dirección
                </p>
                {officeData && officeData.data && (
                    <span className="block mt-2 text-primary font-medium">
                     {officeData.data.address || "No seleccionada"}
                    </span>
                  )}     
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center mb-[44px]">
   
      {isToday && (
        <Button
          onClick={onConfirm}
          className="bg-primary text-white w-full md:w-[384px] py-[18px] px-[48px] text-[24px] h-auto leading-[30px] shadow-input font-roboto-condensed"
        >
          Confirmar cita
        </Button>
      )}
      </div> 

    </section>
  );
};

export default AppointmentConfirmation;

import React from "react"; 
import { AppointmentConfirmFormData } from "@/pages/AppointmentConfirm";
import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale"; 
import { NavLink } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";


interface AppointmentConfirmEndProps {
  formData: any;
} 

const AppointmentConfirmEnd: React.FC<AppointmentConfirmEndProps> = ({
  formData,
}) => { 
  const turn = {
    id: "B010",
    advisor: "5",
    desk: "5",
  };

    const { theme } = useTheme();
    const companyName = useTheme().theme.companyName;
    
console.log(formData);

  return (
    <section className="pt-[43px] px-5 md:px-[70px] lg:px-[204px] pb-[58px]">
      <div className="text-center text-black flex flex-col gap-3 mb-12">
        <h2 className="text-[46px] leading-[52px] font-bold">
          ¡{formData.customer}, Tu cita ha sido confirmada!
        </h2>
        <p className="text-[16px] tracking-[0.08px]">
        Revisa tu turno asignado, mantente atento a la pantalla y espera el llamado en la sala. ¡Estamos por atenderte!
        </p>
      </div>

      <div className="flex flex-col gap-[6px] items-center w-full mb-[36px] font-roboto-condensed">
        <div className="uppercase text-[20px] tracking-[4px]">Turno Asignado</div>
        <h3 className="text-[128px] text-[#00C65E] font-bold leading-[112px]">{formData.code}</h3>
       
      </div>

  
      <div className="flex items-center justify-center gap-6">
        <NavLink to="/appointments" className="flex justify-center border border-primary text-primary font-semibold py-[17px] px-[28px] rounded-[40px] min-w-[282px] text-[16px] hover:bg-primary/10">
          Agendar nueva cita
        </NavLink>
        <a href="" className="flex justify-center border border-primary text-white bg-primary font-semibold py-[17px] px-[28px] rounded-[40px] min-w-[282px] text-[16px] hover:bg-primary/90">
          Ir a {companyName}
        </a>
      </div> 

    </section>
  );
};

export default AppointmentConfirmEnd;


import React from "react";
import { Button } from "@/components/ui/button"; 
import { NavLink } from "react-router-dom"; 
import { CalendarCheck, CircleArrowRight } from "lucide-react";

interface AppointmentStartProps {
  onNext: () => void;
  onOpenWalkIn: () => void;
}

const AppointmentStart: React.FC<AppointmentStartProps> = ({ onNext, onOpenWalkIn }) => {
  return (
    <section className="pt-[40px] md:pt-[70px] pb-[280px] md:pb-[110px] px-5 md:px-[100px]"> 
      <div className="md:max-w-[486px] flex flex-col items-start gap-[42px]"> 
        <div className="flex flex-col gap-[18px] items-start"> 
          <h1 className="text-[46px] font-bold">Agenda tu cita</h1>
          <p className="text-black text-[16px] max-w-lg">
            Asegura tu cita en solo unos pasos y disfruta de un proceso ágil y sin estrés. <strong>¡Tu tiempo es valioso, haz que cada minuto cuente!</strong> 
          </p>
          <ul className="list-disc ps-5">
            <li>Elige el horario que más se adapte a ti</li>
            <li>Evita largas filas</li>
            <li>Recibe atención prioritaria</li>
          </ul>
        </div>
        <div className="flex flex-col w-full md:max-w-[60%] lg:max-w-[384px] gap-4 font-roboto-condensed"> 
          <Button onClick={onNext} className="px-[36px] py-[15px] bg-primary justify-between font-bold text-[22px] h-auto leading-[30px]">
            Comenzar ahora
            <CircleArrowRight className="!w-[20px] !h-[20px]" size={24} />
          </Button> 
          <NavLink to={"/appointment-confirm"} className="flex items-center justify-between px-[36px] py-[15px] border border-primary rounded-[6px] text-primary text-[22px] font-bold leading-[30px] hover:bg-primary/10">
            Tengo una cita reservada
            <CalendarCheck size={20} />
          </NavLink>
        </div>
      </div>
    </section>
  );
};

export default AppointmentStart;

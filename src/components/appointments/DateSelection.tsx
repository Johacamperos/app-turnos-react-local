import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format, isBefore, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, ChevronDown, Check } from "lucide-react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Office, ZoneOfficeInfo } from "@/api/ApiService";
import { useToast } from "@/components/ui/use-toast";

interface DateSelectionProps {
  selected: Date | undefined | null;
  onChange: (value: Date) => void;
  onNext: () => void;
  onPrev: () => void;
  officeId: string; 
}

const DateSelection: React.FC<DateSelectionProps> = ({
  selected,
  onChange,
  onNext,
  onPrev,
  officeId,
}) => {
  const [currentView, setCurrentView] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [officeData, setOfficeData] = useState<ZoneOfficeInfo | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    try {
      const savedOfficeData = localStorage.getItem('appointment-office-data');
      if (savedOfficeData) {
        const parsedData = JSON.parse(savedOfficeData) as ZoneOfficeInfo;
        setOfficeData(parsedData);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de la oficina",
        variant: "destructive",
      });
    }
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    onNext();
  };

  const handleToggleCalendar = (e: React.FormEvent) => { 
    e.preventDefault();
    setIsCalendarOpen(!isCalendarOpen);
  }

  const today = startOfDay(new Date());

  const nextWeekDays = useMemo(() => {
    const days = [];
    const startDate = new Date(currentView);
    startDate.setHours(0, 0, 0, 0);
    for (let i = 0; i < 5; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  }, [currentView]);

  const isHoliday = (date: Date): boolean => {
    if (!officeData || !officeData.data || !officeData.data.holidays) {
      return false;
    }
    const dateString = format(date, 'yyyy-MM-dd');
    return officeData.data.holidays.includes(dateString);
  };

  const disabledDates = (date: Date) => {
    if (isBefore(startOfDay(date), today)) return true;
    if (isHoliday(date)) return true;
    return false;
  };

  return (
    <section className="pt-[43px] px-5 md:px-[70px] lg:px-[204px] pb-[58px]">
      <form onSubmit={handleSubmit} className="w-full mx-auto">
        <div className="text-center text-black flex flex-col gap-3 mb-12">
          <h2 className="text-[46px] leading-[52px] font-bold">Selecciona el día de tu cita</h2>
          <p className="text-[16px] tracking-[0.08px]">
            Elige la fecha que mejor se adapte a tu agenda.
            {officeData && officeData.name && (
              <span className="block mt-2 text-primary font-medium">
                Oficina seleccionada: {officeData.name}
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-col">
          <div className="flex px-[42px] justify-between items-center bg-[#FCFAF9] rounded-[6px] relative">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                const prev = new Date(currentView);
                prev.setMonth(prev.getMonth() - 1);
                setCurrentView(prev);
              }}
              className="border-primary rounded-full w-6 h-6"
            >
              <ChevronLeft className="h-6 w-6 text-primary" />
            </Button>
            <Button 
              variant="ghost"
              className="flex gap-2 items-center justify-center relative"
              onClick={handleToggleCalendar}
            > 
              <CalendarIcon />
              <h3 className="text-center font-medium font-roboto capitalize">
                {format(currentView, "MMMM yyyy", { locale: es })}
              </h3>
              <ChevronDown className={`h-4 w-4 transition-all ${isCalendarOpen ? 'rotate-[180deg]' : ''}`} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="border-primary rounded-full w-6 h-6"
              onClick={() => {
                const next = new Date(currentView);
                next.setMonth(next.getMonth() + 1);
                setCurrentView(next);
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            {isCalendarOpen && (
              <Calendar
                mode="single"
                selected={selected ?? undefined}
                onSelect={(date) => date && onChange(date)}
                className="rounded-md border bg-white pointer-events-auto absolute top-[100%] z-10 left-1/2 -translate-x-1/2"
                locale={es}
                month={currentView}
                onMonthChange={setCurrentView}
                disabled={disabledDates}
              />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 lg:gap-[23px] mt-6 relative mb-[60px]">
            {nextWeekDays.map((day, index) => {
              const isSelected = selected && day.toDateString() === selected.toDateString();
              const isToday = day.toDateString() === today.toDateString();
              const dayIsHoliday = isHoliday(day);
              const dayIsPast = isBefore(startOfDay(day), today);
              const isDisabled = dayIsHoliday || dayIsPast;

              return (
                <div
                  key={index}
                  className={`relative pt-[13px] pb-[43px] rounded-[12px] border text-center 
                    ${isDisabled 
                      ? 'opacity-50 cursor-not-allowed bg-gray-100' 
                      : 'cursor-pointer transition-colors'
                    } ${isSelected && !isDisabled
                      ? "border-primary-custom bg-primary/10 shadow-input"
                      : "border-border hover:bg-primary/10 hover:border-primary/50 hover:shadow-input"
                  }`}
                  onClick={() => {
                    if (!isDisabled) {
                      onChange(day);
                    }
                  }}
                >
                  <div className={`items-center ${isSelected && !isDisabled ? 'text-primary' : isDisabled ? 'text-red-500' : 'text-black'}`}>
                    <div className="text-[14px] mb-1">
                      {isToday ? "HOY" : format(day, "EEEE", { locale: es }).toUpperCase()}
                    </div>
                    <div className="text-[46px] leading-[40px] font-medium -mt-[3px] font-roboto-condensed">{format(day, "d", { locale: es })}</div>
                    <div className="text-[14px] uppercase -mt-[3px]">{format(day, "MMMM", { locale: es })}</div>
                    {isDisabled && (
                      <div className="text-[12px] text-red-500 mt-1">No disponible</div>
                    )}
                    {isSelected && !isDisabled && <Check size={20} className="text-primary-custom absolute left-1/2 -translate-x-1/2 mt-1" />}
                  </div>
                </div>
              );
            })}

            {/* Botones para moverse entre semanas */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const prevWeek = new Date(currentView);
                prevWeek.setDate(currentView.getDate() - 7);
                setCurrentView(prevWeek);
              }}
              className="text-xs absolute rounded-full top-[50%] w-[48px] h-[48px] -left-[10px] lg:-left-[24px] -translate-y-1/2 border-primary -translate-x-full invisible md:visible"
            >
              <ChevronLeft className="h-3 text-primary" /> 
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const nextWeek = new Date(currentView);
                nextWeek.setDate(currentView.getDate() + 7);
                setCurrentView(nextWeek);    
              }}
              className="text-xs absolute rounded-full top-[50%] w-[48px] h-[48px] -right-[10px] lg:-right-[24px] -translate-y-1/2 border-primary translate-x-full invisible md:visible"
            > 
              <ChevronRight className="h-3 text-primary" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6">
          <Button 
            type="button" 
            onClick={onPrev} 
            variant="outline" 
            size="formStep"
            className="text-primary border-primary text-[16px]"
          >
            Regresar
          </Button>
          <Button 
            type="submit" 
            disabled={!selected}
            size="formStep"
            className="bg-primary text-white text-[16px]"
          >
            Continuar
          </Button>
        </div>
      </form>
    </section>
  );
};

export default DateSelection;

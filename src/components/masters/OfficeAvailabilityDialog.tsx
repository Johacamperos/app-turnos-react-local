
import React, { useState, useEffect } from "react";
import { format, parse } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Office } from "@/api/ApiService";
import { cn } from "@/lib/utils";
import { CalendarIcon, X, Clock } from "lucide-react";

interface OfficeAvailabilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  office: Office | null;
  onSave: (availabilityData: {
    maxAppointments?: number;
    address?: string;
    holidays?: string[];
    workingHours?: { start: string; end: string };
  }) => void;
  isLoading?: boolean;
}

const OfficeAvailabilityDialog: React.FC<OfficeAvailabilityDialogProps> = ({
  open,
  onOpenChange,
  office,
  onSave,
  isLoading = false,
}) => {
  const [maxAppointments, setMaxAppointments] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [selectedHolidays, setSelectedHolidays] = useState<Date[]>([]);
  const [startHour, setStartHour] = useState<string>("08:00");
  const [endHour, setEndHour] = useState<string>("17:00");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    if (office) {
      setMaxAppointments(office.data.maxAppointments?.toString() || "");
      setAddress(office.data.address?.toString() || "");
      
      // Convert ISO string dates to Date objects
      const holidays = office.data.holidays?.map(dateStr => new Date(dateStr)) || [];
      setSelectedHolidays(holidays);
      
      // Set working hours if available
      if (office.data.workingHours) {
        setStartHour(office.data.workingHours.start);
        setEndHour(office.data.workingHours.end);
      } else {
        // Default values
        setStartHour("08:00");
        setEndHour("17:00");
      }
    }
  }, [office]);

  const handleSave = () => {
    onSave({
      maxAppointments: maxAppointments ? parseInt(maxAppointments) : undefined,
      address: address,
      holidays: selectedHolidays.map(date => date.toISOString().split('T')[0]),
      workingHours: {
        start: startHour,
        end: endHour,
      },
    });
  };

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return;

    setSelectedHolidays(prev => {
      const dateString = format(date, "yyyy-MM-dd");
      const exists = prev.some(d => format(d, "yyyy-MM-dd") === dateString);

      if (exists) {
        return prev.filter(d => format(d, "yyyy-MM-dd") !== dateString);
      } else {
        return [...prev, date];
      }
    });
  };

  const removeHoliday = (index: number) => {
    setSelectedHolidays(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {office && `Gestión de Disponibilidad: ${office.name}`}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="maxAppointments" className="text-right">
              Máximo de Citas
            </Label>
            <Input
              id="maxAppointments"
              type="number"
              min="1"
              value={maxAppointments}
              onChange={(e) => setMaxAppointments(e.target.value)}
              className="col-span-3"
              placeholder="Número máximo de citas por día"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">
              Dirección
            </Label>
            <Input
              id="address"
              type="string"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="col-span-3"
              placeholder="Dirección de la oficina"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Horario Laboral</Label>
            <div className="col-span-3 flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 opacity-70" />
                <Input
                  type="time"
                  value={startHour}
                  onChange={(e) => setStartHour(e.target.value)}
                  className="w-24"
                />
                <span>hasta</span>
                <Input
                  type="time"
                  value={endHour}
                  onChange={(e) => setEndHour(e.target.value)}
                  className="w-24"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Días no Laborables</Label>
            <div className="col-span-3">
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Seleccionar fechas
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    onSelect={handleSelectDate}
                    selected={new Date()}
                    modifiers={{
                      selected: selectedHolidays,
                    }}
                    modifiersStyles={{
                      selected: { backgroundColor: "#f43f5e" },
                    }}
                    className="p-3"
                    disabled={date => 
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                  />
                </PopoverContent>
              </Popover>

              <div className="mt-3 flex flex-wrap gap-2">
                {selectedHolidays.length > 0 ? (
                  selectedHolidays.map((holiday, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {format(holiday, "dd/MM/yyyy")}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeHoliday(index)}
                      />
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No hay días no laborables seleccionados
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OfficeAvailabilityDialog;

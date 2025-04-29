
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppointmentConfirmFormData } from "@/pages/AppointmentConfirm";
import ApiService from "@/api/ApiService"; // Import ApiService
import { useToast } from "@/components/ui/use-toast"; // Import useToast for notifications
import { Loader } from "lucide-react"; // Import Loader icon

interface AppointmentConfirmStartProps {
  formData: AppointmentConfirmFormData;
  onChange: (data: Partial<AppointmentConfirmFormData>) => void;
  onNext: () => void;
  setQueueData: (data: any) => void; // Add this prop to pass queue data up
}

const AppointmentConfirmStart: React.FC<AppointmentConfirmStartProps> = ({
  formData,
  onChange,
  onNext,
  setQueueData, // Receive the setter function
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // Start loading

    // Validate form
    if (!formData.documentType || !formData.documentNumber) {
      toast({
        title: "Error de Validación",
        description: "Por favor, completa el tipo y número de documento.",
        variant: "destructive",
      });
      setIsLoading(false); // Stop loading on validation error
      return;
    }

    try {
      // 1. Fetch appointment by document details
      const queueResponse = await ApiService.fetchAppointmentByDocument(
        formData.documentType,
        formData.documentNumber
      );

      if (!queueResponse) {
        toast({
          title: "Cita no encontrada",
          description: "No se encontró una cita con los datos proporcionados.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }


      // 3. Pass the queue data up to the parent component
      setQueueData(queueResponse);

      // 4. Proceed to the next step (AppointmentConfirmEnd)
      onNext();

    } catch (error: any) {
      console.error("Error confirming appointment:", error);
      toast({
        title: "Error al Confirmar",
        description: error.message || "Ocurrió un error al confirmar la cita. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false); // Stop loading regardless of outcome
    }
  };

  return (
    <section className="pt-[40px] md:pt-[70px] pb-[280px] md:pb-[60px] px-5 md:px-[100px]">
      <div className="md:max-w-[486px] flex flex-col items-start gap-[42px]">
        <div className="flex flex-col gap-[12px] items-start">
          <h1 className="text-[46px] font-bold leading-[52px]">Confirma tu cita</h1>
          <p className="text-black text-[16px] max-w-lg tracking-[0.08px]">
            Revisa los detalles y confirma tu asistencia para asegurar tu cita.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="w-full max-w-[384px]">
          <div className="mb-6">
            <Label>Tipo de documento</Label>
            <Select
              value={formData.documentType}
              onValueChange={(value) => onChange({ documentType: value })}
              disabled={isLoading} // Disable while loading
            >
              <SelectTrigger id="documentType" className="h-[54px]">
                <SelectValue placeholder="Selecciona una opción" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                <SelectItem value="PASSPORT">Pasaporte</SelectItem>
                <SelectItem value="OTHER">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mb-[42px]">
            <Label htmlFor="documentNumber">Número de documento</Label>
            <Input
              id="documentNumber"
              value={formData.documentNumber}
              onChange={(e) => onChange({ documentNumber: e.target.value })}
              placeholder="Ingresa número de documento"
              className="focus:shadow-input"
              disabled={isLoading} // Disable while loading
            />
          </div>
          <Button
            type="submit"
            className="font-semibold text-[16px] leading-[20px] py-[17px] rounded-[40px] min-w-[180px] h-auto"
            disabled={isLoading} // Disable button while loading
          >
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Confirmando...
              </>
            ) : (
              "Confirmar"
            )}
          </Button>
        </form>
      </div>
    </section>
  );
};

export default AppointmentConfirmStart;


import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppointmentFormData } from "@/pages/Appointments";

interface ContactDataFormProps {
  formData: AppointmentFormData;
  onChange: (data: Partial<AppointmentFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const ContactDataForm: React.FC<ContactDataFormProps> = ({
  formData,
  onChange,
  onNext,
  onPrev,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate form
    if (!formData.email || !formData.phone) {
      return;
    }
    onNext();
  };

  return (
    <section className="pt-[43px] px-5 md:px-[70px] lg:px-[204px] pb-[58px]">
      <form onSubmit={handleSubmit} className="w-full mx-auto">
        <div className="text-center text-black flex flex-col gap-3 mb-12">
          <h2 className="text-[46px] leading-[52px] font-bold">Datos de contacto</h2>
          <p className="text-[16px] tracking-[0.08px]">
            Diligencialos de forma correcta. A ellos enviaremos los datos y confirmación de tu cita.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-[60px]">
          <div>
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="Ingresa tu correo electrónico"
            />
          </div>

          <div>
            <Label htmlFor="phone">Número telefónico</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              placeholder="Ingresa tu número de teléfono"
            />
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

export default ContactDataForm;

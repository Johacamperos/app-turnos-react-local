
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppointmentFormData } from "@/pages/Appointments";

interface PersonalDataFormProps {
  formData: AppointmentFormData;
  onChange: (data: Partial<AppointmentFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const PersonalDataForm: React.FC<PersonalDataFormProps> = ({
  formData,
  onChange,
  onNext,
  onPrev,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.documentType || !formData.documentNumber) {
      return;
    }
    onNext();
  };

  return (
    <section className="pt-[43px] px-5 md:px-[70px] lg:px-[204px] pb-[58px]">
      <form onSubmit={handleSubmit} className="w-full mx-auto">
        <div className="text-center text-black flex flex-col gap-3 mb-12">
          <h2 className="text-[46px] leading-[52px] font-bold">Diligencia tus datos</h2>
          <p className="text-[16px] tracking-[0.08px]">
            Escribe tu nombre según consta en tu documento de identificación.
          </p>
        </div> 
        <div className="grid md:grid-cols-2 gap-6 mb-[60px]">
          <div>
            <Label htmlFor="firstName">Nombre completo</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => onChange({ firstName: e.target.value })}
              placeholder="Ingresa tu nombre"
              className={`${formData.firstName ? "border-green-500" : ""} focus:shadow-input`}
            />
          </div>

          <div>
            <Label htmlFor="lastName">Apellido</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => onChange({ lastName: e.target.value })}
              placeholder="Ingresa tu apellido"
              className="focus:shadow-input"
            />
          </div>

          <div>
            <Label htmlFor="documentType">Tipo de documento</Label>
            <Select
              value={formData.documentType}
              onValueChange={(value) => onChange({ documentType: value })}
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

          <div>
            <Label htmlFor="documentNumber">Número de documento</Label>
            <Input
              id="documentNumber"
              value={formData.documentNumber}
              onChange={(e) => onChange({ documentNumber: e.target.value })}
              placeholder="Ingresa número de documento"
              className="focus:shadow-input"
            />
          </div>
        </div> 
        <div className="flex items-center justify-center gap-6">
          <Button 
            type="button" 
            onClick={onPrev} 
            variant="outline" 
            size="formStep"
            className=" text-primary border-primary text-[16px]"
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

export default PersonalDataForm;

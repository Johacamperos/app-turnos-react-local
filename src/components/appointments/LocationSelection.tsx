import React from "react";
import { Button } from "@/components/ui/button";
import { Check, Loader } from "lucide-react";
import ApiService, { Office, Zone } from "@/api/ApiService";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";

const LoaderSpinner = () => (
  <div className="flex flex-col items-center justify-center h-64 py-12">
    <Loader className="animate-spin w-10 h-10 text-primary mb-4" />
    <span className="text-gray-700 text-[18px] mt-2">Cargando ubicaciones...</span>
  </div>
);

interface LocationSelectionProps {
  selected: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

const LocationSelection: React.FC<LocationSelectionProps> = ({
  selected,
  onChange,
  onNext,
  onPrev,
}) => {
  // Fetch offices
  const { data: offices = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['offices'],
    queryFn: () => ApiService.fetchOffices()
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    onNext();
  };

  if (isLoading) {
    return (
      <section className="pt-[43px] px-5 md:px-[70px] lg:px-[204px] pb-[58px] flex items-center justify-center min-h-[420px]">
        <div className="w-full mx-auto text-center">
          <div className="text-center text-black flex flex-col gap-3 mb-12">
            <h2 className="text-[46px] leading-[52px] font-bold">Elige la sede de tu cita</h2>
            <p className="text-[16px] tracking-[0.08px]">
              Selecciona la ubicación más conveniente para recibir tu atención.
            </p>
          </div>
          <LoaderSpinner />
          <div className="flex items-center justify-center gap-6 mt-12">
            <Button 
              type="button" 
              variant="outline" 
              size="formStep"
              className="text-primary border-primary text-[16px]"
              disabled
            >
              Regresar
            </Button>
            <Button 
              type="button"
              size="formStep"
              className="bg-primary text-white text-[16px]"
              disabled
            >
              Continuar
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-[43px] px-5 md:px-[70px] lg:px-[204px] pb-[58px]">
      <form onSubmit={handleSubmit} className="w-full mx-auto">
        <div className="text-center text-black flex flex-col gap-3 mb-12">
          <h2 className="text-[46px] leading-[52px] font-bold">Elige la sede de tu cita</h2>
          <p className="text-[16px] tracking-[0.08px]">
            Selecciona la ubicación más conveniente para recibir tu atención.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-[60px] font-roboto-condensed">
          {offices.map((location) => (
            <div
              key={location.id}
              className={`px-[24px] py-[21px] rounded-lg border hover:shadow-input hover:bg-[#F5FDF9] cursor-pointer transition-colors ${
                selected === location.id
                  ? "border-primary-custom shadow-input bg-[#F5FDF9]"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => onChange(location.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3"> 
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center relative ${
                      selected === location.id
                      ? "text-white border-primary border bg-white"
                      : "border border-gray-300"
                    }`}
                  > 
                    {selected === location.id && <div className="bg-primary h-[10px] w-[10px] rounded-[50%]"></div>}
                  </div>
                  <span className="font-medium">{location.name}</span>
                </div>
                {selected === location.id && <Check size={16} />}
              </div>
            </div>
          ))}
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

export default LocationSelection;

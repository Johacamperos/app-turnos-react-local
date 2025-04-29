
import React from "react";
import { Office } from "@/api/ApiService";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Building2, MapPin, CalendarDays, Smartphone } from "lucide-react";

interface OfficeDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentOffice: Office | null;
  onEdit: (office: Office) => void;
  onManageZones: (office: Office) => void;
  onManageDevices: (office: Office) => void;
  onManageAvailability: (office: Office) => void;
}

const OfficeDetailsDialog: React.FC<OfficeDetailsDialogProps> = ({
  open,
  onOpenChange,
  currentOffice,
  onEdit,
  onManageZones,
  onManageDevices,
  onManageAvailability,
}) => {
  if (!currentOffice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Detalles de la Oficina</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="flex items-center mb-4">
            <Building2 className="h-8 w-8 mr-3 text-primary" />
            <div>
              <h3 className="text-lg font-medium">{currentOffice.name}</h3>
              <p className="text-sm text-muted-foreground">
                {currentOffice.deviceCode 
                  ? `Código de Dispositivo: ${currentOffice.deviceCode}` 
                  : "Sin código de dispositivo asignado"
                }
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <h4 className="text-sm font-medium mb-2">Zonas Asociadas</h4>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onManageZones(currentOffice)}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Gestionar Zonas
            </Button>

            <h4 className="text-sm font-medium pt-2 mb-2">Dispositivos</h4>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onManageDevices(currentOffice)}
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Gestionar Dispositivos
            </Button>

            <h4 className="text-sm font-medium pt-2 mb-2">Disponibilidad</h4>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onManageAvailability(currentOffice)}
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              Configurar Disponibilidad
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Button onClick={() => onEdit(currentOffice)}>
            Editar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OfficeDetailsDialog;

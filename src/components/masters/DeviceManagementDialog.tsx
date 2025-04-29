
import React, { useState, useEffect } from "react";
import { Office } from "@/api/ApiService";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RefreshCcw, X, Smartphone, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { v4 as uuidv4 } from 'uuid';

interface DeviceManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  office: Office | null;
  onSave: (devices: string[]) => void;
}

const DeviceManagementDialog: React.FC<DeviceManagementDialogProps> = ({
  open,
  onOpenChange,
  office,
  onSave,
}) => {
  const [devices, setDevices] = useState<string[]>([]);
  const [newDevice, setNewDevice] = useState<string>("");
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (open && office) {
      // Initialize devices from office.data.devices or empty array
      setDevices(office.data.devices || []);
    }
  }, [open, office]);

  const handleAddDevice = () => {
    if (!newDevice.trim()) return;
    
    setDevices([...devices, newDevice]);
    setNewDevice("");
  };

  const handleRemoveDevice = (index: number) => {
    const updatedDevices = [...devices];
    updatedDevices.splice(index, 1);
    setDevices(updatedDevices);
  };

  const handleSave = () => {
    setIsPending(true);
    onSave(devices);
    setIsPending(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {office && `Gestionar Dispositivos de Oficina: ${office.name}`}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="flex items-center gap-2 mb-4">
            <Input
              placeholder="Dispositivo nuevo"
              value={newDevice}
              onChange={(e) => setNewDevice(e.target.value)}
              
              className="flex-1"
            />
            <Button onClick={handleAddDevice} type="button">
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
          
          <div className="border rounded-md p-4 mt-4">
            <h3 className="text-sm font-medium mb-2">Dispositivos Asociados</h3>
            {devices.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {devices.map((device, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-2 rounded bg-primary/10"
                  >
                    <div className="flex items-center">
                      <Smartphone className="h-4 w-4 mr-2 text-primary" />
                      <span>{device}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleRemoveDevice(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No hay dispositivos asociados.
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? (
              <RefreshCcw className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Guardar Dispositivos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeviceManagementDialog;

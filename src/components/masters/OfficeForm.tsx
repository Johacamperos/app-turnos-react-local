
import React from "react";
import { Office } from "@/api/ApiService";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { RefreshCcw } from "lucide-react";

interface OfficeFormProps {
  formData: Office;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  isEditing: boolean;
}

const OfficeForm: React.FC<OfficeFormProps> = ({
  formData,
  onInputChange,
  onSubmit,
  isPending,
  isEditing,
}) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Nombre
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={onInputChange}
            className="col-span-3"
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="deviceCode" className="text-right">
            Código de Dispositivo
          </Label>
          <Input
            id="deviceCode"
            name="deviceCode"
            value={formData.deviceCode || ""}
            onChange={onInputChange}
            className="col-span-3"
            placeholder="Opcional"
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <RefreshCcw className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          {isEditing ? "Actualizar" : "Crear"}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default OfficeForm;

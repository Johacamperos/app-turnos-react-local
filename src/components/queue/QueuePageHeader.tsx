
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw } from "lucide-react";

const QueuePageHeader = () => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 className="text-3xl font-display font-medium tracking-tight animate-fade-in">
        Gestión de Turnos
      </h1>
      
      <div className="flex items-center gap-3 animate-fade-in">
        <Button 
          variant="outline" 
          size="sm" 
          className="h-9"
        >
          <RefreshCw size={16} className="mr-2" />
          Actualizar
        </Button>
        <Button 
          variant="default" 
          size="sm" 
          className="h-9"
        >
          <PlusCircle size={16} className="mr-2" />
          Nuevo Turno
        </Button>
      </div>
    </div>
  );
};

export default QueuePageHeader;


import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { 
  Search, Plus, Pencil, Eye, MoreHorizontal, X, RefreshCcw, Building2, MapPin, CalendarDays, Smartphone
} from "lucide-react";
import ApiService, { Office, Zone } from "@/api/ApiService";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import OfficeAvailabilityDialog from "@/components/masters/OfficeAvailabilityDialog";
import OfficeForm from "@/components/masters/OfficeForm";
import OfficeDetailsDialog from "@/components/masters/OfficeDetailsDialog";
import DeviceManagementDialog from "@/components/masters/DeviceManagementDialog";
import { useOfficesData } from "@/hooks/useOfficesData";

const OfficeManagement = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isZoneManagementOpen, setIsZoneManagementOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
  const [isDeviceManagementOpen, setIsDeviceManagementOpen] = useState(false);
  const [currentOffice, setCurrentOffice] = useState<Office | null>(null);
  const [selectedZoneIds, setSelectedZoneIds] = useState<string[]>([]);
  const [formData, setFormData] = useState<Office>({
    name: "",
    deviceCode: "",
    data: {}
  });

  const {
    paginatedOffices,
    isLoading,
    isError,
    refetch,
    searchTerm,
    setSearchTerm,
    page,
    setPage,
    maxPage,
    createOfficeMutation,
    updateOfficeMutation,
    deleteOfficeMutation
  } = useOfficesData();

  // Fetch all zones
  const { data: allZones = [] } = useQuery({
    queryKey: ['zones'],
    queryFn: ApiService.fetchZones
  });

  // Fetch zones for specific office
  const { data: officeZones = [], refetch: refetchOfficeZones } = useQuery({
    queryKey: ['office-zones', currentOffice?.id],
    queryFn: () => currentOffice?.id ? ApiService.fetchZonesByOffice(currentOffice.id) : Promise.resolve([]),
    enabled: !!currentOffice?.id && isZoneManagementOpen
  });

  // Associate zone to office mutation
  const associateZoneMutation = useMutation({
    mutationFn: ({ zoneId, officeId }: { zoneId: string, officeId: string }) => 
      ApiService.associateZoneOffice(zoneId, officeId),
    onSuccess: () => {
      refetchOfficeZones();
    }
  });

  // Dissociate zone from office mutation
  const dissociateZoneMutation = useMutation({
    mutationFn: ({ zoneId, officeId }: { zoneId: string, officeId: string }) => 
      ApiService.dissociateZoneOffice(zoneId, officeId),
    onSuccess: () => {
      refetchOfficeZones();
    }
  });

  // Save zone associations mutation
  const saveZoneAssociationsMutation = useMutation({
    mutationFn: async () => {
      if (!currentOffice?.id) return;
      
      // Find zones to add
      const zonesToAdd = selectedZoneIds.filter(
        zoneId => !officeZones.some(zone => zone.id === zoneId)
      );
      
      // Find zones to remove
      const zonesToRemove = officeZones
        .filter(zone => !selectedZoneIds.includes(zone.id!))
        .map(zone => zone.id!);
      
      // Process additions
      const addPromises = zonesToAdd.map(zoneId => 
        ApiService.associateZoneOffice(zoneId, currentOffice.id!)
      );
      
      // Process removals
      const removePromises = zonesToRemove.map(zoneId => 
        ApiService.dissociateZoneOffice(zoneId, currentOffice.id!)
      );
      
      // Wait for all operations to complete
      await Promise.all([...addPromises, ...removePromises]);
    },
    onSuccess: () => {
      toast({
        title: "Zonas actualizadas",
        description: "Las asociaciones de zonas han sido actualizadas exitosamente",
      });
      setIsZoneManagementOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al actualizar asociaciones de zonas: ${error}`,
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      deviceCode: "",
      data: {}
    });
    setCurrentOffice(null);
  };

  const handleOpenDialog = (office?: Office) => {
    if (office) {
      setFormData(office);
      setCurrentOffice(office);
    } else {
      resetForm();
    }
    setIsOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.name) {
      toast({
        title: "Error de validación",
        description: "El nombre de la oficina es obligatorio",
        variant: "destructive",
      });
      return;
    }

    if (currentOffice?.id) {
      updateOfficeMutation.mutate({ 
        id: currentOffice.id, 
        office: formData 
      });
    } else {
      createOfficeMutation.mutate(formData);
    }
    
    setIsOpen(false);
    resetForm();
  };

  const handleViewDetails = (office: Office) => {
    setCurrentOffice(office);
    setIsDetailsOpen(true);
  };

  const handleDeleteOffice = (office: Office) => {
    if (confirm(`¿Está seguro de eliminar la oficina "${office.name}"?`)) {
      deleteOfficeMutation.mutate(office.id!);
    }
  };

  const handleOpenZoneManagement = (office: Office) => {
    setCurrentOffice(office);
    setIsZoneManagementOpen(true);
    
    // Populate selected zones when opening the dialog
    if (office.id) {
      ApiService.fetchZonesByOffice(office.id).then(zones => {
        setSelectedZoneIds(zones.map(zone => zone.id!));
      });
    }
  };

  const handleOpenDeviceManagement = (office: Office) => {
    setCurrentOffice(office);
    setIsDeviceManagementOpen(true);
  };

  const handleOpenAvailabilityManagement = (office: Office) => {
    setCurrentOffice(office);
    setIsAvailabilityOpen(true);
  };

  const handleSaveAvailability = (availabilityData: {
    maxAppointments?: number;
    holidays?: string[];
    workingHours?: { start: string; end: string };
  }) => {
    if (currentOffice?.id) {
      const updatedOffice = { ...currentOffice };
      updatedOffice.data = {
        ...updatedOffice.data,
        ...availabilityData
      };
      
      updateOfficeMutation.mutate({
        id: currentOffice.id,
        office: updatedOffice
      });
    }
    
    setIsAvailabilityOpen(false);
  };  

  const handleSaveDevices = (devices: string[]) => {
   
    if (currentOffice?.id) {
      const updatedOffice = { ...currentOffice };
      
      updatedOffice.data.devices = devices;
      
      updateOfficeMutation.mutate({
        id: currentOffice.id,
        office: updatedOffice
      });
    }

    setIsDeviceManagementOpen(false);

  };

  const toggleZoneSelection = (zoneId: string) => {
    setSelectedZoneIds(prev => 
      prev.includes(zoneId)
        ? prev.filter(id => id !== zoneId)
        : [...prev, zoneId]
    );
  };

  const handleSaveZoneAssociations = () => {
    saveZoneAssociationsMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCcw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <X className="h-12 w-12 text-destructive" />
        <h2 className="text-xl">Error al cargar oficinas</h2>
        <Button onClick={() => refetch()}>Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-medium tracking-tight">
          Gestión de Oficinas
        </h1>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Oficina
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
        <div className="relative w-full md:w-auto max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o código de dispositivo..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Zonas</TableHead>
              <TableHead>Dispositivos</TableHead>
              <TableHead>Disponibilidad</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOffices.length > 0 ? (
              paginatedOffices.map((office) => (
                <TableRow key={office.id}>
                  <TableCell className="font-medium">{office.name}</TableCell>
  
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleOpenZoneManagement(office)}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Gestionar
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleOpenDeviceManagement(office)}
                    >
                      <Smartphone className="h-4 w-4 mr-2" />
                      Gestionar
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleOpenAvailabilityManagement(office)}
                    >
                      <CalendarDays className="h-4 w-4 mr-2" />
                      Configurar
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(office)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenDialog(office)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteOffice(office)}
                          className="text-destructive focus:text-destructive"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No se encontraron oficinas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {paginatedOffices.length > 0 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setPage(page > 1 ? page - 1 : 1)}
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {Array.from({ length: Math.min(maxPage, 5) }).map((_, i) => {
              let pageNumber;
              
              // Logic to show pages around the current page
              if (maxPage <= 5) {
                pageNumber = i + 1;
              } else if (page <= 3) {
                pageNumber = i + 1;
              } else if (page >= maxPage - 2) {
                pageNumber = maxPage - 4 + i;
              } else {
                pageNumber = page - 2 + i;
              }
              
              return (
                <PaginationItem key={i}>
                  <PaginationLink 
                    onClick={() => setPage(pageNumber)}
                    isActive={pageNumber === page}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setPage(page < maxPage ? page + 1 : maxPage)}
                className={page >= maxPage ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Office Form Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {currentOffice ? `Editar Oficina: ${currentOffice.name}` : "Agregar Nueva Oficina"}
            </DialogTitle>
          </DialogHeader>
          <OfficeForm 
            formData={formData} 
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            isPending={createOfficeMutation.isPending || updateOfficeMutation.isPending}
            isEditing={!!currentOffice}
          />
        </DialogContent>
      </Dialog>

      {/* Zone Management Dialog */}
      <Dialog open={isZoneManagementOpen} onOpenChange={setIsZoneManagementOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {currentOffice && `Asociar Zonas a Oficina: ${currentOffice.name}`}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-md p-4">
                <h3 className="text-sm font-medium mb-2">Zonas Disponibles</h3>
                {allZones.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {allZones.map(zone => (
                      <div 
                        key={zone.id}
                        className={`flex items-center p-2 rounded hover:bg-muted cursor-pointer ${
                          selectedZoneIds.includes(zone.id!) ? 'bg-primary/10' : ''
                        }`}
                        onClick={() => toggleZoneSelection(zone.id!)}
                      >
                        <input 
                          type="checkbox" 
                          checked={selectedZoneIds.includes(zone.id!)}
                          readOnly
                          className="mr-2"
                        />
                        <span>{zone.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No hay zonas disponibles.
                  </div>
                )}
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="text-sm font-medium mb-2">Zonas Seleccionadas</h3>
                {selectedZoneIds.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {allZones
                      .filter(zone => selectedZoneIds.includes(zone.id!))
                      .map(zone => (
                        <div 
                          key={zone.id}
                          className="flex items-center justify-between p-2 rounded bg-primary/10"
                        >
                          <span>{zone.name}</span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toggleZoneSelection(zone.id!)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No hay zonas seleccionadas.
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsZoneManagementOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveZoneAssociations} disabled={saveZoneAssociationsMutation.isPending}>
              {saveZoneAssociationsMutation.isPending ? (
                <RefreshCcw className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Guardar Asociaciones
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Office Availability Dialog */}
      <OfficeAvailabilityDialog
        open={isAvailabilityOpen}
        onOpenChange={setIsAvailabilityOpen}
        office={currentOffice}
        onSave={handleSaveAvailability}
      />

      {/* Device Management Dialog */}
      <DeviceManagementDialog
        open={isDeviceManagementOpen}
        onOpenChange={setIsDeviceManagementOpen}
        office={currentOffice}
        onSave={handleSaveDevices}
      />

      {/* Office Details Dialog */}
      <OfficeDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        currentOffice={currentOffice}
        onEdit={(office) => {
          setIsDetailsOpen(false);
          handleOpenDialog(office);
        }}
        onManageZones={(office) => {
          setIsDetailsOpen(false);
          handleOpenZoneManagement(office);
        }}
        onManageDevices={(office) => {
          setIsDetailsOpen(false);
          handleOpenDeviceManagement(office);
        }}
        onManageAvailability={(office) => {
          setIsDetailsOpen(false);
          handleOpenAvailabilityManagement(office);
        }}
      />
    </div>
  );
};

export default OfficeManagement;

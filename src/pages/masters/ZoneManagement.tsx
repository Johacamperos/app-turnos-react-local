
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Label } from "@/components/ui/label";
import { 
  Search, Plus, Pencil, Eye, MoreHorizontal, X, RefreshCcw, Map, Building2
} from "lucide-react";
import ApiService, { Zone, Office } from "@/api/ApiService";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ZoneManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isOfficeManagementOpen, setIsOfficeManagementOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [currentZone, setCurrentZone] = useState<Zone | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState<Zone>({
    name: ""
  });
  const [selectedOfficeIds, setSelectedOfficeIds] = useState<string[]>([]);

  // Fetch zones
  const { data: zones = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['zones'],
    queryFn: ApiService.fetchZones
  });

  // Fetch all offices (mock data for now)
  const { data: allOffices = [] } = useQuery({
    queryKey: ['offices'],
    queryFn: ApiService.fetchOffices
  });

  // Fetch offices for specific zone
  const { data: zoneOffices = [], refetch: refetchZoneOffices } = useQuery({
    queryKey: ['zone-offices', currentZone?.id],
    queryFn: () => currentZone?.id ? ApiService.fetchOfficesByZone(currentZone.id) : Promise.resolve([]),
    enabled: !!currentZone?.id && (isOfficeManagementOpen || isDetailsOpen)
  });

  // Create zone mutation
  const createZoneMutation = useMutation({
    mutationFn: (newZone: Zone) => ApiService.createZone(newZone),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
      toast({
        title: "Zona creada",
        description: "La zona ha sido creada exitosamente",
      });
      setIsOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al crear zona: ${error}`,
        variant: "destructive",
      });
    }
  });

  // Update zone mutation
  const updateZoneMutation = useMutation({
    mutationFn: ({ id, zone }: { id: string, zone: Zone }) => 
      ApiService.updateZone(id, zone),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
      toast({
        title: "Zona actualizada",
        description: "La zona ha sido actualizada exitosamente",
      });
      setIsOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al actualizar zona: ${error}`,
        variant: "destructive",
      });
    }
  });

  // Delete zone mutation
  const deleteZoneMutation = useMutation({
    mutationFn: (id: string) => ApiService.deleteZone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
      toast({
        title: "Zona eliminada",
        description: "La zona ha sido eliminada exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al eliminar zona: ${error}`,
        variant: "destructive",
      });
    }
  });

  // Save office associations mutation
  const saveOfficeAssociationsMutation = useMutation({
    mutationFn: async () => {
      if (!currentZone?.id) return;
      
      // Find offices to add
      const officesToAdd = selectedOfficeIds.filter(
        officeId => !zoneOffices.some(office => office.id === officeId)
      );
      
      // Find offices to remove
      const officesToRemove = zoneOffices
        .filter(office => !selectedOfficeIds.includes(office.id!))
        .map(office => office.id!);
      
      // Process additions
      const addPromises = officesToAdd.map(officeId => 
        ApiService.associateZoneOffice(currentZone.id!, officeId)
      );
      
      // Process removals
      const removePromises = officesToRemove.map(officeId => 
        ApiService.dissociateZoneOffice(currentZone.id!, officeId)
      );
      
      // Wait for all operations to complete
      await Promise.all([...addPromises, ...removePromises]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zone-offices'] });
      toast({
        title: "Oficinas actualizadas",
        description: "Las asociaciones de oficinas han sido actualizadas exitosamente",
      });
      setIsOfficeManagementOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al actualizar asociaciones de oficinas: ${error}`,
        variant: "destructive",
      });
    }
  });

  const itemsPerPage = 10;
  
  // Filter zones based on search term
  const filteredZones = zones.filter(zone => 
    zone.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const maxPage = Math.ceil(filteredZones.length / itemsPerPage);

  // Paginated zones
  const paginatedZones = filteredZones.slice(
    (page - 1) * itemsPerPage, 
    page * itemsPerPage
  );

  const resetForm = () => {
    setFormData({
      name: ""
    });
    setCurrentZone(null);
  };

  const handleOpenDialog = (zone?: Zone) => {
    if (zone) {
      setFormData(zone);
      setCurrentZone(zone);
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
        description: "El nombre de la zona es obligatorio",
        variant: "destructive",
      });
      return;
    }

    if (currentZone?.id) {
      updateZoneMutation.mutate({ 
        id: currentZone.id, 
        zone: formData 
      });
    } else {
      createZoneMutation.mutate(formData);
    }
  };

  const handleViewDetails = (zone: Zone) => {
    setCurrentZone(zone);
    setIsDetailsOpen(true);
  };

  const handleDeleteZone = (zone: Zone) => {
    if (confirm(`¿Está seguro de eliminar la zona "${zone.name}"?`)) {
      deleteZoneMutation.mutate(zone.id!);
    }
  };

  const handleOpenOfficeManagement = (zone: Zone) => {
    setCurrentZone(zone);
    setIsOfficeManagementOpen(true);
    
    // Populate selected offices when opening the dialog
    if (zone.id) {
      ApiService.fetchOfficesByZone(zone.id).then(offices => {
        setSelectedOfficeIds(offices.map(office => office.id!));
      });
    }
  };

  const toggleOfficeSelection = (officeId: string) => {
    setSelectedOfficeIds(prev => 
      prev.includes(officeId)
        ? prev.filter(id => id !== officeId)
        : [...prev, officeId]
    );
  };

  const handleSaveOfficeAssociations = () => {
    saveOfficeAssociationsMutation.mutate();
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
        <h2 className="text-xl">Error al cargar zonas</h2>
        <Button onClick={() => refetch()}>Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-medium tracking-tight">
          Gestión de Zonas
        </h1>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Zona
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
        <div className="relative w-full md:w-auto max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
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
              <TableHead>Oficinas Asociadas</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedZones.length > 0 ? (
              paginatedZones.map((zone) => (
                <TableRow key={zone.id}>
                  <TableCell className="font-medium">{zone.name}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleOpenOfficeManagement(zone)}
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      Gestionar
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
                        <DropdownMenuItem onClick={() => handleViewDetails(zone)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenDialog(zone)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteZone(zone)}
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
                <TableCell colSpan={3} className="h-24 text-center">
                  No se encontraron zonas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {filteredZones.length > 0 && (
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

      {/* Zone Form Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {currentZone ? `Editar Zona: ${currentZone.name}` : "Agregar Nueva Zona"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createZoneMutation.isPending || updateZoneMutation.isPending}>
                {createZoneMutation.isPending || updateZoneMutation.isPending ? (
                  <RefreshCcw className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {currentZone ? "Actualizar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Office Management Dialog */}
      <Dialog open={isOfficeManagementOpen} onOpenChange={setIsOfficeManagementOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {currentZone && `Asociar Oficinas a Zona: ${currentZone.name}`}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-md p-4">
                <h3 className="text-sm font-medium mb-2">Oficinas Disponibles</h3>
                {allOffices.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {allOffices.map(office => (
                      <div 
                        key={office.id}
                        className={`flex items-center p-2 rounded hover:bg-muted cursor-pointer ${
                          selectedOfficeIds.includes(office.id!) ? 'bg-primary/10' : ''
                        }`}
                        onClick={() => toggleOfficeSelection(office.id!)}
                      >
                        <input 
                          type="checkbox" 
                          checked={selectedOfficeIds.includes(office.id!)}
                          readOnly
                          className="mr-2"
                        />
                        <span>{office.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No hay oficinas disponibles.
                  </div>
                )}
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="text-sm font-medium mb-2">Oficinas Seleccionadas</h3>
                {selectedOfficeIds.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {allOffices
                      .filter(office => selectedOfficeIds.includes(office.id!))
                      .map(office => (
                        <div 
                          key={office.id}
                          className="flex items-center justify-between p-2 rounded bg-primary/10"
                        >
                          <span>{office.name}</span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toggleOfficeSelection(office.id!)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No hay oficinas seleccionadas.
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOfficeManagementOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveOfficeAssociations} disabled={saveOfficeAssociationsMutation.isPending}>
              {saveOfficeAssociationsMutation.isPending ? (
                <RefreshCcw className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Guardar Asociaciones
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Zone Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Detalles de la Zona</DialogTitle>
          </DialogHeader>
          {currentZone && (
            <div className="py-4">
              <div className="flex items-center mb-4">
                <Map className="h-8 w-8 mr-3 text-primary" />
                <div>
                  <h3 className="text-lg font-medium">{currentZone.name}</h3>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Oficinas Asociadas</h4>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setIsDetailsOpen(false);
                    handleOpenOfficeManagement(currentZone);
                  }}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Gestionar Oficinas
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Cerrar
            </Button>
            <Button onClick={() => {
              setIsDetailsOpen(false);
              handleOpenDialog(currentZone!);
            }}>
              Editar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ZoneManagement;


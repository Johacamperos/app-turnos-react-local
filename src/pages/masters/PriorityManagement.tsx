import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Label } from "@/components/ui/label";
import { 
  Search, Plus, Pencil, Eye, MoreHorizontal, X, RefreshCcw, Flag, UserCheck
} from "lucide-react";
import ApiService, { Priority } from "@/api/ApiService";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PriorityManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdvisorManagementOpen, setIsAdvisorManagementOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [currentPriority, setCurrentPriority] = useState<Priority | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState<Priority>({
    name: ""
  });
  const [selectedAdvisorIds, setSelectedAdvisorIds] = useState<number[]>([]);

  // Fetch priorities
  const { data: priorities = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['priorities'],
    queryFn: ApiService.fetchPriorities
  });

  // Fetch all advisors (mock data for now)
  const { data: allAdvisors = [] } = useQuery({
    queryKey: ['advisors'],
    queryFn: () => {
      // In a real implementation, this would call a specific API endpoint
      // For now, we'll simulate with a mock response
      return Promise.resolve([
        { id: 1, name: "Juan Pérez", email: "juan@example.com", position: "Senior" },
        { id: 2, name: "Ana Gómez", email: "ana@example.com", position: "Junior" },
        { id: 3, name: "Carlos Ruiz", email: "carlos@example.com", position: "Senior" },
        { id: 4, name: "María López", email: "maria@example.com", position: "Junior" },
        { id: 5, name: "Roberto Santos", email: "roberto@example.com", position: "Senior" }
      ]);
    }
  });

  // Fetch advisors for specific priority
  const { data: priorityAdvisors = [], refetch: refetchPriorityAdvisors } = useQuery({
    queryKey: ['priority-advisors', currentPriority?.id],
    queryFn: () => currentPriority?.id ? ApiService.fetchAdvisorsByPriority(Number(currentPriority.id)) : Promise.resolve([]),
    enabled: !!currentPriority?.id && (isAdvisorManagementOpen || isDetailsOpen)
  });

  // Create priority mutation
  const createPriorityMutation = useMutation({
    mutationFn: (newPriority: Priority) => ApiService.createPriority(newPriority),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priorities'] });
      toast({
        title: "Prioridad creada",
        description: "La prioridad ha sido creada exitosamente",
      });
      setIsOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al crear prioridad: ${error}`,
        variant: "destructive",
      });
    }
  });

  // Update priority mutation
  const updatePriorityMutation = useMutation({
    mutationFn: ({ id, priority }: { id: number, priority: Priority }) => 
      ApiService.updatePriority(id, priority),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priorities'] });
      toast({
        title: "Prioridad actualizada",
        description: "La prioridad ha sido actualizada exitosamente",
      });
      setIsOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al actualizar prioridad: ${error}`,
        variant: "destructive",
      });
    }
  });

  // Delete priority mutation
  const deletePriorityMutation = useMutation({
    mutationFn: (id: number) => ApiService.deletePriority(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priorities'] });
      toast({
        title: "Prioridad eliminada",
        description: "La prioridad ha sido eliminada exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al eliminar prioridad: ${error}`,
        variant: "destructive",
      });
    }
  });

  // Save advisor associations mutation
  const saveAdvisorAssociationsMutation = useMutation({
    mutationFn: async () => {
      if (!currentPriority?.id) return;
      
      // Find advisors to add
      const advisorsToAdd = selectedAdvisorIds.filter(
        advisorId => !priorityAdvisors.some(advisor => advisor.id === advisorId)
      );
      
      // Find advisors to remove
      const advisorsToRemove = priorityAdvisors
        .filter(advisor => !selectedAdvisorIds.includes(advisor.id!))
        .map(advisor => advisor.id!);
      
      // Process additions
      const addPromises = advisorsToAdd.map(advisorId => 
        ApiService.associatePriorityAdvisor(Number(currentPriority.id), advisorId)
      );
      
      // Process removals
      const removePromises = advisorsToRemove.map(advisorId => 
        ApiService.dissociatePriorityAdvisor(Number(currentPriority.id), advisorId)
      );
      
      // Wait for all operations to complete
      await Promise.all([...addPromises, ...removePromises]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priority-advisors'] });
      toast({
        title: "Asesores actualizados",
        description: "Las asociaciones de asesores han sido actualizadas exitosamente",
      });
      setIsAdvisorManagementOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al actualizar asociaciones de asesores: ${error}`,
        variant: "destructive",
      });
    }
  });

  const itemsPerPage = 10;
  
  // Filter priorities based on search term
  const filteredPriorities = priorities.filter(priority => 
    priority.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const maxPage = Math.ceil(filteredPriorities.length / itemsPerPage);

  // Paginated priorities
  const paginatedPriorities = filteredPriorities.slice(
    (page - 1) * itemsPerPage, 
    page * itemsPerPage
  );

  const resetForm = () => {
    setFormData({
      name: ""
    });
    setCurrentPriority(null);
  };

  const handleOpenDialog = (priority?: Priority) => {
    if (priority) {
      setFormData(priority);
      setCurrentPriority(priority);
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
        description: "El nombre de la prioridad es obligatorio",
        variant: "destructive",
      });
      return;
    }

    if (currentPriority?.id) {
      updatePriorityMutation.mutate({ 
        id: Number(currentPriority.id), 
        priority: formData 
      });
    } else {
      createPriorityMutation.mutate(formData);
    }
  };

  const handleViewDetails = (priority: Priority) => {
    setCurrentPriority(priority);
    setIsDetailsOpen(true);
  };

  const handleDeletePriority = (priority: Priority) => {
    if (confirm(`¿Está seguro de eliminar la prioridad "${priority.name}"?`)) {
      deletePriorityMutation.mutate(Number(priority.id!));
    }
  };

  const handleOpenAdvisorManagement = (priority: Priority) => {
    setCurrentPriority(priority);
    setIsAdvisorManagementOpen(true);
    
    // Populate selected advisors when opening the dialog
    if (priority.id) {
      ApiService.fetchAdvisorsByPriority(Number(priority.id)).then(advisors => {
        setSelectedAdvisorIds(advisors.map(advisor => Number(advisor.id!)));
      });
    }
  };

  const toggleAdvisorSelection = (advisorId: number) => {
    setSelectedAdvisorIds(prev => 
      prev.includes(advisorId)
        ? prev.filter(id => id !== advisorId)
        : [...prev, advisorId]
    );
  };

  const handleSaveAdvisorAssociations = () => {
    saveAdvisorAssociationsMutation.mutate();
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
        <h2 className="text-xl">Error al cargar prioridades</h2>
        <Button onClick={() => refetch()}>Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-medium tracking-tight">
          Gestión de Prioridades
        </h1>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Prioridad
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
              <TableHead>Asesores</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPriorities.length > 0 ? (
              paginatedPriorities.map((priority) => (
                <TableRow key={priority.id}>
                  <TableCell className="font-medium">{priority.name}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleOpenAdvisorManagement(priority)}
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
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
                        <DropdownMenuItem onClick={() => handleViewDetails(priority)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenDialog(priority)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeletePriority(priority)}
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
                  No se encontraron prioridades.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {filteredPriorities.length > 0 && (
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

      {/* Priority Form Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {currentPriority ? `Editar Prioridad: ${currentPriority.name}` : "Agregar Nueva Prioridad"}
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
              <Button type="submit" disabled={createPriorityMutation.isPending || updatePriorityMutation.isPending}>
                {createPriorityMutation.isPending || updatePriorityMutation.isPending ? (
                  <RefreshCcw className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {currentPriority ? "Actualizar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Advisor Management Dialog */}
      <Dialog open={isAdvisorManagementOpen} onOpenChange={setIsAdvisorManagementOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {currentPriority && `Asignar Asesores a Prioridad: ${currentPriority.name}`}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-md p-4">
                <h3 className="text-sm font-medium mb-2">Asesores Disponibles</h3>
                {allAdvisors.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {allAdvisors.map(advisor => (
                      <div 
                        key={advisor.id}
                        className={`flex items-center p-2 rounded hover:bg-muted cursor-pointer ${
                          selectedAdvisorIds.includes(advisor.id) ? 'bg-primary/10' : ''
                        }`}
                        onClick={() => toggleAdvisorSelection(advisor.id)}
                      >
                        <input 
                          type="checkbox" 
                          checked={selectedAdvisorIds.includes(advisor.id)}
                          readOnly
                          className="mr-2"
                        />
                        <div>
                          <div>{advisor.name}</div>
                          <div className="text-xs text-muted-foreground">{advisor.position}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No hay asesores disponibles.
                  </div>
                )}
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="text-sm font-medium mb-2">Asesores Seleccionados</h3>
                {selectedAdvisorIds.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {allAdvisors
                      .filter(advisor => selectedAdvisorIds.includes(advisor.id))
                      .map(advisor => (
                        <div 
                          key={advisor.id}
                          className="flex items-center justify-between p-2 rounded bg-primary/10"
                        >
                          <div>
                            <div>{advisor.name}</div>
                            <div className="text-xs text-muted-foreground">{advisor.position}</div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toggleAdvisorSelection(advisor.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No hay asesores seleccionados.
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdvisorManagementOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveAdvisorAssociations} disabled={saveAdvisorAssociationsMutation.isPending}>
              {saveAdvisorAssociationsMutation.isPending ? (
                <RefreshCcw className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Guardar Asociaciones
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Priority Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Detalles de la Prioridad</DialogTitle>
          </DialogHeader>
          {currentPriority && (
            <div className="py-4">
              <div className="flex items-center mb-4">
                <Flag className="h-8 w-8 mr-3 text-primary" />
                <div>
                  <h3 className="text-lg font-medium">{currentPriority.name}</h3>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Asesores Asignados</h4>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setIsDetailsOpen(false);
                    handleOpenAdvisorManagement(currentPriority);
                  }}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Gestionar Asesores
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
              handleOpenDialog(currentPriority!);
            }}>
              Editar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PriorityManagement;

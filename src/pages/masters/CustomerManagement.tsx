
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, Plus, Pencil, Eye, MoreHorizontal, X, RefreshCcw
} from "lucide-react";
import ApiService, { Customer } from "@/api/ApiService";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


const CustomerManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState<Customer>({
    name: "",
    dnt: "",
    dni: "",
    status: "Active"
  });

  // Fetch customers
  const { data: customers = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['customers'],
    queryFn: ApiService.fetchCustomers
  });

  // Create customer mutation
  const createCustomerMutation = useMutation({
    mutationFn: (newCustomer: Customer) => ApiService.createCustomer(newCustomer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: "Cliente creado",
        description: "El cliente ha sido creado exitosamente",
      });
      setIsOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al crear cliente: ${error}`,
        variant: "destructive",
      });
    }
  });

  // Update customer mutation
  const updateCustomerMutation = useMutation({
    mutationFn: ({ id, customer }: { id: number, customer: Customer }) => 
      ApiService.updateCustomer(id, customer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: "Cliente actualizado",
        description: "El cliente ha sido actualizado exitosamente",
      });
      setIsOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al actualizar cliente: ${error}`,
        variant: "destructive",
      });
    }
  });

  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.dni.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.dnt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const itemsPerPage = 10;
  const maxPage = Math.ceil(filteredCustomers.length / itemsPerPage);
  
  // Paginated customers
  const paginatedCustomers = filteredCustomers.slice(
    (page - 1) * itemsPerPage, 
    page * itemsPerPage
  );

  const resetForm = () => {
    setFormData({
      name: "",
      dnt: "",
      dni: "",
      status: "Active"
    });
    setCurrentCustomer(null);
  };

  const handleOpenDialog = (customer?: Customer) => {
    if (customer) {
      setFormData(customer);
      setCurrentCustomer(customer);
    } else {
      resetForm();
    }
    setIsOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value: 'Active' | 'Inactive') => {
    setFormData(prev => ({ ...prev, status: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.name || !formData.dnt || !formData.dni) {
      toast({
        title: "Error de validación",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      });
      return;
    }

    // Check if DNI + DNT combination already exists
    const isDuplicate = customers.some(c => 
      c.dni === formData.dni && 
      c.dnt === formData.dnt && 
      c.id !== currentCustomer?.id
    );

    if (isDuplicate) {
      toast({
        title: "Error de validación",
        description: "Ya existe un cliente con la misma combinación de tipo y número de documento",
        variant: "destructive",
      });
      return;
    }

    // Ensuring status is correctly typed as 'Active' | 'Inactive'
    const customerToSave: Customer = {
      ...formData,
      status: formData.status as 'Active' | 'Inactive'
    };

    if (currentCustomer?.id) {
      updateCustomerMutation.mutate({ 
        id: currentCustomer.id, 
        customer: customerToSave 
      });
    } else {
      createCustomerMutation.mutate(customerToSave);
    }
  };

  const handleViewDetails = (customer: Customer) => {
    setCurrentCustomer(customer);
    setIsDetailsOpen(true);
  };

  const toggleCustomerStatus = (customer: Customer) => {
    const newStatus = customer.status === 'Active' ? 'Inactive' : 'Active';
    const updatedCustomer = { ...customer, status: newStatus };
    
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
        <h2 className="text-xl">Error al cargar clientes</h2>
        <Button onClick={() => refetch()}>Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-medium tracking-tight">
          Gestión de Clientes
        </h1>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Cliente
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
        <div className="relative w-full md:w-auto max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, DNI o tipo de documento..."
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
              <TableHead>Tipo Documento</TableHead>
              <TableHead>Número Documento</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCustomers.length > 0 ? (
              paginatedCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.dnt}</TableCell>
                  <TableCell>{customer.dni}</TableCell>
                  <TableCell>
                    <Badge variant={customer.status === 'Active' ? "default" : "secondary"}>
                      {customer.status === 'Active' ? 'Activo' : 'Inactivo'}
                    </Badge>
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
                        <DropdownMenuItem onClick={() => handleViewDetails(customer)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenDialog(customer)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => toggleCustomerStatus(customer)}
                          className={customer.status === 'Active' ? "text-amber-600" : "text-green-600"}
                        >
                          {customer.status === 'Active' ? 'Desactivar' : 'Activar'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No se encontraron clientes.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {filteredCustomers.length > 0 && (
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

      {/* Customer Form Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {currentCustomer ? `Editar Cliente: ${currentCustomer.name}` : "Agregar Nuevo Cliente"}
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dnt" className="text-right">
                  Tipo Documento
                </Label>
                <Input
                  id="dnt"
                  name="dnt"
                  value={formData.dnt}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dni" className="text-right">
                  Número Documento
                </Label>
                <Input
                  id="dni"
                  name="dni"
                  value={formData.dni}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Estado
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'Active' | 'Inactive') => handleStatusChange(value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Activo</SelectItem>
                    <SelectItem value="Inactive">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createCustomerMutation.isPending || updateCustomerMutation.isPending}>
                {createCustomerMutation.isPending || updateCustomerMutation.isPending ? (
                  <RefreshCcw className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {currentCustomer ? "Actualizar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Customer Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Detalles del Cliente</DialogTitle>
          </DialogHeader>
          {currentCustomer && (
            <div className="py-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-sm font-medium">Nombre:</div>
                <div className="col-span-2">{currentCustomer.name}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div className="text-sm font-medium">Tipo Documento:</div>
                <div className="col-span-2">{currentCustomer.dnt}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div className="text-sm font-medium">Número Documento:</div>
                <div className="col-span-2">{currentCustomer.dni}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div className="text-sm font-medium">Estado:</div>
                <div className="col-span-2">
                  <Badge variant={currentCustomer.status === 'Active' ? "default" : "secondary"}>
                    {currentCustomer.status === 'Active' ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Cerrar
            </Button>
            <Button onClick={() => {
              setIsDetailsOpen(false);
              handleOpenDialog(currentCustomer!);
            }}>
              Editar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerManagement;

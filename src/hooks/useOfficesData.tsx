
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import ApiService, { Office, Zone } from "@/api/ApiService";

export const useOfficesData = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch offices
  const { 
    data: offices = [], 
    isLoading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ['offices'],
    queryFn: () => ApiService.fetchOffices()
  });

  // Create office mutation
  const createOfficeMutation = useMutation({
    mutationFn: (newOffice: Office) => ApiService.createOffice(newOffice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offices'] });
      toast({
        title: "Oficina creada",
        description: "La oficina ha sido creada exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al crear oficina: ${error}`,
        variant: "destructive",
      });
    }
  });

  // Update office mutation
  const updateOfficeMutation = useMutation({
    mutationFn: ({ id, office }: { id: string, office: Office }) => 
      ApiService.updateOffice(id, office),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offices'] });
      toast({
        title: "Oficina actualizada",
        description: "La oficina ha sido actualizada exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al actualizar oficina: ${error}`,
        variant: "destructive",
      });
    }
  });

  // Delete office mutation
  const deleteOfficeMutation = useMutation({
    mutationFn: (id: string) => ApiService.deleteOffice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offices'] });
      toast({
        title: "Oficina eliminada",
        description: "La oficina ha sido eliminada exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al eliminar oficina: ${error}`,
        variant: "destructive",
      });
    }
  });


  // Filter offices based on search term
  const filteredOffices = offices.filter(office => 
    office.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (office.deviceCode && office.deviceCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const maxPage = Math.ceil(filteredOffices.length / itemsPerPage);

  // Paginated offices
  const paginatedOffices = filteredOffices.slice(
    (page - 1) * itemsPerPage, 
    page * itemsPerPage
  );

  return {
    offices,
    paginatedOffices,
    filteredOffices,
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
    deleteOfficeMutation,
    itemsPerPage
  };
};

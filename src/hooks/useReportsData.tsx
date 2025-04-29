
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import ApiService from "@/api/ApiService";

export interface Report {
  id: number;
  title: string;
  date: string;
}

export const useReportsData = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch reports from API
  const { 
    data: reports = [], 
    isLoading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      try {
        // This would be replaced with an actual API call once endpoint is available
        // For now, return sample data to simulate the API
        return [
          { id: 1, title: "Monthly Sales Report", date: "April 2025" },
          { id: 2, title: "Customer Feedback Analysis", date: "March 2025" },
          { id: 3, title: "Appointment Trends", date: "February 2025" },
          { id: 4, title: "Revenue Breakdown", date: "January 2025" },
          { id: 5, title: "Yearly Performance", date: "December 2024" },
          { id: 6, title: "Employee Productivity", date: "November 2024" },
          { id: 7, title: "Marketing Campaign Results", date: "October 2024" },
        ] as Report[];
      } catch (error) {
        toast({
          title: "Error",
          description: `Error fetching reports: ${error}`,
          variant: "destructive",
        });
        return [];
      }
    }
  });

  // Filter reports based on search term
  const filteredReports = reports.filter((report) =>
    report.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginate reports
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return {
    reports,
    filteredReports,
    paginatedReports,
    isLoading,
    isError,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages,
    itemsPerPage,
    refetch,
  };
};

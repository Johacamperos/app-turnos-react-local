
import React from "react";
import { useReportsData } from "@/hooks/useReportsData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

const Reports: React.FC = () => {
  const { t } = useTranslation();
  const {
    paginatedReports,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages,
    isLoading
  } = useReportsData();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to the first page on search
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">{t('reports.title', 'Reports')}</h1>
      <div className="mb-4 flex justify-between items-center">
        <Input
          type="text"
          placeholder={t('reports.searchPlaceholder', 'Search reports...')}
          value={searchTerm}
          onChange={handleSearchChange}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full max-w-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array(5).fill(0).map((_, index) => (
            <div key={index} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-200 px-4 py-2 text-left">{t('reports.id', 'ID')}</th>
              <th className="border border-gray-200 px-4 py-2 text-left">{t('reports.title', 'Title')}</th>
              <th className="border border-gray-200 px-4 py-2 text-left">{t('reports.date', 'Date')}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedReports.length > 0 ? (
              paginatedReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2">{report.id}</td>
                  <td className="border border-gray-200 px-4 py-2">{report.title}</td>
                  <td className="border border-gray-200 px-4 py-2">{report.date}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="border border-gray-200 px-4 py-2 text-center text-gray-500"
                >
                  {t('reports.noReportsFound', 'No reports found.')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      <div className="mt-4 flex justify-between items-center">
        <Button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1 || isLoading}
          className={`px-4 py-2 rounded-lg ${
            currentPage === 1
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-primary text-white hover:bg-primary-dark"
          }`}
        >
          {t('common.previous', 'Previous')}
        </Button>
        <span className="text-gray-600">
          {t('common.pageOf', 'Page {{currentPage}} of {{totalPages}}', { currentPage, totalPages: totalPages || 1 })}
        </span>
        <Button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages || totalPages === 0 || isLoading}
          className={`px-4 py-2 rounded-lg ${
            currentPage === totalPages || totalPages === 0
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-primary text-white hover:bg-primary-dark"
          }`}
        >
          {t('common.next', 'Next')}
        </Button>
      </div>
    </div>
  );
};

export default Reports;

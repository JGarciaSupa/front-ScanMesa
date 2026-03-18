"use client";

import { useEffect, useState } from "react";
import {
  Download,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  getInvoicesAction,
  getInvoiceDetailsAction,
  getInvoiceStatsAction,
} from "@/app/actions/invoices";

import { InvoiceStats } from "@/components/dashboard/invoices/InvoiceStats";
import { InvoiceFilters } from "@/components/dashboard/invoices/InvoiceFilters";
import { InvoiceTable } from "@/components/dashboard/invoices/InvoiceTable";
import { InvoicePagination } from "@/components/dashboard/invoices/InvoicePagination";
import { InvoiceDetails } from "@/components/dashboard/invoices/InvoiceDetails";
import { ReportModal } from "@/components/dashboard/invoices/ReportModal";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [serverStats, setServerStats] = useState({
    totalRecaudado: 0,
    totalVentas: 0,
    ticketPromedio: 0
  });

  const [isReportOpen, setIsReportOpen] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    const [invoicesRes, statsRes] = await Promise.all([
      getInvoicesAction({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm
      }),
      getInvoiceStatsAction({ search: searchTerm })
    ]);
    
    if (invoicesRes.success) {
      setInvoices(invoicesRes.items || []);
      setTotalItems(invoicesRes.total || 0);
    }

    if (statsRes.success) {
      setServerStats(statsRes.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, [currentPage, itemsPerPage]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchInvoices();
      } else {
        setCurrentPage(1); // This will trigger the fetch due to the dependency [currentPage]
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleViewDetails = async (id: number) => {
    const res = await getInvoiceDetailsAction(id);
    if (res.success) {
      setSelectedInvoice(res.data);
      setIsDetailsOpen(true);
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">
          Registro de Ventas
        </h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={fetchInvoices} disabled={loading}>
            {loading ? "Cargando..." : "Actualizar"}
          </Button>
          <Button 
            variant="default" 
            onClick={() => setIsReportOpen(true)}
            disabled={loading}
          >
            <Download className="mr-2 h-4 w-4" />
            Descargar Reporte
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <InvoiceStats stats={serverStats} />

      {/* Filters and Search */}
      <InvoiceFilters 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
      />

      {/* Invoices Table */}
      <InvoiceTable 
        invoices={invoices} 
        loading={loading} 
        onViewDetails={handleViewDetails} 
      />

      {/* Pagination */}
      <InvoicePagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(limit) => {
          setItemsPerPage(limit);
          setCurrentPage(1);
        }}
      />

      {/* Detalle de Factura */}
      <InvoiceDetails 
        isOpen={isDetailsOpen} 
        onClose={setIsDetailsOpen} 
        invoice={selectedInvoice} 
      />

      {/* Modal de Reporte */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={setIsReportOpen}
        searchTerm={searchTerm}
      />
    </div>
  );
}

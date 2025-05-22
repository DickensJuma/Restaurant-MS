import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

// Currency formatter
const formatCurrency = (value) => {
  return `KES ${Number(value).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const exportToExcel = (data, filename) => {
  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Convert data to worksheet
  const ws = XLSX.utils.json_to_sheet(data);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Report");

  // Generate Excel file
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const exportToPDF = (data, columns, filename, reportType) => {
  try {
    // Create new PDF document
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(16);
    const title = `${
      reportType.charAt(0).toUpperCase() + reportType.slice(1)
    } Report`;
    doc.text(title, 14, 15);

    // Add date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);

    // Process data for table
    const tableData = data.map((row) => {
      return columns.map((col) => {
        const value = row[col.dataIndex];
        // Handle different data types
        if (typeof value === "number") {
          // Check if the column is a currency column
          if (
            col.title.toLowerCase().includes("sales") ||
            col.title.toLowerCase().includes("amount") ||
            col.title.toLowerCase().includes("spent") ||
            col.title.toLowerCase().includes("revenue")
          ) {
            return formatCurrency(value);
          }
          return value.toFixed(2);
        }
        if (value instanceof Date) {
          return value.toLocaleDateString();
        }
        return value || "";
      });
    });

    // Add table
    doc.autoTable({
      head: [columns.map((col) => col.title)],
      body: tableData,
      startY: 35,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
      },
      margin: { top: 35 },
    });

    // Add summary if available
    if (data.summary) {
      const finalY = doc.lastAutoTable.finalY || 35;
      doc.setFontSize(12);
      doc.text("Summary", 14, finalY + 15);

      // Add summary data
      Object.entries(data.summary).forEach(([key, value], index) => {
        const formattedKey = key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase());
        let formattedValue = value;

        // Format currency values
        if (
          typeof value === "number" &&
          (key.toLowerCase().includes("sales") ||
            key.toLowerCase().includes("amount") ||
            key.toLowerCase().includes("spent") ||
            key.toLowerCase().includes("revenue"))
        ) {
          formattedValue = formatCurrency(value);
        } else if (typeof value === "number") {
          formattedValue = value.toFixed(2);
        }

        doc.setFontSize(10);
        doc.text(
          `${formattedKey}: ${formattedValue}`,
          14,
          finalY + 25 + index * 10
        );
      });
    }

    // Save PDF
    doc.save(`${filename}.pdf`);
  } catch (error) {
    console.error("PDF Export Error:", error);
    throw new Error("Failed to generate PDF: " + error.message);
  }
};

export const formatReportData = (reportData, reportType) => {
  try {
    switch (reportType) {
      case "sales":
        return {
          data: reportData.tableData.map((row) => ({
            ...row,
            sales: formatCurrency(row.sales.replace(/[^0-9.-]+/g, "")),
          })),
          columns: reportData.columns,
          summary: {
            ...reportData.summary,
            totalSales: formatCurrency(reportData.summary.totalSales),
            averageOrderValue: formatCurrency(
              reportData.summary.averageOrderValue
            ),
          },
        };
      case "customer-analytics":
        return {
          data: reportData.tableData.map((row) => ({
            ...row,
            totalSpent: formatCurrency(row.totalSpent),
          })),
          columns: reportData.columns,
          summary: {
            ...reportData.summary,
            averageOrderValue: formatCurrency(
              reportData.summary.averageOrderValue
            ),
          },
          segments: reportData.customerSegments,
        };
      case "peak-hours":
        return {
          data: reportData.tableData,
          columns: reportData.columns,
          summary: reportData.summary,
        };
      default:
        return {
          data: reportData.tableData,
          columns: reportData.columns,
        };
    }
  } catch (error) {
    console.error("Data Formatting Error:", error);
    throw new Error("Failed to format report data: " + error.message);
  }
};

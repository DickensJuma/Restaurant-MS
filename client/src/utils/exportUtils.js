import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

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
        const value = row[col.key];
        // Handle different data types
        if (typeof value === "number") {
          // Check if the column is a currency column
          if (
            col.header.toLowerCase().includes("sales") ||
            col.header.toLowerCase().includes("amount") ||
            col.header.toLowerCase().includes("spent") ||
            col.header.toLowerCase().includes("revenue")
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

    // Add table using autoTable
    autoTable(doc, {
      head: [columns.map((col) => col.header)],
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

export const formatReportData = (data, reportType) => {
  try {
    let formattedData = [];
    let columns = [];

    switch (reportType) {
      case "sales":
        formattedData = data.tableData.map((row) => ({
          Date: row.date,
          Sales:
            typeof row.sales === "number"
              ? `KES ${row.sales.toFixed(2)}`
              : row.sales,
          Orders: row.orders,
        }));
        columns = [
          { header: "Date", key: "Date", width: 15 },
          { header: "Sales", key: "Sales", width: 15 },
          { header: "Orders", key: "Orders", width: 10 },
        ];
        break;

      case "customer-analytics":
        formattedData = data.tableData.map((row) => ({
          "Customer ID": row.customerId,
          Orders: row.orders,
          "Total Spent":
            typeof row.totalSpent === "number"
              ? `KES ${row.totalSpent.toFixed(2)}`
              : row.totalSpent,
          "Last Visit": new Date(row.lastVisit).toLocaleDateString(),
        }));
        columns = [
          { header: "Customer ID", key: "Customer ID", width: 15 },
          { header: "Orders", key: "Orders", width: 10 },
          { header: "Total Spent", key: "Total Spent", width: 15 },
          { header: "Last Visit", key: "Last Visit", width: 15 },
        ];
        break;

      case "peak-hours":
        formattedData = data.tableData.map((row) => ({
          Hour: row.hour,
          Orders: row.orders,
          Percentage: row.percentage,
        }));
        columns = [
          { header: "Hour", key: "Hour", width: 10 },
          { header: "Orders", key: "Orders", width: 10 },
          { header: "Percentage", key: "Percentage", width: 10 },
        ];
        break;

      default:
        throw new Error("Invalid report type");
    }

    return {
      data: formattedData,
      columns: columns,
    };
  } catch (error) {
    console.error("Error formatting report data:", error);
    throw new Error(`Failed to format report data: ${error.message}`);
  }
};

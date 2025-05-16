// exportHandler.js
"use strict";
import { DependencyLoader } from './dependencyLoader.js';
import { getNestedValue } from './utils.js';

export class ExportHandler {
    constructor(stateManager, configManager) {
        this.state = stateManager;
        this.config = configManager;
    }

    _getExportableData() {
        // Use processedData to get data that reflects current search and filters, but not pagination
        const dataToExport = this.state.get('processedData');
        const columns = this.config.get('columns');
        const exportableColumns = columns.filter(column =>
            column.exportable !== false &&
            (!this.config.get('export.excludeActionColumns') || !column.actionable)
        );
        return { dataToExport, exportableColumns };
    }

    copyToClipboard() {
        const { dataToExport, exportableColumns } = this._getExportableData();
        const headers = exportableColumns.map(col => col.name);
        const rows = dataToExport.map(row =>
            exportableColumns.map(col => getNestedValue(row, col.field, this.config.get('display.nullValue')))
        );

        const text = [headers, ...rows].map(row => row.join("\t")).join("\n");

        navigator.clipboard.writeText(text)
            .then(() => alert("Table data copied to clipboard")) // Consider a less intrusive notification
            .catch(err => console.error("Failed to copy to clipboard:", err));
    }

    exportCSV() {
        const { dataToExport, exportableColumns } = this._getExportableData();
        const filename = this.config.get('export.csvOptions.filename') || 'export.csv';

        const headers = exportableColumns.map(col => `"${col.name}"`);
        const rows = dataToExport.map(row =>
            exportableColumns.map(col => {
                const value = getNestedValue(row, col.field, this.config.get('display.nullValue'));
                return `"${String(value ?? '').replace(/"/g, '""')}"`; // Ensure null/undefined are empty strings, escape quotes
            })
        );

        const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

        if (navigator.msSaveBlob) { // For IE
            navigator.msSaveBlob(blob, filename);
        } else {
            const link = document.createElement("a");
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", filename);
                link.style.visibility = "hidden";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }
        }
    }

    async exportPDF() {
        const pdfOptions = this.config.get('export.pdfOptions');
        const filename = pdfOptions.filename || 'table-export.pdf';

        try {
            await DependencyLoader.loadJSPDFDependencies();
            if (!window.jspdf || !window.jspdf.jsPDF || (typeof window.jspdf.jsPDF !== 'function' && !window.jspdf.default)) { // Check for jsPDF v2 vs v3+
                throw new Error('jsPDF or jsPDF.jsPDF is not a constructor or not loaded correctly.');
            }
            // jsPDF v3 changed how it's accessed. jsPDF v2 is window.jspdf, v3 is window.jspdf.jsPDF
            const jsPDF = typeof window.jspdf.jsPDF === 'function' ? window.jspdf.jsPDF : window.jspdf;


            const { dataToExport, exportableColumns } = this._getExportableData();
            const headers = exportableColumns.map(col => col.name);
            const body = dataToExport.map(row =>
                exportableColumns.map(col => getNestedValue(row, col.field, this.config.get('display.nullValue')))
            );

            const doc = new jsPDF(pdfOptions); // Pass orientation, unit, format

            // Your autoTable styling logic from the original DataTable.js
            const margin = 40;
            const usableWidth = doc.internal.pageSize.getWidth() - (margin * 2);
            const columnWidths = headers.map((header, index) => {
                const maxContentLength = Math.max(
                    String(header).length,
                    ...body.map(row => String(row[index] ?? '').length)
                );
                return Math.max(40, maxContentLength * 5.5); // Adjust multiplier as needed
            });
            const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);
            const scaleFactor = Math.min(1, usableWidth / totalWidth);
            const adjustedColumnWidths = columnWidths.map(width => width * scaleFactor);

            doc.autoTable({
                head: [headers],
                body: body,
                startY: margin,
                margin: { top: margin, right: margin, bottom: margin, left: margin },
                headStyles: { fillColor: [248, 250, 252], textColor: [30, 41, 59], fontSize: 9, fontStyle: 'bold', cellPadding: 4 },
                bodyStyles: { textColor: [51, 65, 85], fontSize: 8, cellPadding: 4 },
                alternateRowStyles: { fillColor: [248, 250, 252] },
                styles: { overflow: 'linebreak', font: 'helvetica', fontSize: 8, cellPadding: 4, lineColor: [228, 228, 228], lineWidth: 0.5 },
                columnStyles: adjustedColumnWidths.reduce((acc, width, index) => {
                    acc[index] = { cellWidth: width, halign: (typeof body[0]?.[index] === 'number' && body[0]?.[index] !== null) ? 'right' : 'left' };
                    return acc;
                }, {}),
                didDrawPage: function(data) {
                    doc.setFontSize(8);
                    doc.setTextColor(128, 128, 128);
                    doc.text(
                        `Page ${data.pageNumber} of ${doc.internal.getNumberOfPages()}`, // Use getNumberOfPages() for total
                        data.settings.margin.left,
                        doc.internal.pageSize.getHeight() - (margin / 2)
                    );
                }
            });

            doc.save(filename);

        } catch (error) {
            console.error("Failed to export PDF:", error);
            alert("Failed to export PDF. Check console for details."); // Or a less intrusive error
        }
    }
}
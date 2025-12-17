import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

/**
 * Export service for generating CSV and PDF reports
 */
export const exportService = {
    /**
     * Export items to CSV file
     */
    exportToCSV: (items, filename = 'lost-and-found-report') => {
        const headers = ['Name', 'Description', 'Category', 'Status', 'Date Found', 'Location Found', 'Claim Location'];

        const csvContent = [
            headers.join(','),
            ...items.map(item => [
                `"${(item.name || '').replace(/"/g, '""')}"`,
                `"${(item.description || '').replace(/"/g, '""')}"`,
                `"${item.category || ''}"`,
                `"${item.status || ''}"`,
                `"${item.dateFound ? format(new Date(item.dateFound), 'MMM d, yyyy') : ''}"`,
                `"${(item.locationFound || '').replace(/"/g, '""')}"`,
                `"${item.claimLocation || ''}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    /**
     * Export items to PDF file
     */
    exportToPDF: (items, filename = 'lost-and-found-report') => {
        const doc = new jsPDF();

        // Title
        doc.setFontSize(20);
        doc.setTextColor(30, 64, 175); // Blue color
        doc.text('Adamson University', 14, 20);
        doc.setFontSize(16);
        doc.setTextColor(51, 65, 85); // Slate color
        doc.text('Lost & Found Report', 14, 28);

        // Date
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(`Generated: ${format(new Date(), 'MMMM d, yyyy h:mm a')}`, 14, 36);
        doc.text(`Total Items: ${items.length}`, 14, 42);

        // Summary stats
        const unclaimed = items.filter(i => i.status === 'Unclaimed').length;
        const claimed = items.filter(i => i.status === 'Claimed').length;
        doc.text(`Unclaimed: ${unclaimed} | Claimed: ${claimed}`, 14, 48);

        // Table
        const tableData = items.map(item => [
            item.name || '',
            item.category || '-',
            item.status || '',
            item.dateFound ? format(new Date(item.dateFound), 'MMM d, yyyy') : '',
            item.locationFound || ''
        ]);

        doc.autoTable({
            startY: 55,
            head: [['Item Name', 'Category', 'Status', 'Date Found', 'Location']],
            body: tableData,
            headStyles: {
                fillColor: [30, 64, 175],
                textColor: 255,
                fontStyle: 'bold',
                fontSize: 9
            },
            bodyStyles: {
                fontSize: 8,
                textColor: [51, 65, 85]
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252]
            },
            columnStyles: {
                0: { cellWidth: 40 },
                1: { cellWidth: 25 },
                2: { cellWidth: 22 },
                3: { cellWidth: 28 },
                4: { cellWidth: 45 }
            },
            margin: { left: 14, right: 14 },
            didDrawCell: (data) => {
                // Color the status cell
                if (data.column.index === 2 && data.section === 'body') {
                    const status = data.cell.raw;
                    if (status === 'Claimed') {
                        doc.setTextColor(16, 185, 129); // Green
                    } else if (status === 'Unclaimed') {
                        doc.setTextColor(245, 158, 11); // Amber
                    }
                }
            }
        });

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184);
            doc.text(
                `Page ${i} of ${pageCount}`,
                doc.internal.pageSize.width / 2,
                doc.internal.pageSize.height - 10,
                { align: 'center' }
            );
        }

        doc.save(`${filename}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    }
};

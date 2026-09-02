// jsPDF and html2canvas are large libraries only needed when a user actually
// clicks "Save PDF" — importing them dynamically (below) keeps them out of
// the initial page bundle entirely.

export interface PDFExportOptions {
  filename?: string;
  title?: string;
  orientation?: 'portrait' | 'landscape';
  includeDate?: boolean;
  userEmail?: string;
  calculationType?: string;
}

/**
 * Export calculation results as PDF
 * Uses html2canvas to capture HTML element and jsPDF to generate PDF
 */
export async function exportToPDF(
  elementId: string,
  options: PDFExportOptions = {}
): Promise<void> {
  const {
    filename = 'tax-calculation.pdf',
    title = 'Tax Calculation Report',
    orientation = 'portrait',
    includeDate = true,
    userEmail = '',
    calculationType = '',
  } = options;

  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    // Loaded on demand so these two libraries never ship in the initial page bundle.
    const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
      import('jspdf'),
      import('html2canvas'),
    ]);

    // Capture the element as a canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // Create PDF
    const pageWidth = orientation === 'portrait' ? 210 : 297; // mm
    const pageHeight = orientation === 'landscape' ? 210 : 297; // mm
    const imgWidth = orientation === 'portrait' ? 190 : 280; // mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: [pageWidth, pageHeight],
    });

    // Add header
    let yPosition = 15;
    pdf.setFontSize(16);
    pdf.setTextColor(1, 65, 28); // Dark green color
    pdf.text(title, pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 10;

    // Add metadata
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    if (calculationType) {
      pdf.text(`Calculator: ${calculationType}`, 15, yPosition);
      yPosition += 5;
    }
    if (includeDate) {
      const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      pdf.text(`Generated: ${date}`, 15, yPosition);
      yPosition += 5;
    }
    if (userEmail) {
      pdf.text(`User: ${userEmail}`, 15, yPosition);
      yPosition += 5;
    }

    yPosition += 5;

    // Add the captured content
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 15, yPosition, imgWidth, imgHeight);

    // Add footer
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(9);
      pdf.setTextColor(150, 150, 150);
      pdf.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 8,
        { align: 'center' }
      );
      pdf.text(
        'Pakistan Tax Calculator - www.paktaxcalculator.com',
        pageWidth / 2,
        pageHeight - 4,
        { align: 'center' }
      );
    }

    // Download the PDF
    pdf.save(filename);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error(`Failed to export PDF: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Export calculation data as JSON
 */
export function exportToJSON(data: unknown, filename: string = 'calculation.json'): void {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to JSON:', error);
    throw new Error(`Failed to export JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Export calculation data as CSV
 */
export function exportToCSV(
  data: Array<{ [key: string]: string | number }>,
  filename: string = 'calculation.csv'
): void {
  try {
    if (data.length === 0) {
      throw new Error('No data to export');
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers
          .map(header => {
            const value = row[header];
            // Escape values containing commas or quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw new Error(`Failed to export CSV: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Print calculation results
 */
export function printCalculation(elementId: string, title: string = 'Tax Calculation'): void {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    const printWindow = window.open('', '', 'height=auto,width=auto');
    if (!printWindow) {
      throw new Error('Failed to open print window');
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #01411C; border-bottom: 2px solid #0a6b34; padding-bottom: 10px; }
            .calculation-result { margin: 20px 0; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #0a6b34; color: white; }
            tr:nth-child(even) { background-color: #f2f2f2; }
            .footer { margin-top: 40px; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div class="calculation-result">
            ${element.innerHTML}
          </div>
          <div class="footer">
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <p>Pakistan Tax Calculator - https://www.paktaxcalculator.com</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  } catch (error) {
    console.error('Error printing calculation:', error);
    alert(`Failed to print: ${error instanceof Error ? error.message : String(error)}`);
  }
}

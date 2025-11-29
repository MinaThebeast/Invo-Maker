import { jsPDF } from 'jspdf';
import { Invoice, Business, Customer } from '../types';

/**
 * Generate PDF for an invoice
 */
export async function generateInvoicePDF(
  invoice: Invoice,
  business: Business | null,
  customer: Customer | null
): Promise<Blob> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPos = margin;

  // Helper function to add text with word wrap (unused)
  // const addText = (text: string, x: number, y: number, maxWidth?: number, fontSize = 10) => {
  //   doc.setFontSize(fontSize);
  //   if (maxWidth) {
  //     const lines = doc.splitTextToSize(text, maxWidth);
  //     doc.text(lines, x, y);
  //     return lines.length * (fontSize * 0.4);
  //   } else {
  //     doc.text(text, x, y);
  //     return fontSize * 0.4;
  //   }
  // };

  // Header - Business Info
  if (business) {
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(business.name, margin, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const businessInfo: string[] = [];
    if (business.address) businessInfo.push(business.address);
    if (business.city) businessInfo.push(business.city);
    if (business.state) businessInfo.push(business.state);
    if (business.zip_code) businessInfo.push(business.zip_code);
    if (business.phone) businessInfo.push(`Phone: ${business.phone}`);
    if (business.email) businessInfo.push(`Email: ${business.email}`);
    if (business.website) businessInfo.push(`Website: ${business.website}`);

    businessInfo.forEach((line) => {
      if (line) {
        doc.text(line, margin, yPos);
        yPos += 5;
      }
    });
  }

  yPos += 10;

  // Invoice Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', margin, yPos);
  yPos += 10;

  // Invoice Number and Dates
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice #: ${invoice.invoice_number}`, margin, yPos);
  doc.text(
    `Date: ${new Date(invoice.issue_date).toLocaleDateString()}`,
    pageWidth - margin - 50,
    yPos
  );
  yPos += 5;
  doc.text(
    `Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`,
    pageWidth - margin - 50,
    yPos
  );
  yPos += 10;

  // Customer Info
  if (customer) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', margin, yPos);
    yPos += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(customer.name, margin, yPos);
    yPos += 5;

    const customerInfo: string[] = [];
    if (customer.company) customerInfo.push(customer.company);
    if (customer.address) customerInfo.push(customer.address);
    if (customer.city) customerInfo.push(customer.city);
    if (customer.state) customerInfo.push(customer.state);
    if (customer.zip_code) customerInfo.push(customer.zip_code);
    if (customer.email) customerInfo.push(`Email: ${customer.email}`);
    if (customer.phone) customerInfo.push(`Phone: ${customer.phone}`);

    customerInfo.forEach((line) => {
      if (line) {
        doc.text(line, margin, yPos);
        yPos += 5;
      }
    });
  }

  yPos += 10;

  // Items Table
  // const tableTop = yPos; // Unused
  const colWidths = {
    item: contentWidth * 0.4,
    qty: contentWidth * 0.15,
    price: contentWidth * 0.2,
    total: contentWidth * 0.25,
  };

  // Table Header
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Item', margin, yPos);
  doc.text('Qty', margin + colWidths.item, yPos);
  doc.text('Price', margin + colWidths.item + colWidths.qty, yPos);
  doc.text('Total', margin + colWidths.item + colWidths.qty + colWidths.price, yPos);
  yPos += 7;

  // Table Line
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 5;

  // Table Rows
  doc.setFont('helvetica', 'normal');
  if (invoice.items && invoice.items.length > 0) {
    invoice.items.forEach((item) => {
      // Check if we need a new page
      if (yPos > doc.internal.pageSize.getHeight() - 60) {
        doc.addPage();
        yPos = margin;
      }

      const itemName = item.name.length > 40 ? item.name.substring(0, 37) + '...' : item.name;
      doc.text(itemName, margin, yPos);
      doc.text(item.quantity.toString(), margin + colWidths.item, yPos);
      doc.text(`$${item.unit_price.toFixed(2)}`, margin + colWidths.item + colWidths.qty, yPos);
      doc.text(`$${item.line_total.toFixed(2)}`, margin + colWidths.item + colWidths.qty + colWidths.price, yPos);
      yPos += 6;
    });
  }

  yPos += 5;
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // Totals
  const totalsX = margin + colWidths.item + colWidths.qty;
  doc.text('Subtotal:', totalsX, yPos);
  doc.text(`$${invoice.subtotal.toFixed(2)}`, pageWidth - margin - colWidths.total, yPos, {
    align: 'right',
  });
  yPos += 6;

  if (invoice.tax_total > 0) {
    doc.text('Tax:', totalsX, yPos);
    doc.text(`$${invoice.tax_total.toFixed(2)}`, pageWidth - margin - colWidths.total, yPos, {
      align: 'right',
    });
    yPos += 6;
  }

  if (invoice.discount_total > 0) {
    doc.text('Discount:', totalsX, yPos);
    doc.text(`-$${invoice.discount_total.toFixed(2)}`, pageWidth - margin - colWidths.total, yPos, {
      align: 'right',
    });
    yPos += 6;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total:', totalsX, yPos);
  doc.text(`$${invoice.total.toFixed(2)}`, pageWidth - margin - colWidths.total, yPos, {
    align: 'right',
  });
  yPos += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  if (invoice.paid_amount > 0) {
    doc.text('Paid:', totalsX, yPos);
    doc.text(`$${invoice.paid_amount.toFixed(2)}`, pageWidth - margin - colWidths.total, yPos, {
      align: 'right',
    });
    yPos += 6;
  }

  if (invoice.balance > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('Balance Due:', totalsX, yPos);
    doc.text(`$${invoice.balance.toFixed(2)}`, pageWidth - margin - colWidths.total, yPos, {
      align: 'right',
    });
  }

  yPos += 15;

  // Notes and Terms
  if (invoice.notes) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', margin, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    const notesLines = doc.splitTextToSize(invoice.notes, contentWidth);
    notesLines.forEach((line: string) => {
      if (yPos > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(line, margin, yPos);
      yPos += 5;
    });
    yPos += 5;
  }

  if (invoice.terms) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Terms:', margin, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    const termsLines = doc.splitTextToSize(invoice.terms, contentWidth);
    termsLines.forEach((line: string) => {
      if (yPos > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(line, margin, yPos);
      yPos += 5;
    });
  }

  // Generate blob
  const pdfBlob = doc.output('blob');
  return pdfBlob;
}

/**
 * Download invoice as PDF
 */
export async function downloadInvoicePDF(
  invoice: Invoice,
  business: Business | null,
  customer: Customer | null
): Promise<void> {
  const pdfBlob = await generateInvoicePDF(invoice, business, customer);
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Invoice-${invoice.invoice_number}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}


const PDFDocument = require('pdfkit');

// Safe number formatter – never crashes on undefined/null
const fmt = (val) => {
  const n = Number(val);
  if (isNaN(n)) return '0';
  return n.toLocaleString('en-IN');
};

const fmtCurrency = (val) => `Rs. ${fmt(val)}`;

class InvoiceService {
  generateInvoicePdf(order) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 0 });
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        const W = 595.28; // A4 width in points
        const MARGIN = 45;
        const COL_RIGHT = W - MARGIN;

        // ── Brand Colors ──────────────────────────────────────────────
        const BROWN = '#6b3f1f';
        const BROWN_LIGHT = '#a0603a';
        const DARK = '#1a1a2e';
        const GRAY = '#6b7280';
        const LIGHT_GRAY = '#f3f4f6';
        const WHITE = '#ffffff';
        const LINE = '#e2e8f0';
        const GREEN = '#16a34a';

        // ── Header Background Band ────────────────────────────────────
        doc.rect(0, 0, W, 110).fill(DARK);

        // Company Name
        doc.fillColor(WHITE)
           .fontSize(20)
           .font('Helvetica-Bold')
           .text('MAHAVEER', MARGIN, 28);

        doc.fillColor(BROWN_LIGHT)
           .fontSize(9)
           .font('Helvetica')
           .text('SMART FURNITURE HUB', MARGIN, 52);

        doc.fillColor('#9ca3af')
           .fontSize(7.5)
           .text('Premium Home & Office Furniture | Bangalore, Karnataka', MARGIN, 64)
           .text('Email: support@mahaveerfurniture.in  |  Phone: +91 80 4567 8900', MARGIN, 74);

        // INVOICE badge on the right
        doc.fillColor(BROWN_LIGHT)
           .fontSize(26)
           .font('Helvetica-Bold')
           .text('INVOICE', 0, 30, { align: 'right', width: W - MARGIN });

        doc.fillColor('#9ca3af')
           .fontSize(8)
           .font('Helvetica')
           .text(`#${order.invoiceNumber || 'N/A'}`, 0, 62, { align: 'right', width: W - MARGIN })
           .text(`Order: ${order.orderId || 'N/A'}`, 0, 74, { align: 'right', width: W - MARGIN })
           .text(`Date: ${order.date || new Date().toLocaleDateString('en-IN')}`, 0, 86, { align: 'right', width: W - MARGIN });

        // ── Status pill ───────────────────────────────────────────────
        const statusColors = {
          'Delivered':    ['#d1fae5', GREEN],
          'Cancelled':    ['#fee2e2', '#dc2626'],
          'Pending':      ['#fef3c7', '#d97706'],
          'Shipped':      ['#dbeafe', '#2563eb'],
          'Processing':   ['#ede9fe', '#7c3aed'],
          default:        ['#f3f4f6', '#374151'],
        };
        const [statusBg, statusFg] = statusColors[order.status] || statusColors.default;
        const statusText = (order.status || 'Pending').toUpperCase();

        doc.roundedRect(MARGIN, 120, 95, 20, 4).fill(statusBg);
        doc.fillColor(statusFg)
           .fontSize(8)
           .font('Helvetica-Bold')
           .text(statusText, MARGIN, 127, { width: 95, align: 'center' });

        // Payment badge
        const paid = (order.paymentStatus || '').toLowerCase() === 'paid';
        doc.roundedRect(MARGIN + 105, 120, 70, 20, 4).fill(paid ? '#d1fae5' : '#fef3c7');
        doc.fillColor(paid ? GREEN : '#d97706')
           .fontSize(8)
           .font('Helvetica-Bold')
           .text(paid ? 'PAID' : (order.paymentStatus || 'PENDING').toUpperCase(), MARGIN + 105, 127, { width: 70, align: 'center' });

        // Payment method badge
        doc.roundedRect(MARGIN + 185, 120, 100, 20, 4).fill('#eff6ff');
        doc.fillColor('#2563eb')
           .fontSize(8)
           .font('Helvetica-Bold')
           .text(order.paymentMethod || 'COD', MARGIN + 185, 127, { width: 100, align: 'center' });

        // ── Customer & Shipping two-column block ──────────────────────
        let y = 155;

        // Box backgrounds
        doc.roundedRect(MARGIN, y, 235, 90, 6).fill(LIGHT_GRAY);
        doc.roundedRect(MARGIN + 255, y, 250, 90, 6).fill(LIGHT_GRAY);

        // Billed To
        doc.fillColor(BROWN)
           .fontSize(9)
           .font('Helvetica-Bold')
           .text('BILLED TO', MARGIN + 12, y + 10);

        doc.fillColor(DARK)
           .fontSize(9)
           .font('Helvetica-Bold')
           .text(order.customerName || 'Customer', MARGIN + 12, y + 25);

        doc.fillColor(GRAY)
           .fontSize(8)
           .font('Helvetica')
           .text(order.email || '', MARGIN + 12, y + 40)
           .text(order.phone || '', MARGIN + 12, y + 53);

        // Shipping Address
        doc.fillColor(BROWN)
           .fontSize(9)
           .font('Helvetica-Bold')
           .text('SHIPPING ADDRESS', MARGIN + 267, y + 10);

        const addr = order.shippingAddress || {};
        doc.fillColor(DARK)
           .fontSize(9)
           .font('Helvetica-Bold')
           .text(addr.name || order.customerName || '', MARGIN + 267, y + 25);

        doc.fillColor(GRAY)
           .fontSize(8)
           .font('Helvetica')
           .text(addr.street || 'N/A', MARGIN + 267, y + 40)
           .text([addr.city, addr.state].filter(Boolean).join(', '), MARGIN + 267, y + 53)
           .text(addr.pincode ? `PIN: ${addr.pincode}` : '', MARGIN + 267, y + 66);

        // ── Items Table ───────────────────────────────────────────────
        y += 105;

        // Table header row
        doc.rect(MARGIN, y, COL_RIGHT - MARGIN, 22).fill(DARK);

        const COL = {
          desc:     MARGIN + 8,
          qty:      MARGIN + 270,
          price:    MARGIN + 320,
          disc:     MARGIN + 385,
          total:    MARGIN + 450,
        };

        doc.fillColor(WHITE)
           .fontSize(8)
           .font('Helvetica-Bold');

        doc.text('ITEM DESCRIPTION', COL.desc, y + 7)
           .text('QTY', COL.qty, y + 7)
           .text('UNIT PRICE', COL.price, y + 7)
           .text('DISCOUNT', COL.disc, y + 7)
           .text('AMOUNT', COL.total, y + 7);

        y += 22;

        const items = Array.isArray(order.items) ? order.items : [];
        let rowAlt = false;

        items.forEach((item) => {
          const itemPrice    = Number(item.price)    || 0;
          const itemDiscount = Number(item.discount)  || 0;
          const itemQty      = Number(item.qty)       || 1;
          const itemTotal    = (itemPrice - itemDiscount) * itemQty;

          const rowH = 22;
          if (rowAlt) {
            doc.rect(MARGIN, y, COL_RIGHT - MARGIN, rowH).fill('#faf7f5');
          }
          rowAlt = !rowAlt;

          doc.fillColor(DARK)
             .fontSize(8.5)
             .font('Helvetica')
             .text(item.name || 'Product', COL.desc, y + 6, { width: 250, ellipsis: true })
             .text(itemQty.toString(), COL.qty, y + 6)
             .text(fmtCurrency(itemPrice), COL.price, y + 6)
             .text(itemDiscount > 0 ? `-${fmtCurrency(itemDiscount)}` : '—', COL.disc, y + 6)
             .text(fmtCurrency(itemTotal), COL.total, y + 6);

          y += rowH;
        });

        // Bottom table border
        doc.moveTo(MARGIN, y).lineTo(COL_RIGHT, y).lineWidth(0.5).strokeColor(LINE).stroke();

        // ── Totals Block ──────────────────────────────────────────────
        y += 14;

        const subtotal       = Number(order.subtotal)       || 0;
        const discount       = Number(order.discount)       || 0;
        const gst            = Number(order.gst)            || 0;
        const deliveryCharge = Number(order.deliveryCharge) || 0;
        const total          = Number(order.total)          || 0;

        const totalsX = 360;
        const totalsLabelW = 120;
        const totalsValX = 490;

        const drawTotalRow = (label, value, bold = false, color = DARK) => {
          if (bold) {
            doc.roundedRect(MARGIN, y - 4, COL_RIGHT - MARGIN, 24, 4).fill('#1a1a2e');
            doc.fillColor(WHITE)
               .fontSize(11)
               .font('Helvetica-Bold')
               .text(label, totalsX, y, { width: totalsLabelW })
               .text(value, totalsValX, y);
            y += 28;
          } else {
            doc.fillColor(color)
               .fontSize(9)
               .font('Helvetica')
               .text(label, totalsX, y, { width: totalsLabelW })
               .text(value, totalsValX, y);
            y += 18;
          }
        };

        drawTotalRow('Subtotal:', fmtCurrency(subtotal));

        if (discount > 0) {
          drawTotalRow(
            `Coupon Discount${order.coupon ? ` (${order.coupon})` : ''}:`,
            `-${fmtCurrency(discount)}`,
            false,
            GREEN
          );
        }

        drawTotalRow('GST (18%):', fmtCurrency(gst));
        drawTotalRow(
          'Delivery:',
          deliveryCharge === 0 ? 'FREE' : fmtCurrency(deliveryCharge)
        );

        y += 6;
        drawTotalRow('GRAND TOTAL', fmtCurrency(total), true);

        // ── Notes / Order Notes ───────────────────────────────────────
        if (order.orderNotes) {
          y += 20;
          doc.fillColor(GRAY)
             .fontSize(8)
             .font('Helvetica-Bold')
             .text('ORDER NOTES:', MARGIN, y);
          doc.font('Helvetica')
             .text(order.orderNotes, MARGIN, y + 12, { width: 350 });
          y += 30;
        }

        // ── Footer ────────────────────────────────────────────────────
        const PAGE_H = 841.89; // A4 height in points
        const footerY = PAGE_H - 55;

        doc.rect(0, footerY - 10, W, 65).fill(DARK);

        doc.fillColor('#9ca3af')
           .fontSize(7.5)
           .font('Helvetica')
           .text(
             'This is a computer-generated invoice and does not require a signature.',
             0, footerY,
             { align: 'center', width: W }
           )
           .text(
             'For returns, exchanges or queries: support@mahaveerfurniture.in | www.mahaveerfurniture.in',
             0, footerY + 12,
             { align: 'center', width: W }
           )
           .text(
             '© 2025 Mahaveer Smart Furniture Hub. All rights reserved. | GSTIN: 29AAACM1234A1Z5',
             0, footerY + 24,
             { align: 'center', width: W }
           );

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = new InvoiceService();

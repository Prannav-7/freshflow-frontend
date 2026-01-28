import { FileText, Download, Printer } from 'lucide-react';
import './Invoice.css';

const Invoice = ({ order, onClose }) => {
    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        // Trigger browser's save as PDF directly
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Invoice - ${order.id?.substring(0, 8)}</title>
                    <style>
                        ${getInvoiceStyles()}
                    </style>
                </head>
                <body>
                    ${document.querySelector('.invoice-content').innerHTML}
                    <script>
                        window.onload = function() {
                            window.print();
                            setTimeout(() => window.close(), 100);
                        };
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    const getInvoiceStyles = () => {
        return `
            * { margin: 0; padding: 0; box-sizing: border-box; }
            html, body { width: 100%; height: 100%; }
            body { font-family: Arial, sans-serif; padding: 0; font-size: 11px; width: 210mm; }
            .invoice-header { display: flex; justify-content: space-between; margin-bottom: 15px; }
            .company-info h1 { font-size: 22px; color: #2d6a4f; margin-bottom: 5px; }
            .company-info p { font-size: 11px; margin: 2px 0; line-height: 1.5; }
            .invoice-meta { text-align: right; }
            .invoice-meta h2 { font-size: 20px; margin-bottom: 8px; }
            .invoice-meta p { font-size: 11px; margin: 3px 0; line-height: 1.5; }
            .invoice-divider { height: 1px; background: #2d6a4f; margin: 12px 0; }
            .invoice-addresses { display: flex; gap: 20px; margin-bottom: 15px; }
            .address-section { flex: 1; }
            .address-section h3 { font-size: 13px; color: #2d6a4f; margin-bottom: 5px; border-bottom: 1px solid #2d6a4f; padding-bottom: 3px; }
            .address-section p { font-size: 11px; margin: 2px 0; line-height: 1.5; }
            .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            .invoice-table thead { background: #2d6a4f; color: white; }
            .invoice-table th { padding: 8px; text-align: left; font-size: 11px; }
            .invoice-table td { padding: 8px; font-size: 11px; border-bottom: 1px solid #e5e7eb; }
            .invoice-table th:last-child, .invoice-table td:last-child { text-align: right; }
            .item-category { font-size: 10px; color: #666; }
            .invoice-totals { max-width: 350px; margin-left: auto; margin-bottom: 15px; }
            .totals-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 11px; }
            .grand-total { font-size: 14px; font-weight: bold; color: #2d6a4f; padding-top: 6px; border-top: 1px solid #000; }
            .payment-info { background: #f9fafb; padding: 10px; border-radius: 5px; margin-bottom: 15px; }
            .payment-info h3 { font-size: 12px; color: #2d6a4f; margin-bottom: 5px; }
            .payment-info p { font-size: 11px; margin: 2px 0; }
            .invoice-footer { display: flex; gap: 20px; padding-top: 12px; border-top: 1px solid #e5e7eb; }
            .footer-notes, .footer-signature { flex: 1; }
            .footer-notes h4 { font-size: 12px; color: #2d6a4f; margin-bottom: 5px; }
            .footer-notes li { font-size: 10px; padding: 2px 0; list-style: none; }
            .footer-notes li::before { content: "• "; color: #2d6a4f; font-weight: bold; }
            .footer-signature { text-align: right; }
            .footer-signature p { font-size: 11px; margin: 3px 0; }
            .signature-line { margin-top: 20px; padding-top: 3px; border-top: 1px solid #000; display: inline-block; min-width: 150px; font-style: italic; font-size: 10px; }
            @media print { 
                @page { size: A4 portrait; margin: 15mm; } 
                body { padding: 0; margin: 0; width: 210mm; } 
                * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
        `;
    };

    return (
        <div className="invoice-modal">
            <div className="invoice-overlay" onClick={onClose}></div>
            <div className="invoice-container">
                <div className="invoice-actions no-print">
                    <button onClick={handlePrint} className="btn-print">
                        <Printer size={18} />
                        Print
                    </button>
                    <button onClick={handleDownload} className="btn-download">
                        <Download size={18} />
                        Download PDF
                    </button>
                    <button onClick={onClose} className="btn-close">×</button>
                </div>

                <div className="invoice-content">
                    {/* Invoice Header */}
                    <div className="invoice-header">
                        <div className="company-info">
                            <h1>🌿 Fresh Flow</h1>
                            <p>Premium Organic Products</p>
                            <p>123 Organic Lane, Green City, GC 123456</p>
                            <p>Email: support@freshflow.com | Phone: +91 98765 43210</p>
                        </div>
                        <div className="invoice-meta">
                            <h2>TAX INVOICE</h2>
                            <p><strong>Invoice #:</strong> INV-{order.id?.substring(0, 8).toUpperCase()}</p>
                            <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                            })}</p>
                            <p><strong>Order ID:</strong> {order.id}</p>
                        </div>
                    </div>

                    <div className="invoice-divider"></div>

                    {/* Billing & Shipping */}
                    <div className="invoice-addresses">
                        <div className="address-section">
                            <h3>Bill To:</h3>
                            <p><strong>{order.shippingAddress?.fullName || order.userName}</strong></p>
                            <p>{order.shippingAddress?.email || order.userEmail}</p>
                            <p>{order.shippingAddress?.phone}</p>
                        </div>
                        <div className="address-section">
                            <h3>Ship To:</h3>
                            <p><strong>{order.shippingAddress?.fullName}</strong></p>
                            <p>{order.shippingAddress?.address}</p>
                            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
                        </div>
                    </div>

                    <div className="invoice-divider"></div>

                    {/* Items Table */}
                    <table className="invoice-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Description</th>
                                <th>Size</th>
                                <th>Price</th>
                                <th>Qty</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items?.map((item, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <strong>{item.name}</strong>
                                        {item.category && <div className="item-category">{item.category}</div>}
                                    </td>
                                    <td>{item.size || item.selectedSize || '-'}</td>
                                    <td>₹{item.price.toFixed(2)}</td>
                                    <td>{item.quantity}</td>
                                    <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="invoice-totals">
                        <div className="totals-row">
                            <span>Subtotal:</span>
                            <span>₹{order.subtotal?.toFixed(2) || order.totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="totals-row">
                            <span>Delivery:</span>
                            <span>{order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge?.toFixed(2)}`}</span>
                        </div>
                        <div className="totals-row grand-total">
                            <span><strong>Grand Total:</strong></span>
                            <span><strong>₹{order.totalAmount.toFixed(2)}</strong></span>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="payment-info">
                        <h3>Payment Information</h3>
                        <p><strong>Method:</strong> {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                        <p><strong>Status:</strong> {order.paymentStatus || 'Pending'}</p>
                    </div>

                    {/* Footer */}
                    <div className="invoice-footer">
                        <div className="footer-notes">
                            <h4>Terms & Conditions:</h4>
                            <ul>
                                <li>All products are 100% organic and certified</li>
                                <li>Returns accepted within 7 days of delivery</li>
                                <li>For queries, contact our support team</li>
                            </ul>
                        </div>
                        <div className="footer-signature">
                            <p>Thank you for choosing Fresh Flow!</p>
                            <p className="signature-line">Authorized Signature</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Invoice;

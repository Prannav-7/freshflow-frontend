import { FileText, Download, Printer } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import './Invoice.css';

const Invoice = ({ order, onClose }) => {
    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        const element = document.querySelector('.invoice-content');
        const opt = {
            margin: [15, 15, 15, 15], // 15mm margins on all sides
            filename: `Invoice_${order.id?.substring(0, 8) || 'document'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                letterRendering: true,
                logging: false
            },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait',
                compress: true
            },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        html2pdf().set(opt).from(element).save();
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
                            <p>15-A, Kamaraj Salai, Anna Nagar, Chennai - 600040, Tamil Nadu</p>
                            <p>Email:info.iyarkaivalari@gmail.com | Phone: +91 9976238446</p>
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

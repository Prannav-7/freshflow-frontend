import { RotateCcw, Package, CheckCircle, XCircle, Clock, Phone, Mail, AlertCircle } from 'lucide-react';
import './Returns.css';

const Returns = () => {
    return (
        <div className="returns-page">
            {/* Hero Section */}
            <section className="returns-hero">
                <div className="container">
                    <div className="returns-hero-content">
                        <RotateCcw size={64} className="returns-hero-icon" />
                        <h1 className="returns-hero-title">Returns & Refunds Policy</h1>
                        <p className="returns-hero-subtitle">
                            Your satisfaction is our priority. Easy returns and hassle-free refunds.
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="returns-main">
                <div className="container">
                    {/* Policy Overview */}
                    <div className="returns-overview">
                        <h2>Our Return & Refund Promise</h2>
                        <p>
                            At Fresh Flow, we want you to be completely satisfied with your purchase. If you receive
                            damaged, defective, or incorrect products, we offer a simple and straightforward return process
                            to ensure your concerns are addressed promptly.
                        </p>
                    </div>

                    {/* Return Eligibility */}
                    <div className="eligibility-section">
                        <h2>What Can Be Returned?</h2>
                        <div className="eligibility-grid">
                            <div className="eligibility-card eligible">
                                <CheckCircle size={40} className="card-icon" />
                                <h3>Eligible for Return</h3>
                                <ul>
                                    <li>Damaged products received</li>
                                    <li>Defective or expired items</li>
                                    <li>Wrong product delivered</li>
                                    <li>Quantity mismatch</li>
                                    <li>Quality issues (with proof)</li>
                                    <li>Packaging severely damaged</li>
                                </ul>
                            </div>

                            <div className="eligibility-card ineligible">
                                <XCircle size={40} className="card-icon" />
                                <h3>Not Eligible for Return</h3>
                                <ul>
                                    <li>Products used or consumed</li>
                                    <li>Opened or unsealed packages (except quality issues)</li>
                                    <li>Products damaged by customer</li>
                                    <li>Return request after 48 hours of delivery</li>
                                    <li>Products on special discount/clearance</li>
                                    <li>Change of mind without valid reason</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Return Process */}
                    <div className="return-process">
                        <h2>How to Return an Item</h2>
                        <div className="process-timeline">
                            <div className="timeline-step">
                                <div className="step-circle">1</div>
                                <h3>Contact Us Within 48 Hours</h3>
                                <p>
                                    Call us at <a href="tel:8056638446" style={{ color: '#2d6a4f', fontWeight: 'bold' }}>8056638446</a> or <a href="tel:9976238446" style={{ color: '#2d6a4f', fontWeight: 'bold' }}>9976238446</a>, WhatsApp us at <a href="https://wa.me/918838686407?text=Hi%20Fresh%20Flow!%20🔄%0A%0AI%20need%20to%20return%20a%20product.%0AOrder%20ID:%20%0AReason:%20%0A%0APlease%20help%20me%20with%20the%20return%20process.%0A%0AThank%20you!" target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', fontWeight: 'bold' }}>8838686407</a>, or
                                    email <a href="mailto:info.iyarkaivalari@gmail.com" style={{ color: '#2d6a4f', fontWeight: 'bold' }}>info.iyarkaivalari@gmail.com</a> with your order ID and reason for return.
                                </p>
                            </div>

                            <div className="timeline-step">
                                <div className="step-circle">2</div>
                                <h3>Provide Details & Photos</h3>
                                <p>
                                    Share clear photos of the product showing damage or defect. Include packaging
                                    photos if applicable. This helps us process your request faster.
                                </p>
                            </div>

                            <div className="timeline-step">
                                <div className="step-circle">3</div>
                                <h3>Return Approval</h3>
                                <p>
                                    Our team will review your request within 24 hours and provide return authorization
                                    along with pickup details or return shipping instructions.
                                </p>
                            </div>

                            <div className="timeline-step">
                                <div className="step-circle">4</div>
                                <h3>Product Pickup/Return</h3>
                                <p>
                                    We'll arrange a pickup from your location or provide return shipping details.
                                    Ensure the product is in original condition with all packaging.
                                </p>
                            </div>

                            <div className="timeline-step">
                                <div className="step-circle">5</div>
                                <h3>Quality Check & Refund</h3>
                                <p>
                                    Once we receive and verify the returned product, we'll process your refund or
                                    replacement within 5-7 business days.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Refund Policy */}
                    <div className="refund-section">
                        <h2>Refund Policy</h2>
                        <div className="refund-cards">
                            <div className="refund-card">
                                <Clock size={32} />
                                <h3>Processing Time</h3>
                                <p>
                                    Refunds are processed within <strong>5-7 business days</strong> after
                                    we receive and verify the returned product.
                                </p>
                            </div>

                            <div className="refund-card">
                                <Package size={32} />
                                <h3>Refund Method</h3>
                                <p>
                                    Refunds will be credited to the <strong>original payment method</strong> used
                                    during purchase. For COD orders, bank transfer will be initiated.
                                </p>
                            </div>

                            <div className="refund-card">
                                <CheckCircle size={32} />
                                <h3>Replacement Option</h3>
                                <p>
                                    You can choose a <strong>replacement</strong> instead of a refund.
                                    Replacements are dispatched immediately upon verification.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Important Information */}
                    <div className="important-info">
                        <h2>Important Information</h2>
                        <div className="info-alerts">
                            <div className="info-alert">
                                <AlertCircle size={24} />
                                <div>
                                    <h4>48-Hour Window</h4>
                                    <p>
                                        All return requests must be initiated within 48 hours of delivery.
                                        Requests made after this period will not be entertained.
                                    </p>
                                </div>
                            </div>

                            <div className="info-alert">
                                <AlertCircle size={24} />
                                <div>
                                    <h4>Proof Required</h4>
                                    <p>
                                        For quality issues, please share clear photos/videos showing the defect.
                                        This is mandatory for processing returns.
                                    </p>
                                </div>
                            </div>

                            <div className="info-alert">
                                <AlertCircle size={24} />
                                <div>
                                    <h4>Original Packaging</h4>
                                    <p>
                                        Products must be returned in their original packaging with all labels,
                                        seals, and contents intact (unless damaged upon receipt).
                                    </p>
                                </div>
                            </div>

                            <div className="info-alert">
                                <AlertCircle size={24} />
                                <div>
                                    <h4>No Return Shipping Charges</h4>
                                    <p>
                                        For genuine quality issues or our mistakes, we bear all return shipping charges.
                                        You don't pay anything for returns.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cancellation Policy */}
                    <div className="cancellation-section">
                        <h2>Order Cancellation Policy</h2>
                        <div className="cancellation-content">
                            <p>
                                You can cancel your order free of charge before it is shipped. Once shipped,
                                cancellation is not possible, but you can return it as per our return policy.
                            </p>
                            <div className="cancellation-steps">
                                <div className="cancellation-step">
                                    <h4>Before Shipment</h4>
                                    <p>✅ Free cancellation - Full refund within 3-5 business days</p>
                                </div>
                                <div className="cancellation-step">
                                    <h4>After Shipment</h4>
                                    <p>❌ Cannot cancel - Can return after delivery as per return policy</p>
                                </div>
                            </div>
                            <p className="cancellation-note">
                                To cancel, call us immediately at <a href="tel:8056638446" style={{ color: '#2d6a4f', fontWeight: 'bold' }}>8056638446</a> or <a href="tel:9976238446" style={{ color: '#2d6a4f', fontWeight: 'bold' }}>9976238446</a>, or WhatsApp <a href="https://wa.me/918838686407?text=Hello%20Fresh%20Flow!%20❌%0A%0AI%20need%20to%20cancel%20my%20order.%0AOrder%20ID:%20%0A%0APlease%20help%20me%20cancel%20it%20urgently.%0A%0AThank%20you!" target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', fontWeight: 'bold' }}>8838686407</a>
                            </p>
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div className="returns-contact">
                        <h2>Need Help with Returns?</h2>
                        <p>Our customer support team is ready to assist you with any return or refund queries.</p>
                        <div className="contact-methods">
                            <div className="contact-method">
                                <Phone size={28} />
                                <div>
                                    <h4>Call Us</h4>
                                    <p><a href="tel:8056638446" style={{ color: 'inherit', textDecoration: 'none' }}>8056638446</a> | <a href="tel:9976238446" style={{ color: 'inherit', textDecoration: 'none' }}>9976238446</a></p>
                                    <span>Mon-Sat: 9 AM - 8 PM</span>
                                </div>
                            </div>
                            <div className="contact-method">
                                <Mail size={28} />
                                <div>
                                    <h4>Email Us</h4>
                                    <p><a href="mailto:info.iyarkaivalari@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>info.iyarkaivalari@gmail.com</a></p>
                                    <span>Response within 24 hours</span>
                                </div>
                            </div>
                            <div className="contact-method">
                                <MessageCircle size={28} />
                                <div>
                                    <h4>WhatsApp Us</h4>
                                    <p><a href="https://wa.me/918838686407?text=Hi%20Fresh%20Flow!%20🌿%0A%0AI%20need%20assistance%20with%20returns%20and%20refunds.%0A%0ACan%20you%20please%20help%20me?%0A%0AThank%20you!" target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', textDecoration: 'none', fontWeight: '600' }}>8838686407</a></p>
                                    <span>Quick response</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Returns;

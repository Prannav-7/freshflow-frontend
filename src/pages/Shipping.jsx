import { Package, Truck, MapPin, Clock, Phone, Mail, MessageCircle } from 'lucide-react';
import './Shipping.css';

const Shipping = () => {
    return (
        <div className="shipping-page">
            {/* Hero Section */}
            <section className="shipping-hero">
                <div className="container">
                    <div className="shipping-hero-content">
                        <Package size={64} className="shipping-hero-icon" />
                        <h1 className="shipping-hero-title">Shipping Policy</h1>
                        <p className="shipping-hero-subtitle">
                            Fast, reliable, and safe delivery of your organic products
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="shipping-main">
                <div className="container">
                    {/* Shipping Overview */}
                    <div className="shipping-overview">
                        <h2>Our Shipping Promise</h2>
                        <p>
                            At Fresh Flow, we ensure that your organic products reach you fresh and in perfect condition.
                            We work with trusted delivery partners to provide reliable and timely delivery across Tamil Nadu
                            and beyond.
                        </p>
                    </div>

                    {/* Shipping Details Grid */}
                    <div className="shipping-details-grid">
                        <div className="shipping-detail-card">
                            <div className="detail-icon">
                                <MapPin size={32} />
                            </div>
                            <h3>Delivery Areas</h3>
                            <p>
                                We currently deliver across <strong>Tamil Nadu</strong>, with special focus on
                                <strong> Erode district</strong> and surrounding areas. We are continuously expanding
                                our delivery network to serve more regions.
                            </p>
                            <ul>
                                <li>Erode and surrounding districts - Free delivery</li>
                                <li>Other Tamil Nadu cities - Standard shipping charges apply</li>
                                <li>Remote areas - May have additional charges</li>
                            </ul>
                        </div>

                        <div className="shipping-detail-card">
                            <div className="detail-icon">
                                <Clock size={32} />
                            </div>
                            <h3>Delivery Timeline</h3>
                            <p>
                                We strive to deliver your orders as quickly as possible while maintaining product quality.
                            </p>
                            <ul>
                                <li><strong>Erode District:</strong> 1-2 business days</li>
                                <li><strong>Within Tamil Nadu:</strong> 3-5 business days</li>
                                <li><strong>Remote Areas:</strong> 5-7 business days</li>
                                <li><strong>Express Delivery:</strong> Available for select locations (additional charges apply)</li>
                            </ul>
                        </div>

                        <div className="shipping-detail-card">
                            <div className="detail-icon">
                                <Truck size={32} />
                            </div>
                            <h3>Shipping Charges</h3>
                            <p>
                                We offer competitive shipping rates based on your location and order value.
                            </p>
                            <ul>
                                <li>Orders above ₹500 within Erode - <strong>Free Shipping</strong></li>
                                <li>Orders above ₹1000 across Tamil Nadu - <strong>Free Shipping</strong></li>
                                <li>Orders below minimum - Flat ₹50 shipping charge</li>
                                <li>Bulk orders - Special shipping rates (contact us)</li>
                            </ul>
                        </div>

                        <div className="shipping-detail-card">
                            <div className="detail-icon">
                                <Package size={32} />
                            </div>
                            <h3>Order Processing</h3>
                            <p>
                                Orders are processed quickly to ensure freshness.
                            </p>
                            <ul>
                                <li>Orders placed before 2 PM are processed the same day</li>
                                <li>Orders after 2 PM are processed the next business day</li>
                                <li>Weekend orders are processed on Monday</li>
                                <li>You'll receive tracking details via SMS and email</li>
                            </ul>
                        </div>
                    </div>

                    {/* Delivery Process */}
                    <div className="delivery-process">
                        <h2>How Delivery Works</h2>
                        <div className="process-steps">
                            <div className="process-step">
                                <div className="step-number">1</div>
                                <h3>Order Placed</h3>
                                <p>You place your order and receive order confirmation with tracking ID</p>
                            </div>
                            <div className="process-step">
                                <div className="step-number">2</div>
                                <h3>Order Processing</h3>
                                <p>We carefully pack your products ensuring quality and freshness</p>
                            </div>
                            <div className="process-step">
                                <div className="step-number">3</div>
                                <h3>Shipped</h3>
                                <p>Your order is dispatched with tracking details sent to you</p>
                            </div>
                            <div className="process-step">
                                <div className="step-number">4</div>
                                <h3>Delivered</h3>
                                <p>Receive your fresh organic products at your doorstep</p>
                            </div>
                        </div>
                    </div>

                    {/* Important Notes */}
                    <div className="shipping-notes">
                        <h2>Important Information</h2>
                        <div className="notes-grid">
                            <div className="note-card">
                                <h4>📦 Packaging</h4>
                                <p>
                                    All products are carefully packed in food-grade, eco-friendly packaging
                                    to maintain freshness and prevent damage during transit.
                                </p>
                            </div>
                            <div className="note-card">
                                <h4>🔍 Order Tracking</h4>
                                <p>
                                    Track your order anytime using the tracking ID sent to your email and SMS.
                                    You can also track via our website's "Track Order" feature.
                                </p>
                            </div>
                            <div className="note-card">
                                <h4>📍 Delivery Address</h4>
                                <p>
                                    Please ensure your delivery address is complete and accurate.
                                    We cannot be held responsible for delays due to incorrect addresses.
                                </p>
                            </div>
                            <div className="note-card">
                                <h4>⏰ Delivery Attempts</h4>
                                <p>
                                    Our delivery partner will make up to 3 delivery attempts.
                                    Please be available to receive your order to ensure freshness.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div className="shipping-contact">
                        <h2>Have Questions About Shipping?</h2>
                        <p>Our customer support team is here to help you with any shipping-related queries.</p>
                        <div className="contact-options">
                            <div className="contact-option">
                                <Phone size={24} />
                                <div>
                                    <h4>Call Us</h4>
                                    <p><a href="tel:8056638446" style={{ color: 'inherit', textDecoration: 'none' }}>8056638446</a> | <a href="tel:9976238446" style={{ color: 'inherit', textDecoration: 'none' }}>9976238446</a></p>
                                </div>
                            </div>
                            <div className="contact-option">
                                <Mail size={24} />
                                <div>
                                    <h4>Email Us</h4>
                                    <p><a href="mailto:info.iyarkaivalari@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>info.iyarkaivalari@gmail.com</a></p>
                                </div>
                            </div>
                            <div className="contact-option">
                                <MessageCircle size={24} />
                                <div>
                                    <h4>WhatsApp</h4>
                                    <p><a href="https://wa.me/918838686407?text=Hello%20Fresh%20Flow!%20📦%0A%0AI%20have%20a%20question%20about%20shipping%20for%20organic%20products.%20Can%20you%20help%20me?%0A%0AThank%20you!" target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', textDecoration: 'none', fontWeight: '600' }}>8838686407</a></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Shipping;

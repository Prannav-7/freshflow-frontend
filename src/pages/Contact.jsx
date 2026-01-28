import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from 'lucide-react';
import './Contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });

    const [formStatus, setFormStatus] = useState({ type: '', message: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.name || !formData.email || !formData.message) {
            setFormStatus({
                type: 'error',
                message: 'Please fill in all required fields.'
            });
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setFormStatus({
                type: 'error',
                message: 'Please enter a valid email address.'
            });
            return;
        }

        // Create Gmail compose URL with form data
        const subject = encodeURIComponent(formData.subject || 'Contact Form Inquiry - Fresh Flow');
        const body = encodeURIComponent(
            `Name: ${formData.name}\n` +
            `Email: ${formData.email}\n` +
            `Phone: ${formData.phone || 'Not provided'}\n\n` +
            `Message:\n${formData.message}\n\n` +
            `---\n` +
            `This message was sent from Fresh Flow Contact Form`
        );

        // Gmail compose URL - opens in new tab
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=info.iyarkaivalari@gmail.com&su=${subject}&body=${body}`;

        // Open Gmail in new tab
        window.open(gmailUrl, '_blank');

        // Show success message
        setFormStatus({
            type: 'success',
            message: 'Gmail opened in new tab! Please review and send the email to complete your inquiry.'
        });

        // Reset form
        setTimeout(() => {
            setFormData({
                name: '',
                email: '',
                phone: '',
                subject: '',
                message: ''
            });
        }, 1500);

        // Clear status message after 5 seconds
        setTimeout(() => {
            setFormStatus({ type: '', message: '' });
        }, 5000);
    };

    return (
        <div className="contact-page">
            {/* Hero Section */}
            <section className="contact-hero">
                <div className="container">
                    <div className="contact-hero-content">
                        <h1 className="contact-hero-title">Get In Touch</h1>
                        <p className="contact-hero-subtitle">
                            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Info & Form Section */}
            <section className="contact-main">
                <div className="container">
                    <div className="contact-grid">
                        {/* Contact Information */}
                        <div className="contact-info">
                            <h2 className="contact-info-title">Contact Information</h2>
                            <p className="contact-info-subtitle">
                                Reach out to us through any of these channels
                            </p>

                            <div className="contact-info-cards">
                                <div className="info-card">
                                    <div className="info-icon">
                                        <MapPin size={28} />
                                    </div>
                                    <div className="info-content">
                                        <h3>Visit Us</h3>
                                        <p>51-A, SORIYAMPALAYAM</p>
                                        <p>VAZHAITHOTTAM (Po), SIVAGIRI - 638109</p>
                                        <p>ERODE (Dt), Tamil Nadu</p>
                                    </div>
                                </div>

                                <div className="info-card">
                                    <div className="info-icon">
                                        <Phone size={28} />
                                    </div>
                                    <div className="info-content">
                                        <h3>Call Us</h3>
                                        <p><a href="tel:8056638446" style={{ color: 'inherit', textDecoration: 'none' }}>8056638446</a></p>
                                        <p><a href="tel:9976238446" style={{ color: 'inherit', textDecoration: 'none' }}>9976238446</a></p>
                                    </div>
                                </div>

                                <div className="info-card">
                                    <div className="info-icon">
                                        <Mail size={28} />
                                    </div>
                                    <div className="info-content">
                                        <h3>Email Us</h3>
                                        <p><a href="mailto:info.iyarkaivalari@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>info.iyarkaivalari@gmail.com</a></p>
                                    </div>
                                </div>

                                <div className="info-card">
                                    <div className="info-icon">
                                        <Clock size={28} />
                                    </div>
                                    <div className="info-content">
                                        <h3>Working Hours</h3>
                                        <p>Monday - Saturday: 9:00 AM - 8:00 PM</p>
                                        <p>Sunday: 10:00 AM - 6:00 PM</p>
                                    </div>
                                </div>
                            </div>

                            {/* Social Media or Additional Info */}
                            <div className="contact-additional">
                                <MessageCircle size={24} />
                                <p>
                                    For urgent queries, you can also reach us via WhatsApp at
                                    <a href="https://wa.me/918838686407?text=Hello%20Fresh%20Flow!%20🌿%0A%0AI%20have%20an%20urgent%20query%20about%20your%20organic%20products.%20Please%20help%20me%20with..." target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', fontWeight: 'bold', marginLeft: '5px' }}>8838686407</a>
                                </p>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="contact-form-wrapper">
                            <div className="contact-form-card">
                                <h2 className="form-title">Send Us a Message</h2>

                                {formStatus.message && (
                                    <div className={`form-status ${formStatus.type}`}>
                                        {formStatus.message}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="contact-form">
                                    <div className="form-group">
                                        <label htmlFor="name">Full Name *</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="email">Email Address *</label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="your.email@example.com"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="phone">Phone Number</label>
                                            <input
                                                type="tel"
                                                id="phone"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="+91 98765 43210"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="subject">Subject</label>
                                        <input
                                            type="text"
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            placeholder="What is this regarding?"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="message">Message *</label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            placeholder="Tell us how we can help you..."
                                            rows="6"
                                            required
                                        ></textarea>
                                    </div>

                                    <button type="submit" className="submit-btn">
                                        <Send size={20} />
                                        Send Message
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section (Optional) */}
            <section className="contact-map">
                <div className="container">
                    <h2 className="map-title">Find Us Here</h2>
                    <div className="map-wrapper">
                        <iframe
                            title="VALARI Location - Sivagiri, Erode"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31251.234567890123!2d77.3!3d11.33!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTHCsDE5JzQ4LjAiTiA3N8KwMTgnMDAuMCJF!5e0!3m2!1sen!2sin!4v1706007000000!5m2!1sen!2sin"
                            width="100%"
                            height="450"
                            style={{ border: 0, borderRadius: '16px' }}
                            allowFullScreen=""
                            loading="lazy"
                        ></iframe>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;

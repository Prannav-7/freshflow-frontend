import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import './FAQ.css';

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const faqs = [
        {
            question: 'What makes your products organic?',
            answer: 'All our products are certified organic, sourced directly from certified organic farms. They are grown without harmful pesticides, synthetic fertilizers, or GMOs. Each product meets stringent quality standards and holds valid organic certifications.'
        },
        {
            question: 'What is your delivery area?',
            answer: 'We currently deliver across Tamil Nadu, with special focus on Erode district and surrounding areas. We are expanding our delivery network to serve more regions. Please check availability for your pincode during checkout.'
        },
        {
            question: 'How do I track my order?',
            answer: 'Once your order is placed, you will receive an order ID. You can track your order using this ID by visiting the "Track Order" page from the main menu or your profile dropdown. You will also receive updates via email and SMS at each stage of delivery.'
        },
        {
            question: 'What is your return and refund policy?',
            answer: 'We offer a hassle-free return policy. If you receive damaged or incorrect products, please contact us within 48 hours of delivery. We will arrange for a replacement or refund. For quality issues, please share photos for quick resolution.'
        },
        {
            question: 'Are your products certified?',
            answer: 'Yes, all our products are certified by recognized organic certification bodies. We hold FSSAI license (22422061000260) and our suppliers maintain proper organic certifications. Product-specific certifications are mentioned on individual product pages.'
        },
        {
            question: 'What payment methods do you accept?',
            answer: 'We accept various payment methods including Cash on Delivery (COD), Credit/Debit Cards, UPI, Net Banking, and popular digital wallets. All online transactions are secure and encrypted.'
        },
        {
            question: 'How long does delivery take?',
            answer: 'Standard delivery typically takes 3-5 business days within Tamil Nadu. For remote areas, it may take 5-7 business days. Express delivery options are available for select locations. You will receive estimated delivery dates during checkout.'
        },
        {
            question: 'Do you offer bulk or wholesale pricing?',
            answer: 'Yes, we offer special pricing for bulk orders and wholesale purchases. Please contact us directly at 8056638446 or 9976238446 to discuss your requirements and get a customized quote.'
        },
        {
            question: 'How do you ensure product freshness?',
            answer: 'We maintain strict quality control and use proper storage facilities to ensure product freshness. Products are sourced fresh from farms and packaged immediately. We follow FIFO (First In, First Out) inventory management and clearly mention manufacturing and expiry dates on all products.'
        },
        {
            question: 'Can I cancel or modify my order?',
            answer: 'Yes, you can cancel or modify your order before it is shipped. Please contact us immediately at 8056638446 or through our contact page. Once the order is shipped, cancellation is not possible, but you can return it as per our return policy.'
        },
        {
            question: 'Do you have a physical store?',
            answer: 'Yes, you can visit us at our location: 51-A, SORIYAMPALAYAM, VAZHAITHOTTAM (Po), SIVAGIRI - 638109, ERODE (Dt). Our working hours are Monday to Saturday: 9:00 AM - 8:00 PM, Sunday: 10:00 AM - 6:00 PM.'
        },
        {
            question: 'How can I contact customer support?',
            answer: 'You can reach us through multiple channels: Call us at 8056638446 or 9976238446, WhatsApp at the same numbers, or use the contact form on our Contact Us page. We typically respond within 24 hours.'
        }
    ];

    return (
        <div className="faq-page">
            {/* Hero Section */}
            <section className="faq-hero">
                <div className="container">
                    <div className="faq-hero-content">
                        <HelpCircle size={64} className="faq-hero-icon" />
                        <h1 className="faq-hero-title">Frequently Asked Questions</h1>
                        <p className="faq-hero-subtitle">
                            Find answers to common questions about our products, delivery, and services
                        </p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="faq-main">
                <div className="container">
                    <div className="faq-list">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className={`faq-item ${openIndex === index ? 'open' : ''}`}
                            >
                                <button
                                    className="faq-question"
                                    onClick={() => toggleFAQ(index)}
                                >
                                    <span className="question-text">{faq.question}</span>
                                    <span className="question-icon">
                                        {openIndex === index ? (
                                            <ChevronUp size={24} />
                                        ) : (
                                            <ChevronDown size={24} />
                                        )}
                                    </span>
                                </button>
                                <div className="faq-answer">
                                    <p>{faq.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Contact Section */}
                    <div className="faq-contact">
                        <h2>Still have questions?</h2>
                        <p>
                            Can't find the answer you're looking for? Please contact our customer support team.
                        </p>
                        <div className="faq-contact-buttons">
                            <a href="tel:8056638446" className="contact-btn primary">
                                Call Us: 8056638446
                            </a>
                            <a href="/contact" className="contact-btn secondary">
                                Contact Form
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default FAQ;

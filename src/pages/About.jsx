import { Link } from 'react-router-dom';
import { Leaf, Heart, Users, Award, TrendingUp, Shield } from 'lucide-react';
import './About.css';
import aboutUsImage from '../assets/images/aboutus.png';
import aboutUsBottomImage from '../assets/images/aboutusbottom.jpg';

const About = () => {
    return (
        <div className="about-page">
            {/* Hero Section */}
            <section className="about-hero">
                <div className="container">
                    <div className="about-hero-content">
                        <h1 className="about-hero-title">
                            About <span className="highlight">FreshFlow</span>
                        </h1>
                        <p className="about-hero-subtitle">
                            Your trusted partner for 100% organic and fresh products
                        </p>
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="about-story">
                <div className="container">
                    <div className="story-grid">
                        <div className="story-content">
                            <h2 className="section-title">Our Story</h2>
                            <p className="story-text">
                                Founded with a passion for healthy living and sustainable farming,
                                FreshFlow has been delivering premium organic products to families
                                across the nation since our inception.
                            </p>
                            <p className="story-text">
                                We believe that everyone deserves access to pure, chemical-free food
                                that nourishes both body and soul. Our journey began with a simple
                                mission: to bridge the gap between organic farmers and health-conscious
                                consumers.
                            </p>
                            <p className="story-text">
                                Today, we work directly with certified organic farms, ensuring that
                                every product meets our stringent quality standards. From traditional
                                rice varieties to cold-pressed oils, we bring you the finest selection
                                of organic products.
                            </p>
                        </div>
                        <div className="story-image">
                            <img
                                src={aboutUsImage}
                                alt="Certified Organic Product"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="about-values">
                <div className="container">
                    <h2 className="section-title text-center">Our Core Values</h2>
                    <div className="values-grid">
                        <div className="value-card">
                            <div className="value-icon">
                                <Leaf size={40} />
                            </div>
                            <h3>100% Organic</h3>
                            <p>
                                All our products are certified organic, grown without harmful
                                pesticides or chemicals, ensuring the purest quality for your family.
                            </p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon">
                                <Heart size={40} />
                            </div>
                            <h3>Health First</h3>
                            <p>
                                We prioritize your health and well-being by offering nutritious,
                                wholesome products that support a healthy lifestyle.
                            </p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon">
                                <Users size={40} />
                            </div>
                            <h3>Community Support</h3>
                            <p>
                                We work directly with local farmers, supporting sustainable
                                agriculture and empowering rural communities.
                            </p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon">
                                <Award size={40} />
                            </div>
                            <h3>Quality Assured</h3>
                            <p>
                                Every product undergoes rigorous quality checks to ensure you
                                receive only the best organic produce.
                            </p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon">
                                <TrendingUp size={40} />
                            </div>
                            <h3>Fair Pricing</h3>
                            <p>
                                We believe organic food should be accessible to all, which is
                                why we offer competitive prices without compromising quality.
                            </p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon">
                                <Shield size={40} />
                            </div>
                            <h3>Trust & Transparency</h3>
                            <p>
                                We maintain complete transparency in our sourcing and processes,
                                building trust with every purchase.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="about-mission">
                <div className="container">
                    <div className="mission-grid">
                        <div className="mission-image">
                            <img
                                src={aboutUsBottomImage}
                                alt="Fresh organic grains and pulses"
                            />
                        </div>
                        <div className="mission-content">
                            <h2 className="section-title">Our Mission</h2>
                            <p className="mission-text">
                                To make organic living accessible and affordable for everyone by
                                connecting conscious consumers with trusted organic farmers.
                            </p>
                            <h3 className="mission-subtitle">What We Offer:</h3>
                            <ul className="mission-list">
                                <li>
                                    <span className="list-icon">✓</span>
                                    Certified organic products from verified farms
                                </li>
                                <li>
                                    <span className="list-icon">✓</span>
                                    Traditional rice varieties and ancient grains
                                </li>
                                <li>
                                    <span className="list-icon">✓</span>
                                    Cold-pressed oils and natural spices
                                </li>
                                <li>
                                    <span className="list-icon">✓</span>
                                    Chemical-free pulses and millets
                                </li>
                                <li>
                                    <span className="list-icon">✓</span>
                                    Fast and reliable delivery service
                                </li>
                                <li>
                                    <span className="list-icon">✓</span>
                                    Competitive pricing with no hidden costs
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="about-cta">
                <div className="container">
                    <div className="cta-content">
                        <h2>Join Our Organic Journey</h2>
                        <p>
                            Experience the difference of truly organic products. Start shopping
                            today and embrace a healthier lifestyle.
                        </p>
                        <Link to="/products" className="cta-btn">
                            Explore Products
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;

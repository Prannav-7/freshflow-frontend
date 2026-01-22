import { Link } from 'react-router-dom';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';
import { ArrowRight, TrendingUp, Package, Truck, Shield } from 'lucide-react';
import homeImage from '../assets/images/home.jpg';

const Home = () => {
  const featuredProducts = products.slice(0, 8);
  // Top selling products based on review count (popularity)
  const topSellingProducts = [...products]
    .sort((a, b) => b.reviews - a.reviews)
    .slice(0, 4);


  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Fresh & Organic Products
              <span className="hero-subtitle">Delivered to Your Doorstep</span>
            </h1>
            <p className="hero-description">
              Experience the goodness of 100% certified organic products.
              From farm to your table, we ensure quality in every bite.
            </p>
            <Link to="/products" className="hero-btn">
              Shop Now <ArrowRight size={20} />
            </Link>
          </div>
          <div className="hero-image">
            <img src={homeImage} alt="Fresh organic grains and pulses" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <Package className="feature-icon" size={40} />
              <h3>100% Organic</h3>
              <p>Certified organic products from trusted farms</p>
            </div>
            <div className="feature-card">
              <Truck className="feature-icon" size={40} />
              <h3>Free Delivery</h3>
              <p>Free shipping on orders above ₹500</p>
            </div>
            <div className="feature-card">
              <Shield className="feature-icon" size={40} />
              <h3>Quality Assured</h3>
              <p>Every product is quality checked</p>
            </div>
            <div className="feature-card">
              <TrendingUp className="feature-icon" size={40} />
              <h3>Best Prices</h3>
              <p>Get the best deals on organic products</p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Selling Products Section */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Top Selling Products</h2>
            <Link to="/products" className="view-all">
              View All <ArrowRight size={18} />
            </Link>
          </div>
          <div className="products-grid">
            {topSellingProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="section section-bg">
        <div className="container">
          <div className="section-header">
            <h2>Featured Products</h2>
            <Link to="/products" className="view-all">
              View All <ArrowRight size={18} />
            </Link>
          </div>
          <div className="products-grid">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Shop by Category</h2>
          <div className="categories-grid">
            <Link to="/products?category=Rice" className="category-card">
              <img src="https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400" alt="Rice" />
              <h3>Traditional Rice</h3>
            </Link>
            <Link to="/products?category=Oil" className="category-card">
              <img src="https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400" alt="Oils" />
              <h3>Cold-Pressed Oils</h3>
            </Link>
            <Link to="/products?category=Grains" className="category-card">
              <img src="https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400" alt="Grains" />
              <h3>Millets & Grains</h3>
            </Link>
            <Link to="/products?category=Powder" className="category-card">
              <img src="https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400" alt="Powders" />
              <h3>Natural Powders</h3>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

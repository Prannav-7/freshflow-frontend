import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { categories, brands } from '../data/products';
import { getProducts } from '../api';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import { SlidersHorizontal } from 'lucide-react';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });
  const [rating, setRating] = useState(0);
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Sync search and category from URL params
  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  useEffect(() => {
    let filtered = [...products];

    // Search filter
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'All' && !searchQuery) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(p => selectedBrands.includes(p.brand));
    }

    // Price filter
    filtered = filtered.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);

    // Rating filter
    if (rating > 0) {
      filtered = filtered.filter(p => p.rating >= rating);
    }

    // Sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'discount':
        filtered.sort((a, b) => b.discount - a.discount);
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, selectedBrands, priceRange, rating, sortBy]);

  const handleBrandChange = (brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const handleClearFilters = () => {
    setSelectedCategory('All');
    setSelectedBrands([]);
    setPriceRange({ min: 0, max: Infinity });
    setRating(0);
    setSortBy('relevance');
    setSearchParams({}); // Clear URL params
  };

  return (
    <div className="products-page">
      <div className="container">
        <div className="products-header">
          <h1>All Products</h1>
          <div className="products-controls">
            <button
              className="filter-toggle"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={18} />
              Filters
            </button>
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="relevance">Sort by: Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="discount">Discount</option>
            </select>
          </div>
        </div>

        <div className="products-content">
          <div className={`filter-container ${showFilters ? 'show' : ''}`}>
            <FilterSidebar
              categories={categories}
              brands={brands}
              selectedCategory={selectedCategory}
              selectedBrands={selectedBrands}
              priceRange={priceRange}
              rating={rating}
              onCategoryChange={setSelectedCategory}
              onBrandChange={handleBrandChange}
              onPriceChange={setPriceRange}
              onRatingChange={setRating}
              onClearFilters={handleClearFilters}
            />
          </div>

          <div className="products-main">
            <div className="products-info">
              <p>Showing {filteredProducts.length} products</p>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="products-grid">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="no-products">
                <p>No products found matching your filters.</p>
                <button onClick={handleClearFilters} className="clear-filters-btn">
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;

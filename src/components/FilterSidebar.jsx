import { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

const FilterSidebar = ({ 
  categories, 
  brands, 
  selectedCategory, 
  selectedBrands, 
  priceRange, 
  rating,
  onCategoryChange, 
  onBrandChange, 
  onPriceChange,
  onRatingChange,
  onClearFilters 
}) => {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    brand: true,
    rating: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const priceRanges = [
    { label: 'Under ₹100', min: 0, max: 100 },
    { label: '₹100 - ₹300', min: 100, max: 300 },
    { label: '₹300 - ₹500', min: 300, max: 500 },
    { label: '₹500 - ₹700', min: 500, max: 700 },
    { label: 'Above ₹700', min: 700, max: Infinity }
  ];

  const ratings = [4, 3, 2, 1];

  return (
    <aside className="filter-sidebar">
      <div className="filter-header">
        <h3>Filters</h3>
        <button className="clear-filters" onClick={onClearFilters}>
          <X size={16} />
          Clear All
        </button>
      </div>

      {/* Category Filter */}
      <div className="filter-section">
        <button 
          className="filter-section-header"
          onClick={() => toggleSection('category')}
        >
          <span>Category</span>
          {expandedSections.category ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSections.category && (
          <div className="filter-section-content">
            {categories.map(category => (
              <label key={category} className="filter-option">
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === category}
                  onChange={() => onCategoryChange(category)}
                />
                <span>{category}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Filter */}
      <div className="filter-section">
        <button 
          className="filter-section-header"
          onClick={() => toggleSection('price')}
        >
          <span>Price Range</span>
          {expandedSections.price ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSections.price && (
          <div className="filter-section-content">
            {priceRanges.map((range, index) => (
              <label key={index} className="filter-option">
                <input
                  type="radio"
                  name="price"
                  checked={priceRange.min === range.min && priceRange.max === range.max}
                  onChange={() => onPriceChange(range)}
                />
                <span>{range.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Brand Filter */}
      <div className="filter-section">
        <button 
          className="filter-section-header"
          onClick={() => toggleSection('brand')}
        >
          <span>Brand</span>
          {expandedSections.brand ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSections.brand && (
          <div className="filter-section-content">
            {brands.filter(b => b !== 'All').map(brand => (
              <label key={brand} className="filter-option">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => onBrandChange(brand)}
                />
                <span>{brand}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Rating Filter */}
      <div className="filter-section">
        <button 
          className="filter-section-header"
          onClick={() => toggleSection('rating')}
        >
          <span>Rating</span>
          {expandedSections.rating ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSections.rating && (
          <div className="filter-section-content">
            {ratings.map(rate => (
              <label key={rate} className="filter-option">
                <input
                  type="radio"
                  name="rating"
                  checked={rating === rate}
                  onChange={() => onRatingChange(rate)}
                />
                <span>{rate}★ & above</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};

export default FilterSidebar;

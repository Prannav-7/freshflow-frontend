import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { products as staticProducts } from '../data/products';
import { Star, ShoppingCart, Heart, Truck, Shield, ArrowLeft, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import Toast from '../components/Toast';
import { addReview, getReviews, canUserReview, getProducts } from '../api';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart, cartItems } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [toast, setToast] = useState(null);

  // Calculate price based on selected size
  const getCalculatedPrice = () => {
    if (!selectedSize || !product) return product?.price || 0;

    // Enhanced regex to match: 100g, 250g, 500g, 1kg, 250ml, 500ml, 1L, etc.
    const sizeMatch = selectedSize.match(/^([\d.]+)\s*(kg|gm|g|l|ml)$/i);
    if (!sizeMatch) return product.price;

    const sizeValue = parseFloat(sizeMatch[1]);
    const sizeUnit = sizeMatch[2].toLowerCase();

    // Get product unit - if not set, detect from category
    let productUnit = product.unit;
    if (!productUnit) {
      // Auto-detect unit based on category
      const category = (product.category || '').toLowerCase();
      if (category.includes('oil')) {
        productUnit = 'L'; // Oils are typically in liters
      } else {
        productUnit = 'kg'; // Everything else in kilograms
      }
    }
    productUnit = productUnit.toLowerCase();

    // Product price is assumed to be for 1 base unit
    let pricePerUnit = product.price;

    // Normalize everything to a ratio
    let sizeRatio = 1;

    // Determine the ratio based on unit conversion
    if (productUnit === 'kg') {
      // Base unit is 1 kg
      if (sizeUnit === 'gm' || sizeUnit === 'g') {
        sizeRatio = sizeValue / 1000; // 250g = 0.25 of 1kg
      } else if (sizeUnit === 'kg') {
        sizeRatio = sizeValue; // 1kg = 1.0 of 1kg
      }
    } else if (productUnit === 'gm' || productUnit === 'g') {
      // Base unit is 1 gram (rare)
      if (sizeUnit === 'kg') {
        sizeRatio = sizeValue * 1000;
      } else if (sizeUnit === 'gm' || sizeUnit === 'g') {
        sizeRatio = sizeValue;
      }
    } else if (productUnit === 'l') {
      // Base unit is 1 liter
      if (sizeUnit === 'ml') {
        sizeRatio = sizeValue / 1000; // 250ml = 0.25 of 1L
      } else if (sizeUnit === 'l') {
        sizeRatio = sizeValue; // 1L = 1.0 of 1L
      }
    } else if (productUnit === 'ml') {
      // Base unit is 1 ml (rare)
      if (sizeUnit === 'l') {
        sizeRatio = sizeValue * 1000;
      } else if (sizeUnit === 'ml') {
        sizeRatio = sizeValue;
      }
    }

    // Calculate proportional price
    const calculatedPrice = Math.round(pricePerUnit * sizeRatio);
    console.log(`Price calculation: ${pricePerUnit} * ${sizeRatio} = ${calculatedPrice} (size: ${selectedSize}, unit: ${productUnit}, category: ${product.category})`);

    return calculatedPrice;
  };

  const calculatedPrice = getCalculatedPrice();

  // Review state
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [user, setUser] = useState(null);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  // Fetch product from Firestore
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const allProducts = await getProducts();
        // Handle both string and integer IDs
        const foundProduct = allProducts.find(p =>
          p.id === id || p.id === parseInt(id) || p.id.toString() === id
        );
        setProduct(foundProduct || null);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Fetch reviews and check if user can review
  useEffect(() => {
    const fetchReviews = async () => {
      if (!product) return;
      const productReviews = await getReviews(product.id.toString());
      setReviews(productReviews || []);
    };

    const checkReviewEligibility = async () => {
      if (!product) return;
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);

        const eligibility = await canUserReview(product.id.toString(), userData.uid);
        setCanReview(eligibility.canReview || false);
      }
    };

    if (product) {
      fetchReviews();
      checkReviewEligibility();
    }
  }, [product]);

  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          Loading product details...
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container">
        <div className="not-found">
          <h2>Product not found</h2>
          <Link to="/products" className="back-link">
            <ArrowLeft size={18} />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const isInCart = cartItems.some(item => item.id === product.id);
  const relatedProducts = staticProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {

    // Check if user is logged in
    const user = localStorage.getItem('user');

    if (!user) {
      // Save intended action and product details
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      localStorage.setItem('pendingCartItem', JSON.stringify({
        productId: product.id,
        quantity,
        size: selectedSize
      }));

      // Redirect to login page
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setToast({
        type: 'error',
        message: 'Please select a size before adding to cart'
      });
      return;
    }
    // Create a product object with calculated price
    const productWithPrice = {
      ...product,
      price: calculatedPrice, // Use calculated price based on size
      selectedSize: selectedSize // Store the selected size
    };

    for (let i = 0; i < quantity; i++) {
      addToCart(productWithPrice, selectedSize); // Pass product with calculated price
    }

    // Show success toast
    setToast({
      type: 'cart',
      message: `${quantity} ${quantity > 1 ? 'items' : 'item'} added to cart successfully!`
    });
  };

  const handleWishlistToggle = () => {
    if (!product) return;

    const inWishlist = isInWishlist(product.id);

    if (inWishlist) {
      removeFromWishlist(product.id);
      setToast({
        type: 'wishlist',
        message: 'Removed from wishlist'
      });
    } else {
      addToWishlist(product);
      setToast({
        type: 'wishlist',
        message: 'Added to wishlist successfully!'
      });
    }
  };


  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert('Please login to submit a review');
      navigate('/login');
      return;
    }

    if (!canReview) {
      alert('You must purchase this product before you can review it');
      return;
    }

    setSubmittingReview(true);

    try {
      const result = await addReview({
        productId: product.id.toString(),
        userId: user.uid,
        userName: user.displayName || user.email,
        rating: reviewData.rating,
        comment: reviewData.comment
      });

      if (result.success) {
        alert('Review submitted successfully!');
        setReviewData({ rating: 5, comment: '' });

        // Refresh reviews
        const productReviews = await getReviews(product.id.toString());
        setReviews(productReviews || []);
        setCanReview(false); // User can only review once
      } else {
        alert(result.error || 'Failed to submit review');
      }
    } catch (error) {
      alert('Error submitting review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const images = [product.image, product.image, product.image];

  return (
    <div className="product-detail-page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/products">Products</Link>
          <span>/</span>
          <Link to={`/products?category=${product.category}`}>{product.category}</Link>
          <span>/</span>
          <span>{product.name}</span>
        </div>

        <div className="product-detail">
          <div className="product-images">
            <div className="main-image">
              <img src={images[selectedImage]} alt={product.name} />
              {product.discount > 0 && (
                <span className="discount-badge">{product.discount}% OFF</span>
              )}
            </div>
            <div className="image-thumbnails">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${product.name} ${index + 1}`}
                  className={selectedImage === index ? 'active' : ''}
                  onClick={() => setSelectedImage(index)}
                />
              ))}
            </div>
          </div>

          <div className="product-info-detail">
            <h1>{product.name}</h1>

            <div className="product-rating-detail">
              <span className="rating-value">
                {product.rating} <Star size={16} fill="currentColor" />
              </span>
              <span className="review-count">{product.reviews} Reviews</span>
            </div>

            <div className="product-price-detail">
              <span className="current-price">₹{calculatedPrice}</span>
              {selectedSize && (
                <span className="price-note" style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                  Price for {selectedSize}
                </span>
              )}
              {!selectedSize && product.originalPrice > product.price && (
                <>
                  <span className="original-price">₹{product.originalPrice}</span>
                  <span className="price-discount">{product.discount}% off</span>
                </>
              )}
            </div>

            <div className="product-brand">
              <span className="label">Brand:</span>
              <span className="value">{product.brand}</span>
            </div>

            {product.available && (
              <div className="product-available-detail">
                <span className="label">Available:</span>
                <span className="value">
                  {(() => {
                    // Get unit - auto-detect if missing
                    let unit = product.unit;
                    if (!unit) {
                      const category = (product.category || '').toLowerCase();
                      unit = category.includes('oil') ? 'L' : 'kg';
                    }

                    const unitLower = unit.toLowerCase();
                    if (unitLower === 'kg')
                      return `${(product.available * 1000).toFixed(0)} gm (${product.available} kg)`;
                    else if (unitLower === 'l')
                      return `${(product.available * 1000).toFixed(0)} ml (${product.available} L)`;
                    else
                      return `${product.available} ${unit}`;
                  })()}
                </span>
              </div>
            )}

            <p className="product-description">{product.description}</p>

            {product.sizes && product.sizes.length > 0 && (
              <div className="size-selector">
                <h4>Select Size:</h4>
                <div className="size-options">
                  {product.sizes.map((size, index) => (
                    <button
                      key={index}
                      className={`size-option ${selectedSize === size ? 'active' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="product-stock">
              {product.inStock ? (
                <span className="in-stock">✓ In Stock</span>
              ) : (
                <span className="out-of-stock">✗ Out of Stock</span>
              )}
            </div>

            <div className="product-actions">
              <div className="quantity-selector">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={!product.inStock}
                >
                  -
                </button>
                <span>{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={!product.inStock}
                >
                  +
                </button>
              </div>

              <button
                className={`add-to-cart-btn large ${isInCart ? 'in-cart' : ''}`}
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                <ShoppingCart size={20} />
                {isInCart ? 'Added to Cart' : 'Add to Cart'}
              </button>

              <button
                className={`wishlist-btn ${isInWishlist(product.id) ? 'in-wishlist' : ''}`}
                onClick={handleWishlistToggle}
              >
                <Heart size={20} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
              </button>
            </div>

            <div className="product-features">
              <div className="feature-item">
                <Truck size={20} />
                <div>
                  <strong>Free Delivery</strong>
                  <p>On orders above ₹500</p>
                </div>
              </div>
              <div className="feature-item">
                <Shield size={20} />
                <div>
                  <strong>Quality Assured</strong>
                  <p>100% Certified Organic</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="product-reviews" style={{ marginTop: '3rem', marginBottom: '3rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Customer Reviews</h2>

          {canReview && user && (
            <div className="review-form" style={{
              background: '#f8f9fa',
              padding: '1.5rem',
              borderRadius: '12px',
              marginBottom: '2rem'
            }}>
              <h3 style={{ marginBottom: '1rem' }}>Write a Review</h3>
              <form onSubmit={handleReviewSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Rating
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        size={32}
                        fill={star <= reviewData.rating ? '#ffc107' : 'none'}
                        color={star <= reviewData.rating ? '#ffc107' : '#ddd'}
                        onClick={() => setReviewData({ ...reviewData, rating: star })}
                        style={{ cursor: 'pointer' }}
                      />
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Your Review
                  </label>
                  <textarea
                    value={reviewData.comment}
                    onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                    required
                    rows="4"
                    placeholder="Share your experience with this product..."
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#22c55e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    cursor: submittingReview ? 'not-allowed' : 'pointer',
                    opacity: submittingReview ? 0.6 : 1
                  }}
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          )}

          {!user && (
            <div style={{
              background: '#fff3cd',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '2rem',
              border: '1px solid #ffc107'
            }}>
              <p style={{ margin: 0 }}>
                Please <Link to="/login" style={{ color: '#22c55e', textDecoration: 'underline' }}>login</Link> to write a review
              </p>
            </div>
          )}

          {user && !canReview && (
            <div style={{
              background: '#fff3cd',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '2rem',
              border: '1px solid #ffc107'
            }}>
              <p style={{ margin: 0 }}>
                ℹ️ You can only review this product after your order has been delivered
              </p>
            </div>
          )}

          <div className="reviews-list">
            {reviews.length > 0 ? (
              reviews.map((review, index) => (
                <div
                  key={index}
                  style={{
                    padding: '1.5rem',
                    borderBottom: index < reviews.length - 1 ? '1px solid #eee' : 'none',
                    marginBottom: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <User size={20} />
                      <strong>{review.userName}</strong>
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          size={16}
                          fill={star <= review.rating ? '#ffc107' : 'none'}
                          color={star <= review.rating ? '#ffc107' : '#ddd'}
                        />
                      ))}
                    </div>
                  </div>
                  <p style={{ color: '#666', margin: 0 }}>{review.comment}</p>
                  <small style={{ color: '#999', display: 'block', marginTop: '0.5rem' }}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </small>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
                No reviews yet. Be the first to review this product!
              </p>
            )}
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="related-products">
            <h2>Related Products</h2>
            <div className="products-grid">
              {relatedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ProductDetail;

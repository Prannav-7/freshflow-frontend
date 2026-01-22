import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, addProduct, updateProduct, uploadImage, deleteProduct } from '../../api';
import {
    Plus,
    Edit,
    Trash2,
    Search,
    X,
    Save,
    Package
} from 'lucide-react';
import './ProductManagement.css';

const ProductManagement = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [user, setUser] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        originalPrice: '',
        discount: 0,
        image: '',
        description: '',
        inStock: true,
        available: 0,
        sizes: [],
        unit: 'kg' // Default unit
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    useEffect(() => {
        // Check if user is admin - only specific emails allowed
        const ADMIN_EMAILS = ['psujeeth02@gmail.com', 'prannavp803@gmail.com'];

        const savedUser = localStorage.getItem('user');
        if (!savedUser) {
            navigate('/login');
            return;
        }

        const userData = JSON.parse(savedUser);

        // Check if user email is in allowed admin emails
        if (!ADMIN_EMAILS.includes(userData.email)) {
            // Redirect to home page without alert for non-admin users
            navigate('/');
            return;
        }

        setUser(userData);
        fetchProducts();
    }, [navigate]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await getProducts();
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let imageUrl = formData.image;

            // Upload image if a new file is selected
            if (imageFile) {
                const uploadResult = await uploadImage(imageFile);
                if (uploadResult.success) {
                    imageUrl = uploadResult.url;
                } else {
                    alert('Failed to upload image. Please try again.');
                    return;
                }
            }

            // Prepare sizes - handle both string and array formats
            let sizesArray = [];
            if (typeof formData.sizes === 'string') {
                sizesArray = formData.sizes.trim().length > 0
                    ? formData.sizes.split(',').map(s => s.trim()).filter(s => s.length > 0)
                    : [];
            } else if (Array.isArray(formData.sizes)) {
                sizesArray = formData.sizes;
            }

            const productData = {
                name: formData.name,
                category: formData.category,
                price: Number(formData.price),
                originalPrice: Number(formData.originalPrice) || Number(formData.price),
                discount: Number(formData.discount),
                image: imageUrl,
                description: formData.description || '',
                inStock: Boolean(formData.inStock),
                available: Number(formData.available) || 0,
                sizes: sizesArray,
                unit: formData.unit || 'kg' // Include unit field
            };

            // When editing, preserve rating and reviews from existing product
            if (editingProduct) {
                productData.rating = editingProduct.rating || 0;
                productData.reviews = editingProduct.reviews || 0;
                productData.id = editingProduct.id; // Preserve the product's numeric ID

                console.log('Updating product with data:', productData);
                console.log('Using Firestore docId:', editingProduct.docId);

                // Use the Firestore document ID (docId) for the update, not the product's numeric id
                const documentId = editingProduct.docId || editingProduct.id;
                await updateProduct(documentId, productData);
                alert('Product updated successfully!');
            } else {
                // For new products, initialize rating and reviews
                productData.rating = 0;
                productData.reviews = 0;

                console.log('Adding new product with data:', productData);
                await addProduct(productData);
                alert('Product added successfully!');
            }

            setShowModal(false);
            resetForm();
            fetchProducts();
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Failed to save product. Please try again.');
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            category: product.category,
            price: product.price,
            originalPrice: product.originalPrice || product.price,
            discount: product.discount || 0,
            image: product.image,
            description: product.description || '',
            inStock: product.inStock !== false,
            available: product.available || 0,
            sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : '',
            unit: product.unit || 'kg' // Include unit when editing
        });
        setImagePreview(product.image);
        setImageFile(null);
        setShowModal(true);
    };

    const handleDelete = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            const result = await deleteProduct(productId);
            if (result.success) {
                alert('Product deleted successfully!');
                fetchProducts(); // Refresh the product list
            } else {
                alert(`Failed to delete product: ${result.error}`);
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product. Please try again.');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            category: '',
            price: '',
            originalPrice: '',
            discount: 0,
            image: '',
            description: '',
            inStock: true,
            available: 0,
            sizes: '',
            unit: 'kg'
        });
        setImageFile(null);
        setImagePreview('');
        setEditingProduct(null);
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="product-management">
            <div className="pm-header">
                <div>
                    <h1><Package size={32} /> Product Management</h1>
                    <p>Add, edit, or remove products from your catalog</p>
                </div>
                <button onClick={() => navigate('/admin/dashboard')} className="back-btn">
                    ← Back to Dashboard
                </button>
            </div>

            <div className="pm-controls">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button onClick={() => { resetForm(); setShowModal(true); }} className="add-product-btn">
                    <Plus size={20} />
                    Add New Product
                </button>
            </div>

            {loading ? (
                <div className="loading">Loading products...</div>
            ) : (
                <div className="products-table-container">
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Product Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product) => (
                                <tr key={product.id}>
                                    <td>
                                        <img src={product.image} alt={product.name} className="product-thumb" />
                                    </td>
                                    <td className="product-name-cell">{product.name}</td>
                                    <td>{product.category}</td>
                                    <td className="price-cell">₹{product.price}</td>
                                    <td>
                                        {product.available || 0}{' '}
                                        {(() => {
                                            let unit = product.unit;
                                            if (!unit) {
                                                const category = (product.category || '').toLowerCase();
                                                unit = category.includes('oil') ? 'L' : 'kg';
                                            }
                                            return unit;
                                        })()}
                                    </td>
                                    <td>
                                        <span className={`stock-badge ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button onClick={() => handleEdit(product)} className="edit-btn" title="Edit">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(product.docId || product.id)} className="delete-btn" title="Delete">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredProducts.length === 0 && (
                        <p className="no-products">No products found</p>
                    )}
                </div>
            )}

            {/* Add/Edit Product Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                            <button onClick={() => setShowModal(false)} className="close-modal">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="product-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Product Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g., Organic Basmati Rice"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Category *</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        <option value="Rice">Rice</option>
                                        <option value="Oil">Oil</option>
                                        <option value="Grains">Grains</option>
                                        <option value="Powder">Powder</option>
                                        <option value="Sweeteners">Sweeteners</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Price (₹) *</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Original Price (₹)</label>
                                    <input
                                        type="number"
                                        name="originalPrice"
                                        value={formData.originalPrice}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Discount (%)</label>
                                    <input
                                        type="number"
                                        name="discount"
                                        value={formData.discount}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="100"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Product Image *</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    required={!editingProduct && !imagePreview}
                                />
                                {imagePreview && (
                                    <div className="image-preview" style={{ marginTop: '10px' }}>
                                        <img src={imagePreview} alt="Preview" style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px' }} />
                                    </div>
                                )}
                                <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                                    Upload a product image (JPG, PNG, etc.)
                                </small>
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                    placeholder="Product description..."
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Available Stock *</label>
                                    <input
                                        type="number"
                                        name="available"
                                        value={formData.available}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.001"
                                        required
                                        placeholder="Enter available quantity"
                                    />
                                    <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                                        Note: Product ratings and reviews are automatically calculated from customer feedback
                                    </small>
                                </div>

                                <div className="form-group">
                                    <label>Unit *</label>
                                    <select
                                        name="unit"
                                        value={formData.unit}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="kg">Kilograms (kg)</option>
                                        <option value="gm">Grams (gm)</option>
                                        <option value="L">Liters (L)</option>
                                        <option value="ml">Milliliters (ml)</option>
                                    </select>
                                    <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                                        Unit for measuring product quantity
                                    </small>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Sizes (comma-separated)</label>
                                <input
                                    type="text"
                                    name="sizes"
                                    value={formData.sizes}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 500g, 1kg, 5kg"
                                />
                            </div>

                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="inStock"
                                        checked={formData.inStock}
                                        onChange={handleInputChange}
                                    />
                                    In Stock
                                </label>
                            </div>

                            <div className="form-actions">
                                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">
                                    Cancel
                                </button>
                                <button type="submit" className="save-btn">
                                    <Save size={18} />
                                    {editingProduct ? 'Update Product' : 'Add Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductManagement;

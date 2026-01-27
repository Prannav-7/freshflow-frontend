/**
 * API Service for connecting to the backend
 * 
 * This utility provides easy-to-use functions for interacting with your Firebase backend
 */

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://fresh-flow-fa56.onrender.com';

/**
 * Generic API call handler
 */
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ============================================
// GENERIC FIRESTORE OPERATIONS
// ============================================

/**
 * Get all documents from a collection
 * @param {string} collection - Collection name
 * @returns {Promise<Array>} Array of documents
 */
export async function getAllData(collection) {
    const result = await apiCall(`/api/data/${collection}`);
    return result.data;
}

/**
 * Add a document to a collection
 * @param {string} collection - Collection name
 * @param {Object} data - Document data
 * @returns {Promise<Object>} Created document info
 */
export async function addData(collection, data) {
    const result = await apiCall(`/api/data/${collection}`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return result;
}

// ============================================
// SPECIFIC API FUNCTIONS (Examples)
// ============================================

/**
 * Get all users
 */
export async function getUsers() {
    return getAllData('users');
}

/**
 * Add a new user
 * @param {Object} userData - User data { name, email, role, etc. }
 */
export async function addUser(userData) {
    return addData('users', userData);
}

/**
 * Get all products
 */
export async function getProducts() {
    return getAllData('products');
}

/**
 * Add a new product
 * @param {Object} productData - Product data { name, price, description, etc. }
 */
export async function addProduct(productData) {
    return addData('products', productData);
}

/**
 * Get all orders
 */
export async function getOrders() {
    return getAllData('orders');
}

/**
 * Add a new order
 * @param {Object} orderData - Order data { userId, productId, quantity, etc. }
 */
export async function addOrder(orderData) {
    return addData('orders', orderData);
}

/**
 * Health check - Test if backend is running
 */
export async function healthCheck() {
    try {
        const result = await apiCall('/');
        return result;
    } catch (error) {
        console.error('Backend health check failed:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update a product
 * @param {string} productId - Product ID
 * @param {Object} updateData - Data to update
 */
export async function updateProduct(productId, updateData) {
    try {
        const result = await apiCall(`/api/products/${productId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData),
        });
        return result;
    } catch (error) {
        console.error('Update product failed:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete a product
 * @param {string} productId - Product ID
 */
export async function deleteProduct(productId) {
    try {
        const result = await apiCall(`/api/products/${productId}`, {
            method: 'DELETE',
        });
        return result;
    } catch (error) {
        console.error('Delete product failed:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update an order
 * @param {string} orderId - Order ID
 * @param {Object} updateData - Data to update
 */
export async function updateOrder(orderId, updateData) {
    try {
        const result = await apiCall(`/api/orders/${orderId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData),
        });
        return result;
    } catch (error) {
        console.error('Update order failed:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Upload image to Firebase Storage
 * @param {File} imageFile - Image file to upload
 */
export async function uploadImage(imageFile) {
    try {
        const formData = new FormData();
        formData.append('image', imageFile);

        const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Image upload failed');
        }

        return data;
    } catch (error) {
        console.error('Image upload failed:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Add a review for a product
 * @param {Object} reviewData - Review data { productId, userId, userName, rating, comment }
 */
export async function addReview(reviewData) {
    try {
        const result = await apiCall('/api/reviews', {
            method: 'POST',
            body: JSON.stringify(reviewData),
        });
        return result;
    } catch (error) {
        console.error('Add review failed:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get reviews for a product
 * @param {string} productId - Product ID
 */
export async function getReviews(productId) {
    try {
        const result = await apiCall(`/api/reviews/${productId}`);
        return result.data;
    } catch (error) {
        console.error('Get reviews failed:', error);
        return [];
    }
}

/**
 * Check if user can review a product
 * @param {string} productId - Product ID
 * @param {string} userId - User ID
 */
export async function canUserReview(productId, userId) {
    try {
        const result = await apiCall(`/api/reviews/can-review/${productId}/${userId}`);
        return result;
    } catch (error) {
        console.error('Check review eligibility failed:', error);
        return { success: false, canReview: false, error: error.message };
    }
}

/**
 * Update user profile
 * @param {string} uid - User ID
 * @param {Object} updates - Profile updates { displayName, phone, etc. }
 */
export async function updateUserProfile(uid, updates) {
    try {
        const result = await apiCall(`/api/auth/user/${uid}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
        return result;
    } catch (error) {
        console.error('Update profile failed:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Change user password
 * @param {string} email - User email
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 */
export async function changePassword(email, currentPassword, newPassword) {
    try {
        const result = await apiCall('/api/auth/change-password', {
            method: 'POST',
            body: JSON.stringify({ email, currentPassword, newPassword }),
        });
        return result;
    } catch (error) {
        console.error('Change password failed:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Track order by ID
 * @param {string} orderId - Order ID to track
 */
export async function trackOrder(orderId) {
    try {
        const result = await apiCall(`/api/orders/track/${orderId}`);
        return result;
    } catch (error) {
        console.error('Track order failed:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// EXPORT ALL
// ============================================

export default {
    getAllData,
    addData,
    getUsers,
    addUser,
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getOrders,
    addOrder,
    updateOrder,
    uploadImage,
    addReview,
    getReviews,
    canUserReview,
    updateUserProfile,
    changePassword,
    trackOrder,
    healthCheck,
};

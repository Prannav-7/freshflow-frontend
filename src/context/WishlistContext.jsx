import { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within WishlistProvider');
    }
    return context;
};

export const WishlistProvider = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState(() => {
        const savedWishlist = localStorage.getItem('wishlist');
        return savedWishlist ? JSON.parse(savedWishlist) : [];
    });

    useEffect(() => {
        localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
    }, [wishlistItems]);

    const addToWishlist = (product) => {
        setWishlistItems(prev => {
            const productId = String(product.id);
            const exists = prev.find(item => String(item.id) === productId);
            if (exists) {
                return prev; // Already in wishlist
            }
            return [...prev, product];
        });
    };

    const removeFromWishlist = (productId) => {
        const pId = String(productId);
        setWishlistItems(prev => prev.filter(item => String(item.id) !== pId));
    };

    const isInWishlist = (productId) => {
        const pId = String(productId);
        return wishlistItems.some(item => String(item.id) === pId);
    };

    const getWishlistCount = () => {
        return wishlistItems.length;
    };

    const clearWishlist = () => {
        setWishlistItems([]);
    };

    return (
        <WishlistContext.Provider
            value={{
                wishlistItems,
                addToWishlist,
                removeFromWishlist,
                isInWishlist,
                getWishlistCount,
                clearWishlist,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
};

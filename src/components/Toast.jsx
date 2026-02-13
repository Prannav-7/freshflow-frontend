import { useEffect } from 'react';
import { CheckCircle, X, Heart, ShoppingCart, AlertCircle } from 'lucide-react';
import './Toast.css';

const Toast = ({ message, type = 'success', onClose, duration = 4000, icon }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: <CheckCircle size={20} />,
        error: <AlertCircle size={20} />,
        cart: <ShoppingCart size={20} />,
        wishlist: <Heart size={20} fill="currentColor" />,
    };

    return (
        <div className={`toast toast-${type}`}>
            <div className="toast-icon">
                {icon || icons[type] || icons.success}
            </div>
            <div className="toast-message">{message}</div>
            <button className="toast-close" onClick={onClose}>
                <X size={18} />
            </button>
        </div>
    );
};

export default Toast;

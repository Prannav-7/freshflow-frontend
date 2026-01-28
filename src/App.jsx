import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Account from './pages/Account';
import Login from './components/Login';
import Profile from './pages/Profile';
import About from './pages/About';
import Contact from './pages/Contact';
import TrackOrder from './pages/TrackOrder';
import Wishlist from './pages/Wishlist';
import FAQ from './pages/FAQ';
import Shipping from './pages/Shipping';
import Returns from './pages/Returns';
// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import ProductManagement from './pages/admin/ProductManagement';
import OrdersPage from './pages/admin/OrdersPage';
import OrderDetail from './pages/OrderDetail';
import './App.css';

// Environment variable checker (development only)
if (import.meta.env.DEV) {
  import('./env-check.js');
}


function AppContent() {
  const location = useLocation();
  const hideFooter = location.pathname === '/login' || location.pathname.startsWith('/admin');
  const hideHeader = location.pathname.startsWith('/admin');

  return (
    <div className="app">
      {!hideHeader && <Header />}
      <main className={hideHeader ? "admin-main-content" : "main-content"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/deals" element={<Products />} />
          <Route path="/account" element={<Account />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/track-order" element={<TrackOrder />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/products" element={<ProductManagement />} />
          <Route path="/admin/orders" element={<OrdersPage />} />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <WishlistProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </WishlistProvider>
    </Router>
  );
}

export default App;

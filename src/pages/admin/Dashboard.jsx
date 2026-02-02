import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import {
    TrendingUp,
    ShoppingBag,
    Users,
    Package,
    DollarSign,
    ArrowUp,
    ArrowDown,
    Home,
    AlertTriangle,
    X,
    Download,
    FileText
} from 'lucide-react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { getOrders, getProducts } from '../../api';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalProducts: 0
    });
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState('all'); // week, month, all
    const [showLowStockPopup, setShowLowStockPopup] = useState(false);
    const [lowStockMessage, setLowStockMessage] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        //  Check if user is admin
        const savedUser = localStorage.getItem('user');
        if (!savedUser) {
            navigate('/login');
            return;
        }

        const userData = JSON.parse(savedUser);
        const adminEmails = ['psujeeth02@gmail.com', 'prannavp803@gmail.com'];

        if (!adminEmails.includes(userData.email)) {
            alert('Access denied. Admin only.');
            navigate('/');
            return;
        }

        setUser(userData);
        fetchDashboardData();
    }, [navigate, timeFilter, startDate, endDate]);

    const fetchDashboardData = async () => {
        try {
            const [ordersData, productsData] = await Promise.all([
                getOrders(),
                getProducts()
            ]);

            // Sort orders by newest first
            const sortedOrders = (ordersData || []).sort((a, b) =>
                new Date(b.createdAt || b.orderDate) - new Date(a.createdAt || a.orderDate)
            );

            setOrders(sortedOrders);
            setProducts(productsData || []);

            // Calculate stats
            const filteredOrders = filterOrdersByTime(sortedOrders);
            calculateStats(filteredOrders, productsData || []);

            // Check for low stock and show popup
            const lowStock = productsData.filter(p => (p.available || 0) < 10 && (p.available || 0) > 0);
            const outOfStock = productsData.filter(p => (p.available || 0) === 0);

            if (outOfStock.length > 0 || lowStock.length > 0) {
                let message = '';
                if (outOfStock.length > 0) {
                    message += `⚠️ ${outOfStock.length} product(s) are OUT OF STOCK!\n`;
                    message += `Products: ${outOfStock.slice(0, 3).map(p => p.name).join(', ')}`;
                    if (outOfStock.length > 3) message += ` and ${outOfStock.length - 3} more`;
                }
                if (lowStock.length > 0) {
                    if (message) message += '\n\n';
                    message += `⚠️ ${lowStock.length} product(s) are RUNNING LOW (< 10 items)!\n`;
                    message += `Products: ${lowStock.slice(0, 3).map(p => `${p.name} (${p.available})`).join(', ')}`;
                    if (lowStock.length > 3) message += ` and ${lowStock.length - 3} more`;
                }
                setLowStockMessage(message);
                setShowLowStockPopup(true);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterOrdersByTime = (orders) => {
        if (!orders || orders.length === 0) return [];

        const now = new Date();
        let start;
        let end = new Date(now.setHours(23, 59, 59, 999));

        if (timeFilter === 'custom') {
            if (!startDate && !endDate) return orders;

            start = startDate ? new Date(startDate) : new Date(0);
            start.setHours(0, 0, 0, 0);

            end = endDate ? new Date(endDate) : new Date();
            end.setHours(23, 59, 59, 999);

            return orders.filter(order => {
                const dateStr = order.createdAt || order.orderDate || order.date;
                if (!dateStr) return false;
                const orderDate = new Date(dateStr);
                return orderDate >= start && orderDate <= end;
            });
        }

        switch (timeFilter) {
            case 'week':
                start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            default:
                return orders;
        }

        return orders.filter(order => {
            const dateStr = order.createdAt || order.orderDate || order.date;
            if (!dateStr) return true; // Include if no date
            const orderDate = new Date(dateStr);
            return orderDate >= start;
        });
    };

    const calculateStats = (filteredOrders, products) => {
        const revenue = filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const uniqueCustomers = new Set(filteredOrders.map(order => order.userId).filter(Boolean)).size;

        setStats({
            totalRevenue: revenue,
            totalOrders: filteredOrders.length,
            totalCustomers: uniqueCustomers,
            totalProducts: products.length
        });
    };

    // Prepare data for charts
    const getSalesOverviewData = () => {
        const dailySales = {};
        const filteredOrders = filterOrdersByTime(orders);

        filteredOrders.forEach(order => {
            const dateStr = order.createdAt || order.orderDate || order.date;
            if (!dateStr) return;
            const date = new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            dailySales[date] = (dailySales[date] || 0) + (order.totalAmount || 0);
        });

        return Object.entries(dailySales)
            .map(([date, amount]) => ({ date, sales: amount }))
            .slice(-7); // Last 7 days
    };

    const getCategoryData = () => {
        const categoryCount = {};
        const filteredOrders = filterOrdersByTime(orders);

        filteredOrders.forEach(order => {
            order.items?.forEach(item => {
                const category = item.category || 'Other';
                categoryCount[category] = (categoryCount[category] || 0) + 1;
            });
        });

        return Object.entries(categoryCount).map(([name, value]) => ({ name, value }));
    };

    const getTopProducts = () => {
        const report = getProductSalesReport();
        return report.slice(0, 5).map(p => ({
            name: p.name,
            quantity: p.quantity
        }));
    };

    // Get detailed product sales report with quantity and revenue
    const getProductSalesReport = () => {
        const productSales = {};
        const filteredOrders = filterOrdersByTime(orders);

        filteredOrders.forEach(order => {
            order.items?.forEach(item => {
                const key = item.name;
                if (!productSales[key]) {
                    // Find the product in the products array to get its unit
                    const product = products.find(p =>
                        p.id === item.id ||
                        p.id === parseInt(item.id) ||
                        p.name === item.name
                    );

                    // Get unit - auto-detect if missing
                    let unit = product?.unit;
                    if (!unit) {
                        const category = (product?.category || item.category || '').toLowerCase();
                        unit = category.includes('oil') ? 'L' : 'kg';
                    }

                    productSales[key] = {
                        name: item.name,
                        quantity: 0,
                        revenue: 0,
                        unit: unit // Get unit from product or auto-detect
                    };
                }
                // Handle unit conversion if item has size information
                let quantityToAdd = item.quantity;
                if (item.size && productSales[key].unit) {
                    const sizeMatch = item.size.match(/^([\d.]+)\s*(kg|gm|g|l|ml)$/i);
                    if (sizeMatch) {
                        const sizeValue = parseFloat(sizeMatch[1]);
                        const sizeUnit = sizeMatch[2].toLowerCase();
                        const productUnit = productSales[key].unit.toLowerCase();

                        // Convert to product's base unit
                        if (productUnit === 'kg') {
                            if (sizeUnit === 'gm' || sizeUnit === 'g') {
                                quantityToAdd = item.quantity * (sizeValue / 1000);
                            } else {
                                quantityToAdd = item.quantity * sizeValue;
                            }
                        } else if (productUnit === 'l') {
                            if (sizeUnit === 'ml') {
                                quantityToAdd = item.quantity * (sizeValue / 1000);
                            } else {
                                quantityToAdd = item.quantity * sizeValue;
                            }
                        } else if (productUnit === 'gm' || productUnit === 'g') {
                            if (sizeUnit === 'kg') {
                                quantityToAdd = item.quantity * (sizeValue * 1000);
                            } else {
                                quantityToAdd = item.quantity * sizeValue;
                            }
                        } else if (productUnit === 'ml') {
                            if (sizeUnit === 'l') {
                                quantityToAdd = item.quantity * (sizeValue * 1000);
                            } else {
                                quantityToAdd = item.quantity * sizeValue;
                            }
                        }
                    }
                }

                productSales[key].quantity += quantityToAdd;
                productSales[key].revenue += item.quantity * item.price;
            });
        });

        return Object.values(productSales)
            .sort((a, b) => b.quantity - a.quantity);
    };

    // Get detailed unique customer report
    const getUniqueCustomerDetails = () => {
        const filteredOrders = filterOrdersByTime(orders);
        const customers = {};

        filteredOrders.forEach(order => {
            const uid = order.userId || order.userEmail || order.shippingAddress?.email || 'Guest';
            if (!customers[uid]) {
                const name = order.userName || order.shippingAddress?.fullName || 'Guest';
                customers[uid] = {
                    uid,
                    name: name,
                    email: order.userEmail || order.shippingAddress?.email || 'N/A',
                    phone: order.shippingAddress?.phone || 'N/A',
                    orderCount: 0,
                    totalSpent: 0,
                    lastOrder: order.createdAt || order.orderDate
                };
            }
            customers[uid].orderCount += 1;
            customers[uid].totalSpent += (order.totalAmount || 0);

            const currentOrderDate = new Date(order.createdAt || order.orderDate);
            const lastOrderDate = new Date(customers[uid].lastOrder);
            if (currentOrderDate > lastOrderDate) {
                customers[uid].lastOrder = order.createdAt || order.orderDate;
            }
        });

        return Object.values(customers).sort((a, b) => b.totalSpent - a.totalSpent);
    };

    // Download Sales Report as CSV
    const downloadCSVReport = () => {
        const reportData = getProductSalesReport();
        const filteredOrders = filterOrdersByTime(orders);

        // Calculate summary stats
        const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const totalOrders = filteredOrders.length;

        // Create CSV content
        let csv = 'Fresh Flow - Sales Report\n';
        csv += `Generated: ${new Date().toLocaleString()}\n`;
        csv += `Period: ${timeFilter === 'custom' ? `${startDate || 'Start'} to ${endDate || 'End'}` : timeFilter.toUpperCase()}\n`;
        csv += `\n`;
        csv += `Summary:\n`;
        csv += `Total Revenue,₹${totalRevenue.toLocaleString()}\n`;
        csv += `Total Orders,${totalOrders}\n`;
        csv += `Unique Customers,${new Set(filteredOrders.map(o => o.userId)).size}\n`;
        csv += `Total Products Sold,${reportData.length}\n`;
        csv += `\n`;
        csv += `Detailed Product Sales:\n`;
        csv += 'Rank,Product Name,Quantity Sold,Unit,Total Revenue (₹),Average Price (₹)\n';

        reportData.forEach((product, index) => {
            csv += `${index + 1},${product.name},${product.quantity.toFixed(3)},${product.unit || 'kg'},${product.revenue.toLocaleString()},${(product.revenue / product.quantity).toFixed(2)}\n`;
        });

        // Create download link
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `Sales_Report_${timeFilter}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Download Sales Report as PDF
    const downloadPDFReport = async () => {
        const reportData = getProductSalesReport();
        const filteredOrders = filterOrdersByTime(orders);

        // Calculate summary stats
        const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const totalOrders = filteredOrders.length;

        // Create a temporary div for PDF content
        const tempDiv = document.createElement('div');
        tempDiv.style.padding = '20px';
        tempDiv.style.fontFamily = 'Arial, sans-serif';
        tempDiv.style.backgroundColor = 'white';

        tempDiv.innerHTML = `
            <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #667eea; padding-bottom: 15px;">
                <h1 style="color: #667eea; font-size: 28px; margin-bottom: 5px;">🌿 Fresh Flow - Sales Report</h1>
                <p style="color: #666; font-size: 14px;">Period: ${timeFilter === 'custom' ? `${startDate || 'Start'} to ${endDate || 'End'}` : timeFilter.toUpperCase()} | Generated: ${new Date().toLocaleString()}</p>
            </div>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                <h2 style="color: #333; font-size: 18px; margin-bottom: 15px;">Summary</h2>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                    <div style="text-align: center;">
                        <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Total Revenue</div>
                        <div style="font-size: 20px; color: #667eea; font-weight: bold;">₹${totalRevenue.toLocaleString()}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Total Orders</div>
                        <div style="font-size: 20px; color: #667eea; font-weight: bold;">${totalOrders}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Unique Customers</div>
                        <div style="font-size: 20px; color: #667eea; font-weight: bold;">${new Set(filteredOrders.map(o => o.userId)).size}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Products Sold</div>
                        <div style="font-size: 20px; color: #667eea; font-weight: bold;">${reportData.length}</div>
                    </div>
                </div>
            </div>
            
            <h2 style="color: #333; margin-bottom: 10px; font-size: 18px;">Detailed Product Sales</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <thead style="background: #667eea; color: white;">
                    <tr>
                        <th style="padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase;">Rank</th>
                        <th style="padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase;">Product Name</th>
                        <th style="padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase;">Quantity Sold</th>
                        <th style="padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase;">Total Revenue</th>
                        <th style="padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase;">Avg. Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${reportData.map((product, index) => `
                        <tr style="border-bottom: 1px solid #e5e7eb;">
                            <td style="padding: 12px;">
                                <span style="background: ${index < 3 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '#6b7280'}; color: white; padding: 4px 10px; border-radius: 20px; font-weight: bold; display: inline-block; min-width: 30px; text-align: center;">
                                    ${index + 1}
                                </span>
                            </td>
                            <td style="padding: 12px; font-size: 14px;">${product.name}</td>
                            <td style="padding: 12px; font-size: 14px;">${product.quantity.toFixed(3)} ${product.unit || 'kg'}</td>
                            <td style="padding: 12px; font-size: 14px;">₹${product.revenue.toLocaleString()}</td>
                            <td style="padding: 12px; font-size: 14px;">₹${(product.revenue / product.quantity).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 5px 0;">Fresh Flow - Premium Organic Products</p>
                <p style="margin: 5px 0;">Thank you for choosing Fresh Flow!</p>
            </div>
        `;

        // Append to body temporarily
        document.body.appendChild(tempDiv);

        // Configure html2pdf options
        const opt = {
            margin: [15, 15, 15, 15],
            filename: `Sales_Report_${timeFilter}_${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                letterRendering: true,
                logging: false
            },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait',
                compress: true
            },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        // Generate and download PDF
        try {
            await html2pdf().set(opt).from(tempDiv).save();
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
        } finally {
            // Remove temporary div
            document.body.removeChild(tempDiv);
        }
    };

    // Vibrant, modern color palette for charts
    const COLORS = ['#667eea', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

    if (loading) {
        return (
            <div className="dashboard">
                <div className="dashboard-container">
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        Loading dashboard...
                    </div>
                </div>
            </div>
        );
    }

    const salesData = getSalesOverviewData();
    const categoryData = getCategoryData();
    const topProductsData = getTopProducts();

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div className="dashboard-container">
                    <div className="header-content">
                        <div>
                            <h1>Admin Dashboard</h1>
                            <p>Welcome back, {user?.displayName || 'Admin'}</p>
                        </div>
                        <div className="header-actions-group">
                            <button
                                className="home-btn-dashboard"
                                onClick={() => navigate('/')}
                                title="Go to Homepage"
                            >
                                <Home size={20} />
                                Home
                            </button>
                            <div className="time-filter">
                                <button
                                    className={timeFilter === 'week' ? 'active' : ''}
                                    onClick={() => setTimeFilter('week')}
                                >
                                    Week
                                </button>
                                <button
                                    className={timeFilter === 'month' ? 'active' : ''}
                                    onClick={() => setTimeFilter('month')}
                                >
                                    Month
                                </button>
                                <button
                                    className={timeFilter === 'all' ? 'active' : ''}
                                    onClick={() => setTimeFilter('all')}
                                >
                                    All Time
                                </button>
                                <button
                                    className={timeFilter === 'custom' ? 'active' : ''}
                                    onClick={() => setTimeFilter('custom')}
                                >
                                    Custom Range
                                </button>
                            </div>
                            {timeFilter === 'custom' && (
                                <div className="date-range-picker">
                                    <div className="date-input">
                                        <label>From:</label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="date-input">
                                        <label>To:</label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="dashboard-container">
                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card revenue">
                        <div className="stat-icon">
                            <DollarSign size={32} />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">TOTAL REVENUE</p>
                            <h2 className="stat-value">₹{stats.totalRevenue.toLocaleString()}</h2>
                            <p className="stat-change">
                                <span className="positive">
                                    <ArrowUp size={16} /> 12.5%
                                </span>
                                THIS {timeFilter.toUpperCase()}
                            </p>
                        </div>
                    </div>

                    <div className="stat-card orders">
                        <div className="stat-icon">
                            <ShoppingBag size={32} />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">TOTAL ORDERS</p>
                            <h2 className="stat-value">{stats.totalOrders}</h2>
                            <p className="stat-change">
                                <span className="positive">
                                    <ArrowUp size={16} /> 8.3%
                                </span>
                                ORDERS PLACED
                            </p>
                        </div>
                    </div>

                    <div className="stat-card customers">
                        <div className="stat-icon">
                            <Users size={32} />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">CUSTOMERS</p>
                            <h2 className="stat-value">{stats.totalCustomers}</h2>
                            <p className="stat-change">
                                UNIQUE BUYERS
                            </p>
                        </div>
                    </div>

                    <div className="stat-card products">
                        <div className="stat-icon">
                            <Package size={32} />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">PRODUCTS</p>
                            <h2 className="stat-value">{stats.totalProducts}</h2>
                            <p className="stat-change">
                                IN CATALOG
                            </p>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="charts-grid">
                    {/* Sales Overview Area Chart */}
                    <div className="chart-card full-width sales-chart">
                        <div className="chart-header">
                            <h3><TrendingUp size={20} /> Sales Overview</h3>
                            <p>Daily revenue trend</p>
                        </div>
                        <ResponsiveContainer width="100%" height={500}>
                            <AreaChart data={salesData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#667eea" stopOpacity={0.8} />
                                        <stop offset="50%" stopColor="#764ba2" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#667eea" stopOpacity={0.05} />
                                    </linearGradient>
                                    <linearGradient id="salesStroke" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#667eea" />
                                        <stop offset="50%" stopColor="#764ba2" />
                                        <stop offset="100%" stopColor="#f093fb" />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="rgba(102, 126, 234, 0.1)"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={{ stroke: 'rgba(102, 126, 234, 0.2)' }}
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    tickFormatter={(value) => `₹${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        border: 'none',
                                        borderRadius: '12px',
                                        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2)',
                                        padding: '12px 16px'
                                    }}
                                    labelStyle={{ color: '#1f2937', fontWeight: 600, marginBottom: 8 }}
                                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                                />
                                <Legend
                                    wrapperStyle={{ paddingTop: 20 }}
                                    formatter={() => 'Daily Revenue'}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="url(#salesStroke)"
                                    strokeWidth={3}
                                    fill="url(#salesGradient)"
                                    dot={{ r: 4, fill: '#667eea', stroke: '#fff', strokeWidth: 2 }}
                                    activeDot={{ r: 8, fill: '#764ba2', stroke: '#fff', strokeWidth: 3 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Category Pie Chart */}
                    <div className="chart-card">
                        <div className="chart-header">
                            <h3>Orders by Category</h3>
                            <p>Product distribution</p>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(entry) => entry.name}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Top Products Bar Chart */}
                    <div className="chart-card">
                        <div className="chart-header">
                            <h3>Top Products</h3>
                            <p>Best sellers by quantity</p>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={topProductsData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={100} />
                                <Tooltip formatter={(value) => [`${value.toFixed(2)}`, 'Quantity Sold']} />
                                <Bar dataKey="quantity" fill="url(#colorRevenue)" radius={[4, 4, 0, 0]} />
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#667eea" />
                                        <stop offset="100%" stopColor="#764ba2" />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Product Sales Report */}
                    <div className="chart-card full-width">
                        <div className="chart-header">
                            <div>
                                <h3><Package size={20} /> Product Sales Report</h3>
                                <p>Quantity and revenue sold per product</p>
                            </div>
                            <div className="download-buttons">
                                <button onClick={downloadCSVReport} className="download-btn csv">
                                    <FileText size={18} />
                                    Export CSV
                                </button>
                                <button onClick={downloadPDFReport} className="download-btn pdf">
                                    <Download size={18} />
                                    Export PDF
                                </button>
                            </div>
                        </div>
                        <div className="report-summary">
                            <div className="summary-item">
                                <span className="summary-label">Total Unique Customers in this Period:</span>
                                <span className="summary-value">{new Set(filterOrdersByTime(orders).map(o => o.userId).filter(Boolean)).size}</span>
                            </div>
                        </div>
                        <div className="product-sales-report">
                            <div className="product-sales-table-wrapper">
                                <table className="product-sales-table">
                                    <thead>
                                        <tr>
                                            <th>Rank</th>
                                            <th>Product Name</th>
                                            <th>Quantity Sold</th>
                                            <th>Total Revenue</th>
                                            <th>Avg. Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getProductSalesReport().map((product, index) => (
                                            <tr key={product.name}>
                                                <td>
                                                    <div className="rank-badge" style={{
                                                        background: index < 3 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '#6b7280'
                                                    }}>
                                                        {index + 1}
                                                    </div>
                                                </td>
                                                <td className="product-name">{product.name}</td>
                                                <td className="quantity-sold">{product.quantity.toFixed(3)} {product.unit || 'kg'}</td>
                                                <td className="revenue-amount">₹{product.revenue.toLocaleString()}</td>
                                                <td>₹{(product.revenue / product.quantity).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Unique Customers Details Section */}
                        <div className="report-summary" style={{ marginTop: '2rem' }}>
                            <div className="chart-header">
                                <div>
                                    <h3><Users size={20} /> Unique Customers Details</h3>
                                    <p>Comprehensive list of buyers for the selected period</p>
                                </div>
                            </div>
                            <div className="product-sales-table-wrapper">
                                <table className="product-sales-table">
                                    <thead>
                                        <tr>
                                            <th>Customer Name</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Orders</th>
                                            <th>Total Spent</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getUniqueCustomerDetails().length > 0 ? (
                                            getUniqueCustomerDetails().map((customer) => (
                                                <tr key={customer.uid}>
                                                    <td className="product-name">{customer.name}</td>
                                                    <td>{customer.email}</td>
                                                    <td>{customer.phone}</td>
                                                    <td style={{ textAlign: 'center' }}>{customer.orderCount}</td>
                                                    <td className="revenue-amount">₹{customer.totalSpent.toLocaleString()}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No customer data found for this period</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions">
                    <h3>Quick Actions</h3>
                    <div className="actions-grid">
                        <button onClick={() => navigate('/admin/products')} className="action-btn">
                            <Package size={20} />
                            Manage Products
                        </button>
                        <button onClick={() => navigate('/admin/orders')} className="action-btn">
                            <ShoppingBag size={20} />
                            View Orders
                        </button>
                    </div>
                </div>

                {/* Recent Orders Table */}
                <div className="recent-orders">
                    <h3>{timeFilter === 'all' ? 'Recent Orders' : `Orders in Period (${filterOrdersByTime(orders).length})`}</h3>
                    <div className="orders-table-wrapper">
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Items</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filterOrdersByTime(orders).slice(0, 10).map(order => (
                                    <tr key={order.id}>
                                        <td>#{order.id?.substring(0, 8)}</td>
                                        <td>{order.userName || 'Guest'}</td>
                                        <td>{order.items?.length || 0} items</td>
                                        <td>₹{order.totalAmount}</td>
                                        <td>
                                            <span className={`status-badge ${order.status?.toLowerCase()}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Low Stock Popup Notification */}
            {showLowStockPopup && (
                <div className="popup-overlay" onClick={() => setShowLowStockPopup(false)}>
                    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                        <div className="popup-header">
                            <div className="popup-icon">
                                <AlertTriangle size={32} />
                            </div>
                            <h2>Stock Alert!</h2>
                            <button className="popup-close" onClick={() => setShowLowStockPopup(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className="popup-body">
                            <p className="popup-message">{lowStockMessage}</p>
                        </div>
                        <div className="popup-actions">
                            <button
                                className="popup-btn secondary"
                                onClick={() => setShowLowStockPopup(false)}
                            >
                                Dismiss
                            </button>
                            <button
                                className="popup-btn primary"
                                onClick={() => {
                                    setShowLowStockPopup(false);
                                    navigate('/admin/products');
                                }}
                            >
                                Manage Stock
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;

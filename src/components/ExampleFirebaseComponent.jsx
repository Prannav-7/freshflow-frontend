import { useState, useEffect } from 'react';
import { getUsers, addUser, healthCheck } from '../api';

/**
 * Example component demonstrating how to use the Firebase backend API
 */
function ExampleFirebaseComponent() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [backendStatus, setBackendStatus] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'user'
    });

    // Check backend health on component mount
    useEffect(() => {
        checkBackendHealth();
    }, []);

    // Check if backend is running
    const checkBackendHealth = async () => {
        try {
            const result = await healthCheck();
            setBackendStatus(result);
        } catch (err) {
            setBackendStatus({ success: false, error: 'Backend not running' });
        }
    };

    // Fetch users from backend
    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Add new user
    const handleAddUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await addUser(formData);
            // Clear form
            setFormData({ name: '', email: '', role: 'user' });
            // Refresh users list
            await fetchUsers();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Firebase Backend Example</h1>

            {/* Backend Status */}
            <div style={{
                padding: '15px',
                marginBottom: '20px',
                borderRadius: '8px',
                backgroundColor: backendStatus?.message ? '#d4edda' : '#f8d7da',
                border: `1px solid ${backendStatus?.message ? '#c3e6cb' : '#f5c6cb'}`
            }}>
                <h3>Backend Status</h3>
                {backendStatus?.message ? (
                    <p style={{ color: '#155724' }}>✅ {backendStatus.message}</p>
                ) : (
                    <p style={{ color: '#721c24' }}>❌ Backend not connected</p>
                )}
            </div>

            {/* Add User Form */}
            <div style={{
                padding: '20px',
                marginBottom: '20px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9'
            }}>
                <h2>Add New User</h2>
                <form onSubmit={handleAddUser}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>
                            Name:
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    marginTop: '5px',
                                    borderRadius: '4px',
                                    border: '1px solid #ccc'
                                }}
                            />
                        </label>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>
                            Email:
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    marginTop: '5px',
                                    borderRadius: '4px',
                                    border: '1px solid #ccc'
                                }}
                            />
                        </label>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>
                            Role:
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    marginTop: '5px',
                                    borderRadius: '4px',
                                    border: '1px solid #ccc'
                                }}
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                                <option value="moderator">Moderator</option>
                            </select>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        {loading ? 'Adding...' : 'Add User'}
                    </button>
                </form>
            </div>

            {/* Users List */}
            <div style={{
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#fff'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h2>Users List</h2>
                    <button
                        onClick={fetchUsers}
                        disabled={loading}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Loading...' : 'Fetch Users'}
                    </button>
                </div>

                {error && (
                    <div style={{
                        padding: '10px',
                        marginBottom: '15px',
                        backgroundColor: '#f8d7da',
                        border: '1px solid #f5c6cb',
                        borderRadius: '4px',
                        color: '#721c24'
                    }}>
                        Error: {error}
                    </div>
                )}

                {users.length === 0 ? (
                    <p style={{ color: '#666' }}>No users found. Click "Fetch Users" or add a new user.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                                        <td style={{ padding: '12px' }}>{user.id}</td>
                                        <td style={{ padding: '12px' }}>{user.name}</td>
                                        <td style={{ padding: '12px' }}>{user.email}</td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                backgroundColor: user.role === 'admin' ? '#ffc107' : '#17a2b8',
                                                color: 'white',
                                                borderRadius: '4px',
                                                fontSize: '12px'
                                            }}>
                                                {user.role}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ExampleFirebaseComponent;

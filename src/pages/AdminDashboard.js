import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = () => {
  const { currentUser, logout, API_BASE_URL } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState('');
  const [newUser, setNewUser] = useState({
    email: '',
    type: 'voyager',
    name: '',
    password: 'password' // Default password
  });
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    // Initial mock users
    setUsers([
      { id: 1, email: 'voyager@test.com', type: 'voyager', name: 'John Voyager', status: 'active', joinDate: '2024-01-01' },
      { id: 2, email: 'admin@test.com', type: 'admin', name: 'Admin User', status: 'active', joinDate: '2024-01-01' },
      { id: 3, email: 'manager@test.com', type: 'manager', name: 'Manager User', status: 'active', joinDate: '2024-01-01' },
      { id: 4, email: 'cook@test.com', type: 'head-cook', name: 'Head Cook', status: 'active', joinDate: '2024-01-02' },
      { id: 5, email: 'supervisor@test.com', type: 'supervisor', name: 'Supervisor', status: 'active', joinDate: '2024-01-02' }
    ]);

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const ordersResponse = await fetch(`${API_BASE_URL}/api/admin/orders`);
      const bookingsResponse = await fetch(`${API_BASE_URL}/api/admin/bookings`);
      const usersResponse = await fetch(`${API_BASE_URL}/api/admin/users`);
      
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setOrders(ordersData);
      }
      
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData);
      }
  
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }
    } catch (error) {
      setMessage('Error fetching data: ' + error.message);
      setTimeout(() => setMessage(''), 5000);
    }
  };
  

  const addUser = async () => {
    if (newUser.email && newUser.name) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newUser),
        });
  
        if (response.ok) {
          const result = await response.json();
          setUsers([...users, result.user]);
          setNewUser({ email: '', type: 'voyager', name: '', password: 'password' });
          setMessage('✅ User added successfully! Default password: "password"');
          setTimeout(() => setMessage(''), 5000);
        } else {
          throw new Error('Failed to add user');
        }
      } catch (error) {
        setMessage('❌ Failed to add user: ' + error.message);
        setTimeout(() => setMessage(''), 5000);
      }
    } else {
      setMessage('❌ Please fill all fields');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const updateUser = async () => {
    if (editingUser) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/users/${editingUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editingUser),
        });
  
        if (response.ok) {
          const result = await response.json();
          setUsers(users.map(user => 
            user.id === editingUser.id ? result.user : user
          ));
          setEditingUser(null);
          setMessage('✅ User updated successfully');
          setTimeout(() => setMessage(''), 5000);
        } else {
          throw new Error('Failed to update user');
        }
      } catch (error) {
        setMessage('❌ Failed to update user: ' + error.message);
        setTimeout(() => setMessage(''), 5000);
      }
    }
  };

  const cancelEdit = () => {
    setEditingUser(null);
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
          method: 'DELETE',
        });
  
        if (response.ok) {
          setUsers(users.filter(user => user.id !== userId));
          setMessage('✅ User deleted successfully');
          setTimeout(() => setMessage(''), 5000);
        } else {
          throw new Error('Failed to delete user');
        }
      } catch (error) {
        setMessage('❌ Failed to delete user: ' + error.message);
        setTimeout(() => setMessage(''), 5000);
      }
    }
  };
  

  const resetUserPassword = (userId) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, password: 'password' } : user
    ));
    setMessage('✅ Password reset to "password"');
    setTimeout(() => setMessage(''), 5000);
  };

  const toggleUserStatus = (userId) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' } : user
    ));
    setMessage('✅ User status updated');
    setTimeout(() => setMessage(''), 5000);
  };

  const renderUsers = () => (
    <div>
      <h3>👥 User Management</h3>
      
      {/* Add User Form */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h4>➕ Add New User</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '15px', alignItems: 'end' }}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              placeholder="user@example.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Full Name:</label>
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              placeholder="Full Name"
              required
            />
          </div>
          <div className="form-group">
            <label>Role:</label>
            <select
              value={newUser.type}
              onChange={(e) => setNewUser({...newUser, type: e.target.value})}
            >
              <option value="voyager">Voyager</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="head-cook">Head Cook</option>
              <option value="supervisor">Supervisor</option>
            </select>
          </div>
          <button className="btn btn-success" onClick={addUser} style={{ height: 'fit-content' }}>
            Add User
          </button>
        </div>
        <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
          💡 Default password for new users: <strong>password</strong>
        </p>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="card" style={{ marginBottom: '20px', background: '#f8f9fa', border: '2px solid #007bff' }}>
          <h4>✏️ Edit User: {editingUser.email}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '15px', alignItems: 'end' }}>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={editingUser.email}
                onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Full Name:</label>
              <input
                type="text"
                value={editingUser.name}
                onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Role:</label>
              <select
                value={editingUser.type}
                onChange={(e) => setEditingUser({...editingUser, type: e.target.value})}
              >
                <option value="voyager">Voyager</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="head-cook">Head Cook</option>
                <option value="supervisor">Supervisor</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-success" onClick={updateUser}>
                💾 Update
              </button>
              <button className="btn btn-secondary" onClick={cancelEdit}>
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="grid">
        {users.map(user => (
          <div key={user.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h4>{user.email}</h4>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Role:</strong> 
                  <span style={{ 
                    padding: '2px 8px', 
                    borderRadius: '12px', 
                    fontSize: '12px',
                    marginLeft: '8px',
                    background: user.type === 'admin' ? '#dc3545' : 
                               user.type === 'manager' ? '#17a2b8' : 
                               user.type === 'head-cook' ? '#28a745' : 
                               user.type === 'supervisor' ? '#ffc107' : '#007bff',
                    color: 'white'
                  }}>
                    {user.type}
                  </span>
                </p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span 
                    className={user.status === 'active' ? 'status-approved' : 'status-pending'}
                    style={{ cursor: 'pointer' }}
                    onClick={() => toggleUserStatus(user.id)}
                  >
                    {user.status}
                  </span>
                </p>
                <p><strong>Joined:</strong> {user.joinDate}</p>
              </div>
            </div>
            
            <div style={{ marginTop: '15px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button 
                className="btn btn-warning"
                onClick={() => editUser(user)}
              >
                ✏️ Edit
              </button>
              <button 
                className="btn btn-info"
                onClick={() => resetUserPassword(user.id)}
              >
                🔑 Reset Password
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => toggleUserStatus(user.id)}
              >
                {user.status === 'active' ? '⏸️ Deactivate' : '▶️ Activate'}
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => deleteUser(user.id)}
                disabled={user.email === currentUser.email}
              >
                🗑️ Delete
              </button>
            </div>
            {user.email === currentUser.email && (
              <p style={{ fontSize: '12px', color: '#dc3545', marginTop: '10px' }}>
                ⚠️ You cannot delete your own account
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderOrders = () => (
    <div>
      <h3>📦 All Orders</h3>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button className="btn btn-primary" onClick={fetchData}>
          🔄 Refresh Data
        </button>
        <span className="btn btn-secondary">
          Total Orders: {orders.length}
        </span>
      </div>
      
      {orders.length === 0 ? (
        <div className="card">
          <h4>No orders found</h4>
          <p>There are no orders in the system yet.</p>
        </div>
      ) : (
        <div className="grid">
          {orders.map(order => (
            <div key={order.id} className="card">
              <h4>Order #{order.id}</h4>
              <p><strong>Type:</strong> 
                <span style={{ 
                  padding: '2px 8px', 
                  borderRadius: '12px', 
                  fontSize: '12px',
                  marginLeft: '8px',
                  background: order.type === 'catering' ? '#28a745' : '#17a2b8',
                  color: 'white'
                }}>
                  {order.type}
                </span>
              </p>
              <p><strong>Item:</strong> {order.item}</p>
              <p><strong>Description:</strong> {order.description || 'N/A'}</p>
              <p><strong>Price:</strong> ${order.price}</p>
              <p><strong>User ID:</strong> {order.userId}</p>
              <p>
                <strong>Status:</strong>{' '}
                <span className={`status-${order.status}`}>
                  {order.status}
                </span>
              </p>
              <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderBookings = () => (
    <div>
      <h3>📅 All Bookings</h3>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button className="btn btn-primary" onClick={fetchData}>
          🔄 Refresh Data
        </button>
        <span className="btn btn-secondary">
          Total Bookings: {bookings.length}
        </span>
      </div>
      
      {bookings.length === 0 ? (
        <div className="card">
          <h4>No bookings found</h4>
          <p>There are no bookings in the system yet.</p>
        </div>
      ) : (
        <div className="grid">
          {bookings.map(booking => (
            <div key={booking.id} className="card">
              <h4>Booking #{booking.id}</h4>
              <p><strong>Type:</strong> 
                <span style={{ 
                  padding: '2px 8px', 
                  borderRadius: '12px', 
                  fontSize: '12px',
                  marginLeft: '8px',
                  background: '#6f42c1',
                  color: 'white'
                }}>
                  {booking.type}
                </span>
              </p>
              <p><strong>User:</strong> {booking.userName || booking.userId}</p>
              {booking.type && <p><strong>Service:</strong> {booking.service || booking.movieName || booking.equipment || booking.roomType || 'N/A'}</p>}
              {booking.guests && <p><strong>Guests:</strong> {booking.guests}</p>}
              {booking.seats && <p><strong>Seats:</strong> {booking.seats}</p>}
              {booking.duration && <p><strong>Duration:</strong> {booking.duration} hours</p>}
              <p>
                <strong>Status:</strong>{' '}
                <span className="status-approved">
                  {booking.status}
                </span>
              </p>
              <p><strong>Date:</strong> {new Date(booking.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div>
      <h3>📊 Analytics Dashboard</h3>
      
      <div className="grid">
        <div className="card">
          <h4>👥 Total Users</h4>
          <p style={{ fontSize: '3em', fontWeight: 'bold', color: '#007bff', margin: '0' }}>
            {users.length}
          </p>
          <p style={{ color: '#666' }}>Registered users in system</p>
        </div>
        
        <div className="card">
          <h4>📦 Total Orders</h4>
          <p style={{ fontSize: '3em', fontWeight: 'bold', color: '#28a745', margin: '0' }}>
            {orders.length}
          </p>
          <p style={{ color: '#666' }}>Catering & Stationery orders</p>
        </div>
        
        <div className="card">
          <h4>📅 Total Bookings</h4>
          <p style={{ fontSize: '3em', fontWeight: 'bold', color: '#ffc107', margin: '0' }}>
            {bookings.length}
          </p>
          <p style={{ color: '#666' }}>Service bookings made</p>
        </div>
        
        <div className="card">
          <h4>💰 Total Revenue</h4>
          <p style={{ fontSize: '2em', fontWeight: 'bold', color: '#dc3545', margin: '0' }}>
            ${orders.reduce((sum, order) => sum + (order.price || 0), 0).toFixed(2)}
          </p>
          <p style={{ color: '#666' }}>From all orders</p>
        </div>
      </div>

      {/* User Role Distribution */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h4>👥 User Role Distribution</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '15px' }}>
          {['voyager', 'admin', 'manager', 'head-cook', 'supervisor'].map(role => {
            const count = users.filter(user => user.type === role).length;
            return (
              <div key={role} style={{ textAlign: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#007bff' }}>{count}</div>
                <div style={{ textTransform: 'capitalize', color: '#666' }}>{role.replace('-', ' ')}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h4>📈 Recent Activity</h4>
        <div style={{ marginTop: '15px' }}>
          <p>🟢 System running normally</p>
          <p>📊 Last data refresh: {new Date().toLocaleString()}</p>
          <p>👤 Current admin: {currentUser?.name}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard">
      <div className="sidebar">
        <h2>⚙️ Admin Dashboard</h2>
        <div className="user-welcome">
          <p>Welcome,</p>
          <h3>{currentUser?.name}</h3>
          <p>{currentUser?.email}</p>
        </div>
        <ul>
          <li onClick={() => setActiveTab('users')}>👥 Manage Users</li>
          <li onClick={() => setActiveTab('orders')}>📦 View All Orders</li>
          <li onClick={() => setActiveTab('bookings')}>📅 View All Bookings</li>
          <li onClick={() => setActiveTab('analytics')}>📊 Analytics</li>
          <li onClick={logout}>🚪 Logout</li>
        </ul>
      </div>

      <div className="main-content">
        {message && <div className="success-message">{message}</div>}
        
        <h1>
          {activeTab === 'users' && '👥 User Management'}
          {activeTab === 'orders' && '📦 All Orders'}
          {activeTab === 'bookings' && '📅 All Bookings'}
          {activeTab === 'analytics' && '📊 Analytics Dashboard'}
        </h1>

        {activeTab === 'users' && renderUsers()}
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'bookings' && renderBookings()}
        {activeTab === 'analytics' && renderAnalytics()}
      </div>
    </div>
  );
};

export default AdminDashboard;
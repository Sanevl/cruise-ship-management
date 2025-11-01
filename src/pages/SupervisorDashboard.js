import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const SupervisorDashboard = () => {
  const { currentUser, logout, API_BASE_URL } = useAuth();
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/stationery`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      setMessage('Error fetching orders: ' + error.message);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
        setMessage(`Order ${orderId} status updated to ${newStatus}`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Error updating order: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'approved': return '#28a745';
      case 'delivered': return '#6c757d';
      default: return '#6c757d';
    }
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <h2>👔 Supervisor Dashboard</h2>
        <div className="user-welcome">
          <p>Welcome,</p>
          <h3>{currentUser?.name}</h3>
          <p>{currentUser?.email}</p>
        </div>
        <ul>
          <li onClick={() => fetchOrders()}>🔄 Refresh Orders</li>
          <li onClick={logout}>🚪 Logout</li>
        </ul>
      </div>

      <div className="main-content">
        {message && <div className="success-message">{message}</div>}
        
        <h1>📚 Stationery Orders</h1>
        
        {orders.length === 0 ? (
          <div className="card">
            <h3>No stationery orders found</h3>
            <p>All orders have been processed!</p>
          </div>
        ) : (
          <div className="grid">
            {orders.map(order => (
              <div key={order.id} className="card">
                <h4>Order #{order.id}</h4>
                <p><strong>Item:</strong> {order.item}</p>
                <p><strong>Description:</strong> {order.description}</p>
                <p><strong>Price:</strong> ${order.price}</p>
                <p><strong>Order Time:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span style={{ color: getStatusColor(order.status), fontWeight: 'bold' }}>
                    {order.status.toUpperCase()}
                  </span>
                </p>
                
                <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button 
                    className="btn btn-success"
                    onClick={() => updateOrderStatus(order.id, 'approved')}
                    disabled={order.status !== 'pending'}
                  >
                    Approve Order
                  </button>
                  <button 
                    className="btn btn-info"
                    onClick={() => updateOrderStatus(order.id, 'delivered')}
                    disabled={order.status !== 'approved'}
                  >
                    Mark as Delivered
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupervisorDashboard;
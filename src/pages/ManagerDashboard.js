import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ManagerDashboard = () => {
  const { currentUser, logout, API_BASE_URL } = useAuth();
  const [activeTab, setActiveTab] = useState('resort');
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/bookings`);
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      setMessage('Error fetching bookings: ' + error.message);
    }
  };

  const getBookingsByType = (type) => {
    return bookings.filter(booking => booking.type === type);
  };

  const renderBookings = (bookings, type) => (
    <div>
      <h3>
        {type === 'resort' && '🏨 Resort Bookings'}
        {type === 'movie' && '🎬 Movie Bookings'}
        {type === 'salon' && '💇 Beauty Salon Bookings'}
        {type === 'fitness' && '💪 Fitness Center Bookings'}
        {type === 'party' && '🎉 Party Hall Bookings'}
      </h3>
      {bookings.length === 0 ? (
        <div className="card">
          <p>No {type} bookings found</p>
        </div>
      ) : (
        <div className="grid">
          {bookings.map(booking => (
            <div key={booking.id} className="card">
              <h4>Booking #{booking.id}</h4>
              <p><strong>User ID:</strong> {booking.userId}</p>
              {booking.item && <p><strong>Item:</strong> {booking.item}</p>}
              {booking.description && <p><strong>Description:</strong> {booking.description}</p>}
              <p><strong>Status:</strong> <span className="status-approved">{booking.status}</span></p>
              <p><strong>Date:</strong> {new Date(booking.createdAt).toLocaleString()}</p>
              <button className="btn btn-primary">View Details</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="dashboard">
      <div className="sidebar">
        <h2>📊 Manager Dashboard</h2>
        <div className="user-welcome">
          <p>Welcome,</p>
          <h3>{currentUser?.name}</h3>
          <p>{currentUser?.email}</p>
        </div>
        <ul>
          <li onClick={() => setActiveTab('resort')}>🏨 Resort Bookings</li>
          <li onClick={() => setActiveTab('movie')}>🎬 Movie Bookings</li>
          <li onClick={() => setActiveTab('salon')}>💇 Beauty Salon</li>
          <li onClick={() => setActiveTab('fitness')}>💪 Fitness Center</li>
          <li onClick={() => setActiveTab('party')}>🎉 Party Hall</li>
          <li onClick={logout}>🚪 Logout</li>
        </ul>
      </div>

      <div className="main-content">
        {message && <div className="success-message">{message}</div>}
        
        <h1>
          {activeTab === 'resort' && '🏨 Resort Bookings'}
          {activeTab === 'movie' && '🎬 Movie Bookings'}
          {activeTab === 'salon' && '💇 Beauty Salon Bookings'}
          {activeTab === 'fitness' && '💪 Fitness Center Bookings'}
          {activeTab === 'party' && '🎉 Party Hall Bookings'}
        </h1>

        {activeTab === 'resort' && renderBookings(getBookingsByType('resort'), 'resort')}
        {activeTab === 'movie' && renderBookings(getBookingsByType('movie'), 'movie')}
        {activeTab === 'salon' && renderBookings(getBookingsByType('salon'), 'salon')}
        {activeTab === 'fitness' && renderBookings(getBookingsByType('fitness'), 'fitness')}
        {activeTab === 'party' && renderBookings(getBookingsByType('party'), 'party')}
      </div>
    </div>
  );
};

export default ManagerDashboard;
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const VoyagerDashboard = () => {
  const { currentUser, logout, API_BASE_URL } = useAuth();
  const [activeTab, setActiveTab] = useState('catering');
  const [cateringItems, setCateringItems] = useState([]);
  const [stationeryItems, setStationeryItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState('');
  const [bookingData, setBookingData] = useState({
    resort: { type: 'oceanview', date: '', guests: 1 },
    movie: { movieName: '', showTime: '', seats: 1 },
    salon: { service: 'haircut', date: '', time: '' },
    fitness: { equipment: 'treadmill', date: '', duration: 1 },
    party: { type: 'birthday', date: '', guests: 10 }
  });
  const [myOrders, setMyOrders] = useState([]);
  const [myBookings, setMyBookings] = useState([]);

  useEffect(() => {
    // Mock catering items
    setCateringItems([
      { id: 1, name: 'Club Sandwich', category: 'food', price: 8.99, description: 'Fresh sandwich with turkey, bacon, lettuce, and tomato' },
      { id: 2, name: 'Margherita Pizza', category: 'food', price: 12.99, description: 'Classic pizza with fresh tomato sauce and mozzarella' },
      { id: 3, name: 'Fresh Coffee', category: 'beverage', price: 3.99, description: 'Premium hot brewed coffee' },
      { id: 4, name: 'Potato Chips', category: 'snack', price: 2.99, description: 'Crispy golden potato chips' },
      { id: 5, name: 'Fruit Juice', category: 'beverage', price: 4.99, description: 'Freshly squeezed orange juice' },
      { id: 6, name: 'Chocolate Cake', category: 'dessert', price: 6.99, description: 'Rich chocolate cake slice' }
    ]);

    // Mock stationery items
    setStationeryItems([
      { id: 1, name: 'Premium Chocolate Box', category: 'chocolate', price: 15.99, description: 'Assorted luxury chocolates in gift box' },
      { id: 2, name: 'Gift Card', category: 'gift', price: 5.99, description: 'Elegant custom greeting card' },
      { id: 3, name: 'Adventure Novel', category: 'book', price: 12.99, description: 'Bestselling adventure book' },
      { id: 4, name: 'Souvenir Pen', category: 'gift', price: 8.99, description: 'Cruise branded luxury pen' },
      { id: 5, name: 'Photo Frame', category: 'gift', price: 11.99, description: 'Beautiful wooden photo frame' }
    ]);

    fetchMyData();
  }, []);

  const fetchMyData = async () => {
    try {
      const ordersResponse = await fetch(`${API_BASE_URL}/api/user/orders/${currentUser.uid}`);
      const bookingsResponse = await fetch(`${API_BASE_URL}/api/user/bookings/${currentUser.uid}`);
      
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setMyOrders(ordersData);
      }
      
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        setMyBookings(bookingsData);
      }
    } catch (error) {
      console.log('Error fetching data:', error.message);
    }
  };

  const addToCart = (item, type) => {
    const cartItem = {
      ...item,
      type: type,
      quantity: 1,
      cartId: Date.now() // Unique ID for cart item
    };
    setCart([...cart, cartItem]);
    setMessage(`✅ ${item.name} added to cart!`);
    setTimeout(() => setMessage(''), 3000);
  };

  const placeOrder = async () => {
    if (cart.length === 0) {
      setMessage('❌ Your cart is empty!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      let successCount = 0;
      
      for (const item of cart) {
        const orderData = {
          userId: currentUser.uid,
          userName: currentUser.name,
          item: item.name,
          price: item.price,
          type: item.type,
          description: item.description,
          category: item.category
        };

        const endpoint = item.type === 'catering' ? '/api/orders/catering' : '/api/orders/stationery';
        
        const response = await fetch(API_BASE_URL + endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
        });

        if (response.ok) {
          successCount++;
        }
      }

      if (successCount === cart.length) {
        setMessage(`🎉 All ${successCount} orders placed successfully!`);
        setCart([]);
        fetchMyData(); // Refresh orders list
      } else {
        setMessage(`⚠️ ${successCount}/${cart.length} orders placed. Some items may have failed.`);
      }
      
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      setMessage('❌ Failed to place orders: ' + error.message);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const removeFromCart = (cartId) => {
    const newCart = cart.filter(item => item.cartId !== cartId);
    setCart(newCart);
    setMessage('🗑️ Item removed from cart');
    setTimeout(() => setMessage(''), 3000);
  };

  const updateCartQuantity = (cartId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCart(cart.map(item => 
      item.cartId === cartId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const handleBooking = async (bookingType) => {
    try {
      const bookingPayload = {
        userId: currentUser.uid,
        userName: currentUser.name,
        ...bookingData[bookingType],
        type: bookingType
      };

      const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingPayload),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(`✅ ${bookingType.charAt(0).toUpperCase() + bookingType.slice(1)} booking confirmed! Booking ID: ${result.booking.id}`);
        setTimeout(() => setMessage(''), 5000);
        
        // Reset form
        setBookingData({
          ...bookingData,
          [bookingType]: getDefaultBookingData(bookingType)
        });
        
        fetchMyData(); // Refresh bookings list
      } else {
        throw new Error('Booking failed');
      }
    } catch (error) {
      setMessage(`❌ Failed to book ${bookingType}: ${error.message}`);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const getDefaultBookingData = (type) => {
    const defaults = {
      resort: { type: 'oceanview', date: '', guests: 1 },
      movie: { movieName: '', showTime: '', seats: 1 },
      salon: { service: 'haircut', date: '', time: '' },
      fitness: { equipment: 'treadmill', date: '', duration: 1 },
      party: { type: 'birthday', date: '', guests: 10 }
    };
    return defaults[type];
  };

  const updateBookingData = (type, field, value) => {
    setBookingData({
      ...bookingData,
      [type]: {
        ...bookingData[type],
        [field]: value
      }
    });
  };

  const renderCatering = () => (
    <div>
      <h3>🍽️ Catering Items</h3>
      <p style={{ color: '#666', marginBottom: '20px' }}>Order delicious food and beverages delivered to your room</p>
      <div className="grid">
        {cateringItems.map(item => (
          <div key={item.id} className="card">
            <h4>{item.name}</h4>
            <p style={{ color: '#666', fontStyle: 'italic' }}>{item.description}</p>
            <p><strong>Category:</strong> 
              <span style={{ 
                padding: '2px 8px', 
                borderRadius: '12px', 
                fontSize: '12px',
                marginLeft: '8px',
                background: item.category === 'food' ? '#28a745' : 
                           item.category === 'beverage' ? '#17a2b8' : 
                           item.category === 'snack' ? '#ffc107' : '#6f42c1',
                color: 'white'
              }}>
                {item.category}
              </span>
            </p>
            <p><strong>Price:</strong> <span style={{ color: '#dc3545', fontWeight: 'bold' }}>${item.price}</span></p>
            <button 
              className="btn btn-primary"
              onClick={() => addToCart(item, 'catering')}
            >
              🛒 Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStationery = () => (
    <div>
      <h3>📚 Stationery & Gift Items</h3>
      <p style={{ color: '#666', marginBottom: '20px' }}>Purchase gifts, books, and souvenirs</p>
      <div className="grid">
        {stationeryItems.map(item => (
          <div key={item.id} className="card">
            <h4>{item.name}</h4>
            <p style={{ color: '#666', fontStyle: 'italic' }}>{item.description}</p>
            <p><strong>Category:</strong> 
              <span style={{ 
                padding: '2px 8px', 
                borderRadius: '12px', 
                fontSize: '12px',
                marginLeft: '8px',
                background: item.category === 'chocolate' ? '#8b4513' : 
                           item.category === 'book' ? '#6610f2' : '#e83e8c',
                color: 'white'
              }}>
                {item.category}
              </span>
            </p>
            <p><strong>Price:</strong> <span style={{ color: '#dc3545', fontWeight: 'bold' }}>${item.price}</span></p>
            <button 
              className="btn btn-primary"
              onClick={() => addToCart(item, 'stationery')}
            >
              🛒 Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBookings = () => (
    <div>
      <h3>📅 Make Bookings</h3>
      <p style={{ color: '#666', marginBottom: '20px' }}>Book various services and facilities onboard</p>
      <div className="grid">
        {/* Resort Booking */}
        <div className="card">
          <h4>🏨 Resort Booking</h4>
          <div className="form-group">
            <label>Room Type:</label>
            <select 
              value={bookingData.resort.type} 
              onChange={(e) => updateBookingData('resort', 'type', e.target.value)}
            >
              <option value="oceanview">🌊 Ocean View</option>
              <option value="balcony">🏖️ Balcony Suite</option>
              <option value="corridor">🚪 Corridor View</option>
              <option value="lounge">🍸 Lounge Access</option>
            </select>
          </div>
          <div className="form-group">
            <label>Check-in Date:</label>
            <input 
              type="date" 
              value={bookingData.resort.date}
              onChange={(e) => updateBookingData('resort', 'date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="form-group">
            <label>Number of Guests:</label>
            <input 
              type="number" 
              min="1" 
              max="4"
              value={bookingData.resort.guests}
              onChange={(e) => updateBookingData('resort', 'guests', parseInt(e.target.value))}
            />
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => handleBooking('resort')}
            disabled={!bookingData.resort.date}
          >
            🏨 Book Resort
          </button>
        </div>

        {/* Movie Booking */}
        <div className="card">
          <h4>🎬 Movie Tickets</h4>
          <div className="form-group">
            <label>Movie Name:</label>
            <input 
              type="text" 
              value={bookingData.movie.movieName}
              onChange={(e) => updateBookingData('movie', 'movieName', e.target.value)}
              placeholder="Enter movie name"
            />
          </div>
          <div className="form-group">
            <label>Show Time:</label>
            <input 
              type="datetime-local" 
              value={bookingData.movie.showTime}
              onChange={(e) => updateBookingData('movie', 'showTime', e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
          <div className="form-group">
            <label>Number of Seats:</label>
            <input 
              type="number" 
              min="1" 
              max="10"
              value={bookingData.movie.seats}
              onChange={(e) => updateBookingData('movie', 'seats', parseInt(e.target.value))}
            />
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => handleBooking('movie')}
            disabled={!bookingData.movie.movieName || !bookingData.movie.showTime}
          >
            🎬 Book Movie
          </button>
        </div>

        {/* Salon Booking */}
        <div className="card">
          <h4>💇 Beauty Salon</h4>
          <div className="form-group">
            <label>Service Type:</label>
            <select 
              value={bookingData.salon.service} 
              onChange={(e) => updateBookingData('salon', 'service', e.target.value)}
            >
              <option value="haircut">💇 Haircut & Styling</option>
              <option value="spa">🧖 Spa Treatment</option>
              <option value="manicure">💅 Manicure</option>
              <option value="facial">✨ Facial</option>
            </select>
          </div>
          <div className="form-group">
            <label>Appointment Date:</label>
            <input 
              type="date" 
              value={bookingData.salon.date}
              onChange={(e) => updateBookingData('salon', 'date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="form-group">
            <label>Appointment Time:</label>
            <input 
              type="time" 
              value={bookingData.salon.time}
              onChange={(e) => updateBookingData('salon', 'time', e.target.value)}
            />
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => handleBooking('salon')}
            disabled={!bookingData.salon.date || !bookingData.salon.time}
          >
            💇 Book Salon
          </button>
        </div>

        {/* Fitness Center */}
        <div className="card">
          <h4>💪 Fitness Center</h4>
          <div className="form-group">
            <label>Equipment/Session:</label>
            <select 
              value={bookingData.fitness.equipment} 
              onChange={(e) => updateBookingData('fitness', 'equipment', e.target.value)}
            >
              <option value="treadmill">🏃 Treadmill</option>
              <option value="weights">🏋️ Weight Training</option>
              <option value="yoga">🧘 Yoga Session</option>
              <option value="pool">🏊 Swimming Pool</option>
            </select>
          </div>
          <div className="form-group">
            <label>Booking Date:</label>
            <input 
              type="date" 
              value={bookingData.fitness.date}
              onChange={(e) => updateBookingData('fitness', 'date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="form-group">
            <label>Duration (hours):</label>
            <input 
              type="number" 
              min="1" 
              max="3"
              value={bookingData.fitness.duration}
              onChange={(e) => updateBookingData('fitness', 'duration', parseInt(e.target.value))}
            />
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => handleBooking('fitness')}
            disabled={!bookingData.fitness.date}
          >
            💪 Book Fitness
          </button>
        </div>

        {/* Party Hall */}
        <div className="card">
          <h4>🎉 Party Hall</h4>
          <div className="form-group">
            <label>Party Type:</label>
            <select 
              value={bookingData.party.type} 
              onChange={(e) => updateBookingData('party', 'type', e.target.value)}
            >
              <option value="birthday">🎂 Birthday Party</option>
              <option value="wedding">💍 Wedding Reception</option>
              <option value="business">💼 Business Event</option>
              <option value="get-together">👥 Get Together</option>
            </select>
          </div>
          <div className="form-group">
            <label>Event Date:</label>
            <input 
              type="date" 
              value={bookingData.party.date}
              onChange={(e) => updateBookingData('party', 'date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="form-group">
            <label>Number of Guests:</label>
            <input 
              type="number" 
              min="10" 
              max="100"
              value={bookingData.party.guests}
              onChange={(e) => updateBookingData('party', 'guests', parseInt(e.target.value))}
            />
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => handleBooking('party')}
            disabled={!bookingData.party.date}
          >
            🎉 Book Party Hall
          </button>
        </div>
      </div>
    </div>
  );

  const renderCart = () => {
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
      <div>
        <h3>🛒 Shopping Cart</h3>
        
        {cart.length === 0 ? (
          <div className="card">
            <h4>Your cart is empty</h4>
            <p>Browse our catering and stationery items to add something to your cart!</p>
            <button 
              className="btn btn-primary" 
              onClick={() => setActiveTab('catering')}
            >
              🍽️ Browse Catering
            </button>
            <button 
              className="btn btn-primary" 
              onClick={() => setActiveTab('stationery')}
              style={{ marginLeft: '10px' }}
            >
              📚 Browse Stationery
            </button>
          </div>
        ) : (
          <div>
            <div className="grid">
              {cart.map(item => (
                <div key={item.cartId} className="card">
                  <h4>{item.name}</h4>
                  <p><strong>Type:</strong> 
                    <span style={{ 
                      padding: '2px 8px', 
                      borderRadius: '12px', 
                      fontSize: '12px',
                      marginLeft: '8px',
                      background: item.type === 'catering' ? '#28a745' : '#17a2b8',
                      color: 'white'
                    }}>
                      {item.type}
                    </span>
                  </p>
                  <p><strong>Price:</strong> ${item.price}</p>
                  <p><strong>Description:</strong> {item.description}</p>
                  
                  <div className="form-group">
                    <label>Quantity:</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => updateCartQuantity(item.cartId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span style={{ fontWeight: 'bold', minWidth: '30px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => updateCartQuantity(item.cartId, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <p><strong>Subtotal:</strong> <span style={{ color: '#dc3545', fontWeight: 'bold' }}>${(item.price * item.quantity).toFixed(2)}</span></p>
                  
                  <button 
                    className="btn btn-danger"
                    onClick={() => removeFromCart(item.cartId)}
                  >
                    🗑️ Remove
                  </button>
                </div>
              ))}
            </div>
            
            <div className="card" style={{ marginTop: '20px', background: '#f8f9fa' }}>
              <h3>💰 Order Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <p><strong>Total Items:</strong> {totalItems}</p>
                  <p><strong>Total Amount:</strong> <span style={{ color: '#dc3545', fontWeight: 'bold', fontSize: '1.2em' }}>${totalAmount.toFixed(2)}</span></p>
                </div>
                <div>
                  <p><strong>Catering Items:</strong> {cart.filter(item => item.type === 'catering').length}</p>
                  <p><strong>Stationery Items:</strong> {cart.filter(item => item.type === 'stationery').length}</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button className="btn btn-success" onClick={placeOrder}>
                  ✅ Place Order
                </button>
                <button className="btn btn-danger" onClick={() => setCart([])}>
                  🗑️ Clear Cart
                </button>
                <button className="btn btn-secondary" onClick={() => setActiveTab('catering')}>
                  🍽️ Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMyOrders = () => (
    <div>
      <h3>📦 My Orders</h3>
      <button className="btn btn-primary" onClick={fetchMyData} style={{ marginBottom: '20px' }}>
        🔄 Refresh
      </button>
      
      {myOrders.length === 0 ? (
        <div className="card">
          <h4>No orders yet</h4>
          <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
        </div>
      ) : (
        <div className="grid">
          {myOrders.map(order => (
            <div key={order.id} className="card">
              <h4>Order #{order.id}</h4>
              <p><strong>Item:</strong> {order.item}</p>
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
              <p><strong>Price:</strong> ${order.price}</p>
              <p>
                <strong>Status:</strong>{' '}
                <span className={`status-${order.status}`}>
                  {order.status}
                </span>
              </p>
              <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderMyBookings = () => (
    <div>
      <h3>📅 My Bookings</h3>
      <button className="btn btn-primary" onClick={fetchMyData} style={{ marginBottom: '20px' }}>
        🔄 Refresh
      </button>
      
      {myBookings.length === 0 ? (
        <div className="card">
          <h4>No bookings yet</h4>
          <p>You haven't made any bookings yet. Book services to see them here!</p>
        </div>
      ) : (
        <div className="grid">
          {myBookings.map(booking => (
            <div key={booking.id} className="card">
              <h4>Booking #{booking.id}</h4>
              <p><strong>Service:</strong> 
                <span style={{ 
                  padding: '2px 8px', 
                  borderRadius: '12px', 
                  fontSize: '12px',
                  marginLeft: '8px',
                  background: '#6f42c1',
                  color: 'white',
                  textTransform: 'capitalize'
                }}>
                  {booking.type}
                </span>
              </p>
              {booking.service && <p><strong>Details:</strong> {booking.service}</p>}
              {booking.movieName && <p><strong>Movie:</strong> {booking.movieName}</p>}
              {booking.guests && <p><strong>Guests:</strong> {booking.guests}</p>}
              {booking.seats && <p><strong>Seats:</strong> {booking.seats}</p>}
              <p>
                <strong>Status:</strong>{' '}
                <span className="status-approved">
                  {booking.status}
                </span>
              </p>
              <p><strong>Booking Date:</strong> {new Date(booking.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="dashboard">
      <div className="sidebar">
        <h2>🚢 Voyager Dashboard</h2>
        <div className="user-welcome">
          <p>Welcome aboard,</p>
          <h3>{currentUser?.name}</h3>
          <p>{currentUser?.email}</p>
        </div>
        <ul>
          <li onClick={() => setActiveTab('catering')}>🍽️ Order Catering</li>
          <li onClick={() => setActiveTab('stationery')}>📚 Order Stationery</li>
          <li onClick={() => setActiveTab('bookings')}>📅 Make Bookings</li>
          <li onClick={() => setActiveTab('cart')}>🛒 View Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})</li>
          <li onClick={() => setActiveTab('my-orders')}>📦 My Orders ({myOrders.length})</li>
          <li onClick={() => setActiveTab('my-bookings')}>📅 My Bookings ({myBookings.length})</li>
          <li onClick={logout}>🚪 Logout</li>
        </ul>
      </div>

      <div className="main-content">
        {message && <div className="success-message">{message}</div>}
        
        <h1>
          {activeTab === 'catering' && '🍽️ Catering Items'}
          {activeTab === 'stationery' && '📚 Stationery Items'}
          {activeTab === 'bookings' && '📅 Make Bookings'}
          {activeTab === 'cart' && '🛒 Shopping Cart'}
          {activeTab === 'my-orders' && '📦 My Orders'}
          {activeTab === 'my-bookings' && '📅 My Bookings'}
        </h1>

        {activeTab === 'catering' && renderCatering()}
        {activeTab === 'stationery' && renderStationery()}
        {activeTab === 'bookings' && renderBookings()}
        {activeTab === 'cart' && renderCart()}
        {activeTab === 'my-orders' && renderMyOrders()}
        {activeTab === 'my-bookings' && renderMyBookings()}
      </div>
    </div>
  );
};

export default VoyagerDashboard;
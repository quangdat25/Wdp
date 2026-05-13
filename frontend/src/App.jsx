import { useState, useEffect } from 'react'
import { getAllRooms, createRoom, deleteRoom, healthCheck } from './api/roomService'
import './App.css'

function App() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [serverStatus, setServerStatus] = useState(null)
  const [error, setError] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    building: '',
    floor: 1,
    capacity: 4,
    price: 1500000,
    amenities: '',
  })
  const [showForm, setShowForm] = useState(false)

  // Kiểm tra kết nối server
  useEffect(() => {
    checkServerHealth()
    fetchRooms()
  }, [])

  const checkServerHealth = async () => {
    try {
      const data = await healthCheck()
      setServerStatus(data)
      setError(null)
    } catch (err) {
      setError('❌ Không thể kết nối đến Backend server! Hãy chắc chắn backend đang chạy trên port 3000.')
      setServerStatus(null)
    }
  }

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const data = await getAllRooms()
      setRooms(data.data)
    } catch (err) {
      console.error('Lỗi khi lấy danh sách phòng:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const roomData = {
        ...formData,
        floor: Number(formData.floor),
        capacity: Number(formData.capacity),
        price: Number(formData.price),
        amenities: formData.amenities.split(',').map((a) => a.trim()).filter(Boolean),
      }
      await createRoom(roomData)
      setFormData({ name: '', building: '', floor: 1, capacity: 4, price: 1500000, amenities: '' })
      setShowForm(false)
      fetchRooms()
    } catch (err) {
      console.error('Lỗi khi thêm phòng:', err)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa phòng này?')) return
    try {
      await deleteRoom(id)
      fetchRooms()
    } catch (err) {
      console.error('Lỗi khi xóa phòng:', err)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1>🏠 DormBooking</h1>
          <p className="subtitle">Hệ thống đặt phòng ký túc xá</p>
        </div>
      </header>

      <main className="container">
        {/* Server Status */}
        <section className="status-card">
          <h2>📡 Trạng thái kết nối Backend</h2>
          {error ? (
            <div className="status-badge status-error">
              <span className="dot dot-error"></span>
              {error}
            </div>
          ) : serverStatus ? (
            <div className="status-badge status-ok">
              <span className="dot dot-ok"></span>
              ✅ Server đang hoạt động — {serverStatus.message} — {serverStatus.timestamp}
            </div>
          ) : (
            <div className="status-badge status-loading">
              <span className="dot dot-loading"></span>
              Đang kiểm tra kết nối...
            </div>
          )}
          <button className="btn btn-outline" onClick={checkServerHealth}>
            🔄 Kiểm tra lại
          </button>
        </section>

        {/* Room List */}
        <section className="rooms-section">
          <div className="section-header">
            <h2>🛏️ Danh sách phòng ({rooms.length})</h2>
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? '✕ Đóng' : '➕ Thêm phòng'}
            </button>
          </div>

          {/* Add Room Form */}
          {showForm && (
            <form className="room-form" onSubmit={handleSubmit}>
              <h3>Thêm phòng mới</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Tên phòng</label>
                  <input
                    type="text"
                    placeholder="VD: Phòng C301"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Tòa nhà</label>
                  <input
                    type="text"
                    placeholder="VD: A, B, C"
                    value={formData.building}
                    onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Tầng</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Sức chứa</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Giá (VNĐ/tháng)</label>
                  <input
                    type="number"
                    min="0"
                    step="100000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Tiện ích (cách nhau bởi dấu phẩy)</label>
                  <input
                    type="text"
                    placeholder="WiFi, Điều hòa, Nóng lạnh"
                    value={formData.amenities}
                    onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-full">
                💾 Lưu phòng
              </button>
            </form>
          )}

          {/* Room Cards */}
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="empty-state">
              <p>📭 Chưa có phòng nào. Hãy thêm phòng mới!</p>
            </div>
          ) : (
            <div className="room-grid">
              {rooms.map((room) => (
                <div key={room._id} className={`room-card ${room.status}`}>
                  <div className="room-header">
                    <h3>{room.name}</h3>
                    <span className={`badge badge-${room.status}`}>
                      {room.status === 'available' ? '🟢 Trống' : '🔴 Đã đầy'}
                    </span>
                  </div>
                  <div className="room-info">
                    <p>🏢 Tòa: <strong>{room.building}</strong></p>
                    <p>📍 Tầng: <strong>{room.floor}</strong></p>
                    <p>👥 Sức chứa: <strong>{room.capacity} người</strong></p>
                    <p>💰 Giá: <strong>{formatPrice(room.price)}/tháng</strong></p>
                  </div>
                  {room.amenities && room.amenities.length > 0 && (
                    <div className="amenities">
                      {room.amenities.map((amenity, idx) => (
                        <span key={idx} className="amenity-tag">{amenity}</span>
                      ))}
                    </div>
                  )}
                  <div className="room-actions">
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(room._id)}>
                      🗑️ Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>DormBooking © 2026 — Backend: <code>localhost:3000</code> | Frontend: <code>localhost:5173</code></p>
      </footer>
    </div>
  )
}

export default App

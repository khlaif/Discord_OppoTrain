import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';

export default function Sidebar({ channels, activeChannel, onSelectChannel, onChannelCreated }) {
  const { user, logout } = useAuth();
  const { onlineUsers } = useSocket();
  const [showCreate, setShowCreate] = useState(false);
  const [newChannel, setNewChannel] = useState({ name: '', description: '' });
  const [error, setError] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await axios.post('/channels', newChannel);
      onChannelCreated(data);
      setNewChannel({ name: '', description: '' });
      setShowCreate(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create channel');
    }
  };

  const initials = user?.username?.slice(0, 2).toUpperCase();

  return (
    <aside className="sidebar">
      {/* Server Header */}
      <div className="sidebar-header">
        <span>💬 ChatterBox</span>
        <div className="online-badge">{onlineUsers.length} online</div>
      </div>

      {/* Channels */}
      <div className="sidebar-section">
        <div className="sidebar-section-header">
          <span>TEXT CHANNELS</span>
          <button className="btn-icon" onClick={() => setShowCreate(!showCreate)} title="Add channel">
            +
          </button>
        </div>

        {showCreate && (
          <form className="create-channel-form" onSubmit={handleCreate}>
            <input
              type="text"
              placeholder="channel-name"
              value={newChannel.name}
              onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
              required
              autoFocus
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newChannel.description}
              onChange={(e) => setNewChannel({ ...newChannel, description: e.target.value })}
            />
            {error && <span className="create-error">{error}</span>}
            <div className="create-actions">
              <button type="submit" className="btn-small btn-primary">Create</button>
              <button type="button" className="btn-small btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </form>
        )}

        <ul className="channel-list">
          {channels.map((ch) => (
            <li
              key={ch._id}
              className={`channel-item ${activeChannel?._id === ch._id ? 'active' : ''}`}
              onClick={() => onSelectChannel(ch)}
            >
              <span className="channel-hash">#</span>
              <span className="channel-name">{ch.name}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Online Users */}
      <div className="sidebar-section">
        <div className="sidebar-section-header">
          <span>ONLINE — {onlineUsers.length}</span>
        </div>
        <ul className="online-list">
          {onlineUsers.map((username) => (
            <li key={username} className="online-item">
              <div className="avatar-small" style={{ backgroundColor: '#43b581' }}>
                {username.slice(0, 2).toUpperCase()}
              </div>
              <span>{username}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* User Footer */}
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="avatar" style={{ backgroundColor: user?.avatarColor || '#7289da' }}>
            {initials}
          </div>
          <div className="user-details">
            <span className="user-name">{user?.username}</span>
            <span className="user-status">🟢 Online</span>
          </div>
        </div>
        <button className="btn-icon logout-btn" onClick={logout} title="Log out">
          ⏻
        </button>
      </div>
    </aside>
  );
}

import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import Message from './Message';

export default function ChatArea({ channel }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = useCallback(async () => {
    if (!channel) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`/messages/${channel._id}`);
      setMessages(data);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [channel]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket || !channel) return;

    socket.emit('join-channel', channel._id);

    const handleNewMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleTyping = ({ username }) => {
      if (username === user?.username) return;
      setTypingUsers((prev) => [...new Set([...prev, username])]);
    };

    const handleStopTyping = ({ username }) => {
      setTypingUsers((prev) => prev.filter((u) => u !== username));
    };

    socket.on('new-message', handleNewMessage);
    socket.on('user-typing', handleTyping);
    socket.on('user-stop-typing', handleStopTyping);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('user-typing', handleTyping);
      socket.off('user-stop-typing', handleStopTyping);
    };
  }, [socket, channel, user]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!socket || !channel) return;
    socket.emit('typing', { channelId: channel._id });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('stop-typing', { channelId: channel._id });
    }, 1500);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !socket || !channel) return;
    socket.emit('send-message', { channelId: channel._id, content: input });
    socket.emit('stop-typing', { channelId: channel._id });
    setInput('');
    clearTimeout(typingTimeout.current);
  };

  if (!channel) {
    return (
      <div className="chat-area empty-state">
        <div className="empty-icon">💬</div>
        <h2>Welcome to ChatterBox!</h2>
        <p>Select a channel from the sidebar to start chatting.</p>
      </div>
    );
  }

  return (
    <div className="chat-area">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <span className="chat-hash">#</span>
          <span className="chat-channel-name">{channel.name}</span>
        </div>
        {channel.description && (
          <span className="chat-description">{channel.description}</span>
        )}
      </div>

      {/* Messages */}
      <div className="messages-container">
        {loading ? (
          <div className="loading-msgs">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="channel-welcome">
            <div className="welcome-icon">#</div>
            <h3>Welcome to #{channel.name}!</h3>
            <p>This is the beginning of the #{channel.name} channel.</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <Message
              key={msg._id}
              message={msg}
              prevMessage={messages[i - 1]}
              currentUser={user}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Typing indicator */}
      <div className="typing-indicator">
        {typingUsers.length > 0 && (
          <span>
            <span className="typing-dots">
              <span /><span /><span />
            </span>
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </span>
        )}
      </div>

      {/* Input */}
      <form className="message-form" onSubmit={sendMessage}>
        <input
          type="text"
          className="message-input"
          placeholder={`Message #${channel.name}`}
          value={input}
          onChange={handleInputChange}
          maxLength={2000}
          autoFocus
        />
        <button type="submit" className="send-btn" disabled={!input.trim()}>
          ➤
        </button>
      </form>
    </div>
  );
}

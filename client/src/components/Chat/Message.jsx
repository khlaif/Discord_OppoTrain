function formatTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString();
}

function isSameAuthorAndTime(msg, prev) {
  if (!prev) return false;
  if (msg.author._id !== prev.author._id) return false;
  const diff = new Date(msg.createdAt) - new Date(prev.createdAt);
  return diff < 5 * 60 * 1000;
}

export default function Message({ message, prevMessage, currentUser }) {
  const grouped = isSameAuthorAndTime(message, prevMessage);
  const showDateSep =
    !prevMessage ||
    new Date(message.createdAt).toDateString() !== new Date(prevMessage.createdAt).toDateString();
  const isOwn = message.author._id === currentUser?.id;

  return (
    <>
      {showDateSep && (
        <div className="date-separator">
          <span>{formatDate(message.createdAt)}</span>
        </div>
      )}
      <div className={`message ${grouped ? 'grouped' : ''} ${isOwn ? 'own' : ''}`}>
        {!grouped ? (
          <div className="message-avatar" style={{ backgroundColor: message.author.avatarColor }}>
            {message.author.username.slice(0, 2).toUpperCase()}
          </div>
        ) : (
          <div className="message-avatar-placeholder" />
        )}
        <div className="message-body">
          {!grouped && (
            <div className="message-header">
              <span className="message-author">{message.author.username}</span>
              <span className="message-time">{formatTime(message.createdAt)}</span>
            </div>
          )}
          <p className="message-content">{message.content}</p>
        </div>
      </div>
    </>
  );
}

import './ChatList.css'

function ChatList({ chats, selectedChat, onSelectChat, loading }) {
  const formatTime = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    } else if (days === 1) {
      return 'Yesterday'
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  if (loading) {
    return (
      <div className="chat-list-loading">
        <div>Loading chats...</div>
      </div>
    )
  }

  if (chats.length === 0) {
    return (
      <div className="chat-list-empty">
        <p>No chats yet. Start a new conversation!</p>
      </div>
    )
  }

  return (
    <div className="chat-list">
      {chats.map((chat) => (
        <div
          key={chat.userId}
          className={`chat-item ${selectedChat?.userId === chat.userId ? 'active' : ''}`}
          onClick={() => onSelectChat(chat)}
        >
          <div className="chat-avatar">
            {chat.displayName?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="chat-info">
            <div className="chat-header-row">
              <div className="chat-name">{chat.displayName || 'Unknown'}</div>
              <div className="chat-time">{formatTime(chat.lastMessageAt)}</div>
            </div>
            <div className="chat-preview-row">
              <div className="chat-preview">
                {chat.lastMessage || 'No messages yet'}
              </div>
              {!chat.read && (
                <div className="unread-indicator"></div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ChatList

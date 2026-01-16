import { useState, useRef, useEffect } from 'react'
import MessageInput from './MessageInput'
import './MessageArea.css'

function MessageArea({ chat, messages, currentUser, onSendMessage, onLoadMore, hasMore, messagesEndRef, onMarkAsRead, onDeleteMessage }) {
  const [editingMessage, setEditingMessage] = useState(null)
  const messagesContainerRef = useRef(null)
  const [showLoadMore, setShowLoadMore] = useState(false)
  const markingRef = useRef(false)

  // When messages change, if there are unread messages from the other user,
  // notify parent to mark them as read on the server and refresh state.
  useEffect(() => {
    if (!chat || !onMarkAsRead || !messages || !currentUser) return

    const hasUnread = messages.some((m) => {
      const senderId = typeof m.sender === 'object' ? (m.sender._id || m.sender) : m.sender
      const senderIdStr = senderId && senderId.toString ? senderId.toString() : String(senderId)
      const currentUserIdStr = currentUser._id && currentUser._id.toString ? currentUser._id.toString() : String(currentUser._id)
      return senderIdStr !== currentUserIdStr && !m.read
    })

    if (hasUnread && !markingRef.current) {
      markingRef.current = true
      // ensure we don't block UI - call parent and clear the flag when done
      Promise.resolve(onMarkAsRead?.(chat.userId))
        .catch(() => {})
        .finally(() => { markingRef.current = false })
    }
  }, [messages, chat?.userId, onMarkAsRead, currentUser])

  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) {
      const handleScroll = () => {
        if (container.scrollTop === 0 && hasMore) {
          setShowLoadMore(true)
        } else {
          setShowLoadMore(false)
        }
      }
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [hasMore])

  const formatTime = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  }

  const handleEditMessage = (message) => {
    setEditingMessage(message)
  }

  const handleSend = async (text) => {
    try {
      await onSendMessage(text)
      setEditingMessage(null)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const groupMessagesByDate = (messages) => {
    const grouped = []
    let currentDate = null

    messages.forEach((message, index) => {
      const messageDate = new Date(message.createdAt).toDateString()
      
      if (messageDate !== currentDate) {
        currentDate = messageDate
        grouped.push({ type: 'date', date: message.createdAt })
      }
      
      grouped.push({ type: 'message', ...message })
    })

    return grouped
  }

  const groupedMessages = groupMessagesByDate(messages)

  return (
    <div className="message-area">
      <div className="message-header">
        <div className="message-header-info">
          <div className="message-header-avatar">
            {chat.displayName?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="message-header-details">
            <div className="message-header-name">{chat.displayName || 'Unknown'}</div>
            <div className="message-header-status">Online</div>
          </div>
        </div>
      </div>

      <div className="messages-container" ref={messagesContainerRef}>
        {showLoadMore && hasMore && (
          <div className="load-more-container">
            <button className="load-more-button" onClick={onLoadMore}>
              Load older messages
            </button>
          </div>
        )}
        
        {groupedMessages.map((item, index) => {
          if (item.type === 'date') {
            return (
              <div key={`date-${index}`} className="date-divider">
                <span>{formatDate(item.date)}</span>
              </div>
            )
          }

          const senderId = typeof item.sender === 'object' ? (item.sender._id || item.sender) : item.sender
          const isOwn = senderId === currentUser._id || senderId.toString() === currentUser._id.toString()

          // Determine whether the message can be edited/deleted (within 5 minutes)
          const canModify = (() => {
            try {
              const created = new Date(item.createdAt).getTime()
              return Date.now() - created <= 5 * 60 * 1000
            } catch (e) {
              return false
            }
          })()
          
          return (
            <div
              key={item._id}
              className={`message-wrapper ${isOwn ? 'own' : 'other'}`}
            >
              <div className={`message-bubble ${isOwn ? 'sent' : 'received'}`}>
                <div className="message-text">{item.messageText}</div>
                <div className="message-time">
                  {formatTime(item.createdAt)}
                  {isOwn && (
                    <span className="message-status">
                      {item.read ? '✓✓' : '✓'}
                    </span>
                  )}
                </div>
              </div>

              {isOwn && canModify && (
                <>
                  <button
                    className="message-edit-button"
                    onClick={() => handleEditMessage(item)}
                    title="Edit message"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
                    </svg>
                  </button>

                  <button
                    className="message-delete-button"
                    onClick={() => {
                      if (!onDeleteMessage) return
                      if (window.confirm('Delete this message?')) {
                        onDeleteMessage(item._id)
                      }
                    }}
                    title="Delete message"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M6 7h12v13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7zm3-4h6l1 1h3v2H3V4h3l1-1z" fill="currentColor"/>
                    </svg>
                  </button>
                </>
              )}

            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        onSend={handleSend}
        editingMessage={editingMessage}
        onCancelEdit={() => setEditingMessage(null)}
      />
    </div>
  )
}

export default MessageArea

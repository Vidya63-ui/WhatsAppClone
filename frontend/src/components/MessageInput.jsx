import { useState, useEffect, useRef } from 'react'
import { messageAPI } from '../services/api'
import './MessageInput.css'

function MessageInput({ onSend, editingMessage, onCancelEdit }) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef(null)

  useEffect(() => {
    if (editingMessage) {
      setMessage(editingMessage.messageText)
      textareaRef.current?.focus()
    } else {
      setMessage('')
    }
  }, [editingMessage])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim() || loading) return

    setLoading(true)
    try {
      if (editingMessage) {
        await messageAPI.updateMessage(editingMessage._id, message)
        onCancelEdit()
      } else {
        await onSend(message)
      }
      setMessage('')
    } catch (error) {
      console.error('Failed to send/update message:', error)
      alert(error.response?.data?.message || 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 100)}px`
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [message])

  return (
    <div className="message-input-container">
      {editingMessage && (
        <div className="edit-indicator">
          <span>Editing message</span>
          <button onClick={onCancelEdit} className="cancel-edit-button">Cancel</button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="message-input-form">
        <div className="message-input-wrapper">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value)
              adjustTextareaHeight()
            }}
            onKeyPress={handleKeyPress}
            placeholder={editingMessage ? "Edit your message..." : "Type a message"}
            className="message-textarea"
            rows={1}
            maxLength={1000}
          />
          <button
            type="submit"
            className="send-button"
            disabled={!message.trim() || loading}
          >
            {loading ? (
              <div className="spinner"></div>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor"/>
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default MessageInput

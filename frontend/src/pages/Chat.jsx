import { useState, useEffect, useRef } from 'react'
import { authAPI, messageAPI, contactAPI } from '../services/api'
import { initSocket } from '../services/socket'
import ChatList from '../components/ChatList'
import MessageArea from '../components/MessageArea'
import ContactModal from '../components/ContactModal'
import ContactsList from '../components/ContactsList'
import SearchUser from '../components/SearchUser'
import './Chat.css'

function Chat({ user, setUser }) {
  const [chats, setChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showContactModal, setShowContactModal] = useState(false)
  const [editContact, setEditContact] = useState(null)
  const [showContactsList, setShowContactsList] = useState(false)
  const [showSearchUser, setShowSearchUser] = useState(false)
  const [contacts, setContacts] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const messagesEndRef = useRef(null)
  const hasLoadedChatList = useRef(false)
  const selectedChatIdRef = useRef(null)

  useEffect(() => {
    // Prevent duplicate calls
    if (!hasLoadedChatList.current) {
      hasLoadedChatList.current = true
      loadChatList()
    }
  }, [])

  // Socket.IO: initialize and register handlers
  useEffect(() => {
    if (!user) return
    const socket = initSocket()

    const handleNewMessage = (msg) => {
      // If message belongs to currently selected chat, reload messages
      const otherId = selectedChat?.userId
      const senderId = msg?.sender?._id || msg?.sender
      const receiverId = msg?.receiver?._id || msg?.receiver
      if (otherId && (senderId === otherId || receiverId === otherId)) {
        loadMessages(otherId, 1)
      }
      loadChatList()
    }

    const handleMessageUpdated = (updated) => {
      const otherId = selectedChat?.userId
      const senderId = updated?.sender?._id || updated?.sender
      const receiverId = updated?.receiver?._id || updated?.receiver
      if (otherId && (senderId === otherId || receiverId === otherId)) {
        loadMessages(otherId,1)
      }
      loadChatList()
    }

    const handleMessageDeleted = (payload) => {
      const otherId = selectedChat?.userId
      const senderId = payload?.sender
      const receiverId = payload?.receiver
      if (otherId && (senderId === otherId || receiverId === otherId)) {
        loadMessages(otherId,1)
      }
      loadChatList()
    }

    const handleMessagesRead = (payload) => {
      const otherId = selectedChat?.userId
      // if read receipts apply to selected chat, reload messages
      if (otherId && payload?.by === otherId) {
        loadMessages(otherId,1)
      }
      loadChatList()
    }

    const handleContactChange = () => {
      loadContacts()
      loadChatList()
    }

    socket.on('newMessage', handleNewMessage)
    socket.on('messageUpdated', handleMessageUpdated)
    socket.on('messageDeleted', handleMessageDeleted)
    socket.on('messagesRead', handleMessagesRead)
    socket.on('contactCreated', handleContactChange)
    socket.on('contactUpdated', handleContactChange)
    socket.on('contactDeleted', handleContactChange)

    return () => {
      socket.off('newMessage', handleNewMessage)
      socket.off('messageUpdated', handleMessageUpdated)
      socket.off('messageDeleted', handleMessageDeleted)
      socket.off('messagesRead', handleMessagesRead)
      socket.off('contactCreated', handleContactChange)
      socket.off('contactUpdated', handleContactChange)
      socket.off('contactDeleted', handleContactChange)
    }
  }, [user, selectedChat])

  useEffect(() => {
    if (selectedChat && selectedChat.userId !== selectedChatIdRef.current) {
      selectedChatIdRef.current = selectedChat.userId
      loadMessages(selectedChat.userId, 1)
      markAsRead(selectedChat.userId)
    }
  }, [selectedChat])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadChatList = async () => {
    try {
      const response = await authAPI.getChatList()
      if (response.data.success) {
        setChats(response.data.chats)
      }
    } catch (error) {
      console.error('Failed to load chat list:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (userId, pageNum = 1) => {
    try {
      const response = await messageAPI.getMessages(userId, pageNum)
      if (response.data.success) {
        const newMessages = response.data.messages.reverse()
        if (pageNum === 1) {
          setMessages(newMessages)
        } else {
          setMessages(prev => [...newMessages, ...prev])
        }
        setHasMore(response.data.count === 25)
        setPage(pageNum)
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  const loadMoreMessages = () => {
    if (hasMore && selectedChat) {
      loadMessages(selectedChat.userId, page + 1)
    }
  }

  const markAsRead = async (userId) => {
    try {
      await messageAPI.markAsRead(userId)
      // Refresh messages for the chat (so local messages show read state) and update chat list
      await loadMessages(userId, 1)
      await loadChatList()
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleSendMessage = async (messageText) => {
    if (!selectedChat || !messageText.trim()) return

    try {
      await messageAPI.sendMessage(selectedChat.userId, messageText)
      await loadMessages(selectedChat.userId, 1)
      await loadChatList()
    } catch (error) {
      console.error('Failed to send message:', error)
      throw error
    }
  }

  const handleDeleteMessage = async (messageId) => {
    if (!messageId || !selectedChat) return
    try {
      await messageAPI.deleteMessage(messageId)
      await loadMessages(selectedChat.userId, 1)
      await loadChatList()
    } catch (error) {
      console.error('Failed to delete message:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await authAPI.logout()
      setUser(null)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleContactAdded = () => {
    loadChatList()
    loadContacts()
    setShowContactModal(false)
  }

  const loadContacts = async () => {
    try {
      const response = await contactAPI.getContacts()
      if (response.data.success) {
        setContacts(response.data.contacts || [])
      }
    } catch (error) {
      console.error('Failed to load contacts:', error)
    }
  }

  const handleSelectUser = (userData) => {
    // Check if chat already exists
    const existingChat = chats.find(chat => chat.userId === userData.userId)
    
    if (existingChat) {
      setSelectedChat(existingChat)
    } else {
      // Create a new chat entry
      const newChat = {
        userId: userData.userId,
        displayName: userData.displayName,
        email: userData.email,
        lastMessage: '',
        lastMessageAt: new Date(),
        read: true
      }
      setSelectedChat(newChat)
      // Optionally add to chat list
      setChats(prev => [newChat, ...prev])
    }
    
    setShowSearchUser(false)
    setShowContactsList(false)
  }

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="chat-header">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <div className="user-name">{user?.name}</div>
              <div className="user-status">Online</div>
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="icon-button" 
              onClick={() => {
                loadContacts()
                setShowSearchUser(true)
              }}
              title="Search & Message by Email"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/>
              </svg>
            </button>
            <button 
              className="icon-button" 
              onClick={() => {
                loadContacts()
                setShowContactsList(true)
              }}
              title="All Contacts"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M20 0H4c-1.1 0-2 .9-2 2v20l4-4h14c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2zm-7 12.5c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm5-6H8V4h10v2.5z" fill="currentColor"/>
              </svg>
            </button>
            <button 
              className="icon-button" 
              onClick={() => setShowContactModal(true)}
              title="Add New Contact"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
              </svg>
            </button>
            <button 
              className="icon-button" 
              onClick={handleLogout}
              title="Logout"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
        <ChatList 
          chats={chats}
          selectedChat={selectedChat}
          onSelectChat={setSelectedChat}
          loading={loading}
        />
      </div>

      <div className="chat-main">
        {selectedChat ? (
          <MessageArea
            chat={selectedChat}
            messages={messages}
            currentUser={user}
            onSendMessage={handleSendMessage}
            onLoadMore={loadMoreMessages}
            hasMore={hasMore}
            messagesEndRef={messagesEndRef}
            onMarkAsRead={markAsRead}
            onDeleteMessage={handleDeleteMessage}
          />
        ) : (
          <div className="no-chat-selected">
            <div className="no-chat-content">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" opacity="0.3">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="currentColor"/>
              </svg>
              <h2>Select a chat to start messaging</h2>
              <p>Or create a new chat by clicking the + button</p>
            </div>
          </div>
        )}
      </div>

      {showContactModal && (
        <ContactModal
          onClose={() => { setShowContactModal(false); setEditContact(null) }}
          onContactAdded={handleContactAdded}
          contact={editContact}
          onContactUpdated={() => { handleContactAdded(); setShowContactModal(false); setEditContact(null); }}
        />
      )}

      {showContactsList && (
        <ContactsList
          onClose={() => setShowContactsList(false)}
          onSelectContact={handleSelectUser}
          onEditContact={(contact) => { setEditContact(contact); setShowContactModal(true); setShowContactsList(false); }}
        />
      )}

      {showSearchUser && (
        <SearchUser
          onClose={() => setShowSearchUser(false)}
          onSelectUser={handleSelectUser}
          currentContacts={contacts}
        />
      )}
    </div>
  )
}

export default Chat

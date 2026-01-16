import { useState, useEffect } from 'react'
import { authAPI, contactAPI } from '../services/api'
import './SearchUser.css'

function SearchUser({ onClose, onSelectUser, currentContacts = [] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [debounceTimer, setDebounceTimer] = useState(null)

  // Create a map of contact emails for quick lookup
  const contactEmailMap = new Map()
  currentContacts.forEach(contact => {
    const email = contact.contactUser?.email || contact.email
    if (email) {
      contactEmailMap.set(email.toLowerCase(), contact)
    }
  })

  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    if (!searchQuery.trim()) {
      setSearchResults([])
      setError('')
      return
    }

    const timer = setTimeout(() => {
      performSearch(searchQuery.trim())
    }, 500) // Debounce for 500ms

    setDebounceTimer(timer)

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
    }
  }, [searchQuery])

  const performSearch = async (email) => {
    setLoading(true)
    setError('')

    try {
      const response = await authAPI.searchUserByEmail(email)
      if (response.data.success) {
        const user = response.data.user
        const isSavedContact = contactEmailMap.has(user.email.toLowerCase())
        
        setSearchResults([{
          ...user,
          isSavedContact,
          contactInfo: isSavedContact ? contactEmailMap.get(user.email.toLowerCase()) : null
        }])
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError('User not found. Please check the email address.')
      } else {
        setError(err.response?.data?.message || 'Failed to search user')
      }
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSelectUser = (user) => {
    if (onSelectUser) {
      onSelectUser({
        userId: user._id,
        displayName: user.isSavedContact && user.contactInfo?.displayName 
          ? user.contactInfo.displayName 
          : user.name,
        email: user.email
      })
    }
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Search & Message by Email</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
            </svg>
          </button>
        </div>

        <div className="search-content">
          <div className="search-input-wrapper">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/>
            </svg>
            <input
              type="email"
              className="search-input"
              placeholder="Enter email address to search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            {loading && (
              <div className="search-loading-spinner"></div>
            )}
          </div>

          {error && (
            <div className="search-error">{error}</div>
          )}

          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  className="search-result-item"
                  onClick={() => handleSelectUser(user)}
                >
                  <div className="result-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="result-info">
                    <div className="result-header">
                      <div className="result-name">
                        {user.isSavedContact && user.contactInfo?.displayName 
                          ? user.contactInfo.displayName 
                          : user.name}
                      </div>
                      {user.isSavedContact && (
                        <span className="saved-badge">Saved</span>
                      )}
                    </div>
                    <div className="result-email">{user.email}</div>
                  </div>
                  <div className="result-action">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor"/>
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!searchQuery && (
            <div className="search-hint">
              <p>💡 Search for any registered user by their email address</p>
              <p>You can message saved contacts or any registered user</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchUser

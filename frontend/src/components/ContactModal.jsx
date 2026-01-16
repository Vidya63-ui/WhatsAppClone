import { useState, useEffect } from 'react'
import { contactAPI } from '../services/api'
import './ContactModal.css' 

function ContactModal({ onClose, onContactAdded, contact, onContactUpdated }) {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    displayName: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (contact) {
      setFormData({
        email: contact.contactUser?.email || contact.email || '',
        name: contact.contactUser?.name || '',
        displayName: contact.displayName || ''
      })
      setError('')
    } else {
      setFormData({ email: '', name: '', displayName: '' })
    }
  }, [contact])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.displayName) {
      setError('Please provide a display name')
      return
    }

    setLoading(true)

    try {
      if (contact) {
        const response = await contactAPI.updateContact(contact._id, { displayName: formData.displayName })
        if (response.data.success) {
          onContactUpdated?.()
        }
      } else {
        if (!formData.email && !formData.name) {
          setError('Please provide either email or name')
          setLoading(false)
          return
        }
        const response = await contactAPI.createContact(formData)
        if (response.data.success) {
          onContactAdded()
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || (contact ? 'Failed to update contact' : 'Failed to create contact'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{contact ? 'Edit Contact' : 'New Chat'}</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="error-message">{error}</div>}

          {contact ? (
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                disabled
              />
              <small className="help-text">Linked user cannot be changed when editing a contact.</small>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="email">Email (optional)</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter user email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="name">Name (optional)</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter user name"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="displayName">Display Name *</label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              required
              placeholder="Enter display name for this contact"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? (contact ? 'Updating...' : 'Creating...') : (contact ? 'Update Contact' : 'Create Chat')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ContactModal

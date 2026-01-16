import { useState, useEffect } from 'react'
import { contactAPI } from '../services/api'
import './ContactsList.css'

function ContactsList({ onClose, onSelectContact, onEditContact }) {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    try {
      const response = await contactAPI.getContacts()
      if (response.data.success) {
        setContacts(response.data.contacts || [])
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load contacts')
    } finally {
      setLoading(false)
    }
  }

  const handleContactClick = (contact) => {
    if (onSelectContact) {
      onSelectContact({
        userId: contact.contactUser._id || contact.contactUser,
        displayName: contact.displayName,
        email: contact.contactUser.email || contact.email
      })
    }
    onClose()
  }



  const handleDelete = async (e, contactId) => {
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await contactAPI.deleteContact(contactId)
        loadContacts()
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete contact')
      }
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content contacts-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>All Contacts</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
            </svg>
          </button>
        </div>

        <div className="contacts-content">
          {loading ? (
            <div className="contacts-loading">Loading contacts...</div>
          ) : error ? (
            <div className="contacts-error">{error}</div>
          ) : contacts.length === 0 ? (
            <div className="contacts-empty">
              <p>No contacts saved yet.</p>
              <p>Add contacts using the + button.</p>
            </div>
          ) : (
            <div className="contacts-list">
              {contacts.map((contact) => {
                const contactUser = contact.contactUser || contact
                const userId = contactUser._id || contactUser
                const name = contact.displayName || contactUser.name || 'Unknown'
                const email = contactUser.email || ''
                
                return (
                  <div
                    key={contact._id}
                    className="contact-item"
                    onClick={() => handleContactClick(contact)}
                  >
                    <div className="contact-avatar">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div className="contact-info">
                      <div className="contact-name">{name}</div>
                      {email && <div className="contact-email">{email}</div>}
                    </div>
                    <button
                      className="contact-update"
                      onClick={(e) => { e.stopPropagation(); if (onEditContact) onEditContact(contact) }}
                      title="Update contact"
                    >
                      {/* <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M14.06 9.21l-1.41-1.41L9 13.59V9H5v8h8v-4.59l-3.54 3.54-1.41-1.41L14.06 9.21z" fill="currentColor"/>
                      </svg> */}
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6"svg width="20" height="20">
                        <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                        <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
                      </svg>
                    </button>

                    <button
                      className="contact-delete"
                      onClick={(e) => handleDelete(e, contact._id)}
                      title="Delete contact"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                      </svg>
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ContactsList
